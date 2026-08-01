// Full Site Page Registry — Use page numbers for instant bug/feedback reference
// "Page 15 has a typo" = instant location identification across the entire platform

export const PAGE_REGISTRY = {
  // ========== PUBLIC / CLIENT PAGES ==========
  1:  { name: 'Home',                   path: '/',                            section: 'Public' },
  2:  { name: 'My Progress',            path: '/dashboard',                   section: 'Client' },
  3:  { name: 'Chat with Charlie',      path: '/chat',                        section: 'Client' },
  4:  { name: 'City Guide',             path: '/CityGuide',                   section: 'Client' },
  5:  { name: 'Property Search',        path: '/search',                      section: 'Client' },
  6:  { name: 'Gemini Session',         path: '/GeminiSession',               section: 'Client' },
  7:  { name: 'Explainers',             path: '/Explainers',                  section: 'Public' },
  8:  { name: 'Agent Explainer',        path: '/AgentExplainer',              section: 'Public' },
  9:  { name: 'Relocation Intake',      path: '/relocation-intake',           section: 'Client' },
  10: { name: 'Relocation Roadmap',     path: '/RelocationRoadmap',           section: 'Client' },
  11: { name: 'Property Comparison',    path: '/PropertyComparison',          section: 'Client' },
  12: { name: 'Action Steps',           path: '/RelocationActionSteps',       section: 'Client' },
  13: { name: 'DNN News',               path: '/dnn-news',                    section: 'Client' },
  14: { name: 'My Agent',               path: '/my-agent',                    section: 'Client' },
  15: { name: 'Financial Services',     path: '/financial-services',          section: 'Client' },
  16: { name: 'Relo Management',        path: '/relo-management',             section: 'Client' },
  17: { name: 'Bob Dyson',              path: '/bob-dyson',                   section: 'Public' },
  18: { name: 'AI Assistants',          path: '/ai-assistants',               section: 'Public' },
  19: { name: 'Solve My Story',         path: '/solve-my-story',              section: 'Public' },
  20: { name: 'Find Agent',             path: '/find-agent',                  section: 'Client' },
  21: { name: 'Media Room',             path: '/media',                       section: 'Public' },
  22: { name: 'Communications Hub',     path: '/communications-explainer',    section: 'Client' },

  // ========== ADMIN PAGES ==========
  30: { name: 'Admin Dashboard',        path: '/admin',                       section: 'Admin' },
  31: { name: 'Admin Clients',          path: '/admin/clients',               section: 'Admin' },
  32: { name: 'Client Detail',          path: '/admin/client-detail',         section: 'Admin' },
  33: { name: 'Communications',         path: '/admin/communications',        section: 'Admin' },
  34: { name: 'Search Profiles',        path: '/admin/search-profiles',       section: 'Admin' },
  35: { name: 'Listing Owners',         path: '/admin/owners',                section: 'Admin' },
  36: { name: 'Outreach Campaigns',     path: '/admin/outreach-campaigns',    section: 'Admin' },
  37: { name: 'Outreach Pipeline',      path: '/admin/outreach-pipeline',     section: 'Admin' },
  38: { name: 'Batch SMS Log',          path: '/admin/batch-sms-log',         section: 'Admin' },
  39: { name: 'Outreach Analytics',     path: '/admin/outreach-analytics',    section: 'Admin' },
  40: { name: 'SMS Sequences',          path: '/admin/sms-sequences',         section: 'Admin' },
  41: { name: 'Owner Kanban',           path: '/admin/owner-kanban',          section: 'Admin' },
  42: { name: 'Compose SMS',            path: '/admin/compose-sms',           section: 'Admin' },
  43: { name: 'DNN News Feed',          path: '/admin/dnn/news-feed',         section: 'Admin' },
  44: { name: 'DNN Market Data',        path: '/admin/dnn/market-data',       section: 'Admin' },
  45: { name: 'DNN Subscribers CRM',    path: '/admin/dnn/subscribers',       section: 'Admin' },
  46: { name: 'DNN Comms Hub',          path: '/admin/dnn/communications',    section: 'Admin' },
  47: { name: 'DNN Agent Bureau',       path: '/admin/dnn/agent-bureau',      section: 'Admin' },
  48: { name: 'Active Campaigns',       path: '/admin/active-campaigns',      section: 'Admin' },
  49: { name: 'Scheduled Campaigns',    path: '/admin/scheduled-campaigns',   section: 'Admin' },
  50: { name: 'Video SMS Campaign',     path: '/admin/video-sms-campaign',    section: 'Admin' },
  51: { name: 'Video Library',          path: '/admin/video-library',         section: 'Admin' },
  52: { name: 'Media CRM',              path: '/admin/media-crm',             section: 'Admin' },
  53: { name: 'Pitch Tracker',          path: '/admin/pitch-tracker',         section: 'Admin' },
  54: { name: 'Press Kit',              path: '/admin/press-kit',             section: 'Admin' },
  55: { name: 'Mass Pitch',             path: '/admin/mass-pitch',            section: 'Admin' },
  56: { name: 'Opt-Ins',                path: '/admin/opt-ins',               section: 'Admin' },
  57: { name: 'Presentation Library',   path: '/admin/presentation-library',  section: 'Admin' },
  58: { name: 'Flagged Conversations',  path: '/admin/flagged-conversations', section: 'Admin' },
  59: { name: 'Referrals',              path: '/admin/referrals',             section: 'Admin' },
  60: { name: "Charlie Scripts",        path: '/admin/charlie-scripts',       section: 'Admin' },
  61: { name: "Charlie Knowledge Base", path: '/admin/charlie-knowledge-base',section: 'Admin' },
  62: { name: "Charlie Escalations",    path: '/admin/charlie-escalations',   section: 'Admin' },
  63: { name: 'Skip Trace',             path: '/admin/skip-trace',            section: 'Admin' },
  64: { name: 'Bulk Skip Trace',        path: '/admin/bulk-skip-trace',       section: 'Admin' },
  65: { name: 'Marketing Campaigns',    path: '/admin/marketing-campaigns',   section: 'Admin' },
  66: { name: 'Target Audiences',       path: '/admin/target-audiences',      section: 'Admin' },
  67: { name: 'Campaign Roadmap',       path: '/admin/campaign-roadmap',      section: 'Admin' },
  68: { name: 'Social Launch',          path: '/admin/social-launch',         section: 'Admin' },
  69: { name: 'Business Plan',          path: '/admin/business-plan',         section: 'Admin' },
  70: { name: 'New Landing Page',       path: '/admin/new-landing-page',      section: 'Admin' },
  71: { name: 'Relo Management Admin',  path: '/admin/relo-management',       section: 'Admin' },
  72: { name: 'DNN Revenue',            path: '/admin/dnn/revenue',           section: 'Admin' },
  73: { name: 'Agent Vetting',          path: '/admin/dnn/agent-vetting',     section: 'Admin' },
  74: { name: 'Lender Vetting',         path: '/admin/dnn/lender-vetting',    section: 'Admin' },
  75: { name: 'Bureau Stories',         path: '/admin/dnn/bureau-stories',    section: 'Admin' },
  76: { name: 'Charlie Scripts (Old)',  path: '/admin/scripts',               section: 'Admin' },
};

// Helper function: Get page number by path
export const getPageNumberByPath = (path) => {
  const cleanPath = path.split('?')[0];
  for (const [number, page] of Object.entries(PAGE_REGISTRY)) {
    if (page.path === cleanPath || page.path.split(':')[0] === cleanPath.split('/').slice(0, -1).join('/') + '/') {
      return number;
    }
  }
  return null;
};

// Helper function: Get page info by number
export const getPageByNumber = (number) => PAGE_REGISTRY[number];