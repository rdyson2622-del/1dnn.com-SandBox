import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronRight, ChevronLeft, Send, MapPin, Home, Users, Star, UserCheck, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { appClient } from '@/api/appClient';

const GOLD = '#D4AF37';

const SECTIONS = [
  { id: 'destination', label: 'Destination', icon: MapPin },
  { id: 'budget', label: 'Budget', icon: Home },
  { id: 'property', label: 'Property', icon: Building },
  { id: 'family', label: 'Family', icon: Users },
  { id: 'priorities', label: 'Priorities', icon: Star },
  { id: 'agent', label: 'Agent Style', icon: UserCheck },
  { id: 'current', label: 'Current Home', icon: Home },
];

const TIMELINES = ['Within 3 months', '3–6 months', '6–12 months', '12+ months', 'Just exploring'];
const BUDGETS = ['Under $300,000', '$300k – $500k', '$500k – $750k', '$750k – $1 million', '$1M – $1.5M', 'Over $1.5 million'];
const PROPERTY_TYPES = ['Single Family Home', 'Condo / High-Rise', 'Townhouse', 'New Construction', 'Gated Community', 'Luxury / Custom'];
const FAMILY_SIZES = ['Just me', 'Couple (no kids)', '1–2 children', '3+ children', 'Multi-generational'];
const KID_AGES = ['Infants (0–2)', 'Preschool (3–5)', 'Elementary (6–11)', 'Middle School (12–14)', 'High School (15–18)', 'No children'];
const PRIORITIES = [
  'Top-rated schools', 'Short commute', 'Walkable neighborhoods', 'Safety & low crime',
  'Nature / outdoor access', 'Dining & nightlife', 'Religious community', 'Sports & recreation',
  'Arts & culture', 'Shopping & conveniences', 'Healthcare access', 'Quiet / suburban feel',
];
const AGENT_STYLES = [
  'Always available / quick to respond',
  'Data-driven and analytical',
  'Warm, relationship-focused',
  'Luxury market specialist',
  'First-time buyer experience',
  'Strong negotiator / assertive',
  'Patient and educational',
  'Tech-savvy / digital-first',
];
const CURRENT_SITUATIONS = [
  'I own and need to sell first',
  'I own and my home is already listed',
  'My home is under contract / sold',
  'I currently rent — no home to sell',
  'I own and NOT selling (investment / second home)',
];

function CheckOption({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left flex gap-3 items-center p-3 rounded-xl transition-all"
      style={{
        background: selected ? 'rgba(212,175,55,0.15)' : '#555',
        border: selected ? `1px solid ${GOLD}55` : '1px solid #777',
      }}
    >
      <div className="w-5 h-5 rounded-md shrink-0 flex items-center justify-center transition-all"
        style={{ background: selected ? GOLD : 'transparent', border: `1.5px solid ${selected ? GOLD : '#666'}` }}>
        {selected && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
      </div>
      <span style={{ color: selected ? '#fff' : '#ccc', fontSize: '0.97rem' }}>{label}</span>
    </button>
  );
}

function SectionHeader({ icon: SectionIcon, title, subtitle }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-1">
        <SectionIcon className="w-5 h-5" style={{ color: GOLD }} />
        <h3 className="font-bold text-lg" style={{ color: '#fff' }}>{title}</h3>
      </div>
      {subtitle && <p style={{ color: '#aaa', fontSize: '0.9rem' }}>{subtitle}</p>}
    </div>
  );
}

export default function RelocationIntakeForm({ clientInfo, onComplete }) {
  const [section, setSection] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    destination_city: '',
    destination_state: '',
    timeline: '',
    budget: '',
    property_types: [],
    family_size: '',
    kid_ages: [],
    pets: '',
    priorities: [],
    agent_styles: [],
    current_situation: '',
    additional_notes: '',
  });

  const toggle = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(x => x !== value)
        : [...prev[field], value],
    }));
  };

  const setSingle = (field, value) => {
    setForm(prev => ({ ...prev, [field]: prev[field] === value ? '' : value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    // Save to RelocationClient entity
    await appClient.entities.RelocationClient.create({
      full_name: clientInfo.name,
      email: clientInfo.email,
      phone: clientInfo.phone || '',
      destination_city: form.destination_city,
      budget: form.budget,
      priorities: form.priorities,
      notes: buildNotesString(),
      status: 'in_consultation',
    }).catch(() => {});

    // Send email notification via backend function
    await appClient.functions.invoke('sendIntakeEmail', { clientInfo, form }).catch(() => {});

    setSubmitting(false);
    onComplete(form);
  };

  const buildNotesString = () => {
    return [
      `Destination: ${form.destination_city}, ${form.destination_state}`,
      `Timeline: ${form.timeline}`,
      `Budget: ${form.budget}`,
      `Property Types: ${form.property_types.join(', ')}`,
      `Family: ${form.family_size}`,
      `Kid Ages: ${form.kid_ages.join(', ') || 'N/A'}`,
      `Pets: ${form.pets || 'Not specified'}`,
      `Priorities: ${form.priorities.join(', ')}`,
      `Agent Style: ${form.agent_styles.join(', ')}`,
      `Current Situation: ${form.current_situation}`,
      `Notes: ${form.additional_notes || 'None'}`,
    ].join('\n');
  };

  const buildEmailBody = () => {
    return `
NEW RELOCATION PROFILE SUBMITTED
================================

CLIENT: ${clientInfo.name}
EMAIL: ${clientInfo.email}
PHONE: ${clientInfo.phone || 'Not provided'}

--- DESTINATION ---
City: ${form.destination_city}
State: ${form.destination_state}
Timeline: ${form.timeline}

--- BUDGET ---
${form.budget}

--- PROPERTY PREFERENCES ---
Types: ${form.property_types.join(', ') || 'Not selected'}

--- FAMILY ---
Household: ${form.family_size}
Children ages: ${form.kid_ages.join(', ') || 'N/A'}
Pets: ${form.pets || 'Not specified'}

--- LIFESTYLE PRIORITIES ---
${form.priorities.map(p => '• ' + p).join('\n') || 'None selected'}

--- PREFERRED AGENT STYLE ---
${form.agent_styles.map(a => '• ' + a).join('\n') || 'None selected'}

--- CURRENT HOME SITUATION ---
${form.current_situation || 'Not specified'}

--- ADDITIONAL NOTES ---
${form.additional_notes || 'None'}

================================
Ready for your call with ${clientInfo.name}.
    `.trim();
  };

  const sections = [
    // 0 — Destination
    <motion.div key="destination" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <SectionHeader icon={MapPin} title="Where are you moving?" subtitle="Give us your best idea — even a general area is fine." />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold mb-1" style={{ color: '#ccc' }}>City *</label>
          <Input placeholder="e.g. Austin" value={form.destination_city}
            onChange={e => setForm(p => ({ ...p, destination_city: e.target.value }))}
            className="border-0 rounded-xl h-11" style={{ background: '#2a2a2a', color: '#fff', caretColor: GOLD }} />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1" style={{ color: '#ccc' }}>State *</label>
          <Input placeholder="e.g. TX" value={form.destination_state}
            onChange={e => setForm(p => ({ ...p, destination_state: e.target.value }))}
            className="border-0 rounded-xl h-11" style={{ background: '#2a2a2a', color: '#fff', caretColor: GOLD }} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: '#ccc' }}>When are you planning to move?</label>
        <div className="space-y-2">
          {TIMELINES.map(t => (
            <CheckOption key={t} label={t} selected={form.timeline === t} onClick={() => setSingle('timeline', t)} />
          ))}
        </div>
      </div>
    </motion.div>,

    // 1 — Budget
    <motion.div key="budget" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <SectionHeader icon={Home} title="What's your home budget?" subtitle="Select the range you're most comfortable with." />
      <div className="space-y-2">
        {BUDGETS.map(b => (
          <CheckOption key={b} label={b} selected={form.budget === b} onClick={() => setSingle('budget', b)} />
        ))}
      </div>
    </motion.div>,

    // 2 — Property Type
    <motion.div key="property" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <SectionHeader icon={Building} title="What type of property?" subtitle="Check all that interest you." />
      <div className="space-y-2">
        {PROPERTY_TYPES.map(p => (
          <CheckOption key={p} label={p} selected={form.property_types.includes(p)} onClick={() => toggle('property_types', p)} />
        ))}
      </div>
    </motion.div>,

    // 3 — Family
    <motion.div key="family" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
      <SectionHeader icon={Users} title="Tell us about your household" subtitle="Helps us match schools, space, and community fit." />
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: '#ccc' }}>Household size</label>
        <div className="space-y-2">
          {FAMILY_SIZES.map(f => (
            <CheckOption key={f} label={f} selected={form.family_size === f} onClick={() => setSingle('family_size', f)} />
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: '#ccc' }}>Children's ages (check all that apply)</label>
        <div className="space-y-2">
          {KID_AGES.map(k => (
            <CheckOption key={k} label={k} selected={form.kid_ages.includes(k)} onClick={() => toggle('kid_ages', k)} />
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1" style={{ color: '#ccc' }}>Pets? (type and number, optional)</label>
        <Input placeholder="e.g. 2 dogs" value={form.pets}
          onChange={e => setForm(p => ({ ...p, pets: e.target.value }))}
          className="border-0 rounded-xl h-11" style={{ background: '#2a2a2a', color: '#fff', caretColor: GOLD }} />
      </div>
    </motion.div>,

    // 4 — Priorities
    <motion.div key="priorities" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <SectionHeader icon={Star} title="What matters most to you?" subtitle="Check everything that's important — we'll use this to match your neighborhood." />
      <div className="space-y-2">
        {PRIORITIES.map(p => (
          <CheckOption key={p} label={p} selected={form.priorities.includes(p)} onClick={() => toggle('priorities', p)} />
        ))}
      </div>
    </motion.div>,

    // 5 — Agent Style
    <motion.div key="agent" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <SectionHeader icon={UserCheck} title="What kind of agent fits you best?" subtitle="We'll use this to hand-select your top candidates from the market." />
      <div className="space-y-2">
        {AGENT_STYLES.map(a => (
          <CheckOption key={a} label={a} selected={form.agent_styles.includes(a)} onClick={() => toggle('agent_styles', a)} />
        ))}
      </div>
    </motion.div>,

    // 6 — Current Situation
    <motion.div key="current" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
      <SectionHeader icon={Home} title="Your current home situation" subtitle="This helps us time everything correctly." />
      <div className="space-y-2">
        {CURRENT_SITUATIONS.map(s => (
          <CheckOption key={s} label={s} selected={form.current_situation === s} onClick={() => setSingle('current_situation', s)} />
        ))}
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1" style={{ color: '#ccc' }}>Anything else you'd like Bob to know? (optional)</label>
        <textarea
          placeholder="Special circumstances, concerns, questions..."
          value={form.additional_notes}
          onChange={e => setForm(p => ({ ...p, additional_notes: e.target.value }))}
          rows={3}
          className="w-full rounded-xl p-3 text-sm resize-none border-0 outline-none"
          style={{ background: '#2a2a2a', color: '#fff', caretColor: GOLD }}
        />
      </div>
    </motion.div>,
  ];

  const isLastSection = section === SECTIONS.length - 1;
  const canProceed = section === 0
    ? form.destination_city.trim() && form.destination_state.trim()
    : true;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Progress bar */}
      <div className="px-5 pt-4 pb-2 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold tracking-widest" style={{ color: GOLD }}>
            {SECTIONS[section].label.toUpperCase()}
          </span>
          <span className="text-xs" style={{ color: '#666' }}>{section + 1} of {SECTIONS.length}</span>
        </div>
        <div className="h-1 rounded-full" style={{ background: '#555' }}>
          <div className="h-1 rounded-full transition-all duration-500"
            style={{ width: `${((section + 1) / SECTIONS.length) * 100}%`, background: GOLD }} />
        </div>
        {/* Step dots */}
        <div className="flex justify-between mt-2">
          {SECTIONS.map((s, i) => (
            <div key={i} className="w-2 h-2 rounded-full transition-all"
              style={{ background: i <= section ? GOLD : '#666' }} />
          ))}
        </div>
      </div>

      {/* Section content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {sections[section]}
      </div>

      {/* Navigation */}
      <div className="px-5 py-4 shrink-0 flex gap-3" style={{ borderTop: '1px solid #555' }}>
        {section > 0 && (
          <Button variant="ghost" onClick={() => setSection(s => s - 1)}
            className="gap-2 rounded-xl" style={{ color: '#aaa' }}>
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
        )}
        <Button
          onClick={isLastSection ? handleSubmit : () => setSection(s => s + 1)}
          disabled={!canProceed || submitting}
          className="flex-1 h-11 font-bold gap-2 rounded-xl disabled:opacity-30"
          style={{ background: GOLD, color: '#000' }}>
          {submitting ? 'Submitting...' : isLastSection ? (
            <><Send className="w-4 h-4" /> Submit My Profile</>
          ) : (
            <>Next <ChevronRight className="w-4 h-4" /></>
          )}
        </Button>
      </div>
    </div>
  );
}