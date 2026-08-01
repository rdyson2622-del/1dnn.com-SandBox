import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Play, X } from 'lucide-react';
import TagTeamBroadcastPlayer from '@/components/dnn/TagTeamBroadcastPlayer';
import DnnStingVideo from '@/components/dnn/DnnStingVideo';

const GOLD = '#D4AF37';
const STUDIO_BG = '/assets/studio-bg.png';

const isPlayable = (b) => (b.clips?.length > 0 && b.clips.every(c => c.videoUrl)) || !!b.videoUrl;

// Stacked cards for the last two days of DNN morning broadcasts.
// Clicking a card opens the full-screen TV player for that day's show.
export default function BroadcastVideoStack() {
  const [playing, setPlaying] = useState(null);

  const { data: broadcasts = [] } = useQuery({
    queryKey: ['dnnBroadcastStack'],
    queryFn: () => appClient.entities.DnnBroadcast.list('-broadcast_date', 10),
    refetchInterval: 60000,
  });

  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const recent = broadcasts.filter(b => isPlayable(b) && b.broadcast_date >= twoDaysAgo).slice(0, 2);
  if (recent.length === 0) return null;

  return (
    <>
      {recent.map(b => {
        const dateLabel = new Date(b.broadcast_date + 'T12:00:00').toLocaleDateString('en-US', {
          weekday: 'short', month: 'short', day: 'numeric',
        });
        return (
          <button key={b.id} onClick={() => setPlaying(b)}
            className="relative w-full aspect-video rounded-xl overflow-hidden group cursor-pointer block"
            style={{ background: '#111', border: '1px solid rgba(212,175,55,0.2)' }}>
            <img src={STUDIO_BG} alt="DNN Morning Broadcast" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.35)' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: 'rgba(212,175,55,0.92)', boxShadow: '0 0 40px rgba(212,175,55,0.3)' }}>
                <Play className="w-6 h-6 ml-0.5" style={{ color: '#000' }} fill="#000" />
              </span>
            </div>
            <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-lg"
              style={{ background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(212,175,55,0.4)', backdropFilter: 'blur(4px)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#ef4444' }} />
              <span className="text-[9px] font-black tracking-[0.2em] uppercase" style={{ color: GOLD }}>MORNING BROADCAST</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 px-3 py-2 text-left"
              style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.85))' }}>
              <p className="text-white font-bold text-xs">{dateLabel} · Charlie Simmons</p>
            </div>
          </button>
        );
      })}

      {playing && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center" style={{ background: '#000' }}>
          {playing.clips?.length > 0 && playing.clips.every(c => c.videoUrl) ? (
            <TagTeamBroadcastPlayer clips={playing.clips} onEnded={() => setPlaying(null)} />
          ) : (
            <DnnStingVideo videoUrl={playing.videoUrl} fullscreen onEnded={() => setPlaying(null)} />
          )}
          <button onClick={() => setPlaying(null)} aria-label="Close broadcast"
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'rgba(0,0,0,0.6)', border: `1px solid ${GOLD}`, color: GOLD }}>
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </>
  );
}