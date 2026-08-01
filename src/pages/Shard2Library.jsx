import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Film, Play, Copy, Check, ExternalLink, Archive, RotateCcw } from 'lucide-react';
import Shard2Header from '@/components/shard2/Shard2Header';

function VideoRow({ video, explainer, onArchive, onRegenerate }) {
  const [copied, setCopied] = useState(false);
  const url = video.finalVideoUrl || explainer?.finalVideoUrl;

  const copy = () => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <td className="px-4 py-3">
        <p className="font-bold text-white">{video.pageTitle}</p>
        <p className="text-[11px] text-slate-600">{video.videoTitle}</p>
      </td>
      <td className="px-4 py-3">
        {video.thumbnailUrl ? (
          <img src={video.thumbnailUrl} alt="" className="w-20 h-12 object-cover rounded" />
        ) : (
          <div className="w-20 h-12 rounded flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <Film className="w-4 h-4 text-slate-600" />
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-slate-400 text-xs">{video.durationSeconds ? `${video.durationSeconds}s` : '—'}</td>
      <td className="px-4 py-3">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: video.status === 'completed' ? 'rgba(74,222,128,0.12)' : video.status === 'failed' ? 'rgba(248,113,113,0.12)' : 'rgba(148,163,184,0.12)', color: video.status === 'completed' ? '#4ade80' : video.status === 'failed' ? '#f87171' : '#94a3b8' }}>
          {video.status}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center gap-1.5 justify-end">
          {url && (
            <>
              <a href={url} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400" title="Preview"><Play className="w-3.5 h-3.5" /></a>
              <button onClick={copy} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400" title="Copy URL">{copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}</button>
            </>
          )}
          {explainer?.pageUrl && (
            <a href={explainer.pageUrl} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400" title="Open page"><ExternalLink className="w-3.5 h-3.5" /></a>
          )}
          {explainer && (
            <button onClick={() => onRegenerate(explainer)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400" title="Regenerate"><RotateCcw className="w-3.5 h-3.5" /></button>
          )}
          {video.status !== 'archived' && (
            <button onClick={() => onArchive(video)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400" title="Archive"><Archive className="w-3.5 h-3.5" /></button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function Shard2Library() {
  const queryClient = useQueryClient();

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['shard2Library'],
    queryFn: () => appClient.entities.CharlieVideoLibrary.list('-created_date', 300),
  });
  const { data: explainers = [] } = useQuery({
    queryKey: ['shard2Explainers'],
    queryFn: () => appClient.entities.CharliePageExplainer.list('-created_date', 500),
  });

  const explainerFor = (id) => explainers.find(e => e.id === id);

  const handleArchive = async (video) => {
    await appClient.entities.CharlieVideoLibrary.update(video.id, { status: 'archived' });
    queryClient.invalidateQueries({ queryKey: ['shard2Library'] });
  };

  const handleRegenerate = async (explainer) => {
    if (!confirm('Reset this explainer to re-render the video?')) return;
    await appClient.entities.CharliePageExplainer.update(explainer.id, { renderStatus: 'not_started', errorMessage: '' });
    queryClient.invalidateQueries({ queryKey: ['shard2Explainers'] });
  };

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0d' }}>
      <Shard2Header />
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <p className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: '#D4AF37' }}>Charlie Video Library</p>

        {isLoading ? (
          <div className="flex justify-center py-20"><div className="w-6 h-6 border-4 border-slate-800 border-t-yellow-500 rounded-full animate-spin" /></div>
        ) : videos.length === 0 ? (
          <div className="rounded-xl p-12 text-center" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Film className="w-10 h-10 mx-auto mb-3 opacity-20 text-white" />
            <p className="text-sm text-slate-500">No completed videos yet. Approved scripts rendered by n8n will appear here.</p>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th className="px-4 py-3 font-bold">Page Title</th>
                  <th className="px-4 py-3 font-bold">Thumbnail</th>
                  <th className="px-4 py-3 font-bold">Duration</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.map(v => (
                  <VideoRow key={v.id} video={v} explainer={explainerFor(v.explainerId)} onArchive={handleArchive} onRegenerate={handleRegenerate} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}