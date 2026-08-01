// Pre-built message templates aligned with your messaging strategy
// Focus: Information gathering, local expertise, task support, nationwide presence
// Agent matching comes later after trust is established

export const TEMPLATE_SEEDS = [
  // INITIAL OUTREACH - Get their attention
  {
    name: "First Contact - SMS Discovery",
    category: "initial_outreach",
    communication_type: "sms",
    description: "Opening message to introduce our services and begin conversation",
    content: "Hi {{owner_name}}, we help people relocating from {{property_address}} get settled in their new city with local expert guidance — completely free to you. Are you planning a move? We'd love to help. dysonrelo.com",
    placeholders: ["owner_name", "property_address"]
  },
  {
    name: "First Contact - Email Professional",
    category: "initial_outreach",
    communication_type: "email",
    description: "Formal introduction via email",
    content: "Dear {{owner_name}},\n\nI noticed your property at {{property_address}} ({{listing_price}}). If you're relocating, we provide comprehensive relocation support across all 50 states and internationally.\n\nOur service includes local market expertise, vetted service providers, and coordination of your entire move.\n\nWould you be open to a brief conversation?\n\nBest regards",
    placeholders: ["owner_name", "property_address", "listing_price"]
  },

  // TRUST BUILDING - Establish credibility
  {
    name: "Trust - Our National Presence",
    category: "trust_building",
    communication_type: "sms",
    description: "Emphasize nationwide coverage and local expertise",
    content: "{{owner_name}}, we have boots on the ground in all 50 states + Canada, UK, Australia. Every city has vetted local contacts and service providers we personally know. Your move will be handled by someone who knows {{destination_city}}. dysonrelo.com",
    placeholders: ["owner_name", "destination_city"]
  },
  {
    name: "Trust - Expertise & Experience",
    category: "trust_building",
    communication_type: "email",
    description: "Build confidence through knowledge",
    content: "Hi {{owner_name}},\n\nHere's what we bring to your relocation to {{destination_city}}:\n\n✓ Deep local knowledge (not generic info)\n✓ Pre-vetted moving companies, utility contacts, schools\n✓ Real relationships with service providers we trust\n✓ Coordination of EVERY part of your move\n✓ Someone who actually lives there to guide you\n\nThis isn't a directory. It's a concierge service.\n\nReady to talk?",
    placeholders: ["owner_name", "destination_city"]
  },
  {
    name: "Trust - Local Relationships",
    category: "trust_building",
    communication_type: "sms",
    description: "Highlight vetted contacts",
    content: "We don't just give you names. We have relationships with the best movers, schools, utilities, contractors in {{destination_city}}. And we coordinate it all for you — at no cost. dysonrelo.com",
    placeholders: ["destination_city"]
  },

  // INFORMATION GATHERING - Understand their needs
  {
    name: "Gather Info - Timeline & Goals",
    category: "information_gathering",
    communication_type: "sms",
    description: "Ask discovery questions",
    content: "{{owner_name}}, to help you best: When are you targeting the move to {{destination_city}}? And what's most important — schools, commute, neighborhood vibe, budget? We manage the whole process, free to you. dysonrelo.com",
    placeholders: ["owner_name", "destination_city"]
  },
  {
    name: "Gather Info - Deep Discovery",
    category: "information_gathering",
    communication_type: "email",
    description: "Comprehensive questionnaire",
    content: "Hi {{owner_name}},\n\nTo give you the most helpful guidance for {{destination_city}}, I'd like to understand:\n\n• Timeline: When do you want to be settled?\n• Budget: What's your target price range?\n• Family: Kids? Any special needs?\n• Lifestyle: Walkability, dining, nightlife, schools, outdoor access?\n• Work: Commute preferences?\n• Neighborhoods: Any you've heard about?\n\nThe more I know, the better I can prepare you and coordinate your move.\n\nCan we schedule a 15-minute call?",
    placeholders: ["owner_name", "destination_city"]
  },

  // TASK COORDINATION - Show value early
  {
    name: "Tasks - Move Checklist",
    category: "task_coordination",
    communication_type: "email",
    description: "Share comprehensive relocation checklist",
    content: "{{owner_name}},\n\nHere's what we'll handle for your move to {{destination_city}}:\n\nHOUSING:\n✓ Market analysis for your budget\n✓ Neighborhood recommendations\n✓ New construction intel\n\nMOVING LOGISTICS:\n✓ Vetted moving company coordination\n✓ Utilities setup (water, gas, electric, internet)\n✓ Address changes and mail forwarding\n\nCOMMUNITY SETUP:\n✓ School research and registration\n✓ Healthcare provider recommendations\n✓ Local service providers (plumbers, contractors, cleaners)\n✓ Banking and insurance updates\n\nSETTLING IN:\n✓ Neighborhood introduction\n✓ Local restaurant & activity recommendations\n✓ Your personal relocation coordinator\n\nLet's get started.",
    placeholders: ["owner_name", "destination_city"]
  },
  {
    name: "Tasks - Service Provider Network",
    category: "task_coordination",
    communication_type: "sms",
    description: "Highlight our network",
    content: "{{owner_name}}, instead of researching moving companies, schools, contractors — we have pre-vetted options ready for you in {{destination_city}}. We'll coordinate all of it, free to you. dysonrelo.com",
    placeholders: ["owner_name", "destination_city"]
  },

  // FOLLOW UP - Keep momentum
  {
    name: "Follow Up - Week 1",
    category: "follow_up",
    communication_type: "sms",
    description: "First follow-up",
    content: "{{owner_name}}, just checking in. Still considering the move to {{destination_city}}? Happy to answer any questions about the process — no cost, no pressure. dysonrelo.com",
    placeholders: ["owner_name", "destination_city"]
  },
  {
    name: "Follow Up - Value Add",
    category: "follow_up",
    communication_type: "email",
    description: "Share specific insights",
    content: "Hi {{owner_name}},\n\nThought you'd find this useful: {{destination_city}} market is moving fast right now. Here's what we're seeing in your budget range.\n\nWhen you're ready to discuss your move timeline, I've got on-the-ground contacts ready to support you.\n\nLooking forward to helping with this transition.",
    placeholders: ["owner_name", "destination_city"]
  },

  // CHARLIE INTRO - AI concierge
  {
    name: "Charlie Intro - Initial Meeting",
    category: "charlie_intro",
    communication_type: "email",
    description: "Introduce AI concierge to handle deep discovery",
    content: "Hi {{owner_name}},\n\nI want you to meet Charlie—our AI relocation specialist who can dive deep into {{destination_city}}, understand your specific situation, and coordinate your entire move.\n\nCharlie has intel on neighborhoods, schools, pricing, service providers, and timeline. You just have a conversation. Then I handle execution.\n\nWhen are you free for a 20-minute chat with Charlie?",
    placeholders: ["owner_name", "destination_city"]
  },
  {
    name: "Charlie Intro - For Interested Prospects",
    category: "charlie_intro",
    communication_type: "sms",
    description: "Quick Charlie intro for engaged leads",
    content: "{{owner_name}}, ready to talk details? Our AI Charlie will dig into {{destination_city}}, ask the right questions, and map your entire relocation. Then we execute — free to you as the buyer. dysonrelo.com",
    placeholders: ["owner_name", "destination_city"]
  },

  // AGENT-FOCUSED - Only after trust is built
  {
    name: "Late Stage - Agent Introduction",
    category: "initial_outreach",
    communication_type: "email",
    description: "Introduce agent AFTER all preparation is done",
    content: "Hi {{owner_name}},\n\nWe've prepared your {{destination_city}} market intel and coordinated your move logistics. Now meet {{agent_name}}, your local agent there. \n\n{{agent_name}} knows the best neighborhoods, current inventory, and will handle your new purchase/rental.\n\nYou've got a full team now. Let's close this move.",
    placeholders: ["owner_name", "destination_city", "agent_name"]
  },
];

// Helper to load templates into database
export async function seedTemplates() {
  const appClient = await import('@/api/appClient').then(m => m.appClient);
  
  try {
    // Check if templates already exist
    const existing = await appClient.entities.MessageTemplate.list();
    if (existing.length > 0) {
      console.log('Templates already seeded');
      return;
    }

    // Create all templates
    for (const template of TEMPLATE_SEEDS) {
      await appClient.entities.MessageTemplate.create(template);
    }
    console.log('Templates seeded successfully');
  } catch (error) {
    console.error('Error seeding templates:', error);
  }
}
