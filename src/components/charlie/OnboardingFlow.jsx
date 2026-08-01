import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, MapPin, Calendar, Users, DollarSign, Home, Heart, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const GOLD = '#D4AF37';

const PRIORITIES = [
  { id: 'schools', label: '🎓 Top Schools', },
  { id: 'commute', label: '🚗 Easy Commute' },
  { id: 'safety', label: '🛡️ Safety' },
  { id: 'religious_community', label: '⛪ Church / Religious Community' },
  { id: 'healthcare', label: '🏥 Healthcare' },
  { id: 'nature', label: '🌿 Nature & Parks' },
  { id: 'nightlife', label: '🎵 Nightlife & Dining' },
  { id: 'walkability', label: '🚶 Walkability' },
  { id: 'arts_culture', label: '🎨 Arts & Culture' },
  { id: 'sports_recreation', label: '⚽ Sports & Recreation' },
  { id: 'shopping', label: '🛍️ Shopping' },
];

const BUDGET_OPTIONS = [
  { value: 'under_200k', label: 'Under $200K' },
  { value: '200k_400k', label: '$200K – $400K' },
  { value: '400k_600k', label: '$400K – $600K' },
  { value: '600k_800k', label: '$600K – $800K' },
  { value: '800k_1m', label: '$800K – $1M' },
  { value: 'over_1m', label: 'Over $1M' },
];

const steps = [
  { id: 'destination', icon: MapPin, title: "Where are you relocating to?", subtitle: "Your destination city" },
  { id: 'origin', icon: MapPin, title: "Where are you moving from?", subtitle: "Your current city" },
  { id: 'timeline', icon: Calendar, title: "When are you planning to move?", subtitle: "Approximate move date" },
  { id: 'family', icon: Users, title: "Tell us about your household", subtitle: "Family size & details" },
  { id: 'budget', icon: DollarSign, title: "What's your home budget?", subtitle: "Price range for your new home" },
  { id: 'purchase_type', icon: Home, title: "Are you buying or renting?", subtitle: "Your housing preference" },
  { id: 'priorities', icon: Heart, title: "What matters most to you?", subtitle: "Select all that apply" },
];

export default function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({
    destination_city: '',
    current_city: '',
    move_date: '',
    family_size: '',
    family_notes: '',
    budget: '',
    purchase_type: 'buying',
    priorities: [],
  });

  const currentStep = steps[step];
  const isLast = step === steps.length - 1;

  const togglePriority = (id) => {
    setProfile(p => ({
      ...p,
      priorities: p.priorities.includes(id)
        ? p.priorities.filter(x => x !== id)
        : [...p.priorities, id],
    }));
  };

  const canAdvance = () => {
    if (currentStep.id === 'destination') return profile.destination_city.trim().length > 1;
    if (currentStep.id === 'origin') return profile.current_city.trim().length > 1;
    if (currentStep.id === 'timeline') return profile.move_date.trim().length > 0;
    if (currentStep.id === 'family') return profile.family_size !== '';
    if (currentStep.id === 'budget') return profile.budget !== '';
    if (currentStep.id === 'purchase_type') return true;
    if (currentStep.id === 'priorities') return profile.priorities.length > 0;
    return true;
  };

  const handleNext = () => {
    if (isLast) {
      onComplete(profile);
    } else {
      setStep(s => s + 1);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Progress bar */}
      <div className="px-4 pt-3 pb-1 shrink-0">
        <div className="flex gap-1 mb-1">
          {steps.map((_, i) => (
            <div key={i} className="flex-1 h-1 rounded-full transition-all duration-500"
              style={{ background: i <= step ? GOLD : '#333' }} />
          ))}
        </div>
        <p className="text-xs" style={{ color: '#e5e5e5' }}>Step {step + 1} of {steps.length}</p>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(212,175,55,0.15)', border: `1px solid ${GOLD}44` }}>
                <currentStep.icon className="w-5 h-5" style={{ color: GOLD }} />
              </div>
              <div>
                <h3 className="font-bold text-base" style={{ color: '#fff' }}>{currentStep.title}</h3>
                <p className="text-xs" style={{ color: '#e5e5e5' }}>{currentStep.subtitle}</p>
              </div>
            </div>

            {/* DESTINATION */}
            {currentStep.id === 'destination' && (
              <Input
                autoFocus
                placeholder="e.g. Austin, TX"
                value={profile.destination_city}
                onChange={e => setProfile(p => ({ ...p, destination_city: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && canAdvance() && handleNext()}
                className="text-base border-0 rounded-xl h-12 placeholder:text-gray-400"
                style={{ background: '#1a1a1a', color: '#fff', caretColor: GOLD }}
              />
            )}

            {/* ORIGIN */}
            {currentStep.id === 'origin' && (
              <Input
                autoFocus
                placeholder="e.g. Chicago, IL"
                value={profile.current_city}
                onChange={e => setProfile(p => ({ ...p, current_city: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && canAdvance() && handleNext()}
                className="text-base border-0 rounded-xl h-12 placeholder:text-gray-400"
                style={{ background: '#1a1a1a', color: '#fff', caretColor: GOLD }}
              />
            )}

            {/* TIMELINE */}
            {currentStep.id === 'timeline' && (
              <div className="space-y-2">
                {['In the next 30 days', '1–3 months', '3–6 months', '6–12 months', 'Over a year'].map(opt => (
                  <button key={opt} onClick={() => setProfile(p => ({ ...p, move_date: opt }))}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm transition-all"
                    style={{
                      background: profile.move_date === opt ? 'rgba(212,175,55,0.2)' : '#1a1a1a',
                      border: profile.move_date === opt ? `1px solid ${GOLD}` : '1px solid #2a2a2a',
                      color: profile.move_date === opt ? GOLD : '#e5e5e5',
                    }}>
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* FAMILY */}
            {currentStep.id === 'family' && (
              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  {['Just me', '2 people', '3 people', '4 people', '5+ people'].map(opt => (
                    <button key={opt} onClick={() => setProfile(p => ({ ...p, family_size: opt }))}
                      className="px-4 py-2 rounded-xl text-sm transition-all"
                      style={{
                        background: profile.family_size === opt ? 'rgba(212,175,55,0.2)' : '#1a1a1a',
                        border: profile.family_size === opt ? `1px solid ${GOLD}` : '1px solid #2a2a2a',
                        color: profile.family_size === opt ? GOLD : '#e5e5e5',
                      }}>
                      {opt}
                    </button>
                  ))}
                </div>
                <Input
                  placeholder="Any details? (kids ages, pets, etc.)"
                  value={profile.family_notes}
                  onChange={e => setProfile(p => ({ ...p, family_notes: e.target.value }))}
                  className="border-0 rounded-xl"
                  style={{ background: '#1a1a1a', color: '#fff', caretColor: GOLD }}
                />
              </div>
            )}

            {/* BUDGET */}
            {currentStep.id === 'budget' && (
              <div className="space-y-2">
                {BUDGET_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setProfile(p => ({ ...p, budget: opt.value }))}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm transition-all"
                    style={{
                      background: profile.budget === opt.value ? 'rgba(212,175,55,0.2)' : '#1a1a1a',
                      border: profile.budget === opt.value ? `1px solid ${GOLD}` : '1px solid #2a2a2a',
                      color: profile.budget === opt.value ? GOLD : '#e5e5e5',
                    }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {/* PURCHASE TYPE */}
            {currentStep.id === 'purchase_type' && (
              <div className="grid grid-cols-2 gap-3">
                {['buying', 'renting'].map(opt => (
                  <button key={opt} onClick={() => setProfile(p => ({ ...p, purchase_type: opt }))}
                    className="py-6 rounded-xl text-sm font-bold capitalize transition-all"
                    style={{
                      background: profile.purchase_type === opt ? 'rgba(212,175,55,0.2)' : '#1a1a1a',
                      border: profile.purchase_type === opt ? `1px solid ${GOLD}` : '1px solid #2a2a2a',
                      color: profile.purchase_type === opt ? GOLD : '#e5e5e5',
                    }}>
                    {opt === 'buying' ? '🏠 Buying' : '🔑 Renting'}
                  </button>
                ))}
              </div>
            )}

            {/* PRIORITIES */}
            {currentStep.id === 'priorities' && (
              <div className="flex flex-wrap gap-2">
                {PRIORITIES.map(p => {
                  const selected = profile.priorities.includes(p.id);
                  return (
                    <button key={p.id} onClick={() => togglePriority(p.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all"
                      style={{
                        background: selected ? 'rgba(212,175,55,0.2)' : '#1a1a1a',
                        border: selected ? `1px solid ${GOLD}` : '1px solid #2a2a2a',
                        color: selected ? GOLD : '#e5e5e5',
                      }}>
                      {selected && <Check className="w-3 h-3" />}
                      {p.label}
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Next button */}
      <div className="p-4" style={{ borderTop: '1px solid #1a1a1a' }}>
        <Button
          onClick={handleNext}
          disabled={!canAdvance()}
          className="w-full h-11 font-bold text-sm gap-2 rounded-xl disabled:opacity-30"
          style={{ background: GOLD, color: '#000' }}
        >
          {isLast ? 'Build My Move Plan ✨' : 'Continue'}
          {!isLast && <ChevronRight className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}