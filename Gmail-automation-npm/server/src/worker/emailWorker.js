const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');

// Use direct (non-pooler) connection for the persistent worker process
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL,
    },
  },
});

// Function to replace variables in templates: {{name}} -> Contact Name
const parseTemplate = (template, contact) => {
  let rendered = template;
  rendered = rendered.replace(/{{name}}/g, contact.name || '');
  rendered = rendered.replace(/{{email}}/g, contact.email || '');

  // Handle custom variables from CSV
  const customVars = contact.variables || {};
  Object.keys(customVars).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(regex, customVars[key]);
  });

  // Simple Spintax support: {Hi|Hello|Hey}
  const spintaxRegex = /\{([^{}]+)\}/g;
  while (rendered.match(spintaxRegex)) {
    rendered = rendered.replace(spintaxRegex, (match, options) => {
      const choices = options.split('|');
      return choices[Math.floor(Math.random() * choices.length)];
    });
  }

  return rendered;
};

const processQueue = async () => {
  // Find all RUNNING campaigns
  const campaigns = await prisma.campaign.findMany({
    where: { status: 'RUNNING' },
    include: {
      account: true,
      templates: true,
    },
  });

  for (const campaign of campaigns) {
    if (!campaign.account) continue;

    // Pick one PENDING log for this campaign
    // Using simple skip locked style if multiple workers exist (not needed for single process but good practice)
    const log = await prisma.emailLog.findFirst({
      where: {
        campaignId: campaign.id,
        status: 'PENDING',
      },
      include: { contact: true },
      orderBy: { createdAt: 'asc' },
    });

    if (!log) continue;

    // Mark as PROCESSING to prevent duplicate sends
    await prisma.emailLog.update({
      where: { id: log.id },
      data: { status: 'PROCESSING' },
    });

    try {
      // Pick a random template from the campaign
      const template = campaign.templates[Math.floor(Math.random() * campaign.templates.length)];
      if (!template) throw new Error('No templates found for campaign');

      const subject = parseTemplate(template.subject, log.contact);
      const body = parseTemplate(template.body, log.contact);

      // Add Tracking Pixel (using base64 encoded log ID)
      const trackingPixel = `<img src="${process.env.BASE_URL}/api/track/open/${log.id}" width="1" height="1" style="display:none;" />`;
      const finalBody = body + trackingPixel;

      // Setup Transporter
      const transporter = nodemailer.createTransport({
        host: campaign.account.host,
        port: campaign.account.port,
        secure: campaign.account.port === 465,
        auth: {
          user: campaign.account.email,
          pass: campaign.account.password,
        },
      });

      // Send Email
      const info = await transporter.sendMail({
        from: `"${campaign.account.fromName || campaign.name}" <${campaign.account.email}>`,
        to: log.contact.email,
        subject,
        html: finalBody,
      });

      // Update Log
      await prisma.emailLog.update({
        where: { id: log.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          messageId: info.messageId,
        },
      });

      // --- Human-Like Throttling Logic ---
      const min = campaign.minDelay || 30;
      const max = campaign.maxDelay || 60;
      
      // Base delay from campaign settings
      const baseDelay = Math.floor(Math.random() * (max - min + 1) + min);
      
      // Organic Jitter (+/- 10%) to look human
      const jitter = (Math.random() * 0.2) - 0.1; // -10% to +10%
      const finalDelaySeconds = Math.max(2, Math.floor(baseDelay * (1 + jitter)));
      
      const delayMs = finalDelaySeconds * 1000;

      console.log(`[Worker] Sent email to ${log.contact.email} (${campaign.name}).`);
      console.log(`[Worker] Next send scheduled in ${finalDelaySeconds} seconds (Base: ${baseDelay}s + Jitter).`);
      
      // Strict sleep to prevent flood
      await new Promise((resolve) => setTimeout(resolve, delayMs));

    } catch (error) {
      console.error(`Error sending email for log ${log.id}:`, error.message);
      await prisma.emailLog.update({
        where: { id: log.id },
        data: {
          status: 'FAILED',
          error: error.message,
        },
      });
    }
  }
};

// Safe, strict sequential queue polling (Prevents Stack Overflows & Overlaps)
let isProcessing = false;

const startWorkerLoop = async () => {
  if (isProcessing) return;
  isProcessing = true;
  
  try {
    await processQueue();
  } catch (err) {
    // Don't crash on DB connection errors (Neon hibernation), just retry
    if (err.message && err.message.includes("Can't reach database")) {
      console.warn('[Worker] DB not reachable (Neon may be waking up). Retrying in 15s...');
    } else {
      console.error('[Worker] Unexpected error:', err.message);
    }
  } finally {
    isProcessing = false;
    setTimeout(startWorkerLoop, 10000); 
  }
};

// Initiate background worker daemon
startWorkerLoop();

module.exports = { processQueue };
