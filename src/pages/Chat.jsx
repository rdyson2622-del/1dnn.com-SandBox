import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, X, Mic } from 'lucide-react';
import ChatInterface from '../components/charlie/ChatInterface';
const DYSON_LOGO = "/assets/dyson-logo.png";
const GOLD = '#D4AF37';

export default function Chat() {
  const [expanded, setExpanded] = useState(false);
  const [voiceBannerDismissed, setVoiceBannerDismissed] = useState(
    () => localStorage.getItem('voice_banner_dismissed') === '1'
  );

  const dismissVoiceBanner = () => {
    localStorage.setItem('voice_banner_dismissed', '1');
    setVoiceBannerDismissed(true);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#080808' }}>
      {/* Header */}
      <header className="px-6 py-3 flex items-center gap-3 shrink-0 frosted-dark" style={{ borderBottom: '1px solid rgba(212,175,55,0.12)' }}>
        <Link to="/Home"><img src={DYSON_LOGO} alt="Dyson & Dyson" className="h-12 w-auto cursor-pointer" /></Link>
        <div>
          <h1 className="text-2xl font-black" style={{ color: '#ffffff' }}>Charlie — AI Concierge</h1>
          <p className="text-sm" style={{ color: '#D4AF37' }}>Concierge Relocation Services • Always Free</p>
        </div>
      </header>

      {/* Gemini Live CTA banner */}
      <div className="max-w-3xl w-full mx-auto px-6 pt-4 shrink-0">
        <Link to="/GeminiSession">
          <div className="rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer transition-all hover:opacity-90"
            style={{ background: 'rgba(212,175,55,0.08)', border: `1px solid ${GOLD}44` }}>
            <Sparkles className="w-5 h-5 shrink-0" style={{ color: GOLD }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold" style={{ color: GOLD }}>Ready for your deep-dive interview?</p>
              <p className="text-sm truncate" style={{ color: '#f5f5f5' }}>Start your live Gemini session — builds your full relocation profile</p>
            </div>
            <span className="text-sm font-bold shrink-0" style={{ color: GOLD }}>Begin →</span>
          </div>
        </Link>
      </div>

      {/* Voice Pioneer Banner — dismissible, shown at top of chat box */}
      {!voiceBannerDismissed && (
        <div className="max-w-3xl w-full mx-auto px-6 pt-3 shrink-0">
          <div className="rounded-xl px-4 py-3 flex items-start gap-3 relative"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)' }}>
            <Mic className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#818cf8' }} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold mb-0.5" style={{ color: '#818cf8' }}>
                🎙️ Pioneering the Future of Voice
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
                We're actively working with Gemini and Supabase to bring you a seamless Voice-to-Voice experience. Because voice tech currently varies across Apple devices and browsers, <strong className="text-white">Text is currently the most reliable way to reach us.</strong> Feel free to test our Voice features on Chrome Desktop as we build this exciting future together!
              </p>
            </div>
            <button onClick={dismissVoiceBanner}
              className="shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 transition-colors mt-0.5">
              <X className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.4)' }} />
            </button>
          </div>
        </div>
      )}

      {/* Chat */}
      <div className="flex-1 max-w-3xl w-full mx-auto p-6">
        <ChatInterface
          expanded={expanded}
          onToggleExpand={() => setExpanded(!expanded)} />
      </div>
    </div>);

}