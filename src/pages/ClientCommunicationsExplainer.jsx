import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle, MessageSquare, CheckCircle } from 'lucide-react';

const GOLD = '#D4AF37';

export default function ClientCommunicationsExplainer() {
  return (
    <div className="flex flex-col h-screen" style={{ background: '#080808' }}>
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 flex items-center justify-center gap-3 border-b" style={{ background: 'rgba(8,8,8,0.95)', borderColor: 'rgba(212,175,55,0.15)' }}>
        <Link to="/chat" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <h1 className="text-xl font-bold text-white">Communications Hub</h1>
        <Link to="/subscribe"
          className="ml-auto px-4 py-2 rounded-full text-xs font-black tracking-wide whitespace-nowrap transition-all hover:opacity-90"
          style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: '#000' }}>
          Subscribe Free
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Slide 1: Intro + How It Works — TAN BACKGROUND */}
        <div className="flex-1 px-12 py-12" style={{ background: '#ede0cc' }}>
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: 'Cormorant Garamond, serif', letterSpacing: '0.05em', color: '#1a1a1a', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              Stay Connected with Your Dyson & Dyson Team
            </h2>
            <p className="text-lg leading-relaxed mb-12" style={{ color: '#4a4a4a', fontFamily: 'Georgia, serif' }}>
              Every message you send — whether through Charlie chat, SMS reply, or email — reaches your dedicated team in one unified thread. No jumping between apps. No missed messages. Just a conversation you can trust.
            </p>

            <h3 className="text-2xl font-bold mb-8" style={{ fontFamily: 'Cormorant Garamond, serif', letterSpacing: '0.05em', color: '#1a1a1a' }}>
              How It Works
            </h3>
            
            <div className="space-y-4">
              {/* Card 1 */}
              <div className="rounded-2xl p-6 flex items-start gap-4" style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.3)' }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(212,175,55,0.2)' }}>
                  <MessageCircle className="w-6 h-6" style={{ color: GOLD }} />
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-2 text-white">Message Your Way</h4>
                  <p className="text-sm leading-relaxed text-white">
                    Send messages through Charlie, reply to SMS, or use email — whichever feels most natural. All conversations flow into one unified inbox where your Dyson team is always watching.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="rounded-2xl p-6 flex items-start gap-4" style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.3)' }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(212,175,55,0.2)' }}>
                  <MessageSquare className="w-6 h-6" style={{ color: GOLD }} />
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-2 text-white">Real-Time Responses</h4>
                  <p className="text-sm leading-relaxed text-white">
                    Your team sees every message instantly. No delays. No waiting for office hours. Replies come back on the same channel you used, so the conversation never breaks rhythm.
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="rounded-2xl p-6 flex items-start gap-4" style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.3)' }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(212,175,55,0.2)' }}>
                  <CheckCircle className="w-6 h-6" style={{ color: GOLD }} />
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-2 text-white">Nothing to Download</h4>
                  <p className="text-sm leading-relaxed text-white">
                    Everything lives here in your client dashboard. No separate apps. No notification overload. Just one place where you and your Dyson team connect.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slide 2: Gemini + CTA — TAN BACKGROUND */}
        <div className="flex-1 px-12 py-12 flex flex-col items-center justify-center" style={{ background: '#ede0cc' }}>
          <div className="max-w-2xl w-full">
            {/* Gemini Banner */}
            <div className="rounded-xl p-6 mb-8 flex items-center justify-between" style={{ background: '#1a1a1a', border: '2px solid rgba(212,175,55,0.4)' }}>
              <div className="flex items-start gap-3">
                <span style={{ fontSize: '1.5rem' }}>⚡</span>
                <div>
                  <p className="font-bold text-white">Ready for your deep-dive interview?</p>
                  <p className="text-sm text-white">Start your live Gemini session — builds your full relocation profile</p>
                </div>
              </div>
              <Link to="/GeminiSession"
                className="px-5 py-2 rounded-lg font-bold text-sm whitespace-nowrap"
                style={{ background: GOLD, color: '#000' }}>
                Begin →
              </Link>
            </div>

            {/* Your Team Section */}
            <div className="rounded-2xl p-8" style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.3)' }}>
              <h3 className="text-2xl font-bold mb-6 text-white" style={{ fontFamily: 'Cormorant Garamond, serif', letterSpacing: '0.05em' }}>
                Your Dedicated Team
              </h3>
              <p className="text-base leading-relaxed mb-4 text-white" style={{ fontFamily: 'Georgia, serif' }}>
                Every message you send — via Charlie chat, SMS reply, or email — reaches your Dyson team in one unified thread. They see your complete conversation history across all channels. They reply directly on the same channel you used, and your response is delivered instantly.
              </p>
              <p className="text-base leading-relaxed text-white" style={{ fontFamily: 'Georgia, serif' }}>
                <strong>Bottom line:</strong> You're never talking to different people. You're always talking to the same team who knows your move, your timeline, and your goals.
              </p>
            </div>

            {/* Subscribe CTA */}
            <div className="rounded-2xl p-8 mt-8 text-center" style={{ background: '#1a1a1a', border: `2px solid ${GOLD}` }}>
              <p className="text-xs font-black tracking-[0.25em] uppercase mb-3" style={{ color: GOLD }}>STAY IN THE LOOP — FREE</p>
              <p className="text-base leading-relaxed mb-6 text-white" style={{ fontFamily: 'Georgia, serif' }}>
                Subscribe free to get the Dyson News Network morning brief, real estate alerts, and team messaging — all in one place.
              </p>
              <Link to="/subscribe"
                className="inline-block px-10 py-4 rounded-full font-bold text-base tracking-wider transition-all hover:opacity-90"
                style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: '#000' }}>
                Subscribe Free →
              </Link>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}