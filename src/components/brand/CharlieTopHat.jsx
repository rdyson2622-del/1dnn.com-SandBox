import React from 'react';
import { motion } from 'framer-motion';

export default function CharlieTopHat({ size = 'md', speaking = false }) {
  const sizes = { sm: 80, md: 120, lg: 160, xl: 200 };
  const s = sizes[size] || sizes.md;

  return (
    <motion.div
      className="relative inline-block"
      style={{ width: s, height: s * 1.3 }}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Ambient glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 60%, rgba(212,175,55,0.35) 0%, transparent 70%)',
          filter: 'blur(12px)',
        }}
        animate={{ opacity: speaking ? [0.5, 1, 0.5] : [0.2, 0.5, 0.2] }}
        transition={{ duration: speaking ? 1 : 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      <svg
        viewBox="0 0 100 130"
        width={s}
        height={s * 1.3}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="goldGradCH" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B6914" />
            <stop offset="30%" stopColor="#D4AF37" />
            <stop offset="55%" stopColor="#F5E27A" />
            <stop offset="80%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#9A7B1A" />
          </linearGradient>
          <linearGradient id="hatGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </linearGradient>
          <linearGradient id="faceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FDDBB4" />
            <stop offset="100%" stopColor="#E8A87C" />
          </linearGradient>
          <linearGradient id="suitGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1c1c2e" />
            <stop offset="100%" stopColor="#0d0d1a" />
          </linearGradient>
        </defs>

        {/* === TOP HAT === */}
        {/* Hat brim */}
        <ellipse cx="50" cy="28" rx="26" ry="5" fill="url(#hatGrad)" stroke="url(#goldGradCH)" strokeWidth="1" />
        {/* Hat body */}
        <rect x="30" y="4" width="40" height="25" rx="3" fill="url(#hatGrad)" stroke="url(#goldGradCH)" strokeWidth="0.8" />
        {/* Hat band (gold stripe) */}
        <rect x="30" y="24" width="40" height="5" rx="1" fill="url(#goldGradCH)" opacity="0.9" />
        {/* Hat top shine */}
        <rect x="33" y="6" width="8" height="18" rx="3" fill="rgba(255,255,255,0.06)" />

        {/* === FACE === */}
        {/* Head */}
        <ellipse cx="50" cy="44" rx="18" ry="16" fill="url(#faceGrad)" />
        {/* Face shine */}
        <ellipse cx="44" cy="39" rx="5" ry="4" fill="rgba(255,255,255,0.15)" />

        {/* Eyes */}
        <ellipse cx="43" cy="42" rx="3" ry="3.5" fill="#1a0a00" />
        <ellipse cx="57" cy="42" rx="3" ry="3.5" fill="#1a0a00" />
        {/* Eye shine */}
        <circle cx="44.2" cy="40.8" r="1" fill="white" opacity="0.8" />
        <circle cx="58.2" cy="40.8" r="1" fill="white" opacity="0.8" />

        {/* Eyebrows */}
        <path d="M 40 38 Q 43 36.5 46 38" stroke="#5C3A1A" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M 54 38 Q 57 36.5 60 38" stroke="#5C3A1A" strokeWidth="1.2" fill="none" strokeLinecap="round" />

        {/* Nose */}
        <ellipse cx="50" cy="47" rx="2.5" ry="1.8" fill="#D4956A" />

        {/* Mouth - smile, animated when speaking */}
        {speaking ? (
          <path d="M 43 52 Q 50 57 57 52" stroke="#8B3A3A" strokeWidth="1.5" fill="rgba(180,60,60,0.4)" strokeLinecap="round" />
        ) : (
          <path d="M 44 52 Q 50 56 56 52" stroke="#8B3A3A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        )}

        {/* Cheeks */}
        <ellipse cx="39" cy="49" rx="4" ry="2.5" fill="rgba(220,100,80,0.2)" />
        <ellipse cx="61" cy="49" rx="4" ry="2.5" fill="rgba(220,100,80,0.2)" />

        {/* Ears */}
        <ellipse cx="32.5" cy="44" rx="3" ry="4" fill="#FDDBB4" />
        <ellipse cx="67.5" cy="44" rx="3" ry="4" fill="#FDDBB4" />

        {/* === NECK === */}
        <rect x="45" y="58" width="10" height="8" rx="2" fill="#FDDBB4" />

        {/* === SUIT === */}
        {/* Body */}
        <path d="M 20 130 L 22 70 Q 30 64 50 66 Q 70 64 78 70 L 80 130 Z" fill="url(#suitGrad)" />

        {/* Lapels */}
        <path d="M 50 70 L 38 80 L 36 90 L 50 85 Z" fill="#2a2a3e" stroke="url(#goldGradCH)" strokeWidth="0.5" />
        <path d="M 50 70 L 62 80 L 64 90 L 50 85 Z" fill="#2a2a3e" stroke="url(#goldGradCH)" strokeWidth="0.5" />

        {/* Gold bow tie */}
        <path d="M 44 67 L 50 71 L 56 67 L 50 63 Z" fill="url(#goldGradCH)" />
        <circle cx="50" cy="67" r="2" fill="url(#goldGradCH)" />

        {/* Suit buttons */}
        <circle cx="50" cy="90" r="1.5" fill="url(#goldGradCH)" />
        <circle cx="50" cy="98" r="1.5" fill="url(#goldGradCH)" />
        <circle cx="50" cy="106" r="1.5" fill="url(#goldGradCH)" />

        {/* Pocket square */}
        <path d="M 62 76 L 68 74 L 70 80 L 64 80 Z" fill="url(#goldGradCH)" opacity="0.9" />

        {/* Arms */}
        {/* Left arm */}
        <path d="M 22 72 Q 10 85 12 100 Q 14 108 20 110" stroke="#1c1c2e" strokeWidth="12" fill="none" strokeLinecap="round" />
        {/* Left hand */}
        <circle cx="19" cy="112" r="6" fill="#FDDBB4" />

        {/* Right arm */}
        <path d="M 78 72 Q 90 85 88 100 Q 86 108 80 110" stroke="#1c1c2e" strokeWidth="12" fill="none" strokeLinecap="round" />
        {/* Right hand */}
        <circle cx="81" cy="112" r="6" fill="#FDDBB4" />

        {/* Suit sleeve cuffs */}
        <ellipse cx="19" cy="107" rx="7" ry="4" fill="white" opacity="0.9" />
        <ellipse cx="81" cy="107" rx="7" ry="4" fill="white" opacity="0.9" />
        {/* Cuff gold links */}
        <circle cx="19" cy="107" r="1.5" fill="url(#goldGradCH)" />
        <circle cx="81" cy="107" r="1.5" fill="url(#goldGradCH)" />

        {/* Monocle */}
        <circle cx="57" cy="42" r="5" fill="none" stroke="url(#goldGradCH)" strokeWidth="1.2" opacity="0.7" />
        <line x1="62" y1="45" x2="66" y2="50" stroke="url(#goldGradCH)" strokeWidth="0.8" opacity="0.7" />
      </svg>
    </motion.div>
  );
}