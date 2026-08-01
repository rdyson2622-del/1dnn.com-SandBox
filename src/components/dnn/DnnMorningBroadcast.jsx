import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Play, X } from 'lucide-react';
import { playNewsSting } from '@/components/dnn/newsSting';
import TagTeamBroadcastPlayer from '@/components/dnn/TagTeamBroadcastPlayer';
import DnnStingVideo from '@/components/dnn/DnnStingVideo';

const isTagTeamReady = (b) => b.clips?.length > 0 && b.clips.every(c => c.videoUrl);

const GOLD = '#D4AF37';
const STUDIO_BG = '/assets/studio-bg.png';

export default function DnnMorningBroadcast() {
  // tvState: 'off' | 'intro' | 'on'
  const [tvState, setTvState] = useState('off');

  // Allow the header LIVE FEED button to launch the broadcast
  const turnOnRef = React.useRef(null);
  React.useEffect(() => {
    const handler = () => turnOnRef.current?.();
    window.addEventListener('dnn-live-broadcast', handler);
    return () => window.removeEventListener('dnn-live-broadcast', handler);
  }, []);

  const { data: broadcasts = [] } = useQuery({
    queryKey: ['dnnMorningBroadcast'],
    queryFn: () => appClient.entities.DnnBroadcast.list('-broadcast_date', 10),
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  // Latest broadcast that has playable video — tag-team clips or legacy solo video
  const broadcast = broadcasts.find(b => isTagTeamReady(b) || b.videoUrl);

  // Auto-open the broadcast once per day when someone lands on DNN News
  React.useEffect(() => {
    if (!broadcast) return;
    const key = `dnn-auto-broadcast-${broadcast.broadcast_date}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    turnOnRef.current?.();
  }, [broadcast?.id]);

  if (!broadcast) return null;
  const tagTeam = isTagTeamReady(broadcast);

  const dateLabel = new Date(broadcast.broadcast_date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  const turnOn = () => {
    try { playNewsSting(); } catch (_) { /* audio must never block the broadcast */ }
    setTvState('on');
  };
  turnOnRef.current = turnOn;

  return (
    <>
      <div className="w-full px-6 md:px-12 lg:px-20 md:pr-44 pt-10 max-w-5xl mx-auto">
        <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid rgba(212,175,55,0.4)`, boxShadow: '0 16px 60px rgba(0,0,0,0.35)' }}>
          {/* TV-off screen — click to power on */}
          <div className="relative w-full aspect-video" style={{ background: '#000' }}>
            <button onClick={turnOn} className="group w-full h-full block relative">
              <img src={STUDIO_BG} alt="DNN Real Estate News studio" className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.35)' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="w-20 h-20 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ background: 'rgba(212,175,55,0.95)', boxShadow: '0 0 60px rgba(212,175,55,0.4)' }}>
                  <Play className="w-9 h-9 ml-1" style={{ color: '#000' }} fill="#000" />
                </span>
              </div>
              <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(212,175,55,0.4)', backdropFilter: 'blur(4px)' }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#ef4444' }} />
                <span className="text-[10px] font-black tracking-[0.25em] uppercase" style={{ color: GOLD }}>LIVE DAILY 6AM</span>
              </div>
            </button>
            <div className="absolute bottom-0 left-0 right-0 px-5 py-3 pointer-events-none"
              style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.85))' }}>
              <p className="text-[10px] font-black tracking-[0.3em] uppercase" style={{ color: GOLD }}>DNN Real Estate News · Morning Broadcast</p>
              <p className="text-white font-bold text-sm">{dateLabel} · Charlie Simmons, Anchor</p>
            </div>
          </div>
        </div>
      </div>

      {/* Full-screen TV takeover */}
      {tvState !== 'off' && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center dnn-tv-on" style={{ background: '#000' }}>
          {tagTeam ? (
            <TagTeamBroadcastPlayer clips={broadcast.clips} onEnded={() => setTvState('off')} />
          ) : (
            <DnnStingVideo videoUrl={broadcast.videoUrl} fullscreen onEnded={() => setTvState('off')} />
          )}

          {/* Channel bug */}
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg pointer-events-none"
            style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(212,175,55,0.4)', backdropFilter: 'blur(4px)' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#ef4444' }} />
            <span className="text-[10px] font-black tracking-[0.25em] uppercase" style={{ color: GOLD }}>DNN · MORNING BROADCAST</span>
          </div>

          {/* Power off */}
          <button onClick={() => setTvState('off')} aria-label="Close broadcast"
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'rgba(0,0,0,0.6)', border: `1px solid ${GOLD}`, color: GOLD }}>
            <X className="w-5 h-5" />
          </button>

          <style>{`
            @keyframes dnnTvOn {
              0% { transform: scaleY(0.005) scaleX(0.6); filter: brightness(6); }
              45% { transform: scaleY(0.01) scaleX(1); filter: brightness(4); }
              100% { transform: scaleY(1) scaleX(1); filter: brightness(1); }
            }
            .dnn-tv-on { animation: dnnTvOn 0.55s cubic-bezier(0.22, 1, 0.36, 1); transform-origin: center; }
          `}</style>
        </div>
      )}
    </>
  );
}