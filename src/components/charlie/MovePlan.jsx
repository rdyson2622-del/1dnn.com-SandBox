import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Home, Package, Zap, GraduationCap, HeartPulse, Users, CalendarCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { appClient } from '@/api/appClient';

const GOLD = '#D4AF37';

const PLAN_STEPS = [
  { id: 'city_research', icon: MapPin, label: '🏙️ City & Neighborhood Research', color: '#6366f1' },
  { id: 'home_search', icon: Home, label: '🏠 Home Search & Agent Match', color: '#f59e0b' },
  { id: 'moving_logistics', icon: Package, label: '📦 Moving Logistics Plan', color: '#10b981' },
  { id: 'utilities', icon: Zap, label: '🔌 Utilities & Services Transfer', color: '#3b82f6' },
  { id: 'schools', icon: GraduationCap, label: '🎓 School Research & Enrollment', color: '#8b5cf6' },
  { id: 'healthcare', icon: HeartPulse, label: '🏥 Healthcare Provider Setup', color: '#ef4444' },
  { id: 'community', icon: Users, label: '🤝 Local Community Connections', color: '#14b8a6' },
  { id: 'checklist', icon: CalendarCheck, label: '✅ 30/60/90 Day Settling-In Plan', color: '#f97316' },
];

const valueOr = (value, fallback) => String(value || '').trim() || fallback;

const buildInstantPlan = (profile) => {
  const origin = valueOr(profile.current_city, 'your current city');
  const destination = valueOr(profile.destination_city, 'your destination city');
  const moveDate = valueOr(profile.move_date, 'your target move date');
  const budget = valueOr(profile.budget, 'your preferred budget');
  const housing = valueOr(profile.purchase_type, 'home search');
  const household = profile.family_size
    ? `your household of ${profile.family_size}`
    : 'your household';
  const priorities = Array.isArray(profile.priorities) && profile.priorities.length
    ? profile.priorities.slice(0, 3).join(', ')
    : 'commute, lifestyle, and day-to-day convenience';

  return {
    city_research: `We’ll compare ${destination} neighborhoods around ${priorities}, then narrow the list to the areas that fit ${household}. Charlie can help turn those priorities into a focused neighborhood shortlist before you spend time touring.`,
    home_search: `For your ${housing} in ${destination}, we’ll work from ${budget} and match you with a vetted local professional who understands relocation timelines. We’ll coordinate virtual previews, offer strategy, and the handoff from ${origin} so the search stays organized.`,
    moving_logistics: `Working backward from ${moveDate}, reserve your mover early and create separate move, donate, store, and carry-with-you lists. Keep closing, travel, and delivery dates on one shared calendar so ${household} arrives with essentials immediately available.`,
    utilities: `Schedule shutoff dates in ${origin} only after confirming possession and travel plans, then start electricity, water, internet, and insurance for ${destination} before arrival. Keep confirmation numbers and account contacts together for a quick first-week check.`,
    schools: `If school or childcare applies, compare boundaries, enrollment documents, calendars, and commute time before choosing a neighborhood in ${destination}. Request records early and confirm enrollment directly with the district or provider before making a housing decision.`,
    healthcare: `Transfer prescriptions and request medical, dental, vision, and veterinary records before the move. Build a short list of in-network providers near your likely ${destination} neighborhoods and identify the closest urgent-care and emergency options.`,
    community: `Use your interests—${priorities}—to identify a few welcoming groups, local events, and everyday places in ${destination}. Choosing one familiar weekly activity during the first month can make the new city feel settled much faster.`,
    checklist: `In the first 30 days, complete utilities, address changes, registrations, and essential appointments. By 60 days, review commute and service choices; by 90 days, revisit the plan with Charlie and close any remaining housing, school, healthcare, or community tasks.`,
  };
};

const isCompletePlan = (candidate) => PLAN_STEPS.every(
  ({ id }) => typeof candidate?.[id] === 'string' && candidate[id].trim(),
);

export default function MovePlan({ profile, onChatAbout }) {
  const [plan, setPlan] = useState(() => buildInstantPlan(profile));
  const [enhancing, setEnhancing] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    let active = true;
    const instantPlan = buildInstantPlan(profile);
    setPlan(instantPlan);
    setEnhancing(true);

    const generatePlan = async () => {
      try {
        const priorities = profile.priorities?.join(', ') || 'general lifestyle';
        const prompt = `You are Charlie, AI concierge for Concierge Relocation Services.

A client is relocating from ${profile.current_city || 'their current city'} to ${profile.destination_city}.
Timeline: ${profile.move_date || 'TBD'}
Family: ${profile.family_size || 'unknown'} ${profile.family_notes ? `(${profile.family_notes})` : ''}
Budget: ${profile.budget || 'TBD'}
Housing: ${profile.purchase_type || 'buying'}
Priorities: ${priorities}

Generate a personalized Relocation Plan. For each of these 8 steps, write 2-3 specific, actionable sentences tailored to their exact situation. Be specific to ${profile.destination_city}. Be warm, expert, and encouraging.

Return a JSON object with these exact keys:
city_research, home_search, moving_logistics, utilities, schools, healthcare, community, checklist

Each value should be a string with 2-3 sentences of specific, personalized guidance.`;

        const result = await Promise.race([
          appClient.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
              type: 'object',
              properties: Object.fromEntries(PLAN_STEPS.map(({ id }) => [id, { type: 'string' }])),
              required: PLAN_STEPS.map(({ id }) => id),
            },
          }),
          new Promise((_, reject) => {
            window.setTimeout(() => reject(new Error('Plan enhancement timed out')), 6000);
          }),
        ]);

        if (active && isCompletePlan(result)) setPlan(result);
      } catch {
        // The instant plan remains available when the optional AI enhancement is offline.
      } finally {
        if (active) setEnhancing(false);
      }
    };

    generatePlan();
    return () => { active = false; };
  }, [profile]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 pt-3 pb-2" style={{ borderBottom: '1px solid #1a1a1a' }}>
        <p className="font-bold text-sm" style={{ color: GOLD }}>My Relocation Plan</p>
        <p className="text-xs mt-0.5" style={{ color: '#555' }}>
          {profile.current_city} → {profile.destination_city} • {profile.move_date}
        </p>
        {enhancing && (
          <p className="text-[10px] mt-1" style={{ color: '#777' }}>
            Plan ready • Charlie is adding extra detail in the background
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {PLAN_STEPS.map((step, i) => {
          const isOpen = expanded === step.id;
          const text = plan?.[step.id];

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-xl overflow-hidden"
              style={{ background: '#111', border: isOpen ? `1px solid ${GOLD}55` : '1px solid #1e1e1e' }}
            >
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-left"
                onClick={() => setExpanded(isOpen ? null : step.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium" style={{ color: isOpen ? GOLD : '#ccc' }}>
                    {step.label}
                  </span>
                </div>
                {isOpen
                  ? <ChevronUp className="w-4 h-4 shrink-0" style={{ color: GOLD }} />
                  : <ChevronDown className="w-4 h-4 shrink-0" style={{ color: '#444' }} />
                }
              </button>

              {isOpen && text && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="px-4 pb-4"
                >
                  <p className="text-sm leading-relaxed mb-3" style={{ color: '#999' }}>{text}</p>
                  <button
                    onClick={() => onChatAbout(step.label)}
                    className="text-xs px-3 py-1.5 rounded-lg font-bold transition-all"
                    style={{ background: 'rgba(212,175,55,0.1)', color: GOLD, border: `1px solid ${GOLD}33` }}
                  >
                    Ask Charlie about this →
                  </button>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="p-4" style={{ borderTop: '1px solid #1a1a1a' }}>
        <button
          onClick={() => onChatAbout("Let's go through my full move plan step by step")}
          className="w-full py-3 rounded-xl font-bold text-sm"
          style={{ background: GOLD, color: '#000' }}
        >
          Talk Through My Plan with Charlie
        </button>
      </div>
    </div>
  );
}
