import React, { useState } from 'react';
import { appClient } from '@/api/appClient';
import {
  RefreshCw, Play, CheckCircle, XCircle, Clock, Edit3, Sparkles,
  Film, Clapperboard, Layers, FileText, ChevronDown, ChevronRight,
  Send
} from 'lucide-react';
import DistributionPanel from '@/components/dnn/DistributionPanel';
import AgentDistributionModal from '@/components/dnn/AgentDistributionModal';
import DistributionTracker from '@/components/dnn/DistributionTracker';
import SocialAnalyticsPanel from '@/components/dnn/SocialAnalyticsPanel';
import DnnNewsBroadcastPlayer from '@/components/dnn/DnnNewsBroadcastPlayer';

function extractBullets(script) {
  if (!script) return [];
  const sentences = script.replace(/\n+/g, ' ').match(/[^.!?]+[.!?]+/g) || [script];
  const cleaned = sentences
    .map(s => s.trim())
    .filter(s => s.length > 25 && !/^(so|well|you know|now|okay|great|thanks|absolutely)[,.\s]/i.test(s));
  return cleaned.slice(0, 5).map(s => s.replace(/[.!?]+$/, ''));
}

const GOLD = '#D4AF37';

const STAGES = [
  { key: 'content', label: 'Content & Stories', icon: FileText, desc: 'Articles accumulated + stories selected' },
  { key: 'script', label: 'Script Generation', icon: Sparkles, desc: 'Charlie open → Bob answer → Charlie close' },
  { key: 'render', label: 'Clip Rendering', icon: Clapperboard, desc: 'HeyGen renders each clip' },
  { key: 'stitch', label: 'Stitching', icon: Film, desc: 'Clips combined into one MP4' },
  { key: 'ready', label: 'Studio Preview', icon: Layers, desc: 'Preview full show with DNN background + whiteboard bullets' },
  { key: 'distribution', label: 'Distribution', icon: Send, desc: 'Post to social, subscribers, agents' },
];

function getShowStage(show) {
  // If any distribution has been done, we're in distribution stage
  const dists = show.distribution || [];
  if (dists.length > 0 && dists.some(d => d.status === 'sent')) return 'distribution';
  // Stitched video exists but nothing distributed yet → Studio Preview step
  if (show.videoUrl) return 'ready';
  if (show.heygenId && show.status === 'completed') return 'stitch';
  if (show.status === 'completed') return 'stitch';
  if (show.status === 'rendering') return 'render';
  if (show.status === 'script_ready') return 'script';
  if (show.status === 'failed') return 'render';
  return 'content';
}

function getStageIndex(stage) {
  return STAGES.findIndex(s => s.key === stage);
}

export default function ShowPipelineCard({ show, onEditScript, onRefresh }) {
  const [expanded, setExpanded] = useState(true);
  const [busy, setBusy] = useState(null);
  const [result, setResult] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [showStudioPreview, setShowStudioPreview] = useState(false);

  const currentStage = getShowStage(show);
  const stageIndex = getStageIndex(currentStage);

  const handleAction = async (action, label) => {
    setBusy(action);
    setResult(null);
    try {
      let res;
      if (action === 'generate') {
        res = await appClient.functions.invoke('dnnMorningBroadcast', { action: 'generate' });
      } else if (action === 'render') {
        res = await appClient.functions.invoke('dnnMorningBroadcast', { action: 'render' });
      } else if (action === 'check') {
        res = await appClient.functions.invoke('dnnMorningBroadcast', { action: 'check' });
      } else if (action === 'stitch') {
        res = await appClient.functions.invoke('dnnStitchBroadcast', { action: 'start', broadcastId: show.id });
      } else if (action === 'checkStitch') {
        res = await appClient.functions.invoke('dnnStitchBroadcast', { action: 'check' });
      }
      setResult({ success: !res?.data?.error, data: res?.data });
      onRefresh();
    } catch (e) {
      setResult({ success: false, error: e.message });
    }
    setBusy(null);
  };

  const clips = show.clips || [];
  const allClipsRendered = clips.length > 0 && clips.every(c => c.videoUrl);
  const someClipsRendering = clips.some(c => c.status === 'rendering');
  const someClipsFailed = clips.some(c => c.status === 'failed');

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.2)' }}>
      {/* Show header */}
      <div className="flex items-center justify-between px-5 py-4 cursor-pointer"
        style={{ borderBottom: expanded ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
        onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          {expanded ? <ChevronDown className="w-4 h-4" style={{ color: GOLD }} /> : <ChevronRight className="w-4 h-4" style={{ color: GOLD }} />}
          <div>
            <p className="text-sm font-black text-white">
              {show.show_name || `Show ${show.show_number || '?'}`}
              <span className="ml-2 text-xs font-normal text-slate-500">{show.broadcast_date}</span>
            </p>
            <p className="text-[10px] text-slate-500">
              {clips.length} clips · {show.headlines?.length || 0} headlines · {show.format || 'solo'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Distribution tracker */}
          {show.videoUrl && <DistributionTracker show={show} />}
          {/* Stage badge */}
          <span className="text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full"
            style={{
              background: show.status === 'failed' ? 'rgba(239,68,68,0.15)' : show.status === 'completed' ? 'rgba(74,222,128,0.15)' : 'rgba(212,175,55,0.15)',
              color: show.status === 'failed' ? '#ef4444' : show.status === 'completed' ? '#4ade80' : GOLD,
            }}>
            {show.status?.toUpperCase() || 'DRAFT'}
          </span>
          {show.videoUrl && (
            <span className="text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80' }}>
              ✓ STITCHED
            </span>
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-5 py-4">
          {/* Pipeline steps */}
          <div className="flex items-center gap-1 mb-5 overflow-x-auto">
            {STAGES.map((stage, i) => {
              const StageIcon = stage.icon;
              const isDone = i < stageIndex;
              const isActive = i === stageIndex;
              const isFuture = i > stageIndex;
              return (
                <React.Fragment key={stage.key}>
                  <div className="flex flex-col items-center shrink-0" style={{ minWidth: '90px' }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                      style={{
                        background: isDone ? 'rgba(74,222,128,0.15)' : isActive ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)',
                        border: `1.5px solid ${isDone ? 'rgba(74,222,128,0.4)' : isActive ? GOLD : 'rgba(255,255,255,0.1)'}`,
                      }}>
                      {isDone ? <CheckCircle className="w-4 h-4 text-green-400" /> : <StageIcon className="w-4 h-4" style={{ color: isActive ? GOLD : '#666' }} />}
                    </div>
                    <p className="text-[8px] font-bold tracking-wide uppercase mt-1.5 text-center leading-tight"
                      style={{ color: isDone ? '#4ade80' : isActive ? GOLD : '#555' }}>
                      {stage.label}
                    </p>
                  </div>
                  {i < STAGES.length - 1 && (
                    <div className="h-0.5 flex-1 mt-[-20px] rounded-full" style={{ minWidth: '20px', background: i < stageIndex ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.08)' }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Action buttons based on current stage */}
          <div className="flex flex-wrap gap-2 mb-4">
            {currentStage === 'content' && (
              <button onClick={() => handleAction('generate', 'Script')} disabled={busy === 'generate'}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-black transition-all disabled:opacity-50"
                style={{ background: busy === 'generate' ? '#666' : 'linear-gradient(135deg, #e8c84a, #D4AF37)' }}>
                {busy === 'generate' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {busy === 'generate' ? 'Generating…' : 'Generate Script'}
              </button>
            )}

            {currentStage === 'script' && (
              <>
                <button onClick={() => handleAction('render', 'Render')} disabled={busy === 'render'}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-black transition-all disabled:opacity-50"
                  style={{ background: busy === 'render' ? '#666' : 'linear-gradient(135deg, #e8c84a, #D4AF37)' }}>
                  {busy === 'render' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Clapperboard className="w-3.5 h-3.5" />}
                  {busy === 'render' ? 'Starting Renders…' : 'Start Clip Renders'}
                </button>
                <button onClick={onEditScript}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all"
                  style={{ background: '#333', border: '1px solid rgba(212,175,55,0.3)' }}>
                  <Edit3 className="w-3.5 h-3.5" /> Edit Script
                </button>
              </>
            )}

            {currentStage === 'render' && (
              <button onClick={() => handleAction('check', 'Check')} disabled={busy === 'check'}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-black transition-all disabled:opacity-50"
                style={{ background: busy === 'check' ? '#666' : 'linear-gradient(135deg, #e8c84a, #D4AF37)' }}>
                {busy === 'check' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                {busy === 'check' ? 'Checking…' : 'Check Render Status'}
              </button>
            )}

            {currentStage === 'stitch' && (
              <>
                <button onClick={() => handleAction('stitch', 'Stitch')} disabled={busy === 'stitch'}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-black transition-all disabled:opacity-50"
                  style={{ background: busy === 'stitch' ? '#666' : 'linear-gradient(135deg, #e8c84a, #D4AF37)' }}>
                  {busy === 'stitch' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Film className="w-3.5 h-3.5" />}
                  {busy === 'stitch' ? 'Stitching…' : 'Start Stitching'}
                </button>
                <button onClick={() => handleAction('checkStitch', 'CheckStitch')} disabled={busy === 'checkStitch'}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all"
                  style={{ background: '#333', border: '1px solid rgba(212,175,55,0.3)' }}>
                  {busy === 'checkStitch' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  Check Stitch Status
                </button>
              </>
            )}

            {currentStage === 'ready' && (
              <>
                <button onClick={() => setShowStudioPreview(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-black transition-all"
                  style={{ background: 'linear-gradient(135deg, #e8c84a, #D4AF37)' }}>
                  <Play className="w-3.5 h-3.5" /> Preview Studio Show
                </button>
                <a href="/admin/dnn/video-preview"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all"
                  style={{ background: '#333', border: '1px solid rgba(212,175,55,0.3)' }}>
                  <Layers className="w-3.5 h-3.5" /> Video Preview Studio
                </a>
              </>
            )}

            {currentStage === 'distribution' && (
              <a href="/admin/dnn/video-preview"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-black transition-all"
                style={{ background: 'linear-gradient(135deg, #e8c84a, #D4AF37)' }}>
                <Layers className="w-3.5 h-3.5" /> Go to Video Preview Studio
              </a>
            )}
          </div>

          {/* Clip status details */}
          {clips.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">Clip Status:</p>
              <div className="flex gap-2 flex-wrap">
                {clips.map((clip, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {clip.status === 'completed' ? <CheckCircle className="w-3 h-3 text-green-400" /> :
                     clip.status === 'rendering' ? <Clock className="w-3 h-3 text-yellow-400" /> :
                     clip.status === 'failed' ? <XCircle className="w-3 h-3 text-red-400" /> :
                     <Clock className="w-3 h-3 text-slate-500" />}
                    <span className="text-[10px] font-bold uppercase text-slate-400">{clip.role}</span>
                    <span className="text-[9px] text-slate-600">#{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video preview */}
          {show.videoUrl && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Composited Video:</p>
                <button onClick={() => setShowStudioPreview(true)}
                  className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg text-black transition-all hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, #e8c84a, #D4AF37)' }}>
                  <Play className="w-3 h-3" /> Preview Studio Show
                </button>
              </div>
              <div className="rounded-xl overflow-hidden" style={{ background: '#000', border: '1px solid rgba(212,175,55,0.15)' }}>
                {playing ? (
                  <video src={show.videoUrl} controls autoPlay playsInline className="w-full" />
                ) : (
                  <button onClick={() => setPlaying(true)} className="w-full aspect-video relative flex items-center justify-center group">
                    <video src={show.videoUrl} muted playsInline preload="metadata"
                      onLoadedMetadata={(e) => { e.target.currentTime = 1; }}
                      className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                        style={{ background: GOLD }}>
                        <Play className="w-6 h-6 ml-1 text-black" fill="black" />
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Script preview */}
          {show.script && !show.videoUrl && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Script Preview:</p>
                <button onClick={onEditScript} className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-white">
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
              </div>
              <div className="rounded-lg p-3 max-h-32 overflow-y-auto" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="text-[11px] text-slate-400 whitespace-pre-wrap line-clamp-6">{show.script}</p>
              </div>
            </div>
          )}

          {/* Distribution panel — shown when video is ready */}
          {show.videoUrl && (
            <div className="mb-4">
              <DistributionPanel
                show={show}
                onRefresh={onRefresh}
                onAgentDistribute={() => setShowAgentModal(true)}
              />
            </div>
          )}

          {/* Social analytics — shown when posts have been distributed */}
          {show.videoUrl && (show.distribution || []).some(d => d.status === 'sent' && d.post_id) && (
            <div className="mb-4">
              <SocialAnalyticsPanel show={show} onRefresh={onRefresh} />
            </div>
          )}

          {/* Agent distribution modal */}
          {showAgentModal && (
            <AgentDistributionModal
              show={show}
              onClose={() => setShowAgentModal(false)}
              onRefresh={onRefresh}
            />
          )}

          {/* Studio preview — full broadcast with DNN background + whiteboard bullets */}
          {showStudioPreview && (() => {
            const clips = show.clips || [];
            const segments = [];
            for (const clip of clips) {
              if (!clip.videoUrl) continue;
              if (clip.role === 'bob') {
                segments.push({
                  src: clip.videoUrl,
                  speaker: 'bob',
                  title: clip.question || show.headlines?.[clips.indexOf(clip)] || null,
                  bullets: extractBullets(clip.script),
                });
              } else {
                segments.push({ src: clip.videoUrl, speaker: 'charlie' });
              }
            }
            if (segments.length === 0) return null;
            return (
              <div className="fixed inset-0 z-[200]">
                <DnnNewsBroadcastPlayer
                  segments={segments}
                  onClose={() => setShowStudioPreview(false)}
                />
              </div>
            );
          })()}

          {/* Error message */}
          {show.errorMessage && (
            <div className="rounded-lg p-2.5 mb-2 flex items-start gap-2" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-red-300">{show.errorMessage}</p>
            </div>
          )}

          {/* Action result */}
          {result && (
            <div className="rounded-lg p-2.5" style={{
              background: result.success ? 'rgba(74,222,128,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${result.success ? 'rgba(74,222,128,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}>
              {result.success ? (
                <p className="text-[10px] text-green-400">✓ {JSON.stringify(result.data).slice(0, 200)}</p>
              ) : (
                <p className="text-[10px] text-red-400">✗ {result.error || 'Unknown error'}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}