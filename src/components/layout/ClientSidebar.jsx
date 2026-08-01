import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  MapPin, Zap, Settings, Phone, Map, Search, MessageCircle,
  Newspaper, DollarSign, Shield, Fingerprint,
  CreditCard, Building2, Home, Users, TrendingUp, Star, ArrowRight
} from 'lucide-react';
import { appClient } from '@/api/appClient';
import RelocationManagementModal from './RelocationManagementModal';
import SendingAgentModal from '@/components/directory/SendingAgentModal';
import ReceivingAgentModal from '@/components/directory/ReceivingAgentModal';

const GOLD = '#D4AF37';
const DYSON_LOGO = "/assets/dyson-logo.png";

const authorityLinks = [
  { label: '55-Year Legacy', to: '/bob-dyson' },
  { label: 'The 1927 Parallel', to: '/Explainers#1927' },
  { label: '21 AI Assistants', to: '/ai-assistants' },
];

// Subtle gold-bordered suite box wrapper
function SuiteBox({ title, children }) {
  return (
    <div className="px-3 pt-4 pb-1">
      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid rgba(212,175,55,0.55)`, background: 'rgba(212,175,55,0.06)' }}>
        <div className="px-3 py-2" style={{ borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
          <p className="text-[10px] font-black tracking-[0.25em] uppercase" style={{ color: GOLD, textShadow: '0 0 8px rgba(212,175,55,0.4)' }}>
            {title}
          </p>
        </div>
        <div className="flex flex-col gap-0.5 p-2">
          {children}
        </div>
      </div>
    </div>
  );
}

function NavLink({ to, icon: Icon, label, badge, location }) {
  const active = location.pathname === to;
  return (
    <Link to={to}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:bg-white/10"
      style={{ background: active ? GOLD : 'transparent', color: active ? '#000' : '#fff' }}>
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: active ? '#000' : GOLD }} />}
      <span className="flex-1">{label}</span>
      {badge}
    </Link>
  );
}

export default function ClientSidebar() {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showRelocationModal, setShowRelocationModal] = useState(false);
  const [showSendingModal, setShowSendingModal] = useState(false);
  const [showReceivingModal, setShowReceivingModal] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [portalRole, setPortalRole] = useState(null);


  useEffect(() => {
    const stored = sessionStorage.getItem('dyson_role');
    if (stored) setPortalRole(stored);

    appClient.auth.me().then(user => {
      if (!user?.email) return;
      setUserRole(user.role);
      appClient.entities.RelocationClient.filter({ email: user.email }, '-created_date', 1).then(clients => {
        if (clients.length > 0) {
          const id = clients[0].id;
          appClient.entities.ChatMessage.filter({ client_id: id, role: 'admin' }, '-created_date', 10).then(msgs => {
            setUnreadCount(msgs.length);
          });
        }
      });
    });

    // Listen for admin role-switch events from the top nav pills
    const onRoleChange = () => {
      const updated = sessionStorage.getItem('dyson_role');
      setPortalRole(updated || 'client');
    };
    window.addEventListener('dyson_role_change', onRoleChange);
    return () => window.removeEventListener('dyson_role_change', onRoleChange);
  }, []);

  // Agent/Vendor suites only appear when that portal pill is explicitly active
  const isAgent = userRole === 'agent' || portalRole === 'agent';
  const isVendor = (userRole === 'vendor' || portalRole === 'vendor') && !isAgent;
  const isAdmin = userRole === 'admin';
  // Pure client: no professional path selected
  const isClientOnly = !isAgent && !isVendor;

  const PORTAL_LABELS = {
    client: 'CLIENT PORTAL',
    agent: 'RELOCATION AGENT PORTAL',
    referral_agent: 'REFERRAL AGENT PORTAL',
    vendor: 'VENDOR PORTAL',
  };
  const portalLabel = location.pathname === '/corporate-relo'
    ? 'CORPORATE HR PORTAL'
    : (PORTAL_LABELS[portalRole] || 'CLIENT PORTAL');

  return (
    <aside className="w-56 shrink-0 flex flex-col h-full overflow-hidden"
      style={{ background: '#0d0d0d', borderRight: '1px solid rgba(212,175,55,0.15)' }}>

      {/* Logo */}
      <div className="shrink-0 px-5 py-5 border-b flex flex-col items-center text-center" style={{ borderColor: 'rgba(212,175,55,0.15)' }}>
        <Link to="/?choose=1" title="Back to landing page">
          <img src={DYSON_LOGO} alt="Dyson & Dyson" className="h-10 w-auto mx-auto" />
        </Link>
        <p className="text-xs mt-2 tracking-widest font-semibold" style={{ color: GOLD }}>
          {portalLabel}
        </p>
      </div>

      {/* ── Two Core Value Links ── */}
      <div className="shrink-0 px-4 py-3 flex flex-col gap-1.5" style={{ borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
        <Link to="/relo-management"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-black tracking-wide transition-all hover:bg-white/10"
          style={{ color: GOLD }}>
          <Star className="w-3.5 h-3.5 shrink-0" style={{ color: GOLD }} />
          RELOCATION SERVICES
        </Link>
        <Link to="/real-estate-answers"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-black tracking-wide transition-all hover:bg-white/10"
          style={{ color: GOLD }}>
          <Star className="w-3.5 h-3.5 shrink-0" style={{ color: GOLD }} />
          REAL ESTATE ANSWERS
        </Link>
        {isAgent && (
          <>
            <button
              onClick={() => setShowSendingModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-black tracking-wide transition-all hover:bg-white/10 text-left"
              style={{ color: GOLD, background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)' }}>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" style={{ color: GOLD }} />
              I AM A REFERRAL SENDING AGENT
            </button>
            <button
              onClick={() => setShowReceivingModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-black tracking-wide transition-all hover:bg-white/10 text-left"
              style={{ color: GOLD, background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)' }}>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" style={{ color: GOLD }} />
              I AM A REFERRAL RECEIVING AGENT
            </button>
          </>
        )}
      </div>

      {/* Scrollable area */}
      <div className="flex-1 overflow-y-auto flex flex-col">

        {/* ══ AGENT PATH: 3-SUITE LAYOUT ══ */}
        {isAgent && (
          <>
            {/* SUITE 1 & 2: PRN Agent Tools + Client Retention Loop — admin only */}
            {isAdmin && (
              <>
                <SuiteBox title="⭐ PRN Agent Tools">
                  <NavLink to="/admin/skip-trace" icon={Fingerprint} location={location}
                    label="Run Skip Trace"
                    badge={<span className="text-[10px] font-black" style={{ color: GOLD }}>$1.50</span>}
                  />
                  <NavLink to="/financial-services" icon={CreditCard} location={location} label="Refill Fuel (Stripe)" />
                  <NavLink to="/agent-invited-clients" icon={Users} location={location} label="My Invited Clients" />
                </SuiteBox>

                <SuiteBox title="🤝 Client Retention Loop">
                  <NavLink to="/agent-invited-clients" icon={TrendingUp} location={location} label="Track My Referrals" />
                  <NavLink to="/financial-services" icon={DollarSign} location={location} label="Lender-Solve Status" />
                </SuiteBox>
              </>
            )}
            <SuiteBox title="🏠 My Personal Real Estate">
              <NavLink to="/RelocationRoadmap" icon={Map} location={location} label="My Roadmap" />
              <NavLink to="/solve-my-story" icon={Home} location={location} label="Solve My Story" />
              <NavLink to="/CityGuide" icon={MapPin} location={location} label="City Guide" />
              <NavLink to="/GeminiSession" icon={Zap} location={location} label="Gemini Session" />
            </SuiteBox>
          </>
        )}

        {/* ══ VENDOR PATH ══ */}
        {isVendor && !isAgent && (
          <>
            <SuiteBox title="🔧 Vendor Utility">
              <NavLink to="/search" icon={Search} location={location} label="Property Search" />
              {isAdmin && (
                <NavLink to="/admin/skip-trace" icon={Building2} location={location} label="Verified Owner Data" />
              )}
            </SuiteBox>
            <SuiteBox title="🏠 My Personal Real Estate">
              <NavLink to="/RelocationRoadmap" icon={Map} location={location} label="My Roadmap" />
              <NavLink to="/solve-my-story" icon={Home} location={location} label="Solve My Story" />
              <NavLink to="/CityGuide" icon={MapPin} location={location} label="City Guide" />
              <NavLink to="/GeminiSession" icon={Zap} location={location} label="Gemini Session" />
            </SuiteBox>
          </>
        )}

        {/* ── 4. STANDARD CLIENT NAV (always shown, but de-emphasised for pros) ── */}
        <div className="px-3 pt-4 pb-1">
          {/* Communications */}
          <p className="text-[10px] uppercase tracking-[2px] px-2 font-bold mb-2" style={{ color: GOLD }}>
            {isClientOnly ? 'Your Portal' : 'Communications'}
          </p>
          <div className="flex flex-col gap-1">
            <Link to="/communications-explainer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:bg-white/10"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#fff' }}>
              <div className="relative shrink-0">
                <MessageCircle className="w-3.5 h-3.5" style={{ color: GOLD }} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black animate-pulse"
                    style={{ background: '#ef4444', color: '#fff' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 ? `${unreadCount} New Reply` : 'Communications Hub'}
            </Link>

            {/* Pure client sub-sections */}
            {isClientOnly && (
              <>
                {/* Relocation Services */}
                <div className="mt-2 mb-1 px-1">
                  <p className="text-[9px] font-black tracking-[0.2em] uppercase" style={{ color: 'rgba(212,175,55,0.55)' }}>Relocation Services</p>
                </div>
                <NavLink to="/RelocationRoadmap" icon={Map} location={location} label="My Roadmap" />
                <NavLink to="/CityGuide" icon={MapPin} location={location} label="City Guide" />

                {/* Real Estate Answers */}
                <div className="mt-2 mb-1 px-1">
                  <p className="text-[9px] font-black tracking-[0.2em] uppercase" style={{ color: 'rgba(212,175,55,0.55)' }}>Real Estate Answers</p>
                </div>
                <NavLink to="/solve-my-story" icon={Home} location={location} label="Solve My Story" />
                <NavLink to="/GeminiSession" icon={Zap} location={location} label="Gemini Session" />
              </>
            )}
          </div>
        </div>

        {/* DNN Section */}
        <div className="px-3 pb-4 pt-2">
          <p className="text-[10px] uppercase tracking-[2px] px-2 font-bold mb-2" style={{ color: GOLD }}>
            Dyson News Network
          </p>
          <div className="flex flex-col gap-1">
            <NavLink to="/dnn-news" icon={Newspaper} location={location} label="DNN News" />
            <NavLink to="/my-agent" icon={Shield} location={location} label="Vette an Agent" />
            <NavLink to="/financial-services" icon={DollarSign} location={location} label="Select a Lender" />
          </div>
        </div>

        {/* Heritage & Authority */}
        <div className="pt-3 border-t mx-3" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="text-[10px] uppercase tracking-[2px] mb-2 px-2 font-bold" style={{ color: GOLD }}>
            Our Authority
          </div>
          <nav className="space-y-0.5">
            {authorityLinks.map(({ label, to }) => (
              <Link key={label} to={to}
                className="block px-2 py-1 text-xs transition-colors hover:text-[#D4AF37]"
                style={{ color: 'rgba(255,255,255,0.7)' }}>
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Human Help */}
        <div className="mx-3 mt-3 mb-3 rounded-xl p-3" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)' }}>
          <p className="text-xs font-bold tracking-widest mb-1" style={{ color: GOLD }}>NEED A HUMAN?</p>
          <p className="text-xs mb-2" style={{ color: '#fff' }}>Mon–Sat, 9am–7pm PT</p>
          <a href="tel:+18583531200" className="flex items-center gap-2 group">
            <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: GOLD }} />
            <span className="text-sm font-bold tracking-wide group-hover:underline" style={{ color: '#fff' }}>
              (858) 353-1200
            </span>
          </a>
        </div>

        {/* Footer — Admin link */}
        {isAdmin && (
          <div className="px-3 py-3 pb-8 border-t" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>
            <Link to="/admin">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-white/5 transition-all"
                style={{ color: '#fff' }}>
                <Settings className="w-4 h-4 shrink-0" style={{ color: GOLD }} />
                Admin Panel
              </div>
            </Link>
          </div>
        )}

      </div>

      <RelocationManagementModal isOpen={showRelocationModal} onClose={() => setShowRelocationModal(false)} />
      {showSendingModal && <SendingAgentModal onClose={() => setShowSendingModal(false)} />}
      {showReceivingModal && <ReceivingAgentModal onClose={() => setShowReceivingModal(false)} />}
    </aside>
  );
}