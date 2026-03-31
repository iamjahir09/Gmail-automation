const { ImapFlow } = require('imapflow');
const prisma = require('../prisma');

const fetchImapEmails = async (req, res) => {
  let client = null;

  try {
    // Get first SMTP account (uses same credentials for IMAP)
    const account = await prisma.account.findFirst();

    if (!account) {
      console.warn('[IMAP] No SMTP account configured. Skipping IMAP fetch.');
      return res.json({ emails: [], error: 'NO_ACCOUNT', message: 'Koi SMTP account configure nahi hai. Settings mein account add karein.' });
    }

    // Determine IMAP host from SMTP host
    let imapHost = account.host;
    if (imapHost.startsWith('smtp.')) {
      imapHost = imapHost.replace('smtp.', 'imap.');
    } else if (!imapHost.startsWith('imap.')) {
      imapHost = 'imap.' + imapHost.replace(/^(mail|smtp|pop)\./i, '');
    }

    console.log(`[IMAP] Connecting to ${imapHost}:993 as ${account.email}...`);

    client = new ImapFlow({
      host: imapHost,
      port: 993,
      secure: true,
      auth: {
        user: account.email,
        pass: account.password,
      },
      logger: false,
      // Generous timeout for slow Gmail servers
      socketTimeout: 30000,
      connectionTimeout: 20000,
    });

    // ✅ CRITICAL FIX: Handle error events so Node.js doesn't crash
    client.on('error', (err) => {
      console.error('[IMAP] Connection error event:', err.message);
    });

    await client.connect();
    console.log('[IMAP] Connected successfully!');

    const emails = [];

    const lock = await client.getMailboxLock('INBOX');
    try {
      const total = client.mailbox.exists;
      console.log(`[IMAP] Total messages in INBOX: ${total}`);

      if (total === 0) {
        return res.json({ emails: [], error: null, message: null });
      }

      const from = Math.max(1, total - 29); // last 30 messages

      // ✅ Fetch envelope + flags only (NO body download here — avoids timeout)
      for await (const msg of client.fetch(`${from}:*`, {
        envelope: true,
        flags: true,
        internalDate: true,
        uid: true,
        bodyStructure: true,
      })) {
        try {
          const isUnread = !msg.flags.has('\\Seen');
          const sender = msg.envelope.from?.[0];
          const senderName = sender?.name || sender?.address || 'Unknown Sender';
          const senderEmail = sender?.address || '';
          const subject = msg.envelope.subject || '(No Subject)';

          emails.push({
            id: `imap-${msg.uid}`,
            folder: 'inbox',
            sender: senderName,
            email: senderEmail,
            subject: subject,
            preview: `From: ${senderEmail} — Click to view full message`,
            body: `From: ${senderName} <${senderEmail}>\nSubject: ${subject}\n\n[Full body loading ke liye email open karein]`,
            date: new Date(msg.internalDate).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric',
              hour: '2-digit', minute: '2-digit'
            }),
            unread: isUnread,
            starred: false,
            uid: msg.uid,   // store uid for full body fetch later
          });
        } catch (msgErr) {
          console.warn(`[IMAP] Skipped message seq=${msg.seq}: ${msgErr.message}`);
        }
      }
    } finally {
      lock.release();
    }

    await client.logout();
    console.log(`[IMAP] Fetched ${emails.length} email headers. Done.`);

    // Return newest first
    res.json({ emails: emails.reverse(), error: null, message: null });

  } catch (error) {
    // Safely logout if still connected
    if (client) {
      try { await client.logout(); } catch (_) {}
    }

    console.error('[IMAP] Fetch error:', error.message);

    let userMessage = 'IMAP connection fail hua.';
    let errorCode = 'IMAP_ERROR';

    if (error.message?.includes('Authentication failed') || error.message?.includes('Invalid credentials')) {
      errorCode = 'AUTH_FAILED';
      userMessage = 'Gmail authentication fail hua. App Password use karein — Gmail → Security → App Passwords → Generate.';
    } else if (error.message?.includes('ECONNREFUSED') || error.message?.includes('ETIMEDOUT') || error.message?.includes('ETIMEOUT')) {
      errorCode = 'CONNECTION_FAILED';
      userMessage = 'IMAP server timeout. Please retry karein.';
    } else if (error.message?.includes('IMAP access is disabled')) {
      errorCode = 'IMAP_DISABLED';
      userMessage = 'Gmail mein IMAP disabled hai. Gmail → Settings → Forwarding and POP/IMAP → Enable IMAP.';
    }

    res.json({ emails: [], error: errorCode, message: userMessage });
  }
};

// Fetch full body of a single email by UID (on-demand, when user clicks)
const fetchEmailBody = async (req, res) => {
  const { uid } = req.params;
  let client = null;

  try {
    const account = await prisma.account.findFirst();
    if (!account) return res.json({ html: null, text: 'No account configured.' });

    let imapHost = account.host.startsWith('smtp.')
      ? account.host.replace('smtp.', 'imap.')
      : account.host;

    client = new ImapFlow({
      host: imapHost, port: 993, secure: true,
      auth: { user: account.email, pass: account.password },
      logger: false, socketTimeout: 30000,
    });

    client.on('error', (err) => {
      console.error('[IMAP Body] error event:', err.message);
    });

    await client.connect();
    const lock = await client.getMailboxLock('INBOX');

    let parsedEmail = null;
    try {
      // Download the full raw RFC822 message
      const download = await client.download(`${uid}`, undefined, { uid: true });
      if (download?.content) {
        const chunks = [];
        for await (const chunk of download.content) chunks.push(chunk);
        const rawBuffer = Buffer.concat(chunks);

        // Parse with mailparser — gives clean HTML, text, attachments etc.
        const { simpleParser } = require('mailparser');
        parsedEmail = await simpleParser(rawBuffer);
      }
    } finally {
      lock.release();
    }

    await client.logout();

    if (!parsedEmail) {
      return res.json({ html: null, text: '(Email parse nahi hua)', subject: '', from: '' });
    }

    res.json({
      html: parsedEmail.html || null,          // Full HTML body (if available)
      text: parsedEmail.text || '',            // Plain text body
      subject: parsedEmail.subject || '',
      from: parsedEmail.from?.text || '',
      date: parsedEmail.date?.toISOString() || null,
      attachments: (parsedEmail.attachments || []).map(a => ({
        filename: a.filename,
        contentType: a.contentType,
        size: a.size,
      })),
    });

  } catch (err) {
    if (client) { try { await client.logout(); } catch (_) {} }
    console.error('[IMAP Body] Error:', err.message);
    res.json({ html: null, text: '(Error: ' + err.message + ')', subject: '', from: '' });
  }
};

module.exports = { fetchImapEmails, fetchEmailBody };
