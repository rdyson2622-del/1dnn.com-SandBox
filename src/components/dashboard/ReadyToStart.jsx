import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const GOLD = '#D4AF37';

export default function ReadyToStart({ compact = false, onScrollToRoadmap }) {
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full px-2 py-4 rounded-2xl text-center"
        style={{ background: '#3a3a3a', border: '1px solid rgba(212,175,55,0.3)' }}
      >
        <h2 className="display-heading" style={{ fontSize: 'clamp(0.7rem, 1.8vw, 0.85rem)', letterSpacing: '-0.02em', color: '#fff', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          Ready to start your relocation journey?
        </h2>
        <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.8)' }}>
          Commit to our services to unlock your personalized relocation plan, agent matching, and full access to all 8 phases.
        </p>
        <button
          onClick={onScrollToRoadmap}
          className="px-6 py-2 rounded-full font-bold text-sm tracking-wider transition-all hover:opacity-90"
          style={{ background: GOLD, color: '#000' }}
        >
          Yes, I Want to Commit & Start My Relocation
        </button>
      </motion.div>
    );
  }

  const handleCommit = () => {
    if (onScrollToRoadmap) {
      onScrollToRoadmap();
    }
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full px-2 py-4 rounded-2xl text-center"
        style={{ background: '#3a3a3a', border: '1px solid rgba(212,175,55,0.3)' }}
      >
        <h2 className="display-heading" style={{ fontSize: 'clamp(0.7rem, 1.8vw, 0.85rem)', letterSpacing: '-0.02em', color: '#fff', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          Ready to start your relocation journey?
        </h2>
        <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.8)' }}>
          Commit to our services to unlock your personalized relocation plan, agent matching, and full access to all 8 phases.
        </p>
        <button
          onClick={onScrollToRoadmap}
          className="px-6 py-2 rounded-full font-bold text-sm tracking-wider transition-all hover:opacity-90"
          style={{ background: GOLD, color: '#000' }}
        >
          Yes, I Want to Commit & Start My Relocation
        </button>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20" style={{ background: '#808080' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl text-center"
      >
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ border: `2px solid ${GOLD}` }}>
            <Sparkles className="w-8 h-8" style={{ color: GOLD }} />
          </div>
        </div>

        {/* Heading */}
        <h1 className="display-heading mb-4" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '0.2em', color: '#fff' }}>
          Ready to start your relocation journey?
        </h1>

        {/* Subheading */}
        <p className="text-lg mb-10" style={{ color: 'rgba(255,255,255,0.85)' }}>
          Commit to our services to unlock your personalized relocation plan, agent matching, and full access to all 8 phases.
        </p>

        {/* CTA Button */}
        <button
          onClick={handleCommit}
          className="px-10 py-4 rounded-full font-bold text-base tracking-wider transition-all hover:opacity-90"
          style={{ background: GOLD, color: '#000' }}
        >
          Yes, I Want to Commit & Start My Relocation
        </button>
      </motion.div>
    </div>
  );
}