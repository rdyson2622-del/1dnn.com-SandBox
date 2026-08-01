// Section Registry - For identifying specific areas within multi-section pages
// Format: PAGE_NUMBER.SECTION_LETTER (e.g., 1.A = Home Hero, 1.B = Home Services)

export const PAGE_SECTIONS = {
  // PAGE 1: Home
  '/Home': {
    '1.A': { id: 'hero', name: 'Hero Section', description: 'Main landing with logo and Charlie card' },
    '1.B': { id: 'promise', name: 'Dyson Promise', description: 'We move with you header section' },
    '1.C': { id: 'services', name: 'Services Grid', description: '8 service cards (AI Concierge, Agent Selection, etc.)' },
    '1.D': { id: 'gemini-cta', name: 'Gemini Session CTA', description: 'Invitation-only session callout' },
    '1.E': { id: 'city-guide-teaser', name: 'City Guide Preview', description: '6 category teaser cards' },
    '1.F': { id: 'voice-to-voice', name: 'V2V Agent Recruitment', description: '1927 Parallel card' },
    '1.G': { id: 'bob-leadership', name: 'Bob Dyson Leadership', description: '54+ years experience section' },
    '1.H': { id: 'orchestration', name: 'Intelligent Orchestration', description: '22 AI agents grid' },
    '1.I': { id: 'agent-selection', name: 'Agent Selection Process', description: 'Your agent, your choice section' },
    '1.J': { id: 'cta', name: 'CTA Section', description: 'Ready for fresh start' },
    '1.K': { id: 'footer', name: 'Footer', description: 'Bottom disclaimer' },
  },

  // PAGE 2: Dashboard
  '/Dashboard': {
    '2.A': { id: 'hero', name: 'Dashboard Hero', description: 'Welcome and Charlie intro' },
    '2.B': { id: 'quick-actions', name: 'Quick Actions', description: 'Navigation shortcuts grid' },
    '2.C': { id: 'progress', name: 'Progress Stats', description: 'Relocation progress metrics' },
    '2.D': { id: 'tasks', name: 'Tasks Timeline', description: 'Upcoming tasks list' },
  },

  // PAGE 3: Chat
  '/Chat': {
    '3.A': { id: 'header', name: 'Chat Header', description: 'Navigation and Gemini banner' },
    '3.B': { id: 'chat-interface', name: 'Chat Interface', description: 'Message conversation area' },
  },

  // PAGE 6: Gemini Session
  '/GeminiSession': {
    '6.A': { id: 'gate', name: 'Commitment Gate', description: 'Initial commitment step' },
    '6.B': { id: 'intake', name: 'Intake Form', description: 'User information form' },
    '6.C': { id: 'path-chooser', name: 'Path Selection', description: 'Choose your path options' },
    '6.D': { id: 'session', name: 'Live Session', description: 'Gemini AI conversation' },
    '6.E': { id: 'summary', name: 'Interview Summary', description: 'Session results' },
  },

  // PAGE 9: Relocation Intake
  '/RelocationIntake': {
    '9.A': { id: 'step-indicator', name: 'Step Progress', description: '4-step progress bar' },
    '9.B': { id: 'your-info', name: 'Step 1 - Your Info', description: 'Name, email, phone, family' },
    '9.C': { id: 'your-move', name: 'Step 2 - Your Move', description: 'Destination, timeline, budget' },
    '9.D': { id: 'priorities', name: 'Step 3 - Priorities', description: 'Lifestyle priorities selection' },
    '9.E': { id: 'confirm', name: 'Step 4 - Confirm', description: 'Review and submit' },
    '9.F': { id: 'scheduler', name: 'Call Scheduler', description: 'Intro call booking' },
    '9.G': { id: 'agreement', name: 'Service Agreement', description: 'Terms and checkboxes' },
  },

  // PAGE 13: Admin Dashboard
  '/Admin': {
    '13.A': { id: 'header', name: 'Admin Header', description: 'Title and navigation' },
    '13.B': { id: 'quick-stats', name: 'Quick Stats', description: 'Overview metrics' },
    '13.C': { id: 'modules-grid', name: 'Admin Modules', description: 'Module cards grid' },
    '13.D': { id: 'quick-actions', name: 'Quick Actions', description: 'Action buttons' },
  },

  // PAGE 14: Admin Owners
  '/AdminOwners': {
    '14.A': { id: 'header', name: 'Owners Header', description: 'Search and filters' },
    '14.B': { id: 'owners-list', name: 'Owners Table', description: 'Listing owners grid' },
    '14.C': { id: 'add-form', name: 'Add Owner Form', description: 'Create new owner' },
  },

  // PAGE 16: Admin Clients
  '/AdminClients': {
    '16.A': { id: 'header', name: 'Clients Header', description: 'Search and filters' },
    '16.B': { id: 'clients-list', name: 'Clients Table', description: 'Relocation clients grid' },
  },
};

// Helper: Get sections for current page
export const getSectionsForPage = (pathname) => {
  const cleanPath = pathname.split('?')[0];
  return PAGE_SECTIONS[cleanPath] || {};
};

// Helper: Get section ID from scroll position
export const getCurrentSection = (pathname, scrollY) => {
  const sections = getSectionsForPage(pathname);
  const sectionEntries = Object.entries(sections);
  
  // Find the section whose top is closest to (but above) a trigger point near the top of viewport
  const triggerPoint = 120; // pixels from top of viewport
  let currentSection = null;
  let minDistance = Infinity;
  
  for (const [code, section] of sectionEntries) {
    const element = document.getElementById(section.id);
    if (element) {
      const rect = element.getBoundingClientRect();
      
      // Check if section is visible in viewport
      if (rect.top <= window.innerHeight - 100 && rect.bottom >= triggerPoint) {
        // Calculate distance from trigger point to section top
        const distance = Math.abs(rect.top - triggerPoint);
        
        // Prefer sections where top is at or below trigger point
        if (rect.top >= triggerPoint - 50 && distance < minDistance) {
          minDistance = distance;
          currentSection = { code, ...section };
        }
      }
    }
  }
  
  // Fallback: if no section found, return the last one whose top is above trigger
  if (!currentSection) {
    for (const [code, section] of sectionEntries.reverse()) {
      const element = document.getElementById(section.id);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.top < triggerPoint) {
          return { code, ...section };
        }
      }
    }
  }
  
  return currentSection;
};