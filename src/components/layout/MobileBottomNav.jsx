import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, Newspaper, MessageCircle, Map } from 'lucide-react';

const GOLD = '#D4AF37';

export default function MobileBottomNav() {
  const location = useLocation();

  const items = [
    { label: 'Home',      path: '/',                      Icon: Home },
    { label: 'Dashboard', path: '/dashboard',             Icon: LayoutDashboard },
    { label: 'Roadmap',   path: '/RelocationRoadmap',     Icon: Map },
    { label: 'DNN News',  path: '/dnn-news',              Icon: Newspaper },
    { label: 'Messages',  path: '/communications-explainer', Icon: MessageCircle },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2"
      style={{
        background: '#0d0d0d',
        borderTop: '1px solid rgba(212,175,55,0.25)',
        paddingTop: '0.5rem',
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
      }}
    >
      {items.map(({ label, path, Icon }) => {
        const active = location.pathname === path ||
          (path !== '/' && location.pathname.toLowerCase().startsWith(path.toLowerCase()));
        return (
          <Link
            key={path}
            to={path}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl"
            style={{ color: active ? GOLD : 'rgba(255,255,255,0.45)' }}
          >
            <Icon className="w-5 h-5" style={{ strokeWidth: active ? 2.5 : 1.8 }} />
            <span className="text-[10px] font-semibold tracking-wide">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}