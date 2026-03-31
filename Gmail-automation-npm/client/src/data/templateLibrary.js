export const TEMPLATE_CATEGORIES = [
  'All',
  'Lead Generation & Scraping',
  'AI Chatbots & Support',
  'Workflow Automation (n8n/Make)',
  'CRM Setup & Integration',
  'Custom AI SaaS'
];

export const PREBUILT_TEMPLATES = [
  // ===================== Lead Generation & Scraping =====================
  {
    id: 'ao-lead-1',
    category: 'Lead Generation & Scraping',
    title: 'High-Volume Lead Scraping Offer',
    subject: 'Scaling your outbound pipeline',
    body: 'Hi {{name}},\n\nI was looking at your recent expansion and realized you might be scaling your outbound sales.\n\nAt AgenticOrbitx, we build custom web-scraping and auto-enrichment pipelines that deliver 5,000+ hyper-targeted leads directly to your CRM every month, completely on autopilot.\n\nAre you currently running cold email campaigns?\n\nBest,\n[Your Name]\nAgenticOrbitx'
  },
  {
    id: 'ao-lead-2',
    category: 'Lead Generation & Scraping',
    title: 'Competitor Client Poaching',
    subject: 'Targeting competitor clients',
    body: 'Hi {{name}},\n\nMany agencies struggle to find active buyers. What if you could automatically scrape the public engagements or reviews of your biggest competitor and instantly pitch them a better offer?\n\nWe build specialized data scrapers at AgenticOrbitx that monitor your competitors\' audiences and feed their active fans directly into your outbound campaign sequence.\n\nOpen to a quick demo video?\n\nCheers,\n[Your Name]\nAgenticOrbitx'
  },
  {
    id: 'ao-lead-3',
    category: 'Lead Generation & Scraping',
    title: 'Local Business Maps Scraping',
    subject: 'Automating your local outreach',
    body: 'Hi {{name}},\n\nIf you sell to brick-and-mortar stores, manual prospecting on Google Maps takes hours.\n\nMy agency, AgenticOrbitx, builds custom scripts that extract every single local business in your target area (including emails, owner names, and phone numbers) and drops them into a Google Sheet in 60 seconds.\n\nCan I send you a 2-minute loom showing this in action?\n\nBest,\n[Your Name]'
  },

  // ===================== AI Chatbots & Support =====================
  {
    id: 'ao-bot-1',
    category: 'AI Chatbots & Support',
    title: 'Customer Support AI Agent',
    subject: 'Reducing your support tickets',
    body: 'Hi {{name}},\n\nI noticed your website has strong traffic, but handling pre-sales questions manually can drain your team\'s time.\n\nAt AgenticOrbitx, we build advanced, custom-trained AI Support Agents that can answer 80% of routine customer questions instantly using your own company\'s knowledge base.\n\nMind if I build a free prototype trained on your website so you can test it?\n\nBest,\n[Your Name]\nAgenticOrbitx'
  },
  {
    id: 'ao-bot-2',
    category: 'AI Chatbots & Support',
    title: 'Lead Qualifying Chatbot',
    subject: 'Automating your lead qualification',
    body: 'Hi {{name}},\n\nWhen a prospect lands on your site at 2 AM, are you capturing them?\n\nWe install conversational AI agents that actively engage visitors, qualify them with specific sales questions, and book them directly into your calendly without any human intervention.\n\nInterested in seeing a live demo of a sales bot?\n\nThanks,\n[Your Name]\nAgenticOrbitx'
  },
  {
    id: 'ao-bot-3',
    category: 'AI Chatbots & Support',
    title: 'WhatsApp Ordering/Appointment Bot',
    subject: 'WhatsApp automation for your business',
    body: 'Hi {{name}},\n\nLocal clients prefer texting over calling. At AgenticOrbitx, we build custom WhatsApp AI Bots that let your customers book appointments, ask for quotes, or place orders directly through WhatsApp.\n\nEverything syncs straight to your Google Calendar or CRM.\n\nWould you be open to a 10-minute discovery call?\n\nRegards,\n[Your Name]'
  },

  // ===================== Workflow Automation (n8n/Make) =====================
  {
    id: 'ao-n8n-1',
    category: 'Workflow Automation (n8n/Make)',
    title: 'Data Entry Elimination',
    subject: 'Saving 20+ hours a week on manual tasks',
    body: 'Hi {{name}},\n\nMost growing companies hit a bottleneck where the team is spending hours copy-pasting data between Stripe, Slack, and your CRM.\n\nMy agency, AgenticOrbitx, specializes in n8n/Make automations that connect all your clunky apps together. When a payment goes through, we can automatically generate an invoice, notify Slack, and update the CRM.\n\nAre there any manual workflows driving your team crazy right now?\n\nBest,\n[Your Name]\nAgenticOrbitx'
  },
  {
    id: 'ao-n8n-2',
    category: 'Workflow Automation (n8n/Make)',
    title: 'AI Cold Email Infrastructure',
    subject: 'Scaling your email outreach safely',
    body: 'Hi {{name}},\n\nSending cold emails manually or with outdated platforms risks destroying your domain reputation.\n\nAt AgenticOrbitx, we set up robust outbound infrastructure using n8n. We rotate sender accounts, auto-warmip IPs, and use AI to hyper-personalize the first lines of every email.\n\nOpen to seeing our complete outbound tech stack?\n\nCheers,\n[Your Name]'
  },
  {
    id: 'ao-n8n-3',
    category: 'Workflow Automation (n8n/Make)',
    title: 'Employee Onboarding Automation',
    subject: 'Automating HR & Onboarding for your team',
    body: 'Hi {{name}},\n\nAs your company grows, bringing on new hires takes a lot of administrative work.\n\nWe build automated HR flows using n8n: one form submission generates their Google Workspace account, adds them to Slack channels, sends welcome documents, and schedules their intro meetings.\n\nMind if I send over a quick diagram showing how this works?\n\nThanks,\n[Your Name]\nAgenticOrbitx'
  },

  // ===================== CRM Setup & Integration =====================
  {
    id: 'ao-crm-1',
    category: 'CRM Setup & Integration',
    title: 'HubSpot/GoHighLevel Migration',
    subject: 'Thoughts on your current CRM setup',
    body: 'Hi {{name}},\n\nMany businesses are using CRMs that are either too complex (and expensive) or too simple (missing automation).\n\nAt AgenticOrbitx, we specialize in migrating businesses to tailored GoHighLevel or bespoke CRM setups, where lead routing, SMS follow-ups, and pipeline tracking are 100% automated.\n\nWould you be open to a free audit of your current tech stack?\n\nBest,\n[Your Name]'
  },
  {
    id: 'ao-crm-2',
    category: 'CRM Setup & Integration',
    title: 'Missed Call Text-Back',
    subject: 'Capturing missed calls at your company',
    body: 'Hi {{name}},\n\nEvery missed call to your business could be a lost client.\n\nWe implement automated Missed Call Text-Back systems. If someone calls and you miss it, they instantly get an SMS: "Hi, this is AgenticOrbitx Client Services. We missed your call, how can we help you today?"\n\nOpen to a quick chat to see how easily this can be installed?\n\nRegards,\n[Your Name]\nAgenticOrbitx'
  },

  // ===================== Custom AI SaaS =====================
  {
    id: 'ao-saas-1',
    category: 'Custom AI SaaS',
    title: 'Internal AI App Development',
    subject: 'An internal AI tool for your company',
    body: 'Hi {{name}},\n\nOff-the-shelf software rarely fits a business perfectly.\n\nAt AgenticOrbitx, we build custom internal micro-SaaS web apps powered by AI. Whether you need a custom dashboard to analyze 10,000 PDFs or an internal tool to draft proposals instantly, we build it in weeks, not months.\n\nLet me know if you are open to a quick discovery call.\n\nBest,\n[Your Name]\nAgenticOrbitx'
  },
  {
    id: 'ao-saas-2',
    category: 'Custom AI SaaS',
    title: 'Automated Proposal Generation',
    subject: 'Drafting proposals instantly for your sales team',
    body: 'Hi {{name}},\n\nDrafting detailed, high-quality proposals takes your sales team hours.\n\nWe design custom AI engines at AgenticOrbitx that take rough meeting notes and instantly generate a formatted, persuasive 5-page PDF proposal, saving thousands of hours a year.\n\nWorth 5 minutes to see a live demo of this?\n\nThanks,\n[Your Name]'
  }
];
