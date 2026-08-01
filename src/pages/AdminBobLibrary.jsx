import React, { useState, useEffect, useCallback } from 'react';
import { appClient } from '@/api/appClient';
import { Sparkles, RefreshCw, Video } from 'lucide-react';
import BobClipCard from '@/components/admin/BobClipCard';

const GOLD = '#D4AF37';

export default function AdminBobLibrary() {
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState('');

  const load = useCallback(() => {
    appClient.entities.BobAnswerClip.list('created_date', 200)
      .then(setClips)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh render status while any clip is rendering
  const anyRendering = clips.some(c => c.status === 'rendering');
  useEffect(() => {
    if (!anyRendering) return;
    const t = setInterval(async () => {
      await appClient.functions.invoke('bobAnswerLibrary', { action: 'checkAll' }).catch(() => {});
      load();
    }, 30000);
    return () => clearInterval(t);
  }, [anyRendering, load]);

  const run = async (action, label) => {
    setWorking(label);
    await appClient.functions.invoke('bobAnswerLibrary', { action }).catch(() => {});
    load();
    setWorking('');
  };

  const addClip = async () => {
    await appClient.entities.BobAnswerClip.create({
      question: 'New question…',
      answerScript: "Bob's answer script…",
      status: 'draft',
      isActive: true,
    });
    load();
  };

  const completed = clips.filter(c => c.status === 'completed').length;
  const pending = clips.filter(c => c.status === 'draft' || c.status === 'failed').length;
  const rendering = clips.filter(c => c.status === 'rendering').length;

  return (
    <div className="min-h-screen p-8" style={{ background: '#0a0a0a' }}>
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-black tracking-[0.3em] uppercase mb-2" style={{ color: GOLD }}>CHARLIE'S BRAIN</p>
        <h1 className="text-2xl font-bold text-white mb-1">Bob's Video Answer Library</h1>
        <p className="text-sm mb-6" style={{ color: '#999' }}>
          Every question here gets a real Bob Dyson video answer in the chat box. Edit scripts, render with HeyGen, and the chat automatically matches consumer questions to these clips.
        </p>

        <div className="flex items-center gap-3 flex-wrap mb-8">
          {clips.length === 0 && !loading && (
            <button onClick={() => run('seed', 'seed')} disabled={!!working}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold"
              style={{ background: GOLD, color: '#000' }}>
              <Sparkles className="w-4 h-4" /> {working === 'seed' ? 'Seeding…' : 'Seed 20 Starter Q&As'}
            </button>
          )}
          {pending > 0 && (
            <button onClick={() => run('startAll', 'render')} disabled={!!working}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold"
              style={{ background: GOLD, color: '#000' }}>
              <Video className="w-4 h-4" /> {working === 'render' ? 'Starting renders…' : `Render All Pending (${pending})`}
            </button>
          )}
          {rendering > 0 && (
            <button onClick={() => run('checkAll', 'check')} disabled={!!working}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold"
              style={{ background: '#000', color: '#fff', border: `1px solid ${GOLD}` }}>
              <RefreshCw className={`w-4 h-4 ${working === 'check' ? 'animate-spin' : ''}`} /> Check Render Status ({rendering})
            </button>
          )}
          <button onClick={addClip}
            className="px-5 py-2.5 rounded-full text-sm font-bold"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#fff' }}>
            + Add Question
          </button>
        </div>

        {clips.length > 0 && (
          <p className="text-xs mb-4" style={{ color: '#888' }}>
            {completed} completed · {rendering} rendering · {pending} pending
          </p>
        )}

        {loading ? (
          <p className="text-sm" style={{ color: '#888' }}>Loading…</p>
        ) : (
          <div className="space-y-4">
            {clips.map(clip => (
              <BobClipCard key={clip.id} clip={clip} onChanged={load} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}