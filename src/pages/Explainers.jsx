import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Volume2, Mic, ArrowLeft } from 'lucide-react';
import { speakAsCharlie } from '../components/charlie/charlieVoice';
import ExplainerCharlieCircle from '@/components/charlie/ExplainerCharlieCircle';

const DYSON_LOGO = "/assets/dyson-logo.png";
const GOLD = '#D4AF37';

const HISTORY_IMAGES = [
  "/assets/explainer-1.png",
  "/assets/explainer-2.png",
  "/assets/explainer-3.png"
];

const THEN_TEXT = "When the movie The Jazz Singer premiered, it revolutionized entertainment by adding synchronized sound to motion pictures. Charlie Chaplin was a significant figure in those times. Audiences were amazed to hear actors speak. It changed everything. Silent films became obsolete overnight.";
const NOW_TEXT = "We're experimenting with voice-to-voice technology that lets you talk naturally with Charlie — he understands your needs, explains complex processes, and guides you through every step. While Charlie is still learning the full range of our services, every conversation is backed up by the text chat box so you're always connected.";

export default function Explainers() {
  const [speaking, setSpeaking] = useState(null);

  const handleSpeak = (key, text) => {
    if (speaking === key) return;
    speakAsCharlie(text, () => setSpeaking(key), () => setSpeaking(null));
  };

  return (
    <div className="min-h-screen" style={{ background: '#ede0cc', color: '#1a1a1a' }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-14 py-4 frosted-dark"
        style={{ borderBottom: '1px solid rgba(212,175,55,0.12)' }}>
        <Link to="/Home"><img src={DYSON_LOGO} alt="Dyson & Dyson" className="h-10 w-auto" /></Link>
        <Link to="/Home" className="flex items-center gap-2 text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color: 'rgba(26,26,26,0.6)' }}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </nav>

      <main className="max-w-5xl mx-auto px-6 md:px-14 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-xs font-semibold tracking-widest"
            style={{ background: GOLD, color: '#000', border: '1px solid #000' }}>
            ✨ Introducing "Talkies"
          </div>
          <h1 className="display-heading whitespace-nowrap" style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', lineHeight: 1.1, letterSpacing: '0.28em', marginBottom: '1.5rem' }}>
            <span style={{ color: '#1a1a1a' }}>THE MODERN </span><span className="gold-text-gradient">EVOLUTION</span>
          </h1>
          <p className="text-lg leading-relaxed max-w-2xl mx-auto mb-12" style={{ color: '#4a4a4a' }}>
            Just as motion pictures evolved from silent films to "talkies" in 1927, we're pioneering the next revolution: voice-powered AI in real estate.
          </p>
        </motion.div>

        {/* Comparison Cards */}
        <motion.div
          id="1927"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6 mb-20"
        >
          {/* Then Card */}
          <div className="rounded-3xl p-5 border" style={{ background: '#1a1a1a', borderColor: 'rgba(212,175,55,0.3)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)' }}>
                <Volume2 className="w-6 h-6" style={{ color: GOLD }} />
              </div>
              <h3 className="serif-heading text-2xl" style={{ color: GOLD }}>Then: 1927 "Talkies"</h3>
            </div>
            <p className="leading-relaxed mb-6" style={{ color: '#ffffff' }}>
              When the movie "The Jazz Singer" premiered, it revolutionized entertainment by adding synchronized sound to motion pictures. One of the first entertainers in those times, Charlie Chaplin was a significant figure. Audiences were amazed to hear actors speak.
            </p>
            <p className="font-semibold" style={{ color: GOLD }}>
              It changed everything. Silent films became obsolete overnight.
            </p>
          </div>

          {/* Now Card */}
          <div className="rounded-3xl p-5 border" style={{ background: '#1a1a1a', borderColor: 'rgba(212,175,55,0.3)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)' }}>
                <Mic className="w-6 h-6" style={{ color: GOLD }} />
              </div>
              <h3 className="serif-heading text-2xl" style={{ color: GOLD }}>Now: AI "Talkies"</h3>
            </div>
            <p className="leading-relaxed mb-6" style={{ color: '#ffffff' }}>
              We're experimenting with voice-to-voice technology that lets you talk naturally with Charlie — he understands your needs, explains complex processes, and guides you through every step.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
              While Charlie is still learning the full range of our services, every conversation is backed up by the text chat box in the upper-right corner of each page — so you're always connected.
            </p>
          </div>
        </motion.div>

        {/* History Section */}
        <motion.div
          id="legacy"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="rounded-3xl p-10 md:p-16 border" style={{ background: 'rgba(212,175,55,0.02)', borderColor: 'rgba(212,175,55,0.1)' }}
        >
          {/* Images Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {HISTORY_IMAGES.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl overflow-hidden"
              >
                <img src={img} alt={`Historical moment ${i + 1}`} className="w-full h-auto object-contain" />
              </motion.div>
            ))}
          </div>

          {/* Content */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center px-6 py-3 rounded-full" style={{ background: '#1a1a1a', border: `2px solid ${GOLD}` }}>
            <h2 className="serif-heading text-xl md:text-2xl" style={{ letterSpacing: '-0.01em', color: GOLD }}>
              The Dyson & Dyson Companies —<br />
              We're known for making history in Real Estate
            </h2>
            </div>
          </div>

          <ul className="space-y-4">
            {[
              "Voice AI (Voice to Voice) is developing and is the future of real estate communications.",
              "Charlie joined us to become the first to employ this new technology on just about every subject you can imagine when it comes to home ownership, buying and selling, or just those daily homeowner needs.",
              "Like any new technology, Charlie might stumble a few times since he couldn't even talk in the 1920's.",
              "Voice to Voice is a fun new entry into all of our lives — so watch us and join us by adding other subscribers to broaden our networks on this fun new road we are all traveling."
            ].map((item, i) => (
              <li key={i} className="flex gap-4 text-base leading-relaxed" style={{ color: '#1a1a1a' }}>
                <span style={{ color: '#1a1a1a' }}>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </main>

      {/* Charlie Circle — silent movies to talkies parallel */}
      <ExplainerCharlieCircle />
    </div>
  );
}