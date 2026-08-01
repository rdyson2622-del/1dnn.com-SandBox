import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { appClient } from '@/api/appClient';
import { Volume2, VolumeX, Phone } from 'lucide-react';

const GOLD = '#D4AF37';

// Build the script dynamically based on owner name from URL params
const buildScript = (ownerName, address) => {
  const firstName = ownerName ? ownerName.split(' ')[0] : null;
  const greeting = firstName
    ? `Hi ${firstName} — I'm Charlie, from Dyson and Dyson. You got our text about ${address ? address : 'your home'}, and I just wanted to take 60 seconds to explain what we actually do.`
    : `Hi — I'm Charlie, from Dyson and Dyson. You got our text, and I just wanted to take 60 seconds to explain what we actually do.`;

  return [
    greeting,
    "We're a concierge relocation service. When someone sells their home and moves to a new city, we take over everything on the buying side — the agent search, the neighborhood research, the school lookups — all of it.",
    "Most people landing in a new city are completely on their own. They pick a random agent off Zillow and hope for the best. We research over 20 agents in your destination market and hand you the top three. You choose. No pressure.",
    "And it costs you nothing. We're compensated through referral agreements with the agent you select — so our interests and yours are perfectly aligned.",
    "So — if you are thinking about a move, I'd love to hear where you're headed. Just talk naturally. I'm listening."
  ];
};

// States
const STATE = {
  IDLE: 'idle',
  SPEAKING: 'speaking',
  LISTENING: 'listening',
  THINKING: 'thinking',
  ERROR: 'error',
};

export default function CharlieVoicePresentation() {
  // Parse URL params for personalization
  const urlParams = new URLSearchParams(window.location.search);
  const ownerName = urlParams.get('owner') || urlParams.get('name') || '';
  const address = urlParams.get('address') || urlParams.get('addr') || '';
  const PRESENTATION_SCRIPT = buildScript(ownerName, address);

  const [status, setStatus] = useState(STATE.IDLE);
  const [currentText, setCurrentText] = useState('');
  const [transcript, setTranscript] = useState('');
  const [conversation, setConversation] = useState([]);
  const [error, setError] = useState('');
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);
  const [presentationDone, setPresentationDone] = useState(false);

  const recognitionRef = useRef(null);
  const scriptIndexRef = useRef(0);
  const isMountedRef = useRef(true);
  const muteRef = useRef(false);
  const audioRef = useRef(null);

  useEffect(() => {
    muteRef.current = muted;
  }, [muted]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      recognitionRef.current?.stop();
    };
  }, []);

  // Setup speech recognition
  const setupRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const text = result[0].transcript;
      setTranscript(text);

      if (result.isFinal) {
        setTranscript('');
        handleUserSpeech(text);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        // Restart listening if no speech detected
        if (isMountedRef.current && presentationDone) {
          setTimeout(() => startListening(), 1000);
        }
      }
    };

    recognition.onend = () => {
      // Auto-restart listening if we're in listening mode
      if (isMountedRef.current && status === STATE.LISTENING) {
        setTimeout(() => {
          if (recognitionRef.current && isMountedRef.current) {
            try { recognitionRef.current.start(); } catch (e) {}
          }
        }, 300);
      }
    };

    return recognition;
  }, [status, presentationDone]);

  // Speak a single line using charlieSpeak backend
  const speakLine = useCallback((text, onEnd) => {
    if (!isMountedRef.current) return;
    if (muteRef.current) {
      setCurrentText(text);
      setTimeout(onEnd, 100);
      return;
    }

    setCurrentText(text);
    setStatus(STATE.SPEAKING);

    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }

    appClient.functions.invoke('charlieSpeak', { text })
      .then(res => {
        if (!isMountedRef.current) return;
        const { audio } = res.data;
        const el = new Audio(`data:audio/wav;base64,${audio}`);
        audioRef.current = el;
        el.onended = () => {
          if (isMountedRef.current) onEnd();
        };
        el.onerror = () => {
          if (isMountedRef.current) onEnd();
        };
        el.play().catch(() => {
          if (isMountedRef.current) onEnd();
        });
      })
      .catch(() => {
        if (isMountedRef.current) onEnd();
      });
  }, []);

  // Run the presentation script sequentially
  const runPresentation = useCallback(() => {
    const idx = scriptIndexRef.current;
    if (idx >= PRESENTATION_SCRIPT.length) {
      // Presentation done — switch to listen mode
      setPresentationDone(true);
      startListening();
      return;
    }

    speakLine(PRESENTATION_SCRIPT[idx], () => {
      scriptIndexRef.current += 1;
      setTimeout(() => {
        if (isMountedRef.current) runPresentation();
      }, 400);
    });
  }, [speakLine]);

  // Start listening for user input
  const startListening = useCallback(() => {
    if (!isMountedRef.current) return;
    setStatus(STATE.LISTENING);
    setCurrentText('');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Voice recognition is not supported in this browser. Please use Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const text = result[0].transcript;
      setTranscript(text);

      if (result.isFinal && text.trim().length > 2) {
        recognition.stop();
        setTranscript('');
        handleUserSpeech(text.trim());
      }
    };

    recognition.onerror = (e) => {
      if (e.error !== 'no-speech' && isMountedRef.current) {
        setTimeout(() => startListening(), 2000);
      }
    };

    recognition.onend = () => {
      if (isMountedRef.current && status === STATE.LISTENING) {
        setTimeout(() => {
          try { recognition.start(); } catch (e) {}
        }, 500);
      }
    };

    recognitionRef.current = recognition;
    try { recognition.start(); } catch (e) {}
  }, [status]);

  // Handle what the user said — call Charlie backend
  const handleUserSpeech = useCallback(async (userText) => {
    if (!isMountedRef.current) return;
    recognitionRef.current?.stop();

    setStatus(STATE.THINKING);
    setCurrentText('');

    const updatedConvo = [...conversation, { role: 'user', content: userText }];
    setConversation(updatedConvo);

    try {
      const res = await appClient.functions.invoke('charlieVoiceChat', {
        message: userText,
        conversation: updatedConvo.slice(-6),
        ownerName,
        address,
      });

      const reply = res.data?.reply || "That's a great point. Let me think about that for a moment and get back to you.";
      const newConvo = [...updatedConvo, { role: 'charlie', content: reply }];
      setConversation(newConvo);

      speakLine(reply, () => {
        if (isMountedRef.current) startListening();
      });

    } catch (err) {
      const fallback = "I'm sorry, I had a brief hiccup. Could you repeat that?";
      speakLine(fallback, () => {
        if (isMountedRef.current) startListening();
      });
    }
  }, [conversation, speakLine, startListening]);

  // Auto-start on first user gesture (required by browsers for autoplay)
  const handleStart = useCallback(() => {
    if (started) return;
    setStarted(true);
    scriptIndexRef.current = 0;
    // Small delay to let browser unlock audio
    setTimeout(() => {
      if (isMountedRef.current) runPresentation();
    }, 300);
  }, [started, runPresentation]);

  // Try to auto-start immediately; if browser blocks, show tap screen
  useEffect(() => {
    // Some browsers require a gesture. We attempt auto-start and catch failure.
    const timer = setTimeout(() => {
      if (!started && isMountedRef.current) {
        handleStart();
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [started, handleStart]);

  const statusLabel = {
    [STATE.IDLE]: 'Initializing...',
    [STATE.SPEAKING]: 'Charlie is speaking...',
    [STATE.LISTENING]: 'Listening — speak freely',
    [STATE.THINKING]: 'Charlie is thinking...',
    [STATE.ERROR]: error,
  };

  const orbColor = {
    [STATE.IDLE]: GOLD,
    [STATE.SPEAKING]: '#60a5fa',
    [STATE.LISTENING]: '#4ade80',
    [STATE.THINKING]: '#a78bfa',
    [STATE.ERROR]: '#ef4444',
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: '#050505' }}
      onClick={handleStart}
    >
      {/* Background pulse rings */}
      <AnimatePresence>
        {status === STATE.SPEAKING && (
          <>
            {[1, 2, 3].map(i => (
              <motion.div
                key={i}
                className="absolute rounded-full border"
                style={{ borderColor: `${GOLD}${i === 1 ? '44' : i === 2 ? '22' : '11'}` }}
                initial={{ width: 120, height: 120, opacity: 0.8 }}
                animate={{ width: 120 + i * 80, height: 120 + i * 80, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.4, ease: 'easeOut' }}
              />
            ))}
          </>
        )}
        {status === STATE.LISTENING && (
          <>
            {[1, 2, 3].map(i => (
              <motion.div
                key={i}
                className="absolute rounded-full border"
                style={{ borderColor: `#4ade80${i === 1 ? '55' : i === 2 ? '33' : '11'}` }}
                initial={{ width: 120, height: 120, opacity: 0.8 }}
                animate={{ width: 120 + i * 60, height: 120 + i * 60, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3, ease: 'easeOut' }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Main Orb */}
      <motion.div
        className="relative z-10 flex items-center justify-center rounded-full"
        style={{ width: 120, height: 120, background: `radial-gradient(circle, ${orbColor[status]}33, ${orbColor[status]}11)`, border: `2px solid ${orbColor[status]}66` }}
        animate={status === STATE.SPEAKING ? { scale: [1, 1.08, 1], opacity: [1, 0.85, 1] } : status === STATE.THINKING ? { rotate: 360 } : {}}
        transition={status === STATE.THINKING ? { duration: 2, repeat: Infinity, ease: 'linear' } : { duration: 0.6, repeat: Infinity }}
      >
        <span style={{ fontSize: '3rem' }}>🎩</span>
      </motion.div>

      {/* Charlie name */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-center z-10">
        <h1 className="text-2xl font-bold tracking-widest" style={{ color: GOLD, fontFamily: 'Georgia, serif' }}>CHARLIE</h1>
        <p className="text-xs tracking-widest mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>DYSON & DYSON AI CONCIERGE</p>
      </motion.div>

      {/* Status indicator */}
      <motion.div
        key={status}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 px-4 py-2 rounded-full z-10"
        style={{ background: `${orbColor[status]}15`, border: `1px solid ${orbColor[status]}33` }}
      >
        <p className="text-sm font-medium" style={{ color: orbColor[status] }}>
          {status === STATE.LISTENING && <span className="inline-block w-2 h-2 rounded-full mr-2 animate-pulse" style={{ background: '#4ade80' }} />}
          {statusLabel[status]}
        </p>
      </motion.div>

      {/* What Charlie is saying */}
      <AnimatePresence mode="wait">
        {currentText && (
          <motion.div
            key={currentText.slice(0, 20)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 max-w-lg text-center z-10 px-8"
          >
            <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)', fontStyle: 'italic' }}>
              "{currentText}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User transcript (live) */}
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 max-w-md text-center z-10 px-8"
          >
            <p className="text-sm" style={{ color: '#4ade80' }}>You: "{transcript}"</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tap to start overlay — shown if autoplay was blocked */}
      {!started && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 flex flex-col items-center justify-center z-50 cursor-pointer px-6"
          style={{ background: '#050505' }}
          onClick={handleStart}
        >
          {/* Logo area */}
          <p className="text-xs font-bold tracking-[0.3em] mb-8" style={{ color: 'rgba(212,175,55,0.5)' }}>DYSON & DYSON</p>

          {/* Animated orb */}
          <motion.div
            animate={{ scale: [1, 1.08, 1], boxShadow: [`0 0 0px ${GOLD}44`, `0 0 40px ${GOLD}33`, `0 0 0px ${GOLD}44`] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
            style={{ background: `${GOLD}15`, border: `2px solid ${GOLD}66` }}
          >
            <span style={{ fontSize: '3rem' }}>🎩</span>
          </motion.div>

          <h2 className="text-3xl font-bold mb-1 tracking-widest" style={{ color: GOLD, fontFamily: 'Georgia, serif' }}>CHARLIE</h2>
          <p className="text-xs tracking-widest mb-6" style={{ color: 'rgba(255,255,255,0.35)' }}>AI CONCIERGE · DYSON & DYSON</p>

          {ownerName && (
            <p className="text-sm mb-6 text-center" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Hello, <span style={{ color: GOLD }}>{ownerName.split(' ')[0]}</span>. Charlie is ready to speak with you.
            </p>
          )}

          <motion.button
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex items-center gap-3 px-8 py-4 rounded-full font-bold text-base mb-4"
            style={{ background: GOLD, color: '#000' }}
            onClick={handleStart}
          >
            <Phone className="w-5 h-5" />
            Tap to Hear from Charlie
          </motion.button>

          <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
            No typing needed — just listen and speak naturally
          </p>

          {address && (
            <p className="text-xs mt-4 text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Re: {address}
            </p>
          )}
        </motion.div>
      )}

      {/* Mute toggle */}
      {started && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={(e) => { e.stopPropagation(); setMuted(m => !m); if (!muted && audioRef.current) audioRef.current.pause(); }}
          className="fixed bottom-8 right-8 z-50 p-3 rounded-full"
          style={{ background: '#1a1a1a', border: `1px solid ${muted ? '#ef4444' : '#333'}` }}
        >
          {muted ? <VolumeX className="w-5 h-5" style={{ color: '#ef4444' }} /> : <Volume2 className="w-5 h-5" style={{ color: '#aaa' }} />}
        </motion.button>
      )}

      {/* Recent conversation history */}
      {conversation.length > 0 && (
        <div className="fixed bottom-8 left-8 max-w-xs z-10 space-y-1">
          {conversation.slice(-3).map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 0.6, x: 0 }}
              className="text-xs px-3 py-1.5 rounded-lg"
              style={{
                background: msg.role === 'charlie' ? 'rgba(212,175,55,0.15)' : 'rgba(74,222,128,0.1)',
                color: msg.role === 'charlie' ? GOLD : '#4ade80',
                maxWidth: '280px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {msg.role === 'charlie' ? '🎩 ' : '👤 '}{msg.content.slice(0, 60)}{msg.content.length > 60 ? '…' : ''}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}