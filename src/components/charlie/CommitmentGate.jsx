import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Check, ChevronRight, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { appClient } from '@/api/appClient';

const GOLD = '#D4AF37';

const COMMITMENTS = [
  "I understand this service is completely FREE to me as the buyer — agent compensation is handled separately.",
  "I agree to work exclusively with a Dyson & Dyson referred agent for my destination purchase.",
  "I consent to this conversation being recorded and summarized to build my relocation profile.",
  "I understand my profile will be reviewed by Dyson & Dyson staff to match me with the right agent.",
  "I agree that all official transaction communications will flow through the Dyson platform.",
];

const WHY_MATTERS = [
  { label: "Total Transparency:", text: "You, our team, and the AI hear everything at once. No 'telephone game' and no missed details." },
  { label: "Instant Intelligence:", text: "Gemini provides deep-market analysis and lifestyle modeling on the fly to help us refine your search." },
  { label: "Verifiable Accuracy:", text: "The session is captured in text and summarized, giving you a perfect record of our strategy." },
  { label: "Elite Vetting:", text: null, textParts: ['This data is used exclusively by our human team to select the specific ', 'boots on the ground', ' agent that fits your profile.'] },
];

export default function CommitmentGate({ onCommit }) {
  const [step, setStep] = useState('intro');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [checked, setChecked] = useState([]);

  useEffect(() => {
    appClient.auth.me().then(user => {
      if (user) {
        setName(user.full_name || '');
        setEmail(user.email || '');
      }
    }).catch(() => {});
  }, []);

  const allChecked = checked.length === COMMITMENTS.length;

  const toggleCheck = (i) => {
    setChecked(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const handleCommit = () => {
    if (!allChecked) return;
    onCommit({ name, email });
  };

  return (
    <div className="flex-1 overflow-y-auto p-5">
      {/* INTRO */}
      {step === 'intro' && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 py-6">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center"
              style={{ background: 'rgba(212,175,55,0.1)', border: `2px solid ${GOLD}` }}>
              <Mic className="w-10 h-10" style={{ color: GOLD }} />
            </div>
            <h2 className="serif-heading font-bold" style={{ color: '#fff', letterSpacing: '-0.01em', fontSize: '2.7rem' }}>What's This Session About?</h2>
            <p className="leading-relaxed max-w-md mx-auto" style={{ color: '#f5f5f5', fontSize: '1.15rem' }}>
              You're about to join a collaborative strategy call with a Dyson & Dyson Relocation Specialist and Gemini, our advanced AI advisor.
            </p>
            <p className="leading-relaxed max-w-md mx-auto" style={{ color: '#f5f5f5', fontSize: '1.15rem' }}>
              Think of this as a three-way brainstorm. We'll bring Gemini in via speakerphone to provide real-time data and insights while we discuss your destination, lifestyle priorities, budget, and timeline. Together, we'll build a move profile that covers every detail that matters to your family.
            </p>
          </div>

          <div className="rounded-2xl p-6 space-y-4" style={{ background: '#2a2a2a', border: `1px solid ${GOLD}33` }}>
            <p className="font-bold uppercase tracking-widest" style={{ color: GOLD, fontSize: '0.9rem' }}>Why This Matters</p>
            {WHY_MATTERS.map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full shrink-0 mt-0.5 flex items-center justify-center"
                  style={{ background: 'transparent', border: `1.5px solid ${GOLD}` }}>
                  <Check className="w-3.5 h-3.5" style={{ color: GOLD }} strokeWidth={3} />
                </div>
                <p className="leading-relaxed" style={{ color: '#f5f5f5', fontSize: '1.05rem' }}>
                  <span style={{ color: GOLD, fontWeight: 600 }}>{item.label}</span>{' '}
                  {item.textParts
                    ? <>{item.textParts[0]}<span style={{ color: GOLD, fontWeight: 600 }}>{item.textParts[1]}</span>{item.textParts[2]}</>
                    : item.text
                  }
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-4" style={{ background: '#2a2a2a', border: `1px solid ${GOLD}33`, borderLeft: `4px solid ${GOLD}`, fontSize: '1.05rem' }}>
            <p style={{ color: '#f5f5f5', lineHeight: '1.6' }}>
              <span style={{ color: GOLD, fontWeight: 600 }}>Disclosure: </span>
              This session is powered by Google Gemini AI. Conversations are recorded and summarized. Information shared by Dyson & Dyson staff is proprietary and confidential. You may request deletion of your data at any time.
            </p>
          </div>

          <Button onClick={() => setStep('consent')} className="w-full h-12 font-bold gap-2 rounded-xl text-base"
            style={{ background: GOLD, color: '#000' }}>
            Get Started <ChevronRight className="w-5 h-5" />
          </Button>
        </motion.div>
      )}

      {/* CONSENT */}
      {step === 'consent' && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center gap-3">
            <Shield className="w-7 h-7" style={{ color: GOLD }} />
            <div>
              <h3 className="font-bold" style={{ color: '#fff', fontSize: '2.1rem' }}>Service Agreement</h3>
              <p style={{ color: '#f5f5f5', fontSize: '1.05rem' }}>Please check each item to confirm you understand</p>
            </div>
          </div>

          <div className="space-y-2">
            {COMMITMENTS.map((item, i) => (
              <button
                key={i}
                onClick={() => toggleCheck(i)}
                className="w-full text-left flex gap-3 items-start p-3 rounded-xl transition-all"
                style={{
                  background: checked.includes(i) ? 'rgba(212,175,55,0.15)' : '#555',
                  border: checked.includes(i) ? `1px solid ${GOLD}44` : '1px solid #777',
                }}>
                <div className="w-5 h-5 rounded-md shrink-0 mt-0.5 flex items-center justify-center transition-all"
                  style={{
                    background: checked.includes(i) ? GOLD : 'transparent',
                    border: `1px solid ${GOLD}`,
                  }}>
                  {checked.includes(i) && <Check className="w-3 h-3 text-black" />}
                </div>
                <p className="leading-relaxed" style={{ color: checked.includes(i) ? '#ddd' : '#bbb', fontSize: '1.05rem' }}>{item}</p>
              </button>
            ))}
          </div>

          <Button
            onClick={handleCommit}
            disabled={!allChecked}
            className="w-full h-11 font-bold gap-2 rounded-xl disabled:opacity-30"
            style={{ background: GOLD, color: '#000' }}>
            I Agree — Start My Session <Mic className="w-4 h-4" />
          </Button>

          <p className="text-center" style={{ color: '#e5e5e5', fontSize: '1.05rem' }}>
            By proceeding you agree to Dyson & Dyson's terms of service and privacy policy.
          </p>
        </motion.div>
      )}
    </div>
  );
}