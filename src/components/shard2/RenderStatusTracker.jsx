import React, { useEffect, useRef, useState } from 'react';
import { appClient } from '@/api/appClient';
import { CheckCircle, Loader, Clock, XCircle, Film } from 'lucide-react';

const STEPS = [
  { key: 'queued', label: 'Queued' },
  { key: 'rendering', label: 'Rendering in HeyGen' },
  { key: 'completed', label: 'Video Live' },
];

const STEP_INDEX = {
  queued: 0,
  rendering: 1,
  heygen_completed: 1,
  composing: 1,
  completed: 2,
};

const POLLING_STATUSES = ['rendering', 'heygen_completed', 'composing'];

/**
 * Live render progress tracker. While a render is in flight it polls
 * shard2RenderPresenterClip (action: check) every 20s and reports back
 * via onStatusChange when the render finishes or fails.
 */
export default function RenderStatusTracker({ explainer, onStatusChange }) {
  const { renderStatus } = explainer;
  const [checking, setChecking] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!POLLING_STATUSES.includes(renderStatus)) return;

    let cancelled = false;
    const poll = async () => {
      setChecking(true);
      const res = await appClient.functions.invoke('shard2RenderPresenterClip', {
        action: 'check', explainerId: explainer.id,
      }).catch(() => null);
      setChecking(false);
      if (cancelled) return;
      const status = res?.data?.status;
      if (status === 'completed' || status === 'failed') {
        onStatusChange?.();
      } else {
        timerRef.current = setTimeout(poll, 20000);
      }
    };
    timerRef.current = setTimeout(poll, 5000);
    return () => { cancelled = true; clearTimeout(timerRef.current); };
  }, [renderStatus, explainer.id]);

  if (!renderStatus || renderStatus === 'not_started') return null;

  if (renderStatus === 'failed') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
        style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)' }}>
        <XCircle className="w-4 h-4 shrink-0" style={{ color: '#f87171' }} />
        <p className="text-xs font-bold" style={{ color: '#f87171' }}>
          Render failed{explainer.errorMessage ? ` — ${explainer.errorMessage}` : ''}
        </p>
      </div>
    );
  }

  const activeIdx = STEP_INDEX[renderStatus] ?? 0;
  const isDone = renderStatus === 'completed';

  return (
    <div className="px-3 py-2.5 rounded-lg"
      style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.2)' }}>
      <div className="flex items-center gap-2 mb-2">
        <Film className="w-3.5 h-3.5" style={{ color: '#D4AF37' }} />
        <p className="text-[10px] font-black tracking-[0.15em] uppercase" style={{ color: '#D4AF37' }}>
          Render Progress
        </p>
        {!isDone && (
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {checking ? 'checking HeyGen...' : 'auto-updating every 20s'}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {STEPS.map((step, i) => {
          const done = isDone ? true : i < activeIdx;
          const active = !isDone && i === activeIdx;
          return (
            <React.Fragment key={step.key}>
              {i > 0 && <div className="w-4 h-px" style={{ background: 'rgba(212,175,55,0.3)' }} />}
              <div className="flex items-center gap-1.5">
                {done ? (
                  <CheckCircle className="w-3.5 h-3.5" style={{ color: '#4ade80' }} />
                ) : active ? (
                  <Loader className="w-3.5 h-3.5 animate-spin" style={{ color: '#fbbf24' }} />
                ) : (
                  <Clock className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.25)' }} />
                )}
                <span className="text-[11px] font-bold"
                  style={{ color: done ? '#4ade80' : active ? '#fbbf24' : 'rgba(255,255,255,0.35)' }}>
                  {step.label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      {isDone && (
        <p className="text-[11px] mt-1.5" style={{ color: '#4ade80' }}>
          ✓ Video completed and live on the page.
        </p>
      )}
    </div>
  );
}