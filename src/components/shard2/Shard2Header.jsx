import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Film } from 'lucide-react';

const NAV = [
  { to: '/admin/shard2', label: 'Dashboard' },
  { to: '/admin/shard2/pages', label: 'Pages' },
  { to: '/admin/shard2/scripts', label: 'Scripts' },
  { to: '/admin/shard2/library', label: 'Library' },
  { to: '/admin/shard2/settings', label: 'Settings' },
];

export default function Shard2Header() {
  const { pathname } = useLocation();

  return (
    <div className="sticky top-0 z-20 px-6 py-4"
      style={{ background: 'rgba(13,13,13,0.97)', borderBottom: '1px solid rgba(212,175,55,0.15)', backdropFilter: 'blur(10px)' }}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #e8c84a, #D4AF37)' }}>
            <Film className="w-4 h-4 text-black" />
          </div>
          <div>
            <p className="text-sm font-black tracking-[0.3em] uppercase" style={{ color: '#D4AF37' }}>DysonRelo Studio</p>
            <p className="text-[10px] tracking-widest uppercase text-slate-600">Charlie Page Explainers · Shard 2</p>
          </div>
        </div>
        <nav className="flex items-center gap-1.5 flex-wrap">
          {NAV.map((n) => {
            const active = pathname === n.to;
            return (
              <Link key={n.to} to={n.to}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: active ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)',
                  color: active ? '#D4AF37' : '#94a3b8',
                  border: `1px solid ${active ? 'rgba(212,175,55,0.35)' : 'rgba(255,255,255,0.08)'}`,
                }}>
                {n.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}