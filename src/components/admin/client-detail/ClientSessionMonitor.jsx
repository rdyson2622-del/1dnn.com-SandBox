import React, { useEffect, useState, useRef } from 'react';
import { Play, Square, Loader, Send, Mic, MicOff, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { appClient } from '@/api/appClient';
import { motion } from 'framer-motion';

const GOLD = '#D4AF37';

const speakText = (text) => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1.05;
  // Prefer a natural female voice
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => v.name.includes('Samantha') || v.name.includes('Google US English') || v.name.includes('Karen') || v.name.includes('Moira'));
  if (preferred) utterance.voice = preferred;
  window.speechSynthesis.speak(utterance);
};

export default function ClientSessionMonitor({ client }) {
  const [sessionActive, setSessionActive] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loadingResponse, setLoadingResponse] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const recognitionRef = useRef(null);
  const transcriptEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, loadingResponse]);

  // Subscribe to live messages
  useEffect(() => {
    const unsubscribe = appClient.entities.ChatMessage.subscribe((event) => {
      if (event.data?.client_id === client.id && event.type === 'create') {
        setTranscript(prev => {
          // Avoid duplicates from local optimistic adds
          if (prev.some(m => m.id === event.data.id)) return prev;
          return [...prev, event.data];
        });
      }
    });
    return unsubscribe;
  }, [client.id]);

  const saveAndShowMessage = async (role, content) => {
    const tempId = `temp-${Date.now()}`;
    const msg = { client_id: client.id, role, content, message_type: role === 'user' ? 'text' : 'recommendation', id: tempId };
    setTranscript(prev => [...prev, msg]);
    await appClient.entities.ChatMessage.create({ client_id: client.id, role, content, message_type: msg.message_type });
  };

  const callGemini = async (userMessage, history) => {
    const clientContext = `Name: ${client.full_name}, Destination: ${client.destination_city || 'unknown'}, Budget: ${client.budget || 'unknown'}, Priorities: ${(client.priorities || []).join(', ') || 'none specified'}`;
    const res = await appClient.functions.invoke('geminiChat', {
      message: userMessage,
      history: history.slice(-10).map(m => ({ role: m.role, content: m.content })),
      clientContext,
    });
    return res.data.response;
  };

  const handleStartSession = async () => {
    setSessionActive(true);
    setTranscript([]);
    setLoadingResponse(true);

    // Check for prior messages to determine if this is a returning session
    const prior = await appClient.entities.ChatMessage.filter({ client_id: client.id }, '-created_date', 5);
    const isReturning = prior && prior.length > 0;

    let greeting;
    if (isReturning) {
      const lastTopic = prior.find(m => m.role === 'user')?.content?.slice(0, 60) || 'your relocation';
      greeting = `Welcome back, ${client.full_name?.split(' ')[0] || 'there'}! Great to continue our conversation. Last time we were discussing ${lastTopic}… Where would you like to pick up, or is there something new on your mind?`;
    } else {
      greeting = `Hello! I'm Charlie, your relocation concierge. I'm here to learn everything about your ideal move to ${client.destination_city || 'your destination'}. Let's start — what's drawing you to that area, and what's your ideal move-in timeline?`;
    }

    await saveAndShowMessage('charlie', greeting);
    if (ttsEnabled) speakText(greeting);
    setLoadingResponse(false);
  };

  const handleEndSession = async () => {
    setSessionActive(false);
    stopListening();
    await saveAndShowMessage('charlie', "Great session! I've captured all your preferences. We'll use this to match you with the perfect agent and neighborhoods. Check your dashboard for your updated profile.");
  };

  const handleSend = async (messageText) => {
    const text = (messageText || inputValue).trim();
    if (!text) return;
    setInputValue('');
    setLoadingResponse(true);
    const currentHistory = [...transcript];
    await saveAndShowMessage('user', text);
    const response = await callGemini(text, currentHistory);
    await saveAndShowMessage('charlie', response);
    if (ttsEnabled) speakText(response);
    setLoadingResponse(false);
  };

  // Voice input via Web Speech API
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice input not supported in this browser. Try Chrome.');
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SR();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.onresult = (e) => {
      const spoken = e.results[0][0].transcript;
      setIsListening(false);
      handleSend(spoken);
    };
    recognitionRef.current.onerror = () => setIsListening(false);
    recognitionRef.current.onend = () => setIsListening(false);
    recognitionRef.current.start();
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  return (
    <div className="flex flex-col gap-4" style={{ height: 'calc(100vh - 280px)', minHeight: 500 }}>
      {/* Control header */}
      <div className="rounded-2xl border p-4 shrink-0" style={{ background: 'rgba(255,255,255,0.95)', borderColor: 'rgba(0,0,0,0.1)' }}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${sessionActive ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`} />
            <div>
              <p className="font-bold text-sm" style={{ color: '#000' }}>Admin × Gemini Interview</p>
              <p className="text-xs" style={{ color: 'rgba(0,0,0,0.5)' }}>
                {sessionActive ? '🔴 Live — syncs to client dashboard instantly' : 'Start to begin real-time AI interview'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {sessionActive && (
              <>
                <Button
                  onClick={() => { setTtsEnabled(v => !v); if (ttsEnabled) window.speechSynthesis?.cancel(); }}
                  size="sm" variant="outline" className="gap-1.5"
                  style={{ borderColor: ttsEnabled ? GOLD : undefined, color: ttsEnabled ? GOLD : undefined }}
                  title="Toggle Gemini voice output"
                >
                  <Volume2 className="w-4 h-4" />
                  {ttsEnabled ? 'Speaking' : 'Muted'}
                </Button>
                <Button
                  onClick={() => setVoiceMode(v => !v)}
                  size="sm" variant="outline" className="gap-1.5"
                  style={{ borderColor: voiceMode ? GOLD : undefined, color: voiceMode ? GOLD : undefined }}
                  title="Toggle mic input"
                >
                  <Mic className="w-4 h-4" />
                  <span style={{ opacity: voiceMode ? 1 : 0.35, fontSize: '0.75rem' }}>
                    {voiceMode ? 'Mic On' : 'Mic Off'}
                  </span>
                </Button>
              </>
            )}
            {!sessionActive ? (
              <Button onClick={handleStartSession} size="sm" style={{ background: GOLD, color: '#000' }} className="gap-2 font-bold">
                <Play className="w-4 h-4" /> Start Interview
              </Button>
            ) : (
              <Button onClick={handleEndSession} size="sm" variant="destructive" className="gap-2">
                <Square className="w-4 h-4" /> End Session
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Transcript */}
      <div className="flex-1 rounded-2xl border overflow-hidden flex flex-col" style={{ background: 'rgba(255,255,255,0.95)', borderColor: 'rgba(0,0,0,0.1)' }}>
        <div className="px-4 py-2 border-b flex items-center gap-2 shrink-0" style={{ borderColor: 'rgba(0,0,0,0.06)', background: '#f9f9f9' }}>
          {sessionActive && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
          <h3 className="font-bold text-xs" style={{ color: '#000' }}>Live Interview Feed</h3>
          <span className="text-xs ml-auto" style={{ color: 'rgba(0,0,0,0.4)' }}>{transcript.length} messages</span>
        </div>

        {transcript.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center px-6">
            <div>
              <p className="text-sm font-semibold" style={{ color: 'rgba(0,0,0,0.4)' }}>Click "Start Interview" to begin</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(0,0,0,0.3)' }}>Gemini will respond to real questions. Everything syncs to the client's app live.</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {transcript.map((msg, i) => {
              const isAdmin = msg.role === 'user';
              return (
                <motion.div key={msg.id || i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[78%]">
                    <p className="text-xs font-semibold mb-1 px-1" style={{ color: isAdmin ? '#555' : GOLD }}>
                      {isAdmin ? '👤 You (Admin)' : '🎙️ Gemini / Charlie'}
                    </p>
                    <div className="rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                      style={{
                        background: isAdmin ? '#1a1a1a' : `${GOLD}18`,
                        color: isAdmin ? '#fff' : '#1a1a1a',
                        borderRadius: isAdmin ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      }}>
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {loadingResponse && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 px-1">
                <Loader className="w-3.5 h-3.5 animate-spin" style={{ color: GOLD }} />
                <span className="text-xs" style={{ color: 'rgba(0,0,0,0.45)' }}>Gemini is thinking...</span>
              </motion.div>
            )}
            <div ref={transcriptEndRef} />
          </div>
        )}
      </div>

      {/* Input row — text always available, mic is optional addon */}
      {sessionActive && (
        <div className="shrink-0 flex flex-col gap-2">
          {isListening && (
            <div className="text-center text-xs font-semibold animate-pulse" style={{ color: '#ef4444' }}>
              🎙️ Listening... speak now
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type your question — or use mic button to speak..."
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loadingResponse && handleSend()}
              disabled={loadingResponse}
              className="flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none"
              style={{
                background: '#fff',
                color: '#000',
                borderColor: isListening ? '#ef4444' : 'rgba(0,0,0,0.2)',
                boxShadow: isListening ? '0 0 0 2px rgba(239,68,68,0.2)' : 'none',
              }}
            />
            {/* Mic button — always visible, optional */}
            <Button
              onClick={isListening ? stopListening : startListening}
              disabled={loadingResponse}
              size="sm"
              className="h-11 shrink-0 gap-1.5 px-3"
              title={isListening ? 'Stop listening' : 'Tap to speak'}
              style={{
                background: isListening ? '#ef4444' : 'rgba(0,0,0,0.06)',
                color: isListening ? '#fff' : 'rgba(0,0,0,0.35)',
                border: `1px solid ${isListening ? '#ef4444' : 'rgba(0,0,0,0.15)'}`,
              }}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span className="text-xs font-medium">{isListening ? 'Stop' : 'Mic Off'}</span>
            </Button>
            <Button
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || loadingResponse}
              size="sm"
              className="h-11 gap-1.5 font-bold px-5 shrink-0"
              style={{ background: GOLD, color: '#000' }}
            >
              <Send className="w-3.5 h-3.5" /> Send
            </Button>
          </div>
        </div>
      )}

      {sessionActive && (
        <p className="text-xs text-center shrink-0" style={{ color: 'rgba(0,0,0,0.4)' }}>
          💡 Real Gemini AI · Messages sync live to client's dashboard · Toggle Voice for hands-free
        </p>
      )}
    </div>
  );
}