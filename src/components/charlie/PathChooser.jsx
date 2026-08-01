import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Users, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { speakAsCharlie } from '@/components/charlie/charlieVoice';

const GOLD = '#D4AF37';

const CHARLIE_INTRO = "Great news — your profile is complete! Now, you have two options for how we move forward. I can walk you through each one. Just pick the path that feels right for you.";

const PATHS = [
  {
    id: 'we_handle_it',
    icon: Users,
    badge: 'HANDS-OFF',
    title: 'We Handle It',
    tagline: 'Dyson & Dyson conducts the Gemini session on your behalf.',
    color: GOLD,
    points: [
      'Bob Dyson and our team run the full AI interview using your profile',
      'We extract the key insights, neighborhood matches, and agent criteria',
      'You receive a curated summary and agent shortlist — nothing more required from you',
      'Ideal if you are busy, not tech-savvy, or simply prefer a full-service experience',
    ],
    cta: 'Let Dyson Handle It',
  },
  {
    id: 'i_want_in',
    icon: Mic,
    badge: 'LIVE SESSION',
    title: 'I Want In',
    tagline: 'You join a live voice session with Google Gemini — right now.',
    color: '#6ee7b7',
    points: [
      'Speak directly with Google Gemini AI in a real-time voice interview',
      'Go deeper on your priorities, lifestyle, and must-haves in your own words',
      'Your responses are transcribed and added to your profile automatically',
      'Ideal if you enjoy being involved and want to shape your plan directly',
    ],
    cta: 'Start My Live Session',
  },
];

export default function PathChooser({ clientInfo, onChoose }) {
  const [charlieSpoke, setCharlieSpoke] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (!charlieSpoke) {
      setCharlieSpoke(true);
      setSpeaking(true);
      speakAsCharlie(CHARLIE_INTRO, {
        onEnd: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      }).catch(() => setSpeaking(false));
    }
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-6 pb-10">
      {/* Charlie intro bubble */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3 items-start"
      >
        <div className="relative shrink-0">
          <img
            src="/assets/path-chooser.png"
            alt="Charlie"
            className="w-14 h-14 object-contain rounded-2xl"
            style={{ background: 'rgba(212,175,55,0.08)', border: `1px solid ${GOLD}33` }}
          />
          {speaking && (
            <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-green-400 animate-pulse border-2 border-[#3a3a3a]" />
          )}
        </div>
        <div className="rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs"
          style={{ background: '#2a2a2a', border: `1px solid ${GOLD}22` }}>
          <p className="text-sm leading-relaxed" style={{ color: '#f0f0f0' }}>
            {CHARLIE_INTRO}
          </p>
        </div>
      </motion.div>

      {/* Name greeting */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <p className="text-xs font-bold tracking-widest" style={{ color: GOLD }}>
          CHOOSE YOUR PATH, {clientInfo?.name?.split(' ')[0]?.toUpperCase()}
        </p>
      </motion.div>

      {/* Path cards */}
      <div className="space-y-4">
        {PATHS.map((path, i) => {
          const Icon = path.icon;
          return (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.15 }}
              className="rounded-2xl p-5 space-y-4"
              style={{ background: '#2a2a2a', border: `1.5px solid ${path.color}44` }}
            >
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${path.color}18`, border: `1px solid ${path.color}44` }}>
                  <Icon className="w-5 h-5" style={{ color: path.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold tracking-widest px-2 py-0.5 rounded-full"
                      style={{ background: `${path.color}22`, color: path.color }}>
                      {path.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg leading-tight" style={{ color: '#fff' }}>{path.title}</h3>
                  <p className="text-sm mt-0.5" style={{ color: '#aaa' }}>{path.tagline}</p>
                </div>
              </div>

              {/* Points */}
              <div className="space-y-2">
                {path.points.map((pt, j) => (
                  <div key={j} className="flex gap-2.5 items-start">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: path.color }} />
                    <p className="text-sm leading-relaxed" style={{ color: '#ddd' }}>{pt}</p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Button
                onClick={() => onChoose(path.id)}
                className="w-full h-11 font-bold rounded-xl gap-2"
                style={{ background: path.id === 'i_want_in' ? 'transparent' : GOLD, color: path.id === 'i_want_in' ? path.color : '#000', border: path.id === 'i_want_in' ? `1.5px solid ${path.color}` : 'none' }}
              >
                {path.cta} <ChevronRight className="w-4 h-4" />
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Fine print */}
      <p className="text-center text-xs" style={{ color: '#666' }}>
        You can always switch paths later. Both options are completely free.
      </p>
    </div>
  );
}