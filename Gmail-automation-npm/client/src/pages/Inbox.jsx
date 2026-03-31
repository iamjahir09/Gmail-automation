import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { 
  Inbox as InboxIcon, 
  Send, 
  Archive, 
  Trash2, 
  Star, 
  Search, 
  MoreVertical, 
  Reply, 
  Forward, 
  CheckCircle2,
  Clock,
  X,
  RefreshCw,
  Loader2
} from 'lucide-react';

const FOLDERS = [
  { id: 'inbox',     label: 'Unified Inbox',    icon: InboxIcon },
  { id: 'starred',   label: 'Starred',          icon: Star },
  { id: 'sent',      label: 'Sent Campaigns',   icon: Send },
  { id: 'scheduled', label: 'Scheduled',        icon: Clock },
  { id: 'archive',   label: 'Archive',          icon: Archive },
  { id: 'trash',     label: 'Trash',            icon: Trash2 },
];

// Precision Line Shimmer Loader
const PrecisionLoader = () => (
  <div className="p-4 border-b border-black/5 dark:border-white/[0.03] animate-precision-reveal">
    <div className="flex justify-between items-center mb-3">
      <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded-full w-32" />
      <div className="h-2 bg-neutral-100 dark:bg-neutral-900 rounded-full w-12" />
    </div>
    <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded-lg w-4/5 mb-2" />
    <div className="h-3 bg-neutral-100 dark:bg-neutral-900 rounded-full w-2/3" />
  </div>
);

// Gmail-style Email Body Renderer (Advanced HTML Format)
const EmailBodyRenderer = ({ html, text, subject, sender }) => {
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  
  let finalHtml = html;

  // Process plain text into a gorgeous HTML template
  if (!finalHtml && text) {
    const lines = text.split('\n');
    let contentHtml = '';
    let currentQuote = [];
    let currentText = [];

    const flushText = () => {
      if (currentText.length > 0) {
        contentHtml += '<div class="text-block">';
        currentText.forEach(l => {
          const isSeparator = /^On .* wrote:$/.test(l.trim());
          if (isSeparator) {
            contentHtml += `<div class="separator"><span>${l.replace(/^On | wrote:$/g, '')}</span></div>`;
          } else {
            // Very simple linkify
            const linked = l.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
            contentHtml += `<p>${linked || '&nbsp;'}</p>`;
          }
        });
        contentHtml += '</div>';
        currentText = [];
      }
    };
    
    const flushQuote = () => {
      if (currentQuote.length > 0) {
        contentHtml += '<div class="quote-block">';
        currentQuote.forEach(l => {
          const linked = l.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
          contentHtml += `<p>${linked || '&nbsp;'}</p>`;
        });
        contentHtml += '</div>';
        currentQuote = [];
      }
    };

    lines.forEach(line => {
      if (line.startsWith('>')) {
        flushText();
        currentQuote.push(line.replace(/^>+\s?/, ''));
      } else {
        flushQuote();
        currentText.push(line);
      }
    });
    flushText();
    flushQuote();

    // Create Sender Initials
    const senderName = sender || 'Unknown';
    let initials = senderName.substring(0, 2).toUpperCase();
    const parts = senderName.split(' ');
    if (parts.length > 1 && parts[0] && parts[1]) {
      initials = (parts[0][0] + parts[1][0]).toUpperCase();
    }
    
    // Inject into a stunning CSS Template matching Replit's clean card style
    const themeCSS = isDark ? `
      :root {
        --body-bg: transparent;
        --card-bg: #1e293b;
        --text-color: #f1f5f9;
        --text-muted: #94a3b8;
        --border-color: #334155;
        --accent: #3b82f6;
        --quote-bg: #0f172ab3;
        --quote-border: #3b82f6;
      }
    ` : `
      :root {
        --body-bg: transparent;
        --card-bg: #ffffff;
        --text-color: #111827;
        --text-muted: #6b7280;
        --border-color: #e5e7eb;
        --accent: #0070f3;
        --quote-bg: #f9fafb;
        --quote-border: #cbd5e1;
      }
    `;

    finalHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          ${themeCSS}
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--body-bg);
            margin: 0;
            padding: 24px;
            display: flex;
            justify-content: center;
          }
          .replit-card {
            width: 100%;
            max-width: 600px;
            background: var(--card-bg);
            border-radius: 20px;
            padding: 40px 48px;
            color: var(--text-color);
            line-height: 1.6;
            font-size: 15px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
            border: 1px solid var(--border-color);
          }
          .text-block p {
            margin: 0 0 16px 0;
          }
          .text-block a, .quote-block a {
            color: var(--accent);
            text-decoration: none;
            font-weight: 500;
          }
          .text-block a:hover, .quote-block a:hover {
            text-decoration: underline;
          }
          .quote-block {
            border-left: 3px solid var(--quote-border);
            padding-left: 16px;
            margin: 24px 0;
            color: var(--text-muted);
            font-style: italic;
          }
          .quote-block p {
            margin: 0 0 10px 0;
          }
          .quote-block p:last-child { margin: 0; }
          .separator {
            font-size: 13px;
            color: var(--text-muted);
            font-weight: 600;
            margin: 32px 0 16px;
            display: flex;
            align-items: center;
          }
          @media(max-width: 600px) {
            body { padding: 12px; }
            .replit-card { padding: 30px 24px; border-radius: 16px; }
          }
        </style>
      </head>
      <body>
        <div class="replit-card">
           ${contentHtml}
        </div>
      </body>
      </html>
    `;
  }

  // HTML renderer
  if (finalHtml) {
    const themeStyles = isDark 
      ? `body { color: #e2e8f0; } a { color: #60a5fa; }`
      : `body { color: #334155; } a { color: #2563eb; }`;

    return (
      <iframe
        srcDoc={!html ? finalHtml : `
          <!DOCTYPE html><html><head>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"; 
              font-size: 15px; 
              line-height: 1.6; 
              margin: 0; 
              padding: 0; 
              background: transparent; 
              word-wrap: break-word; 
            }
            a { text-decoration: none; font-weight: 500; }
            a:hover { text-decoration: underline; }
            img { max-width: 100%; height: auto; border-radius: 8px; margin: 12px 0; }
            p { margin-top: 0; margin-bottom: 1em; }
            ${themeStyles}
          </style></head><body>${finalHtml}</body></html>
        `}
        sandbox="allow-same-origin allow-popups"
        className="w-full border-0 bg-transparent transition-all duration-300"
        style={{ minHeight: '400px', display: 'block' }}
        onLoad={(e) => {
          try {
            const doc = e.target.contentDocument;
            e.target.style.height = (doc.documentElement.scrollHeight + 50) + 'px';
          } catch(_) {}
        }}
        title="email-body"
      />
    );
  }

  return <span className="text-slate-400 italic">No content</span>;
};

import { useData } from '../context/DataContext';

const Inbox = () => {
  const { campaignLogs, imapEmails, isInitialized, isImapSyncing, imapError, refreshAll, refreshImap } = useData();
  const [emails, setEmails]             = useState([]);
  const [activeFolder, setActiveFolder] = useState('inbox'); 
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [searchQuery, setSearchQuery]   = useState('');
  const [isComposing, setIsComposing]   = useState(false);
  const [composeData, setComposeData]   = useState({ to: '', subject: '', body: '' });
  const [readFilter, setReadFilter]     = useState('all');
  const [bodyLoading, setBodyLoading]   = useState(false);
  
  const isLoading = !isInitialized;
  const isRefreshing = false; // Polling happens in background now
  
  const deletedIdsRef   = useRef(new Set());
  const archivedIdsRef  = useRef(new Set());
  const fetchedBodiesRef = useRef({});
  const readIdsRef = useRef(new Set(JSON.parse(localStorage.getItem('inboxReadIds') || '[]')));

  const markAsRead = (id) => {
    readIdsRef.current.add(id);
    localStorage.setItem('inboxReadIds', JSON.stringify([...readIdsRef.current]));
  };

  useEffect(() => {
    const merged = [...campaignLogs, ...imapEmails].map(e => {
      let current = { ...e };
      if (deletedIdsRef.current.has(current.id))  current.folder = 'trash';
      if (archivedIdsRef.current.has(current.id)) current.folder = 'archive';
      if (readIdsRef.current.has(current.id))     current.unread = false;
      if (current.uid && fetchedBodiesRef.current[current.uid]) {
         Object.assign(current, fetchedBodiesRef.current[current.uid]);
      }
      return current;
    });
    setEmails(merged);
  }, [campaignLogs, imapEmails]);

  const handleSend = () => {
    setIsComposing(false);
    setComposeData({ to: '', subject: '', body: '' });
    alert('Message dispatched via OrbitX Action Network.');
  };

  // Toggle star on an email
  const handleStar = (email) => {
    setEmails(prev => prev.map(e => e.id === email.id ? { ...e, starred: !e.starred } : e));
    setSelectedEmail(prev => prev?.id === email.id ? { ...prev, starred: !prev.starred } : prev);
  };

  // Move email to Trash (persists across auto-refreshes via ref)
  const handleDelete = (email) => {
    deletedIdsRef.current.add(email.id);
    setEmails(prev => prev.map(e => e.id === email.id ? { ...e, folder: 'trash' } : e));
    if (selectedEmail?.id === email.id) setSelectedEmail(null);
  };

  // Move email to Archive (persists across auto-refreshes via ref)
  const handleArchive = (email) => {
    archivedIdsRef.current.add(email.id);
    setEmails(prev => prev.map(e => e.id === email.id ? { ...e, folder: 'archive' } : e));
    if (selectedEmail?.id === email.id) setSelectedEmail(null);
  };

  // Open compose in Reply mode
  const handleReply = (email) => {
    setComposeData({
      to: email.email,
      subject: `Re: ${email.subject}`,
      body: `\n\n--- Original Message ---\nFrom: ${email.sender} <${email.email}>\n\n${email.body}`,
    });
    setIsComposing(true);
  };

  // Open compose in Forward mode
  const handleForward = (email) => {
    setComposeData({
      to: '',
      subject: `Fwd: ${email.subject}`,
      body: `\n\n--- Forwarded Message ---\nFrom: ${email.sender} <${email.email}>\n\n${email.body}`,
    });
    setIsComposing(true);
  };

  // Mark email as read when selected; fetch full body for IMAP emails
  const handleSelectEmail = async (email) => {
    if (email.unread) {
      setEmails(prev => prev.map(e => e.id === email.id ? { ...e, unread: false } : e));
      markAsRead(email.id);
    }
    
    // Check session cache for instant load
    const isCached = email.uid && fetchedBodiesRef.current[email.uid];
    
    if (isCached) {
      setSelectedEmail({ ...email, ...fetchedBodiesRef.current[email.uid], unread: false });
    } else {
      setSelectedEmail({ ...email, unread: false });
    }

    // IMAP emails: fetch full body on-demand
    if (email.id?.startsWith('imap-') && email.uid) {
      // ✅ Caching check: agar body pehle se fetch ho chuki hai to double load na ho
      if (email.bodyFetched || isCached) return;

      setBodyLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/inbox/imap/body/${email.uid}`);
        const data = res.data;
        // New API returns { html, text, subject, from }
        const updatedEmailProps = {
          bodyHtml: data.html || null,
          body: data.text || email.body,
          attachments: data.attachments || [],
          bodyFetched: true, // mark as fetched
        };

        // Cache it permanently in memory for this session
        fetchedBodiesRef.current[email.uid] = updatedEmailProps;

        setSelectedEmail(prev => prev?.id === email.id ? { ...prev, ...updatedEmailProps } : prev);
        setEmails(prev => prev.map(e => e.id === email.id ? { ...e, ...updatedEmailProps } : e));
      } catch (err) {
        console.error('Body fetch error:', err);
      } finally {
        setBodyLoading(false);
      }
    }
  };

  const filteredEmails = emails.filter(email => {
    const folderMatch = activeFolder === 'starred' ? email.starred : email.folder === activeFolder;
    const searchMatch = email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
     email.sender.toLowerCase().includes(searchQuery.toLowerCase());
    const readMatch = readFilter === 'all' ? true : readFilter === 'unread' ? email.unread : !email.unread;
    return folderMatch && searchMatch && readMatch;
  });

  // Build live folder counts
  const folderCounts = FOLDERS.map(f => ({
    ...f,
    count: f.id === 'starred'
      ? emails.filter(e => e.starred).length
      : emails.filter(e => e.folder === f.id).length,
  }));

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-transparent overflow-hidden relative z-10 animate-precision-reveal">

      {/* IMAP Error Banner */}
      {imapError && (
        <div className="flex items-start gap-3 px-5 py-3 bg-amber-50 dark:bg-amber-500/10 border-b border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300 text-sm">
          <span className="text-lg">⚠️</span>
          <div>
            <span className="font-bold">Inbox sync nahi hua: </span>
            <span>{imapError}</span>
          </div>
          <button onClick={() => setImapError(null)} className="ml-auto text-amber-500 hover:text-amber-700 font-bold text-lg leading-none">×</button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden p-6 gap-6 items-stretch">

      {/* Left Sidebar - Folders */}
      <div className="w-72 precision-card hidden md:flex flex-col animate-precision-reveal shrink-0">
        <div className="p-6 border-b border-black/5 dark:border-white/[0.06] space-y-3">
          <button
            onClick={() => setIsComposing(true)}
            className="w-full btn-primary"
          >
            <Send className="w-4 h-4" />
            <span>Compose Email</span>
          </button>
          <button
            onClick={() => { fetchCampaignLogs(false); fetchImapEmails(); }}
            disabled={isImapSyncing || isLoading}
            className="w-full flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl text-[15px] font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all border border-neutral-200 dark:border-neutral-800 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isImapSyncing ? 'animate-spin text-primary' : ''}`} />
            <span>{isImapSyncing ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {folderCounts.map(folder => (
            <button
              key={folder.id}
              onClick={() => { setActiveFolder(folder.id); setSelectedEmail(null); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                activeFolder === folder.id
                  ? 'bg-blue-50 dark:bg-blue-500/10 text-primary font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium'
              }`}
            >
              <div className="flex items-center space-x-3">
                <folder.icon className={`w-4 h-4 ${activeFolder === folder.id ? 'text-primary' : 'text-slate-400'}`} />
                <span className="text-sm">{folder.label}</span>
              </div>
              {/* Badge: sirf tab dikhao jab is folder pe NA ho, aur unread ho */}
              {(() => {
                const unreadCount = emails.filter(e =>
                  (folder.id === 'starred' ? e.starred : e.folder === folder.id) && e.unread
                ).length;
                // Actively viewed folder ka badge hide karo
                const isActive = activeFolder === folder.id;
                return (!isActive && unreadCount > 0) ? (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary animate-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                ) : null;
              })()}
            </button>
          ))}
        </div>

      </div>

      {/* Middle Pane - Email List */}
      <div className="w-full md:w-[400px] precision-card flex flex-col animate-precision-reveal stagger-1 shrink-0">
        <div className="p-6 border-b border-black/5 dark:border-white/[0.06] space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-100 dark:bg-white/[0.03] border border-black/5 dark:border-white/[0.08] rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none dark:text-white transition-all font-medium"
            />
          </div>
          {/* Read / Unread / All filter tabs */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            {[
              { id: 'all',    label: 'All',    count: emails.filter(e => activeFolder === 'starred' ? e.starred : e.folder === activeFolder).length },
              { id: 'unread', label: 'Unread', count: emails.filter(e => (activeFolder === 'starred' ? e.starred : e.folder === activeFolder) && e.unread).length },
              { id: 'read',   label: 'Read',   count: emails.filter(e => (activeFolder === 'starred' ? e.starred : e.folder === activeFolder) && !e.unread).length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setReadFilter(tab.id)}
                className={`flex-1 text-[11px] font-bold py-1.5 rounded-md transition-all flex items-center justify-center space-x-1 ${
                  readFilter === tab.id
                    ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    tab.id === 'unread' ? 'bg-primary/10 text-primary' : 'bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-300'
                  }`}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-1 space-y-0.5 [&::-webkit-scrollbar]:hidden">
          {isLoading ? (
            // Precision Shimmers
            <>
              {[...Array(8)].map((_, i) => <PrecisionLoader key={i} />)}
            </>
          ) : filteredEmails.length > 0 ? (
            filteredEmails.map((email, index) => (
              <div
                key={email.id}
                onClick={() => handleSelectEmail(email)}
                className={`email-item-interactive animate-precision-reveal stagger-${(index % 10) + 1} ${
                  selectedEmail?.id === email.id ? 'email-item-active z-20' : ''
                } ${email.unread ? 'opacity-100' : 'opacity-70 text-neutral-500'}`}
              >
                <div className="flex justify-between items-center mb-1 relative z-10">
                  <span className={`text-sm tracking-tight ${email.unread ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-600 dark:text-slate-400'}`}>
                    {email.sender}
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className={`text-[11px] ${email.unread ? 'text-black dark:text-white font-bold' : 'text-neutral-500 font-medium'}`}>
                      {email.date}
                    </span>
                    {/* Hover delete button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(email); }}
                      className="opacity-0 group-hover:opacity-100 ml-1 p-1 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all relative z-20"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mb-1 relative z-10">
                  {email.unread && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
                  <h4 className={`text-sm truncate tracking-tight ${email.unread ? 'font-bold text-black dark:text-white' : 'font-medium text-neutral-400'}`}>
                    {email.subject}
                  </h4>
                </div>
                <p className="text-xs text-neutral-500 line-clamp-1 leading-normal relative z-10">
                  {email.preview}
                </p>
                {/* Read/Unread badge */}
                {email.unread && (
                  <div className="mt-2 flex relative z-10">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#3b82f6] bg-[#3b82f6]/10 px-2 py-0.5 rounded-md">New</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            // Empty state
            <div className="flex flex-col items-center justify-center p-8 text-center h-full opacity-60">
              <div className="relative mb-4">
                <InboxIcon className="w-12 h-12 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                {activeFolder === 'sent' ? 'No sent emails yet' : 'All caught up!'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {activeFolder === 'sent'
                  ? 'Launch a campaign to see sent emails here.'
                  : 'No messages in this folder.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Pane - Email Viewer */}
      <div className="flex-1 precision-card flex flex-col hidden lg:flex animate-precision-reveal stagger-2 overflow-hidden">
        {isLoading ? (
          <div className="flex-1 flex flex-col p-12 space-y-6 opacity-60">
             <div className="flex items-center space-x-6">
                <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-white/5" />
                <div className="flex-1 space-y-3">
                   <div className="w-1/3 h-6 rounded-lg bg-neutral-100 dark:bg-white/5" />
                   <div className="w-1/6 h-3 rounded-full bg-neutral-100 dark:bg-white/5" />
                </div>
             </div>
             <div className="pt-8 space-y-4">
                {[...Array(12)].map((_, i) => (
                   <div key={i} className={`h-3 rounded-full bg-neutral-100 dark:bg-white/[0.03] ${i % 3 === 2 ? 'w-2/3' : 'w-full'}`} />
                ))}
             </div>
          </div>
        ) : selectedEmail ? (
          <>
            {/* Viewer Header */}
            <div className="px-8 py-8 border-b border-black/5 dark:border-white/[0.06] flex justify-between items-start bg-transparent z-10 shrink-0">
              <div className="flex items-center space-x-5">
                <div className="w-14 h-14 rounded-2xl bg-neutral-900 dark:bg-white flex items-center justify-center text-white dark:text-black font-bold text-xl shadow-lg">
                  {selectedEmail.sender.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-black dark:text-white tracking-tight leading-tight">{selectedEmail.subject}</h2>
                  <div className="flex items-center space-x-3 mt-1.5">
                    <span className="font-bold text-sm text-neutral-800 dark:text-neutral-200">{selectedEmail.sender}</span>
                    <span className="text-xs text-neutral-400 font-medium">({selectedEmail.email})</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleStar(selectedEmail)}
                  className="p-2 text-slate-400 hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                  title="Star"
                >
                  <Star className={`w-5 h-5 transition-all ${selectedEmail.starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                </button>
                <button
                  onClick={() => handleDelete(selectedEmail)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Viewer Body */}
            <div className="flex-1 overflow-y-auto p-8 relative bg-transparent">
              {bodyLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-6">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 border-2 border-black/5 dark:border-white/5 rounded-full" />
                    <div className="absolute inset-0 border-2 border-t-primary rounded-full animate-spin" />
                  </div>
                  <span className="text-sm font-bold tracking-tight text-neutral-500 uppercase">Indexing Payload...</span>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto precision-card shadow-none overflow-hidden animate-precision-reveal relative z-10">
                  <div className="p-0">
                    <EmailBodyRenderer
                      html={selectedEmail.bodyHtml || null}
                      text={selectedEmail.body || ''}
                      subject={selectedEmail.subject}
                      sender={selectedEmail.sender}
                    />
                    
                    {/* Attachments */}
                    {selectedEmail.attachments?.length > 0 && (
                      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/50">
                        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Attachments ({selectedEmail.attachments.length})</p>
                        <div className="flex flex-wrap gap-2.5">
                          {selectedEmail.attachments.map((att, i) => (
                            <div key={i} className="flex items-center gap-2.5 px-4 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 transition-colors cursor-pointer rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm group">
                              <span className="text-lg opacity-70 group-hover:scale-110 transition-transform">📎</span>
                              <div className="flex flex-col">
                                <span className="font-semibold text-sm text-slate-700 dark:text-slate-200 leading-tight">{att.filename || 'attachment'}</span>
                                {att.size && <span className="text-xs text-slate-400 font-medium tracking-wide">{(att.size/1024).toFixed(1)} KB</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>



            {/* Viewer Actions */}
            <div className="p-6 border-t border-black/5 dark:border-white/[0.06] bg-transparent">
              <div className="max-w-2xl flex space-x-3">
                <button
                  onClick={() => handleReply(selectedEmail)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Reply className="w-4 h-4" />
                  <span>Reply</span>
                </button>
                <button
                  onClick={() => handleForward(selectedEmail)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Forward className="w-4 h-4" />
                  <span>Forward</span>
                </button>
                <button
                  onClick={() => handleArchive(selectedEmail)}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold flex items-center space-x-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm"
                  title="Archive"
                >
                  <Archive className="w-4 h-4" />
                  <span>Archive</span>
                </button>
                <button
                  onClick={() => handleDelete(selectedEmail)}
                  className="px-4 py-2.5 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-500 rounded-xl font-bold flex items-center space-x-2 hover:bg-red-100 transition-all shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-40">
            <InboxIcon className="w-16 h-16 text-slate-400 mb-4" />
            <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400">No Email Selected</h3>
            <p className="text-sm text-slate-400 mt-1">Select an email from the list to read its contents.</p>
          </div>
        )}
      </div>

      {/* Floating Compose Window */}
      {isComposing && (
        <div className="fixed bottom-0 right-10 w-[500px] h-[550px] glass-panel bg-white/80 dark:bg-slate-900/90 border border-white dark:border-slate-700/50 rounded-t-3xl shadow-[0_-20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_-20px_50px_rgba(0,0,0,0.6)] z-50 flex flex-col overflow-hidden animate-slide-up transform-gpu">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-black dark:to-slate-900 px-5 py-4 flex justify-between items-center text-white border-b border-white/5">
            <span className="font-bold text-sm tracking-wide">New Message</span>
            <button onClick={() => setIsComposing(false)} className="hover:bg-slate-700/50 p-1.5 rounded-lg transition-colors text-slate-300 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col flex-1 pb-4">
            <input type="email" placeholder="To" value={composeData.to}
              onChange={(e) => setComposeData({...composeData, to: e.target.value})}
              className="w-full border-b border-slate-100 dark:border-slate-800/60 bg-transparent px-6 py-3 text-[15px] focus:outline-none dark:text-white dark:placeholder-slate-500"
            />
            <input type="text" placeholder="Subject" value={composeData.subject}
              onChange={(e) => setComposeData({...composeData, subject: e.target.value})}
              className="w-full border-b border-slate-100 dark:border-slate-800/60 bg-transparent px-6 py-3 text-[15px] focus:outline-none dark:text-white dark:placeholder-slate-500 font-semibold"
            />
            <textarea placeholder="Write your message here..." value={composeData.body}
              onChange={(e) => setComposeData({...composeData, body: e.target.value})}
              className="w-full flex-1 bg-transparent px-6 py-4 text-[15px] focus:outline-none dark:text-slate-300 dark:placeholder-slate-600 resize-none"
            />
          </div>
          <div className="px-6 py-5 border-t border-slate-200/50 dark:border-slate-800 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md flex justify-between items-center">
            <button onClick={handleSend} className="btn-primary px-8 py-3 rounded-2xl text-sm font-bold flex items-center space-x-2 shadow-lg hover:-translate-y-1">
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
            <button onClick={() => setIsComposing(false)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 rounded-xl transition-all p-2.5">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Inbox;
