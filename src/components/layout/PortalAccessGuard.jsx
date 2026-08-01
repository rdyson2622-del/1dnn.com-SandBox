import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { appClient } from '@/api/appClient';

const PORTAL_HOMES = {
  client: '/home',
  agent: '/find-agent',
  referral_agent: '/partner-benefits',
  vendor: '/search',
  hr: '/corporate-relo',
};

const PORTAL_ROUTES = {
  '/home': 'client',
  '/dashboard': 'client',
  '/relocation-intake': 'client',
  '/subscribe': 'client',
  '/find-agent': 'agent',
  '/agent-subscribe': 'agent',
  '/agent-invited-clients': 'agent',
  '/national-directory': 'agent',
  '/partner-benefits': 'referral_agent',
  '/search': 'vendor',
  '/corporate-relo': 'hr',
};

const getSavedPortal = () => {
  try { return JSON.parse(localStorage.getItem('dyson_portal')); }
  catch { return null; }
};

export default function PortalAccessGuard({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    appClient.auth.me().then(user => {
      if (user?.role === 'admin') return setReady(true);
      const assigned = user?.portal_role || getSavedPortal()?.roleKey;
      if (assigned) {
        sessionStorage.setItem('dyson_role', assigned);
        window.dispatchEvent(new Event('dyson_role_change'));
      }
      const requested = location.pathname.startsWith('/vetted-agents/')
        ? 'agent'
        : PORTAL_ROUTES[location.pathname.toLowerCase()];
      if (assigned && requested && requested !== assigned) {
        navigate(PORTAL_HOMES[assigned] || '/?choose=1', { replace: true });
        return;
      }
      setReady(true);
    }).catch(() => setReady(true));
  }, [location.pathname, navigate]);

  if (!ready) return <div className="min-h-screen bg-black" />;
  return children;
}