const prisma = require('../prisma');
const csv = require('csv-parser');
const fs = require('fs');

const createCampaign = async (req, res) => {
  const { name, minDelay, maxDelay, accountId, templates } = req.body;

  try {
    const fallbackUser = await prisma.user.findFirst();

    // Auto-pick first SMTP account if none provided
    let resolvedAccountId = accountId || null;
    if (!resolvedAccountId) {
      const firstAccount = await prisma.account.findFirst();
      if (firstAccount) resolvedAccountId = firstAccount.id;
    }

    if (!resolvedAccountId) {
      return res.status(400).json({ 
        error: 'No SMTP account configured. Please add an SMTP relay in Admin → Global SMTP Relays before launching a campaign.' 
      });
    }

    const campaign = await prisma.campaign.create({
      data: {
        name,
        minDelay: parseInt(minDelay) || 30,
        maxDelay: parseInt(maxDelay) || 60,
        accountId: resolvedAccountId,
        userId: (req.user && req.user.id) ? req.user.id : fallbackUser.id,
        status: 'RUNNING',
        templates: {
          create: templates?.map((t) => ({
            subject: t.subject,
            body: t.body,
          })) || [],
        },
      },
      include: {
        templates: true,
      },
    });

    res.status(201).json(campaign);
  } catch (error) {
    console.error("Backend API Error [createCampaign]:", error);
    res.status(500).json({ error: error.message });
  }
};

const uploadContacts = async (req, res) => {
  const { campaignId } = req.params;
  const results = [];

  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        const contactData = results
          .filter(row => row.email || row.Email)
          .map((row) => ({
            campaignId,
            email: row.email || row.Email,
            name: row.name || row.Name || '',
            variables: row, 
          }));

        if (contactData.length === 0) {
          fs.unlinkSync(req.file.path);
          return res.status(400).json({ 
            error: 'Invalid CSV format. Make sure your file has a header row with exactly "email" or "Email" as a column name.' 
          });
        }

        const createdContacts = await prisma.contact.createMany({
          data: contactData,
          skipDuplicates: true,
        });

        // Create PENDING logs for all these contacts
        const contacts = await prisma.contact.findMany({
          where: { campaignId },
        });

        await prisma.emailLog.createMany({
          data: contacts.map((c) => ({
            campaignId,
            contactId: c.id,
            status: 'PENDING',
          })),
        });

        // Auto-activate: set campaign to RUNNING so worker picks it up immediately
        await prisma.campaign.update({
          where: { id: campaignId },
          data: { status: 'RUNNING' },
        });

        fs.unlinkSync(req.file.path); // Clean up
        res.json({ message: 'Contacts uploaded and queued', count: createdContacts.count });
      } catch (error) {
        console.error("Backend Error [uploadContacts]:", error);
        res.status(500).json({ error: error.message });
      }
    });
};

const getCampaigns = async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        _count: { select: { contacts: true, logs: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const campaign = await prisma.campaign.update({
      where: { id },
      data: { status },
    });
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllContacts = async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      include: { campaign: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllTemplates = async (req, res) => {
  try {
    const templates = await prisma.template.findMany({
      include: { campaign: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { 
  createCampaign, 
  uploadContacts, 
  getCampaigns, 
  updateStatus, 
  getAllContacts, 
  getAllTemplates 
};
