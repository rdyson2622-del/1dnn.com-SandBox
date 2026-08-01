import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, MapPin, Home, Package, Zap, GraduationCap, HeartPulse, Users, CalendarCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { appClient } from '@/api/appClient';

const GEMINI_API_KEY_NOTE = true; // Using Gemini via backend

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

export default function MovePlan({ profile, onChatAbout }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    generatePlan();
  }, []);

  const generatePlan = async () => {
    setLoading(true);

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

    const result = await appClient.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          city_research: { type: 'string' },
          home_search: { type: 'string' },
          moving_logistics: { type: 'string' },
          utilities: { type: 'string' },
          schools: { type: 'string' },
          healthcare: { type: 'string' },
          community: { type: 'string' },
          checklist: { type: 'string' },
        },
      },
    });

    setPlan(result);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
          <Loader2 className="w-8 h-8" style={{ color: GOLD }} />
        </motion.div>
        <div className="text-center">
          <p className="font-bold text-sm" style={{ color: GOLD }}>Building your Relocation Plan...</p>
          <p className="text-xs mt-1" style={{ color: '#555' }}>Personalizing every step for {profile.destination_city}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 pt-3 pb-2" style={{ borderBottom: '1px solid #1a1a1a' }}>
        <p className="font-bold text-sm" style={{ color: GOLD }}>My Relocation Plan</p>
        <p className="text-xs mt-0.5" style={{ color: '#555' }}>
          {profile.current_city} → {profile.destination_city} • {profile.move_date}
        </p>
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