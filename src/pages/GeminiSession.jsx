import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import CommitmentGate from '../components/charlie/CommitmentGate';
import GeminiLiveSession from '../components/charlie/GeminiLiveSession';
import InterviewSummary from '../components/charlie/InterviewSummary';
import RelocationIntakeForm from '../components/charlie/RelocationIntakeForm';
import PathChooser from '../components/charlie/PathChooser';
import LayoutToggleButton from '../components/layout/LayoutToggleButton';
import { useLayout } from '@/lib/LayoutContext';
import CharliePagePresenter from '@/components/charlie/CharliePagePresenter';

const GOLD = '#D4AF37';
const DYSON_LOGO = "/assets/dyson-logo.png";

export default function GeminiSession() {
  const [stage, setStage] = useState('gate'); // gate | intake | path | session | done
  const [chosenPath, setChosenPath] = useState(null);
  const [clientInfo, setClientInfo] = useState(null);
  const [sessionResult, setSessionResult] = useState(null);
  const [intakeData, setIntakeData] = useState(null);
  const { landscape } = useLayout();

  const handleCommit = (info) => {
    setClientInfo(info);
    setStage('intake');
  };

  const handleIntakeComplete = (data) => {
    setIntakeData(data);
    setStage('path');
  };

  const handlePathChosen = (pathId) => {
    setChosenPath(pathId);
    setStage('session');
  };

  const handleSessionComplete = (result) => {
    setSessionResult(result);
    setStage('done');
  };

  const [signTiming, setSignTiming] = useState(null); // 'now' or 'after'

  // Agent portals (not client) get the lead-in script addressed to agents
  const isAgentPortal = (() => {
    try {
      const role = sessionStorage.getItem('dyson_role');
      return role && role !== 'client';
    } catch { return false; }
  })();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#ede0cc' }}>
      {/* Header */}
      <header className="px-6 py-3 flex items-center gap-3 shrink-0 frosted-dark"
        style={{ borderBottom: '1px solid rgba(212,175,55,0.12)', background: '#1a1a1a' }}>
        <Link to="/Chat">
          <Button variant="ghost" size="icon" className="h-8 w-8" style={{ color: GOLD }}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <Link to="/Home">
          <img src={DYSON_LOGO} alt="Dyson & Dyson" className="h-12 w-auto cursor-pointer" />
        </Link>
        <div className="flex-1 text-center">
          <p className="text-xs font-bold tracking-[0.3em] mb-0.5" style={{ color: GOLD }}>GEMINI LIVE INTERVIEW</p>
          <h1 className="display-heading whitespace-nowrap" style={{ fontSize: 'clamp(1.2rem, 2.8vw, 2.2rem)', color: '#fff' }}>Your Private Session</h1>
        </div>
        <LayoutToggleButton />
      </header>

      {/* Content */}
       <div className={`flex-1 w-full mx-auto flex flex-col ${landscape ? 'max-w-5xl' : 'max-w-2xl'}`} style={{ minHeight: 0 }}>
         {/* Charlie page explainer — in flow, upper right of the content area */}
         <div className="w-full flex justify-end px-4 pt-4 -mb-2">
           <div className="relative w-[126px] h-[126px] md:w-36 md:h-36 shrink-0">
             <CharliePagePresenter pageKey="gemini-session" inline positionClass="top-0 left-0" />
           </div>
         </div>
         <AnimatePresence mode="wait">

           {/* CONTEXT EXPLAINER - shown before signing */}
           {!signTiming && (
             <motion.div key="explainer" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full px-4 pt-4">
               <div className="rounded-2xl p-6 mb-6" style={{ background: '#1a1a1a', border: `1px solid ${GOLD}33` }}>
                 <div className="space-y-4">
                   {isAgentPortal && (
                     <div className="rounded-xl p-4 mb-2" style={{ background: 'rgba(212,175,55,0.08)', border: `1px solid ${GOLD}44` }}>
                       <p className="text-sm md:text-base leading-relaxed" style={{ color: '#e5e5e5' }}>
                         Following is how and why we establish a private session with a new relocating client. Their voices, personality, interests and objectives are all discussed so we and Gemini hear their desires live. Let me share how this works and why:
                       </p>
                     </div>
                   )}
                   <div>
                       <h2 className="serif-heading text-2xl md:text-3xl mb-3" style={{ color: '#fff' }}>What's This Session About?</h2>
                       <p className="text-sm md:text-base leading-relaxed mb-2" style={{ color: '#e5e5e5' }}>
                         You're about to join a collaborative strategy call with a Dyson & Dyson Relocation Specialist and Gemini, our advanced AI advisor.
                       </p>
                       <p className="text-sm md:text-base leading-relaxed" style={{ color: '#e5e5e5' }}>
                         Think of this as a three-way brainstorm. We'll bring Gemini in via speakerphone to provide real-time data and insights while we discuss your destination, lifestyle priorities, budget, and timeline. Together, we'll build a move profile that covers every detail that matters to your family.
                       </p>
                     </div>
                     <div>
                       <p className="text-xs font-bold mb-3 uppercase tracking-[0.2em]" style={{ color: GOLD }}>Why This Matters</p>
                       <ul className="text-sm md:text-base space-y-2.5" style={{ color: '#e5e5e5' }}>
                         <li className="flex gap-3">
                           <span style={{ color: GOLD, fontWeight: 'bold' }}>✓</span>
                           <span><span style={{ color: GOLD, fontWeight: 600 }}>Total Transparency:</span> You, our team, and the AI hear everything at once. No "telephone game" and no missed details.</span>
                         </li>
                         <li className="flex gap-3">
                           <span style={{ color: GOLD, fontWeight: 'bold' }}>✓</span>
                           <span><span style={{ color: GOLD, fontWeight: 600 }}>Instant Intelligence:</span> Gemini provides deep-market analysis and lifestyle modeling on the fly to help us refine your search.</span>
                         </li>
                         <li className="flex gap-3">
                           <span style={{ color: GOLD, fontWeight: 'bold' }}>✓</span>
                           <span><span style={{ color: GOLD, fontWeight: 600 }}>Verifiable Accuracy:</span> The session is captured in text and summarized, giving you a perfect record of our strategy.</span>
                         </li>
                         <li className="flex gap-3">
                           <span style={{ color: GOLD, fontWeight: 'bold' }}>✓</span>
                           <span><span style={{ color: GOLD, fontWeight: 600 }}>Elite Vetting:</span> This data is used exclusively by our human team to select the specific <span style={{ color: GOLD, fontWeight: 600 }}>boots on the ground</span> agent that fits your profile.</span>
                         </li>
                       </ul>
                     </div>
                     <div className="rounded-xl p-4" style={{ background: 'rgba(212,175,55,0.07)', border: `1px solid ${GOLD}44` }}>
                       <p className="text-xs font-bold mb-3 uppercase tracking-[0.2em]" style={{ color: GOLD }}>The Taped Agent Interviews</p>
                       <p className="text-sm md:text-base leading-relaxed mb-2" style={{ color: '#e5e5e5' }}>
                         As part of our agent vetting process, we conduct a <span style={{ color: GOLD, fontWeight: 600 }}>taping session with every agent we vet</span>. Each candidate answers the same specific questions, captured on tape for you to hear.
                       </p>
                       <p className="text-sm md:text-base leading-relaxed" style={{ color: '#e5e5e5' }}>
                         In your session, you and Gemini listen together — the voice, the tone, the inflection, and the substance of every answer. These details dramatically inform your decision. It has proven to be one of our greatest assets: <span style={{ color: GOLD, fontWeight: 600 }}>you stay in full control of choosing your agent</span> — not someone else's opinion or selection.
                       </p>
                     </div>
                 </div>
               </div>
             </motion.div>
           )}

           {/* SIGN TIMING CHOICE */}
           {!signTiming && (
             <motion.div key="timing" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full px-4">
               <div className="text-center mb-6">
                 <div className="flex items-center justify-center gap-2 mb-2" style={{ color: GOLD }}>
                   <Zap className="w-4 h-4" />
                   <span className="text-xs font-bold tracking-[0.3em]">BEFORE WE BEGIN</span>
                 </div>
                 <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                   You have two options — sign now and keep the momentum going, or sign after our call when you've had a chance to chat with the Dyson team. Both are totally fine.
                 </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                 <motion.button
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   onClick={() => setSignTiming('now')}
                   className="rounded-2xl p-6 border-2 transition-all text-left"
                   style={{ background: '#1a1a1a', borderColor: GOLD }}>
                   <div className="flex items-center gap-3 mb-3">
                     <CheckCircle2 className="w-5 h-5" style={{ color: GOLD }} />
                     <span className="font-bold" style={{ color: GOLD }}>Sign Now</span>
                   </div>
                   <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                     Review and sign the agreement right now. You'll be all set before we talk.
                   </p>
                 </motion.button>

                 <motion.button
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.1 }}
                   onClick={() => setSignTiming('after')}
                   className="rounded-2xl p-6 border-2 transition-all text-left hover:border-slate-500"
                   style={{ background: '#1a1a1a', borderColor: 'rgba(255,255,255,0.2)' }}>
                   <div className="flex items-center gap-3 mb-3">
                     <Clock className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.5)' }} />
                     <span className="font-bold" style={{ color: '#fff' }}>Sign After Our Call</span>
                   </div>
                   <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                     We'll send it to you after we chat — gives you time to process everything.
                   </p>
                 </motion.button>
               </div>
             </motion.div>
           )}

           {/* COMMITMENT GATE */}
           {stage === 'gate' && signTiming && (
            <motion.div key="gate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col rounded-2xl m-4 overflow-hidden"
              style={{ background: '#1a1a1a', border: `1px solid ${GOLD}33` }}>
              {/* Gate header */}
              <div className="px-5 pt-5 pb-3 shrink-0" style={{ borderBottom: '1px solid #555' }}>
                <div className="flex items-center gap-2 mb-1">
                 <span className="text-2xl">✨</span>
                 <h2 className="font-bold text-xl" style={{ color: GOLD }}>Before We Begin</h2>
                </div>
                <p className="text-sm" style={{ color: '#e5e5e5' }}>
                 Charlie will hand you off to Gemini for your private relocation interview.
                </p>
              </div>
              <CommitmentGate onCommit={handleCommit} />
            </motion.div>
          )}

          {/* INTAKE FORM */}
          {stage === 'intake' && (
            <motion.div key="intake" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col rounded-2xl m-4 overflow-hidden"
              style={{ background: '#1a1a1a', border: `1px solid ${GOLD}33` }}>
              <div className="px-5 pt-5 pb-3 shrink-0" style={{ borderBottom: '1px solid #555' }}>
                <div className="flex items-center gap-2 mb-1">
                   <span className="text-2xl">📋</span>
                  <h2 className="font-bold text-xl" style={{ color: GOLD }}>Your Relocation Profile</h2>
                </div>
                <p className="text-sm" style={{ color: '#e5e5e5' }}>
                  Welcome, {clientInfo?.name?.split(' ')[0]}! Fill this out before your session — or use it as your complete profile if you prefer to skip the live interview.
                </p>
              </div>
              <RelocationIntakeForm clientInfo={clientInfo} onComplete={handleIntakeComplete} />
              <div className="px-5 pb-4 shrink-0">
                <button onClick={() => setStage('path')}
                  className="w-full text-center text-sm underline"
                  style={{ color: '#666' }}>
                  Skip form — choose your path
                </button>
              </div>
            </motion.div>
          )}

          {/* PATH CHOOSER */}
          {stage === 'path' && (
            <motion.div key="path" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col rounded-2xl m-4 overflow-hidden"
              style={{ background: '#1a1a1a', border: `1px solid ${GOLD}33` }}>
              <div className="px-5 pt-5 pb-3 shrink-0" style={{ borderBottom: '1px solid #555' }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">🛤️</span>
                  <h2 className="font-bold text-xl" style={{ color: GOLD }}>How Would You Like to Proceed?</h2>
                </div>
                <p className="text-sm" style={{ color: '#e5e5e5' }}>
                  Your profile is saved. Now choose how the Gemini session happens.
                </p>
              </div>
              <PathChooser clientInfo={clientInfo} onChoose={handlePathChosen} />
            </motion.div>
          )}

          {/* LIVE SESSION */}
          {stage === 'session' && (
            <motion.div key="session" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col rounded-2xl m-4 overflow-hidden"
              style={{ background: '#1a1a1a', border: `1px solid ${GOLD}33`, minHeight: '600px' }}>
              {/* Session header */}
              <div className="px-5 pt-4 pb-3 shrink-0" style={{ borderBottom: '1px solid #555' }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-bold" style={{ color: '#fff' }}>
                    Welcome, {clientInfo?.name?.split(' ')[0]} — Gemini is ready
                  </span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: '#e5e5e5' }}>
                 Speak naturally. This conversation builds your relocation profile.
                </p>
              </div>
              <GeminiLiveSession
                clientInfo={clientInfo}
                onSessionComplete={handleSessionComplete}
              />
            </motion.div>
          )}

          {/* DONE - Interview Summary */}
           {stage === 'done' && (
             <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
               className="flex-1 flex flex-col w-full">
               <InterviewSummary clientInfo={clientInfo} sessionResult={sessionResult} />
             </motion.div>
           )}

        </AnimatePresence>
      </div>
    </div>
  );
}