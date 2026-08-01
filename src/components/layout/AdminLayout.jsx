import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Navigate } from 'react-router-dom';
import { appClient } from '@/api/appClient';
import AdminSidebar from '../admin/AdminSidebar';
import LayoutToggleButton from './LayoutToggleButton';
import PageNumberBadge from '../PageNumberBadge';
import { useLayout } from '@/lib/LayoutContext';
import { ArrowLeft, Menu, X } from 'lucide-react';
import AdminCharliePanel from '../admin/AdminCharliePanel';
import CommandPills from './CommandPills';
import PortalHomeButton from './PortalHomeButton';

export default function AdminLayout() {
  const { landscape } = useLayout();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [access, setAccess] = useState('loading'); // 'loading' | 'allowed' | 'denied'

  useEffect(() => {
    appClient.auth.me()
      .then(u => setAccess(u?.role === 'admin' ? 'allowed' : 'denied'))
      .catch(() => setAccess('denied'));
  }, []);

  if (access === 'loading') {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#0a0a0a' }}>
        <div className="w-8 h-8 border-4 rounded-full animate-spin"
          style={{ borderColor: 'rgba(212,175,55,0.2)', borderTopColor: '#D4AF37' }} />
      </div>
    );
  }

  if (access === 'denied') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#ede0cc' }}>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <AdminSidebar />
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setMobileMenuOpen(false)}>
          <div onClick={e => e.stopPropagation()} className="fixed left-0 top-0 h-full w-56 z-50">
            <AdminSidebar />
          </div>
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}

      <main className="flex-1 overflow-auto relative" style={{ background: '#ede0cc' }}>
        {/* Top Controls */}
        <div className="fixed top-3 left-3 z-50 flex items-center gap-2">
          <PortalHomeButton onClick={() => navigate('/?choose=1')} label="STUDIO" />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all hover:opacity-80"
            style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.4)' }}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
        <div className="fixed top-3 right-3 z-[10000] flex items-center gap-2">
          <CommandPills />
          <LayoutToggleButton />
        </div>
        <div className={`mx-auto ${landscape ? 'max-w-5xl' : 'max-w-2xl'}`}>
          {/* Back button */}
          <div className="px-4 pt-16 md:pt-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full transition-all hover:opacity-80"
              style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </div>
          <Outlet />
        </div>
        <PageNumberBadge />
        <AdminCharliePanel />
      </main>
    </div>
  );
}