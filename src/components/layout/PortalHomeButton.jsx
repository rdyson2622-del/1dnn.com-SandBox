import React from 'react';
import { Home } from 'lucide-react';

export default function PortalHomeButton({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 text-xs font-black tracking-[0.12em] px-3 py-2 rounded-lg transition-all hover:opacity-80"
      style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.45)' }}
    >
      <Home className="w-4 h-4" />
      <span className="hidden sm:inline">{label} HOME</span>
    </button>
  );
}