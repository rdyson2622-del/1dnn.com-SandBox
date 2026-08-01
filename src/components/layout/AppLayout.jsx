import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { appClient } from '@/api/appClient';
import FloatingCharlie from '../charlie/FloatingCharlie';
import PWAInstallPrompt from '../pwa/PWAInstallPrompt';
import ClientSidebar from './ClientSidebar';
import PageNumberBadge from '../PageNumberBadge';
import { ArrowLeft, PanelLeft } from 'lucide-react';
import MobileBottomNav from './MobileBottomNav';
import CommandPills from './CommandPills';
import PortalHomeButton from './PortalHomeButton';
import PortalAccessGuard from './PortalAccessGuard';

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => sessionStorage.getItem('dyson_sidebar_expanded') === 'true');

  const toggleSidebar = () => {
    setSidebarOpen(prev => {
      sessionStorage.setItem('dyson_sidebar_expanded', String(!prev));
      return !prev;
    });
  };

  useEffect(() => {
    appClient.auth.me().then(u => { if (u?.role === 'admin') setIsAdmin(true); }).catch(() => {});
  }, []);
  
  // Don't show FloatingCharlie on pages that already have embedded chat
  const hideFloatingCharlie = ['/Chat', '/Dashboard', '/dnn-news'].some(path => 
     location.pathname.startsWith(path)
   );

  // Video pipeline mode: strip ALL portal chrome and render only the page.
  const isVideoMode = new URLSearchParams(location.search).get('videoMode') === 'true';
  if (isVideoMode) {
    return (
      <div className="fixed inset-0 overflow-hidden" style={{ background: '#0d0d0d' }}>
        <Outlet />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#A9A9A9' }}>
      {/* Top bar spanning full width */}
      <div className="px-4 py-3 flex items-center gap-3" style={{ background: '#0d0d0d' }}>
        <PortalHomeButton
          onClick={() => navigate('/?choose=1')}
          label="STUDIO"
        />

        {/* Sidebar toggle */}
        <button
          onClick={toggleSidebar}
          aria-label="Toggle portal menu"
          title="Toggle portal menu"
          className="w-9 h-9 flex items-center justify-center rounded-lg transition-all hover:opacity-80"
          style={{ color: '#D4AF37', border: '1px solid rgba(212,175,55,0.35)' }}
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full transition-all hover:opacity-80"
          style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex-1" />

        {/* ── ADMIN-ONLY COMMAND PILLS ── */}
        {isAdmin && <CommandPills />}
      </div>
      {/* Content area with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — desktop only, toggled by the Client Portal box */}
        {sidebarOpen && (
          <div className="hidden md:flex">
            <ClientSidebar />
          </div>
        )}
        {/* Main content */}
        <div className="flex-1 overflow-auto pb-16 md:pb-0">
          <PortalAccessGuard>
            <Outlet />
          </PortalAccessGuard>
        </div>
      </div>
      <MobileBottomNav />
      <PageNumberBadge />
      {!hideFloatingCharlie && <FloatingCharlie />}
      <PWAInstallPrompt />
    </div>
  );
}