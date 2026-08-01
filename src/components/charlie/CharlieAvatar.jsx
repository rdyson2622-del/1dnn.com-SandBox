import React from 'react';
import { motion } from 'framer-motion';

const CHARLIE_HEADSHOT = '/assets/charlie-headshot.png';

// Charlie — photographic avatar (sizes reduced 25%)
export default function CharlieAvatar({ size = 'md', speaking = false, onClick }) {
  const sizes = {
    sm: 'w-[30px] h-[30px]',
    md: 'w-12 h-12',
    lg: 'w-[72px] h-[72px]',
    xl: 'w-[108px] h-[108px]',
  };

  const outer = sizes[size] || sizes.md;

  return (
    <motion.div
      className={`relative cursor-pointer ${outer} shrink-0`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Speaking glow ring - gold */}
      {speaking && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.1, 0.5] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Charlie photo */}
      <span
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{ background: '#0d0d0d', border: '2px solid #D4AF37' }}
      >
        <img
          src={CHARLIE_HEADSHOT}
          alt="Charlie — Dyson AI Concierge"
          className="w-full h-full object-cover pointer-events-none"
        />
      </span>

      {/* Online status - gold dot */}
      <div className="absolute bottom-0 right-0 w-[22%] aspect-square rounded-full border-2 border-black" style={{ background: '#D4AF37' }} />
    </motion.div>
  );
}