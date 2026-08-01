import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { appClient } from '@/api/appClient';
import { Home, Users, Map, CheckCircle2, Zap, Clock } from 'lucide-react';

const GOLD = '#D4AF37';

const EVENT_ICONS = {
  housing:    { icon: Home,         color: '#60a5fa' },
  moving:     { icon: Map,          color: '#34d399' },
  social:     { icon: Users,        color: '#a78bfa' },
  schools:    { icon: CheckCircle2, color: '#f59e0b' },
  healthcare: { icon: CheckCircle2, color: '#f87171' },
  other:      { icon: Zap,          color: GOLD },
  default:    { icon: Clock,        color: 'rgba(255,255,255,0.4)' },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getEventMeta(task) {
  const map = EVENT_ICONS[task.category] || EVENT_ICONS.default;
  return map;
}

export default function ActivityFeed({ clientId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = async () => {
    const tasks = await appClient.entities.RelocationTask.filter(
      { client_id: clientId },
      '-updated_date',
      20
    );
    setEvents(tasks);
    setLoading(false);
  };

  useEffect(() => {
    if (!clientId) return;
    loadEvents();

    // Real-time subscription
    const unsub = appClient.entities.RelocationTask.subscribe((event) => {
      if (event.data?.client_id !== clientId) return;
      if (event.type === 'create') {
        setEvents(prev => [event.data, ...prev].slice(0, 20));
      } else if (event.type === 'update') {
        setEvents(prev => prev.map(e => e.id === event.id ? event.data : e));
      } else if (event.type === 'delete') {
        setEvents(prev => prev.filter(e => e.id !== event.id));
      }
    });

    return unsub;
  }, [clientId]);

  if (loading) return null;
  if (events.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <p className="text-xs font-bold tracking-[0.2em]" style={{ color: GOLD }}>ACTIVITY FEED</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Your relocation journey, live</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#22c55e' }} />
          <span className="text-xs" style={{ color: '#22c55e' }}>Live</span>
        </div>
      </div>

      <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
        <AnimatePresence initial={false}>
          {events.map((task, i) => {
            const { icon: Icon, color } = getEventMeta(task);
            const statusDot = task.status === 'completed' ? '#22c55e'
              : task.status === 'in_progress' ? GOLD
              : 'rgba(255,255,255,0.2)';

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-start gap-3 px-5 py-3.5"
              >
                {/* Icon */}
                <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center mt-0.5"
                  style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white leading-tight">{task.title}</p>
                  {task.description && (
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Right: status + time */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: statusDot }} />
                    <span className="text-xs capitalize" style={{ color: statusDot }}>
                      {task.status?.replace('_', ' ') || 'pending'}
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    {timeAgo(task.updated_date || task.created_date)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}