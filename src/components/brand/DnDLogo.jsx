import React from 'react';
import { motion } from 'framer-motion';

export default function DnDLogo({ size = 'md', speaking = false, onClick }) {
  const sizes = {
    sm:  { w: 32,  h: 44  },
    md:  { w: 52,  h: 72  },
    lg:  { w: 80,  h: 110 },
    xl:  { w: 120, h: 165 },
  };

  const s = sizes[size] || sizes.md;

  return (
    <motion.div
      className="relative cursor-pointer shrink-0 inline-block"
      style={{ width: s.w, height: s.h }}
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      animate={speaking
        ? { scale: [1, 1.06, 1], filter: ['brightness(1)', 'brightness(1.4)', 'brightness(1)'] }
        : { scale: [1, 1.025, 1], filter: ['brightness(1)', 'brightness(1.1)', 'brightness(1)'] }
      }
      transition={{ duration: speaking ? 1.0 : 2.8, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Always-on ambient glow */}
      <motion.div
        className="absolute inset-0 rounded-lg pointer-events-none"
        style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)', filter: 'blur(10px)' }}
        animate={{ opacity: speaking ? [0.4, 0.9, 0.4] : [0.08, 0.22, 0.08] }}
        transition={{ duration: speaking ? 1.0 : 2.8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <svg
        viewBox="0 0 100 138"
        width={s.w}
        height={s.h}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gold gradient for main body */}
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#8B6914" />
            <stop offset="20%"  stopColor="#D4AF37" />
            <stop offset="45%"  stopColor="#F5E27A" />
            <stop offset="65%"  stopColor="#D4AF37" />
            <stop offset="85%"  stopColor="#9A7B1A" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>

          {/* Darker gold for border/frame */}
          <linearGradient id="frameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#5C4A0A" />
            <stop offset="40%"  stopColor="#C9A227" />
            <stop offset="60%"  stopColor="#F0D060" />
            <stop offset="100%" stopColor="#7A6010" />
          </linearGradient>

          {/* DD monogram gradient — richer */}
          <linearGradient id="ddGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#3D2B00" />
            <stop offset="25%"  stopColor="#C9A030" />
            <stop offset="50%"  stopColor="#FFF0A0" />
            <stop offset="75%"  stopColor="#B8860B" />
            <stop offset="100%" stopColor="#7A5E00" />
          </linearGradient>

          {/* Text gradient */}
          <linearGradient id="textGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#FFF0A0" />
            <stop offset="50%"  stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#8B6914" />
          </linearGradient>
        </defs>

        {/* Outer rectangle border */}
        <rect x="2" y="2" width="96" height="134" rx="8" ry="8"
          fill="#0a0a0a" stroke="url(#frameGrad)" strokeWidth="3.5" />

        {/* Inner border line */}
        <rect x="7" y="7" width="86" height="124" rx="5" ry="5"
          fill="none" stroke="url(#goldGrad)" strokeWidth="1" opacity="0.6" />

        {/* Top "DYSON" band */}
        <rect x="7" y="7" width="86" height="26" rx="5" ry="5"
          fill="url(#frameGrad)" opacity="0.25" />
        {/* Top divider line */}
        <line x1="7" y1="33" x2="93" y2="33" stroke="url(#goldGrad)" strokeWidth="1" />

        {/* Bottom "DYSON" band */}
        <rect x="7" y="105" width="86" height="26" rx="0" ry="0"
          style={{ borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }}
          fill="url(#frameGrad)" opacity="0.25" />
        {/* Bottom divider line */}
        <line x1="7" y1="105" x2="93" y2="105" stroke="url(#goldGrad)" strokeWidth="1" />

        {/* TOP TEXT: DYSON */}
        <text
          x="50" y="24"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontWeight="bold"
          fontSize="15"
          letterSpacing="5"
          fill="url(#textGrad)"
        >
          DYSON
        </text>

        {/* BOTTOM TEXT: DYSON */}
        <text
          x="50" y="120"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontWeight="bold"
          fontSize="15"
          letterSpacing="5"
          fill="url(#textGrad)"
        >
          DYSON
        </text>

        {/* ── DD Monogram ── */}
        {/* Left D */}
        <path
          d="M 22 42
             L 22 96
             L 34 96
             C 52 96, 62 85, 62 69
             C 62 53, 52 42, 34 42
             Z"
          fill="url(#ddGrad)"
        />
        {/* Left D inner cutout */}
        <path
          d="M 30 51
             L 30 87
             L 35 87
             C 48 87, 53 79, 53 69
             C 53 59, 48 51, 35 51
             Z"
          fill="#0a0a0a"
        />

        {/* Right D (mirrored) */}
        <path
          d="M 78 42
             L 78 96
             L 66 96
             C 48 96, 38 85, 38 69
             C 38 53, 48 42, 66 42
             Z"
          fill="url(#ddGrad)"
        />
        {/* Right D inner cutout */}
        <path
          d="M 70 51
             L 70 87
             L 65 87
             C 52 87, 47 79, 47 69
             C 47 59, 52 51, 65 51
             Z"
          fill="#0a0a0a"
        />

        {/* Center vertical divider line between the two D's */}
        <line x1="50" y1="40" x2="50" y2="98" stroke="url(#goldGrad)" strokeWidth="1.2" opacity="0.7" />

      </svg>

      {/* Online / active indicator */}
      {speaking && (
        <div
          className="absolute bottom-0 right-0 w-[18%] aspect-square rounded-full border-2"
          style={{ background: '#D4AF37', borderColor: '#080808' }}
        />
      )}
    </motion.div>
  );
}