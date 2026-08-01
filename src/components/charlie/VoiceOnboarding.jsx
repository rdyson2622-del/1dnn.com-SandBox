import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const GOLD = '#D4AF37';

const BUDGET_OPTIONS = [
  { value: 'under_200k', label: 'Under $200K' },
  { value: '200k_400k', label: '$200K – $400K' },
  { value: '400k_600k', label: '$400K – $600K' },
  { value: '600k_800k', label: '$600K – $800K' },
  { value: '800k_1m', label: '$800K – $1M' },
  { value: 'over_1m', label: 'Over $1M' },
];

const TIMELINE_OPTIONS = ['In the next 30 days', '1–3 months', '3–6 months', '6–12 months', 'Over a year'];
const FAMILY_OPTIONS = ['Just me', '2 people', '3 people', '4 people', '5+ people'];

const PRIORITIES = [
  { id: 'schools', label: '🎓 Top Schools' },
  { id: 'commute', label: '🚗 Easy Commute' },
  { id: 'safety', label: '🛡️ Safety' },
  { id: 'religious_community', label: '⛪ Religious Community' },
  { id: 'healthcare', label: '🏥 Healthcare' },
  { id: 'nature', label: '🌿 Nature & Parks' },
  { id: 'nightlife', label: '🎵 Nightlife & Dining' },
  { id: 'walkability', label: '🚶 Walkability' },
  { id: 'arts_culture', label: '🎨 Arts & Culture' },
  { id: 'sports_recreation', label: '⚽ Sports & Recreation' },
  { id: 'shopping', label: '🛍️ Shopping' },
];

// What Charlie says for each question
const QUESTION_SCRIPTS = [
  "First question — what city and state are you relocating to?",
  "Got it. And where are you moving from? What city are you currently in?",
  "Perfect. When are you planning to make this move?",
  "How many people are in your household?",
  "What's your budget range for the new home?",
  "Are you planning to buy or rent?",
  "Last one — what matters most to you in your new community? You can name a few things.",
];

// Parse voice input into structured values
function parseVoiceAnswer(stepId, transcript) {
  const t = transcript.toLowerCase();

  if (stepId === 'budget') {
    if (t.includes('under') && (t.includes('200') || t.includes('two hundred'))) return 'under_200k';
    if (t.includes('200') || t.includes('two hundred')) return '200k_400k';
    if (t.includes('400') || t.includes('four hundred')) return '400k_600k';
    if (t.includes('600') || t.includes('six hundred')) return '600k_800k';
    if (t.includes('800') || t.includes('eight hundred') || t.includes('million')) return '800k_1m';
    if (t.includes('over') || t.includes('above') || t.includes('more than')) return 'over_1m';
    return null;
  }

  if (stepId === 'timeline') {
    if (t.includes('30') || t.includes('thirty') || t.includes('month') && t.includes('next')) return TIMELINE_OPTIONS[0];
    if (t.includes('1') || t.includes('one') || t.includes('two') || t.includes('2') || t.includes('three') || t.includes('3')) return TIMELINE_OPTIONS[1];
    if (t.includes('3') || t.includes('four') || t.includes('five') || t.includes('six') || t.includes('6')) return TIMELINE_OPTIONS[2];
    if (t.includes('6') || t.includes('seven') || t.includes('eight') || t.includes('nine') || t.includes('year')) return TIMELINE_OPTIONS[3];
    if (t.includes('over') || t.includes('more')) return TIMELINE_OPTIONS[4];
    return TIMELINE_OPTIONS[1]; // default to 1-3 months
  }

  if (stepId === 'family') {
    if (t.includes('just me') || t.includes('only me') || t.includes('myself') || t.includes('one')) return 'Just me';
    if (t.includes('two') || t.includes('2') || t.includes('couple') || t.includes('partner') || t.includes('spouse') || t.includes('wife') || t.includes('husband')) return '2 people';
    if (t.includes('three') || t.includes('3')) return '3 people';
    if (t.includes('four') || t.includes('4')) return '4 people';
    if (t.includes('five') || t.includes('5') || t.includes('six') || t.includes('more')) return '5+ people';
    return '2 people';
  }

  if (stepId === 'purchase_type') {
    if (t.includes('rent') || t.includes('lease')) return 'renting';
    return 'buying';
  }

  if (stepId === 'priorities') {
    const matched = [];
    if (t.includes('school')) matched.push('schools');
    if (t.includes('commut') || t.includes('drive') || t.includes('traffic')) matched.push('commute');
    if (t.includes('safe') || t.includes('security')) matched.push('safety');
    if (t.includes('church') || t.includes('religio') || t.includes('faith') || t.includes('temple') || t.includes('synagogue')) matched.push('religious_community');
    if (t.includes('health') || t.includes('doctor') || t.includes('hospital') || t.includes('medical')) matched.push('healthcare');
    if (t.includes('nature') || t.includes('park') || t.includes('outdoor') || t.includes('hiking')) matched.push('nature');
    if (t.includes('nightlife') || t.includes('dining') || t.includes('restaurant') || t.includes('bar')) matched.push('nightlife');
    if (t.includes('walk') || t.includes('walkable')) matched.push('walkability');
    if (t.includes('art') || t.includes('culture') || t.includes('museum') || t.includes('theater')) matched.push('arts_culture');
    if (t.includes('sport') || t.includes('gym') || t.includes('fitness') || t.includes('recreat')) matched.push('sports_recreation');
    if (t.includes('shop') || t.includes('mall') || t.includes('store')) matched.push('shopping');
    return matched.length > 0 ? matched : ['safety'];
  }

  // For destination, origin — return as-is (cleaned up)
  return transcript.trim();
}

const STEPS = ['destination', 'origin', 'timeline', 'family', 'budget', 'purchase_type', 'priorities'];

export default function VoiceOnboarding({ onComplete }) {
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
  const [phase, setPhase] = useState('speaking'); // speaking | listening | confirming | manual
  const [transcript, setTranscript] = useState('');
  const [confirmedText, setConfirmedText] = useState('');
  const [manualInput, setManualInput] = useState('');
  const recognitionRef = useRef(null);
  const stepId = STEPS[step];
  const isLast = step === STEPS.length - 1;

  // Show options immediately — no voice delay
  useEffect(() => {
    setPhase('manual');
    setTranscript('');
    setConfirmedText('');
    setManualInput('');
  }, [step]);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setPhase('manual');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      handleVoiceAnswer(text);
    };
    recognition.onerror = () => setPhase('manual');
    recognition.onend = () => {};
    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleVoiceAnswer = (text) => {
    const parsed = parseVoiceAnswer(stepId, text);
    if (!parsed || (Array.isArray(parsed) && parsed.length === 0)) {
      setPhase('manual');
      return;
    }
    applyAnswer(parsed, text);
  };

  const applyAnswer = (parsed, displayText) => {
    let newProfile = { ...profile };
    let confirmMsg = '';

    if (stepId === 'destination') {
      newProfile.destination_city = parsed;
      confirmMsg = `${parsed} — got it.`;
    } else if (stepId === 'origin') {
      newProfile.current_city = parsed;
      confirmMsg = `Moving from ${parsed}.`;
    } else if (stepId === 'timeline') {
      newProfile.move_date = parsed;
      confirmMsg = `${parsed} — perfect.`;
    } else if (stepId === 'family') {
      newProfile.family_size = parsed;
      confirmMsg = `${parsed} — noted.`;
    } else if (stepId === 'budget') {
      newProfile.budget = parsed;
      const label = BUDGET_OPTIONS.find(o => o.value === parsed)?.label || parsed;
      confirmMsg = `${label} budget — got it.`;
    } else if (stepId === 'purchase_type') {
      newProfile.purchase_type = parsed;
      confirmMsg = parsed === 'buying' ? `Buying — great.` : `Renting — noted.`;
    } else if (stepId === 'priorities') {
      newProfile.priorities = parsed;
      confirmMsg = `Perfect. I've got your priorities noted.`;
    }

    setProfile(newProfile);

    if (isLast) {
      onComplete(newProfile);
    } else {
      setStep(s => s + 1);
    }
  };

  const handleManualSubmit = () => {
    const val = manualInput.trim();
    if (!val) return;

    if (stepId === 'destination' || stepId === 'origin') {
      applyAnswer(val, val);
    } else {
      applyAnswer(parseVoiceAnswer(stepId, val) || val, val);
    }
  };

  const togglePriority = (id) => {
    setProfile(p => ({
      ...p,
      priorities: p.priorities.includes(id)
        ? p.priorities.filter(x => x !== id)
        : [...p.priorities, id],
    }));
  };

  const handleManualContinue = () => {
    let parsed;
    if (stepId === 'destination') parsed = manualInput.trim() || profile.destination_city;
    else if (stepId === 'origin') parsed = manualInput.trim() || profile.current_city;
    else if (stepId === 'timeline') parsed = profile.move_date;
    else if (stepId === 'family') parsed = profile.family_size;
    else if (stepId === 'budget') parsed = profile.budget;
    else if (stepId === 'purchase_type') parsed = profile.purchase_type;
    else if (stepId === 'priorities') parsed = profile.priorities;

    if (!parsed || (Array.isArray(parsed) && parsed.length === 0)) return;
    applyAnswer(parsed, String(parsed));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Progress */}
      <div className="px-4 pt-3 pb-1 shrink-0">
        <div className="flex gap-1 mb-1">
          {STEPS.map((_, i) => (
            <div key={i} className="flex-1 h-1 rounded-full transition-all duration-500"
              style={{ background: i <= step ? GOLD : '#333' }} />
          ))}
        </div>
        <p className="text-xs" style={{ color: '#aaa' }}>Step {step + 1} of {STEPS.length}</p>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 min-h-0">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }} className="w-full space-y-6 text-center">

            {/* Question */}
            <p className="text-base font-semibold" style={{ color: '#fff' }}>{QUESTION_SCRIPTS[step]}</p>

            {/* Speaking phase */}
            {phase === 'speaking' && (
              <div className="flex flex-col items-center gap-3">
                <motion.div className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: `${GOLD}20`, border: `2px solid ${GOLD}` }}
                  animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>
                  <span className="text-2xl">🔊</span>
                </motion.div>
                <p className="text-xs" style={{ color: '#aaa' }}>Charlie is speaking...</p>
              </div>
            )}

            {/* Listening phase */}
            {phase === 'listening' && (
              <div className="flex flex-col items-center gap-3">
                <motion.div className="w-16 h-16 rounded-full flex items-center justify-center cursor-pointer"
                  style={{ background: '#ef444420', border: '2px solid #ef4444' }}
                  animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 1 }}
                  onClick={() => { recognitionRef.current?.stop(); setPhase('manual'); }}>
                  <Mic className="w-7 h-7 text-red-400" />
                </motion.div>
                <p className="text-xs" style={{ color: '#aaa' }}>Listening... tap to type instead</p>
              </div>
            )}

            {/* Confirming phase */}
            {phase === 'confirming' && (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: `${GOLD}20`, border: `2px solid ${GOLD}` }}>
                  <Check className="w-7 h-7" style={{ color: GOLD }} />
                </div>
                <p className="text-sm font-medium" style={{ color: GOLD }}>{confirmedText}</p>
                {transcript && <p className="text-xs italic" style={{ color: '#888' }}>"{transcript}"</p>}
              </div>
            )}

            {/* Manual fallback */}
            {phase === 'manual' && (
              <div className="space-y-3 w-full text-left">
                <p className="text-xs text-center mb-2" style={{ color: '#888' }}>Type your answer or tap an option below</p>

                {/* Text input for destination/origin */}
                {(stepId === 'destination' || stepId === 'origin') && (
                  <Input
                    autoFocus
                    placeholder={stepId === 'destination' ? 'e.g. Austin, TX' : 'e.g. Chicago, IL'}
                    value={manualInput}
                    onChange={e => setManualInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && manualInput.trim() && handleManualSubmit()}
                    className="border-0 rounded-xl h-11"
                    style={{ background: '#1a1a1a', color: '#fff', caretColor: GOLD }}
                  />
                )}

                {/* Timeline buttons */}
                {stepId === 'timeline' && TIMELINE_OPTIONS.map(opt => (
                  <button key={opt} onClick={() => { setProfile(p => ({ ...p, move_date: opt })); applyAnswer(opt, opt); }}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm transition-all"
                    style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e5e5e5' }}>
                    {opt}
                  </button>
                ))}

                {/* Family buttons */}
                {stepId === 'family' && (
                  <div className="space-y-2">
                    <div className="flex gap-2 flex-wrap">
                      {FAMILY_OPTIONS.map(opt => (
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
                    <Input placeholder="Any details? (kids ages, pets, etc.)" value={manualInput}
                      onChange={e => setManualInput(e.target.value)}
                      className="border-0 rounded-xl" style={{ background: '#1a1a1a', color: '#fff', caretColor: GOLD }} />
                  </div>
                )}

                {/* Budget buttons */}
                {stepId === 'budget' && BUDGET_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => { setProfile(p => ({ ...p, budget: opt.value })); applyAnswer(opt.value, opt.label); }}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm transition-all"
                    style={{
                      background: profile.budget === opt.value ? 'rgba(212,175,55,0.2)' : '#1a1a1a',
                      border: profile.budget === opt.value ? `1px solid ${GOLD}` : '1px solid #2a2a2a',
                      color: profile.budget === opt.value ? GOLD : '#e5e5e5',
                    }}>
                    {opt.label}
                  </button>
                ))}

                {/* Purchase type */}
                {stepId === 'purchase_type' && (
                  <div className="grid grid-cols-2 gap-3">
                    {['buying', 'renting'].map(opt => (
                      <button key={opt} onClick={() => { setProfile(p => ({ ...p, purchase_type: opt })); applyAnswer(opt, opt); }}
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

                {/* Priorities */}
                {stepId === 'priorities' && (
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

                {/* Continue button for manual */}
                {(stepId === 'destination' || stepId === 'origin') ? (
                  <Button onClick={handleManualSubmit} disabled={!manualInput.trim()}
                    className="w-full h-11 font-bold text-sm rounded-xl gap-2 disabled:opacity-30 mt-2"
                    style={{ background: GOLD, color: '#000' }}>
                    Continue <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (stepId === 'family' || stepId === 'priorities') ? (
                  <Button onClick={handleManualContinue}
                    disabled={stepId === 'family' ? !profile.family_size : profile.priorities.length === 0}
                    className="w-full h-11 font-bold text-sm rounded-xl gap-2 disabled:opacity-30 mt-2"
                    style={{ background: GOLD, color: '#000' }}>
                    {isLast ? 'Build My Move Plan ✨' : 'Continue'} {!isLast && <ChevronRight className="w-4 h-4" />}
                  </Button>
                ) : null}

                {/* Re-try mic */}
                <button onClick={() => { setPhase('listening'); startListening(); }}
                  className="w-full text-xs py-2 flex items-center justify-center gap-1"
                  style={{ color: '#666' }}>
                  <Mic className="w-3 h-3" /> Try voice again
                </button>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}