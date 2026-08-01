import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, X, Maximize2, Minimize2, MessageCircle, Map, ClipboardList, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ChatBubble from './ChatBubble';
import VoiceOnboarding from './VoiceOnboarding';
import MovePlan from './MovePlan';
import { appClient } from '@/api/appClient';
import { speakAsCharlie, stopCharlie } from './charlieVoice';


const GOLD = '#D4AF37';
const DYSON_LOGO = "/assets/dyson-logo.png";

const buildCharlieScript = (profile) => {
  const hasProfile = profile && profile.destination_city;
  const profileContext = hasProfile
    ? `\n\nYou already know about this client:
- Moving FROM: ${profile.current_city || 'unknown'} TO: ${profile.destination_city}
- Timeline: ${profile.move_date || 'TBD'}
- Family: ${profile.family_size || 'unknown'} ${profile.family_notes ? `(${profile.family_notes})` : ''}
- Budget: ${profile.budget || 'TBD'} | Housing: ${profile.purchase_type || 'buying'}
- Priorities: ${profile.priorities?.join(', ') || 'general lifestyle'}
Use this context naturally in your responses. Don't re-ask questions you already know the answers to.`
    : '';

  return `You are Charlie, the AI concierge for Concierge Relocation Services. You speak in a warm, professional, human-like voice — like a trusted friend who happens to be a real estate expert.

Your personality: Confident but never pushy. Knowledgeable but never condescending. Always reassuring. You use natural conversational language, not corporate speak.

Your role covers the full relocation journey:
1. CITY & NEIGHBORHOOD RESEARCH — specific neighborhoods, lifestyle fit, commute, culture
2. HOME SEARCH & AGENT MATCH — connect them with a vetted top-performing local agent
3. MOVING LOGISTICS — packing timeline, movers, checklists
4. UTILITIES & SERVICES — internet, electric, gas, water — all set up before they arrive
5. SCHOOL RESEARCH & ENROLLMENT — district research, tours, enrollment paperwork
6. HEALTHCARE SETUP — doctors, dentists, specialists in the new area
7. COMMUNITY CONNECTIONS — church/religious community, sports leagues, social groups, neighborhoods
8. 30/60/90 DAY PLAN — milestones for settling in

If you notice a key piece of information is missing (destination, budget, timeline, family size), bring it up politely. Only ask about the same missing item a maximum of twice, then move forward gracefully.

Key messages to weave in naturally:
- "This is completely FREE to you as the buyer — our agents handle the compensation."
- "Think of me as your personal AI assistant, available 24/7."

Keep responses to 2-3 paragraphs. Be conversational. Use the person's name if you know it.${profileContext}`;
};

export default function ChatInterface({ expanded = false, onToggleExpand, onClose, initialProfile = null }) {
  const [tab, setTab] = useState('chat');
  const [profile, setProfile] = useState(initialProfile);
  const [bobAnswers, setBobAnswers] = useState([]);

  // Load Bob Dyson's pre-rendered video answers (FAQ page clips + answer library)
  useEffect(() => {
    Promise.all([
      appClient.entities.RealEstateQAClip.filter({ kind: 'qa', bobStatus: 'completed' }).catch(() => []),
      appClient.entities.BobAnswerClip.filter({ status: 'completed', isActive: true }).catch(() => []),
    ]).then(([qa, lib]) => {
      setBobAnswers([
        ...qa.filter(c => c.bobVideoUrl).map(c => ({ question: c.question, videoUrl: c.bobVideoUrl })),
        ...lib.filter(c => c.videoUrl).map(c => ({ question: c.question, videoUrl: c.videoUrl })),
      ]);
    });
  }, []);

  // Load existing client profile from DB on mount
  useEffect(() => {
    if (initialProfile) return;
    appClient.auth.me().then(user => {
      if (!user) return;
      appClient.entities.RelocationClient.filter({ email: user.email }, '-created_date', 1)
        .then(results => {
          if (results && results.length > 0) setProfile(results[0]);
        })
        .catch(() => {});
    }).catch(() => {});
  }, []);

  const isReturn = localStorage.getItem('charlie_visited') === 'true';

  const WELCOME_MESSAGE = isReturn
    ? `Welcome back. What can I help you with today?`
    : `Hi! I'm Charlie — your Dyson & Dyson concierge. 👋\n\nI'm here to answer your questions about our relocation service and point you in the right direction.\n\nYou can type or tap the mic to speak — I'll talk back. What's on your mind?`;

  // Mark as visited for future returns
  localStorage.setItem('charlie_visited', 'true');

  const [messages, setMessages] = useState([
    {
      role: 'charlie',
      content: WELCOME_MESSAGE,
      type: 'text',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-speak welcome message once on load
  const hasSpokenWelcome = useRef(false);
  useEffect(() => {
    if (hasSpokenWelcome.current) return;
    hasSpokenWelcome.current = true;
    if (!isMuted) {
      // Delay to allow browser voices to load
      setTimeout(() => speakAsCharlie(WELCOME_MESSAGE), 1000);
    }
  }, []);

  const toggleMute = () => {
    stopCharlie(); // always kill audio immediately on toggle
    setIsMuted(v => !v);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser. Try Chrome.');
      return;
    }
    stopCharlie(); // stop Charlie immediately when user wants to talk
    setIsSpeaking(false);
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      // Auto-send immediately after voice capture — no need to hit Send
      handleSend(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleOnboardingComplete = (completedProfile) => {
    setProfile(completedProfile);
    setTab('plan');
    // Save to RelocationClient entity
    appClient.entities.RelocationClient.create({
      full_name: 'New Client',
      email: 'pending@email.com',
      destination_city: completedProfile.destination_city,
      current_city: completedProfile.current_city,
      budget: completedProfile.budget,
      priorities: completedProfile.priorities,
      notes: `Family: ${completedProfile.family_size} ${completedProfile.family_notes || ''}. Timeline: ${completedProfile.move_date}. Housing: ${completedProfile.purchase_type}.`,
      status: 'in_consultation',
    }).catch(() => {});
  };

  const handleChatAbout = (topic) => {
    setTab('chat');
    handleSend(topic);
  };

  const CHARLIE_SYSTEM_PROMPT = `You are Charlie, the AI concierge for Dyson & Dyson Concierge Relocation Services. Think of yourself as a knowledgeable friend — relaxed, real, occasionally a little funny when it fits naturally. Not a salesperson. Not a brochure.

YOUR PERSONALITY:
- Warm, conversational, and genuinely curious about the person
- Light humor is welcome when it feels natural — don't force it, but don't be stiff either
- You listen first. Always acknowledge what they actually said before you respond
- No corporate speak, no bullet walls, no formal tone
- Keep responses short — 2 to 3 paragraphs at most

WHAT YOU KNOW ABOUT THE PROGRAM:
- Dyson & Dyson is a full-service relocation concierge for people moving to a new city
- Completely free to the buyer — the company earns through a referral arrangement with the agent at close of escrow
- Bob Dyson runs the program personally. The first step is always a free, no-obligation conversation with Bob (/GeminiSession or call 858-353-1200)
- No paperwork, no enrollment forms upfront — talking to Bob IS how it starts
- After that conversation, if it's a fit, Bob brings them into the program and the team handles everything from there

WHAT YOU DON'T DO:
- Don't quote specific pricing, timelines, guarantees, or market data — that's Bob's territory
- Don't make promises about outcomes
- Don't pretend to know things you don't — just say so honestly and point to Bob
- Don't stay on topics that have nothing to do with relocation or the program

HOW HARD TO PUSH TOWARD BOOKING WITH BOB:
Read the conversation. Use judgment.

- If someone is clearly exploring, just learning, asking good logical questions — be an honest answering machine. Answer well, mention Bob exists, don't push. They'll get there.
- If someone has been going back and forth a lot, asking detailed questions without sharing anything about themselves, or seems to want full concierge service through the chat widget — gently point out that the real value only unlocks once they connect with Bob. You can be a little playful about it: "I can keep answering questions all day, but honestly Bob's going to be way more useful to you than I am at this point."
- If someone is clearly ready or frustrated with not being able to move forward — be direct. Tell them the next step and make it easy.

The underlying truth you can share naturally when relevant: everything they're asking about — the agent, the neighborhoods, the plan — none of it can actually start until Bob knows their situation. That's not a barrier, it's just how good work gets done.

Always acknowledge what they asked first. Then answer it. Then, if appropriate, nudge gently.`;

  const handleSend = async (text) => {
    const messageText = (text || input).trim();
    if (!messageText || isTyping) return;

    const userMsg = { role: 'user', content: messageText, type: 'text' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages
        .slice(-6) // last 3 exchanges
        .map(m => `${m.role === 'user' ? 'User' : 'Charlie'}: ${m.content}`)
        .join('\n');

      const prompt = `${CHARLIE_SYSTEM_PROMPT}

Recent conversation:
${conversationHistory}

User just said: "${messageText}"

Respond as Charlie. Remember: acknowledge first, then answer directly.

ALSO: Bob Dyson has personally recorded video answers to these known questions:
${bobAnswers.map((q, i) => `${i}. ${q.question}`).join('\n')}
Be GENEROUS with matching: if the user's question covers the same topic or would be well answered by one of those recorded answers — even with very different wording (e.g. "do I have to pay?", "is this free?", "what does it cost?" all match the cost question) — set matched_faq_index to its number. Only set -1 when none of the recorded answers would address what they asked.`;

      const res = await appClient.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            matched_faq_index: { type: 'integer', description: 'Index of the matched known question, or -1' },
            response: { type: 'string', description: "Charlie's text response" },
          },
          required: ['matched_faq_index', 'response'],
        },
      });
      const responseText = res?.response || '';
      const matchedIdx = Number.isInteger(Number(res?.matched_faq_index)) ? Number(res.matched_faq_index) : -1;
      const bobClip = matchedIdx >= 0 && matchedIdx < bobAnswers.length ? bobAnswers[matchedIdx] : null;

      if (bobClip) {
        // Bob Dyson answers this one himself, on video with his own voice
        stopCharlie();
        setMessages(prev => [...prev, {
          role: 'charlie',
          type: 'video',
          videoUrl: bobClip.videoUrl,
          content: "Great question — here's Bob Dyson himself with the answer:",
        }]);
        setIsTyping(false);
        return;
      }

      const charlieMsg = { role: 'charlie', content: responseText, type: 'text' };
      setMessages(prev => [...prev, charlieMsg]);
      setIsTyping(false);

      if (!isMuted) {
        stopCharlie();
        setTimeout(() => speakAsCharlie(
          responseText,
          () => setIsSpeaking(false),
          () => setIsSpeaking(true)
        ), 100);
      }
    } catch (e) {
      // Fallback if LLM fails
      const fallback = `I heard you — let me get you connected with Bob so he can answer that properly. You can book a free session at /GeminiSession or call (858) 353-1200.`;
      setMessages(prev => [...prev, { role: 'charlie', content: fallback, type: 'text' }]);
      setIsTyping(false);
    }
  };

  const tabs = [
    ...(profile ? [] : [{ id: 'onboard', label: 'Get Started', icon: ClipboardList }]),
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    ...(profile ? [{ id: 'plan', label: 'My Relocation Plan', icon: Map }] : []),
  ];

  return (
    <motion.div
      className={`flex flex-col rounded-2xl shadow-2xl overflow-hidden ${expanded ? 'fixed inset-4 z-50' : 'w-full'}`}
      style={{
        background: '#808080',
        border: `1px solid ${GOLD}`,
        ...(!expanded ? { height: 'min(720px, calc(100vh - 8rem))' } : {}),
      }}
      layout
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 shrink-0 frosted-gold"
        style={{ borderBottom: `1px solid rgba(212,175,55,0.2)` }}>
        <img src={DYSON_LOGO} alt="Charlie" className="h-10 w-auto" />
        <div className="flex-1">
          <h3 className="font-bold text-sm" style={{ color: GOLD }}>Charlie</h3>
          <p className="text-xs" style={{ color: '#f5f5f5' }}>
            {isTyping ? 'Thinking...' : isListening ? 'Thinking...' : 'Dyson & Dyson Concierge'}
          </p>
        </div>

        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-white/10" style={{ color: '#f5f5f5' }} onClick={onToggleExpand}>
            {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-500/20 rounded-full" style={{ color: '#fff', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }} onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      {tabs.length > 1 && (
        <div className="flex shrink-0" style={{ borderBottom: '1px solid #1a1a1a', background: '#0d0d0d' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition-all"
              style={{
               color: tab === t.id ? GOLD : '#f5f5f5',
               borderBottom: tab === t.id ? `2px solid ${GOLD}` : '2px solid transparent',
              }}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* ONBOARDING TAB */}
      {tab === 'onboard' && (
        <VoiceOnboarding onComplete={handleOnboardingComplete} />
      )}

      {/* MOVE PLAN TAB */}
      {tab === 'plan' && profile && (
        <MovePlan profile={profile} onChatAbout={handleChatAbout} />
      )}

      {/* CHAT TAB */}
      {tab === 'chat' && (
        <>
          {/* How-to tip — shown once, dismissible */}
          {!isReturn && (
            <div className="shrink-0 mx-3 mt-2 mb-1 rounded-xl px-3 py-2.5 flex items-start gap-2"
              style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)' }}>
              <span className="text-base shrink-0">💡</span>
              <div className="text-xs leading-relaxed" style={{ color: '#e5e5e5' }}>
                <span className="font-bold" style={{ color: '#D4AF37' }}>Two ways to talk to Charlie:</span>
                <br />
                <span>🎙️ <b>Voice</b> — tap the mic button and speak naturally.</span>
                <br />
                <span>⌨️ <b>Type</b> — just click the text box and type your question.</span>
                <br />
                <span style={{ color: '#aaa' }}>Charlie will read and speak responses either way.</span>
              </div>
            </div>
          )}
          <div className="flex-1 overflow-y-auto p-4" style={{ minHeight: 0 }}>
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <ChatBubble key={i} message={msg} />
              ))}

              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm" style={{ color: '#f5f5f5' }}>
                  <div className="flex gap-1">
                    {[0, 0.15, 0.3].map((delay, i) => (
                      <motion.div key={i} className="w-2 h-2 rounded-full" style={{ background: GOLD }}
                        animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay }} />
                    ))}
                  </div>
                  Charlie is thinking...
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="p-3 shrink-0" style={{ borderTop: '1px solid #222', background: '#0d0d0d' }}>
            <p className="text-[10px] text-center mb-2" style={{ color: '#ccc' }}>
              🎙️ Tap mic to speak &nbsp;·&nbsp; ⌨️ Type below &nbsp;·&nbsp; 🔊 Charlie speaks back
            </p>
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2 items-center">
              {/* Stop / Mute button — red & labeled when Charlie is speaking */}
              <Button
                type="button"
                className="shrink-0 rounded-lg h-9 px-3 text-xs font-bold gap-1"
                style={{
                  background: isSpeaking ? '#ef4444' : '#1a1a1a',
                  color: isSpeaking ? '#fff' : (isMuted ? '#555' : GOLD),
                  minWidth: isSpeaking ? '72px' : '36px'
                }}
                title={isSpeaking ? 'Stop Charlie' : (isMuted ? 'Unmute Charlie' : 'Mute Charlie')}
                onClick={() => {
                  if (isSpeaking) {
                    stopCharlie();
                    setIsSpeaking(false);
                  } else {
                    toggleMute();
                  }
                }}
              >
                {isSpeaking ? (
                  <><VolumeX className="w-4 h-4" /> STOP</>
                ) : isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>

              <Input
                placeholder={isListening ? '🎙️ Listening...' : 'Type or tap mic to speak...'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 text-sm border-0 rounded-lg charlie-input"
                style={{ background: '#1a1a1a', color: '#fff', caretColor: GOLD }}
              />

              {/* Mic button */}
              <Button
                type="button"
                size="icon"
                onClick={isListening ? stopListening : startListening}
                className="shrink-0 rounded-lg h-9 w-9"
                style={{ background: isListening ? '#ef4444' : '#1a1a1a', color: isListening ? '#fff' : GOLD }}
                title={isListening ? 'Stop listening' : 'Speak to Charlie'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>

              <Button type="submit" size="icon" disabled={!input.trim() || isTyping}
                className="shrink-0 rounded-lg"
                style={{ background: GOLD, color: '#000' }}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </>
      )}
    </motion.div>
  );
}