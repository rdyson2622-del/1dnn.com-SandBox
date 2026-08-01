import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2 } from 'lucide-react';

export default function VoiceOrb({ isListening, isSpeaking, onToggle, disabled }) {
  const [level, setLevel] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isListening || isSpeaking) {
      intervalRef.current = setInterval(() => {
        setLevel(Math.random());
      }, 150);
    } else {
      clearInterval(intervalRef.current);
      setLevel(0);
    }
    return () => clearInterval(intervalRef.current);
  }, [isListening, isSpeaking]);

  const rings = [1, 2, 3];

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex items-center justify-center">
        {/* Animated rings */}
        {rings.map((r) => (
          <AnimatePresence key={r}>
            {(isListening || isSpeaking) && (
              <motion.div
                className="absolute rounded-full border"
                style={{ borderColor: '#D4AF37', opacity: 0 }}
                animate={{
                  width: [60, 60 + r * 30 + level * 20],
                  height: [60, 60 + r * 30 + level * 20],
                  opacity: [0.6, 0],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: r * 0.3,
                  ease: 'easeOut',
                }}
              />
            )}
          </AnimatePresence>
        ))}

        {/* Main orb */}
        <motion.button
          onClick={onToggle}
          disabled={disabled}
          className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all disabled:opacity-50"
          style={{
            background: isListening
              ? 'linear-gradient(135deg, #D4AF37, #B8860B)'
              : isSpeaking
              ? 'linear-gradient(135deg, #1a1a1a, #333)'
              : 'linear-gradient(135deg, #111, #222)',
            boxShadow: isListening
              ? '0 0 30px rgba(212, 175, 55, 0.6)'
              : isSpeaking
              ? '0 0 20px rgba(212, 175, 55, 0.3)'
              : '0 4px 20px rgba(0,0,0,0.5)',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={isListening ? { scale: [1, 1.05 + level * 0.1, 1] } : {}}
          transition={{ duration: 0.15 }}
        >
          {isListening ? (
            <MicOff className="w-6 h-6 text-black" />
          ) : isSpeaking ? (
            <Volume2 className="w-6 h-6" style={{ color: '#D4AF37' }} />
          ) : (
            <Mic className="w-6 h-6" style={{ color: '#D4AF37' }} />
          )}
        </motion.button>
      </div>

      <p className="text-xs font-medium" style={{ color: '#D4AF37' }}>
        {isListening ? '🎤 Listening...' : isSpeaking ? '🔊 Charlie is speaking...' : 'Tap to speak'}
      </p>
    </div>
  );
}