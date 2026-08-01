import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Home, UserCheck, BarChart3, ArrowLeft, Search,
  SendHorizontal, Flag, MessageCircle, FileText, Link as LinkIcon, ScrollText,
  ArrowRight, Fingerprint, List, Brain, AlertTriangle, ChevronDown,
  ChevronRight as ChevronRightIcon, Calendar, Video, Newspaper, Star, Package,
  Edit, Globe, Send, Shield, TrendingUp, FileCheck, DollarSign, BookOpen, Zap,
  Clapperboard, Library
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { PAGE_REGISTRY } from '@/lib/pageRegistry';
import AdminCommsBadge from '@/components/admin/AdminCommsBadge';
import AdminCharlieCard from '@/components/admin/AdminCharlieCard';

const GOLD = '#D4AF37';
const DYSON_LOGO = "/assets/dyson-logo.png";

// All collapsible section groups
const NAV_SECTIONS = [
  {
    key: 'quick_links',
    label: 'QUICK LINKS',
    children: [
      { isCommsBadge: true },
      { label: '📜 Master Referral & Relo Mgmt Agreement', path: '/admin/master-agreement', icon: ScrollText, highlight: true },
    ],
  },
  {
    key: 'marketing_prep',
    label: 'MARKETING & PREP',
    children: [
      { label: 'Search Listing Profiles', path: '/admin/search-profiles', icon: Search },
      { label: 'Skip Trace Lookup', path: '/admin/skip-trace', icon: Fingerprint },
      { label: 'Outreach Pipeline', path: '/admin/outreach-pipeline', icon: SendHorizontal },
      { label: 'Compose SMS', path: '/admin/compose-sms', icon: SendHorizontal },
      { label: 'Owner Response Board', path: '/admin/owner-kanban', icon: LayoutDashboard },
      { label: 'Batch SMS Logs', path: '/admin/batch-sms-log', icon: List },
      { label: 'Scheduled Campaigns', path: '/admin/scheduled-campaigns', icon: Calendar },
      { label: 'Video SMS Campaign', path: '/admin/video-sms-campaign', icon: Video },
      { label: 'Video Library', path: '/admin/video-library', icon: Video },
      { label: 'Outreach Analytics', path: '/admin/outreach-analytics', icon: BarChart3 },
      { label: 'SMS Sequences', path: '/admin/sms-sequences', icon: MessageCircle },
      { label: 'Agreements', isHeader: true },
      { label: '📜 Master Referral & Relo Mgmt Agreement', path: '/admin/master-agreement', icon: ScrollText, indent: true, highlight: true },
    ],
  },
  {
    key: 'pr',
    label: 'PR & MEDIA',
    children: [
      { label: 'Media CRM', path: '/admin/media-crm', icon: Newspaper },
      { label: 'Pitch Tracker', path: '/admin/pitch-tracker', icon: Star },
      { label: 'Press Kit Assets', path: '/admin/press-kit', icon: Package },
      { label: 'Mass Pitch Personalizer', path: '/admin/mass-pitch', icon: Edit },
    ],
  },
  {
    key: 'affiliate_recruiting',
    label: 'AFFILIATE RECRUITING',
    icon: Users,
    color: '#34d399',
    children: [
      { label: 'Recruiting Pipeline', path: '/admin/affiliate-recruiting', icon: Users },
      { label: '↳ Master Partner Roster', path: '/admin/roster', icon: List, indent: true },
      { label: '↳ Exodus Pitch Page', path: '/admin/exodus-pitch', icon: ArrowRight, indent: true },
      { label: '↳ Partner Benefits', path: '/admin/partner-benefits', icon: ArrowRight, indent: true },
      { label: '↳ Agent Subscribe Page', path: '/agent-subscribe', icon: Globe, indent: true },
    ],
  },
  {
    key: 'results',
    label: 'CLIENT MARKETING RESULTS',
    children: [
      { label: 'Listing Clients', path: '/admin/clients', icon: Home },
      { label: '↳ Contact Info', path: '/admin/communications', icon: MessageCircle, indent: true },
      { label: 'Private Referral Network (PRN)', isHeader: true },
      { label: 'Agents', path: '/admin/referrals', icon: UserCheck },
      { label: '↳ PRN Agent Business Plan', path: '/admin/prn-agent-plan', icon: FileText, indent: true },
      { label: '↳ Master Partner Roster', path: '/admin/roster', icon: List, indent: true },
      { label: '↳ Sending Agent Tracker', path: '/admin/sending-agents', icon: ArrowRight, indent: true },
      { label: '↳ Exodus Pitch Page', path: '/admin/exodus-pitch', icon: ArrowRight, indent: true },
      { label: '↳ Partner Benefits', path: '/admin/partner-benefits', icon: ArrowRight, indent: true },
      { label: '[Targeting] Exodus Agent Outreach', path: '/admin/exodus-outreach', icon: ArrowRight, indent: true },
      { label: '⚖ [Management] Referral Fee Agreements', path: '/admin/prn-agreements', icon: ArrowRight, indent: true, highlight: true },
      { label: '📜 Master Referral & Relo Mgmt Agreement', path: '/admin/master-agreement', icon: ScrollText, indent: true, highlight: true },
      { label: '[Tracking] Managed Referral Pipeline', path: '/admin/sending-agents', icon: ArrowRight, indent: true },
      { label: '↳ Contact Info', path: '/admin/communications', icon: MessageCircle, indent: true },
      { label: 'Lenders', path: '/admin/owners', icon: Users },
      { label: '↳ Contact Info', path: '/admin/communications', icon: MessageCircle, indent: true },
    ],
  },
  {
    key: 'relo_management',
    label: 'RELO MANAGEMENT',
    children: [
      { label: 'Relo Management Explainer', path: '/admin/relo-management', icon: Home },
    ],
  },
  {
    key: 'corporate_relo',
    label: 'CORPORATE RELO / HR',
    children: [
      { label: 'HR Explainer Videos & Guidelines', path: '/admin/corporate-relo', icon: Video },
      { label: 'Public Corporate Relo Page', path: '/corporate-relo', icon: Globe },
    ],
  },
  {
    key: 'operations',
    label: 'OPERATIONS',
    children: [
      { label: '🛡 Compliance Doc Review', path: '/admin/compliance-review', icon: FileCheck },
      { label: '🎬 Q&A Script Studio', path: '/admin/qa-script-studio', icon: Video },
      { label: 'Presentation Library', path: '/admin/presentation-library', icon: FileText },
      { label: 'Flagged Messages', path: '/admin/flagged-conversations', icon: Flag },
      { label: 'Referral Management', path: '/admin/referrals', icon: LinkIcon },
    ],
  },
  {
    key: 'dnn',
    label: 'DNN INTELLIGENCE',
    icon: Globe,
    color: '#D4AF37',
    children: [
      { label: 'DNN News', path: '/dnn-news', icon: Newspaper },
      { label: 'News Feed (Staging)', path: '/admin/dnn/news-feed', icon: Newspaper },
      { label: 'Market Data Hub', path: '/admin/dnn/market-data', icon: BarChart3 },
      { label: 'Subscriber CRM', path: '/admin/dnn/subscribers', icon: Users },
      { label: 'Communications Hub', path: '/admin/dnn/communications', icon: Send },
      { label: 'Agent Bureau (B2B)', path: '/admin/dnn/agent-bureau', icon: Shield },
      { label: 'Featured Agent Revenue', path: '/admin/dnn/revenue', icon: TrendingUp },
      { label: 'Agent Vetting Process', path: '/admin/dnn/agent-vetting', icon: FileCheck },
      { label: 'Lender Vetting Process', path: '/admin/dnn/lender-vetting', icon: DollarSign },
      { label: 'Bureau Story Hub', path: '/admin/dnn/bureau-stories', icon: BookOpen },
      { label: '🎬 DNN Studio', path: '/admin/dnn/studio', icon: Video },
      { label: '📣 Agent Recruiting Broadcast', path: '/admin/dnn/recruiting', icon: Send },
      { label: '✅ Shard 1 Script Review', path: '/admin/dnn/script-review', icon: FileCheck },
      { label: '🎬 Video Preview & Blast', path: '/admin/dnn/video-preview', icon: Video },
      { label: '📚 Daily News Library', path: '/admin/dnn/daily-library', icon: Library, highlight: true },
      { label: '🎬 Show Production Pipeline', path: '/admin/dnn/show-pipeline', icon: Clapperboard },
      { label: '⚡ HeyGen Credit Monitor', path: '/admin/heygen-credits', icon: Zap },
      { label: '📊 Production Cost Dashboard', path: '/admin/production-dashboard', icon: BarChart3 },
    ],
  },
  {
    key: 'creative_lab',
    label: 'CREATIVE LAB',
    children: [
      { label: 'New Landing Page', path: '/admin/new-landing-page', icon: Globe },
    ],
  },
  {
    key: 'agent_lender_vetting',
    label: 'AGENT VETTING & LENDER',
    children: [
      { label: 'Looking to Vette an Agent?', path: '/admin/dnn/agent-vetting', icon: Shield },
      { label: 'Looking to Select a Lender?', path: '/admin/dnn/lender-vetting', icon: DollarSign },
    ],
  },
  {
    key: 'charlie',
    label: "CHARLIE'S BRAIN",
    icon: Brain,
    color: '#A78BFA',
    children: [
      { label: 'Scripts', path: '/admin/charlie-scripts', icon: ScrollText },
      { label: 'Knowledge Base', path: '/admin/charlie-knowledge-base', icon: Brain },
      { label: "Bob's Video Answers", path: '/admin/bob-library', icon: Video },
      { label: 'Escalations', path: '/admin/charlie-escalations', icon: AlertTriangle },
      { label: 'Voice Presentation', path: '/charlie-voice', icon: MessageCircle },
    ],
  },
];

// All child paths for auto-expand detection
const getSectionPaths = (section) =>
  section.children.filter(c => c.path).map(c => c.path);

function loadOpenState() {
  try {
    const saved = localStorage.getItem('adminSidebarOpen');
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
}

function saveOpenState(state) {
  try { localStorage.setItem('adminSidebarOpen', JSON.stringify(state)); } catch {}
}

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [pageCode, setPageCode] = useState('');

  // Sections that are always open by default (never collapsed on first visit)
  const DEFAULT_OPEN = new Set(['dnn', 'dnn']);

  const [openSections, setOpenSections] = useState(() => {
    const saved = loadOpenState();
    const initial = {};
    NAV_SECTIONS.forEach(s => {
      const hasActive = getSectionPaths(s).some(p => location.pathname === p || location.pathname.startsWith(p));
      // DEFAULT_OPEN sections always start open regardless of saved state
      if (DEFAULT_OPEN.has(s.key)) {
        initial[s.key] = true;
      } else {
        initial[s.key] = saved[s.key] !== undefined ? saved[s.key] : hasActive;
      }
    });
    return initial;
  });

  const toggleSection = (key) => {
    setOpenSections(prev => {
      const next = { ...prev, [key]: !prev[key] };
      saveOpenState(next);
      return next;
    });
  };

  const { data: batchLogs = [] } = useQuery({
    queryKey: ['batchSmsLogs'],
    queryFn: () => appClient.entities.BatchSMSLog.list('-sent_at', 100),
    refetchInterval: 5000,
  });

  const handlePageJump = (e) => {
    e.preventDefault();
    if (!pageCode.trim()) return;
    const match = pageCode.toUpperCase().match(/^(\d+)([A-Z])?$/);
    if (match) {
      const pageData = PAGE_REGISTRY[match[1]];
      if (pageData) { navigate(pageData.path); setPageCode(''); return; }
    }
    const found = Object.values(PAGE_REGISTRY).find(p => p.name.toLowerCase().includes(pageCode.toLowerCase()));
    if (found) { navigate(found.path); setPageCode(''); }
  };

  const suggestions = pageCode.trim() && !/^\d/.test(pageCode)
    ? Object.entries(PAGE_REGISTRY).filter(([, p]) => p.name.toLowerCase().includes(pageCode.toLowerCase())).slice(0, 4)
    : [];

  return (
    <aside className="w-64 flex flex-col h-screen shrink-0 overflow-y-auto" style={{ background: '#000', borderRight: '1px solid rgba(212,175,55,0.12)' }}>
      {/* Logo */}
      <div className="p-6 flex items-center gap-3 shrink-0" style={{ borderBottom: '1px solid #D4AF3733' }}>
        <Link to="/home"><img src={DYSON_LOGO} alt="Dyson & Dyson" className="h-12 w-auto cursor-pointer" /></Link>
        <div>
          <p className="text-xs tracking-widest font-light" style={{ color: '#D4AF37' }}>ADMIN PANEL</p>
        </div>
      </div>

      {/* ── VIEW AS: Master Key Action Boxes ── */}
      <div className="px-3 pt-3 pb-2 shrink-0">
        <p className="text-[10px] font-black tracking-[0.2em] uppercase mb-2" style={{ color: '#D4AF37' }}>View Portal As:</p>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { label: 'D&D LANDING PAGE', role: 'landing', emoji: '🚪', path: '/' },
            { label: 'CLIENT', role: 'client', emoji: '🏠' },
            { label: 'RELOCATION AGENT', role: 'agent', emoji: '⭐' },
            { label: 'REFERRAL AGENT', role: 'referral_agent', emoji: '🤝' },
            { label: 'VENDOR', role: 'vendor', emoji: '🔧' },
            { label: 'CORP RELO HR', role: 'corporate_hr', emoji: '🏢', path: '/corporate-relo' },
          ].map(({ label, role, emoji, path }) => (
            <button
              key={role}
              onClick={() => {
                if (path) { navigate(path); return; }
                sessionStorage.setItem('dyson_role', role);
                window.dispatchEvent(new Event('dyson_role_change'));
                navigate('/dashboard');
              }}
              className="flex flex-col items-center justify-center py-2 px-1 rounded-xl text-center transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'rgba(212,175,55,0.1)',
                border: '1px solid rgba(212,175,55,0.35)',
                color: '#D4AF37',
              }}
            >
              <span className="text-lg leading-none mb-0.5">{emoji}</span>
              <span className="text-[9px] font-black tracking-[0.1em] leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Admin Dashboard — always visible */}
      <div className="px-3 pt-2 space-y-0.5">
        <Link
          to="/admin"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{
            background: location.pathname === '/admin' ? 'rgba(212,175,55,0.12)' : 'transparent',
            color: location.pathname === '/admin' ? '#D4AF37' : '#fff',
          }}
        >
          <LayoutDashboard className="w-4 h-4" />
          Admin Dashboard
        </Link>
      </div>

      {/* Business Plan — always visible */}
      <div className="px-3 pt-1 pb-2">
        <Link
          to="/admin/business-plan"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all"
          style={{
            background: location.pathname === '/admin/business-plan' ? 'rgba(212,175,55,0.2)' : 'rgba(212,175,55,0.08)',
            color: '#D4AF37',
            border: '1px solid rgba(212,175,55,0.35)',
          }}
        >
          <FileText className="w-4 h-4" />
          📋 Business Plan
        </Link>
      </div>

      {/* Collapsible Sections */}
      <nav className="py-2 px-3 space-y-0.5 flex-1">
        {NAV_SECTIONS.map(section => {
          const isOpen = openSections[section.key];
          const hasActive = getSectionPaths(section).some(p => location.pathname === p || location.pathname.startsWith(p));
          const SectionIcon = section.icon;
          const sectionColor = section.color || '#D4AF37';
          const borderColor = section.color === '#A78BFA' ? 'rgba(167,139,250,0.25)' : 'rgba(212,175,55,0.2)';

          return (
            <div key={section.key} className="mt-1">
              {/* Section Header — clickable gold toggle */}
              <button
                onClick={() => toggleSection(section.key)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all group"
                style={{ background: hasActive && !isOpen ? 'rgba(212,175,55,0.06)' : 'transparent' }}
              >
                <div className="flex items-center gap-2">
                  {SectionIcon && <SectionIcon className="w-3.5 h-3.5" style={{ color: sectionColor }} />}
                  <span className="text-xs font-bold tracking-[0.2em] truncate" style={{ color: sectionColor }}>
                    {section.label}
                  </span>
                  {hasActive && !isOpen && (
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: sectionColor }} />
                  )}
                </div>
                {isOpen
                  ? <ChevronDown className="w-3 h-3 opacity-60" style={{ color: sectionColor }} />
                  : <ChevronRightIcon className="w-3 h-3 opacity-40" style={{ color: sectionColor }} />
                }
              </button>

              {/* Section Children */}
              {isOpen && (
                <div className="mt-0.5 ml-2 pl-3 pb-1 space-y-0.5 border-l" style={{ borderColor }}>
                  {section.children.map((child, ci) => {
                    if (child.isCommsBadge) {
                      return <div key={ci} className="py-1"><AdminCommsBadge /></div>;
                    }
                    if (child.isHeader) {
                      return (
                        <div key={ci} className="px-3 pt-3 pb-1">
                          <span className="text-[10px] font-black tracking-[0.2em] uppercase" style={{ color: '#D4AF37' }}>{child.label}</span>
                        </div>
                      );
                    }
                    const isActive = location.pathname === child.path;
                    const childColor = section.color || '#D4AF37';
                    return (
                      <Link
                        key={`${child.path}-${ci}`}
                        to={child.path}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all"
                        style={{
                          background: child.highlight ? 'rgba(212,175,55,0.15)' : (isActive ? `${childColor}22` : 'transparent'),
                          color: child.highlight ? GOLD : (child.indent ? '#ffffff' : (isActive ? childColor : '#ccc')),
                          border: child.highlight ? `1px solid rgba(212,175,55,0.4)` : 'none',
                          marginLeft: child.indent ? '8px' : '0',
                          fontSize: child.indent ? '12px' : '14px',
                          paddingTop: child.indent ? '4px' : undefined,
                          paddingBottom: child.indent ? '4px' : undefined,
                          fontWeight: child.highlight ? 900 : undefined,
                        }}
                      >
                        <child.icon className="w-3 h-3 shrink-0" style={{ opacity: child.indent ? 0.5 : 1 }} />
                        <span className="truncate">{child.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Admin Charlie Card */}
      <AdminCharlieCard />

      {/* Recent Batch SMS Widget */}
      <div className="mx-3 mb-3 p-3 rounded-lg shrink-0" style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)' }}>
        <Link to="/admin/batch-sms-log" className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#D4AF37' }}>📡 Recent SMS Batches</span>
          <ArrowRight className="w-3 h-3" style={{ color: '#D4AF37' }} />
        </Link>
        <div className="space-y-2">
          {batchLogs.length > 0 ? (
            batchLogs.slice(0, 3).map(log => (
              <div key={log.id} className="text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-white truncate max-w-[110px]">{log.city || 'Unknown'}</span>
                  <span className="font-semibold ml-1 shrink-0" style={{ color: '#D4AF37' }}>✓ {log.sent_count || 0}</span>
                </div>
                <div className="text-slate-400 mt-0.5">
                  {log.sent_at ? new Date(log.sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                  {log.failed_count > 0 && <span className="text-red-400"> · {log.failed_count} failed</span>}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500">No batches sent yet</p>
          )}
        </div>
      </div>

      {/* Quick Page Jump */}
      <div className="mx-3 mb-3 relative shrink-0">
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5 text-slate-400">Quick Page Jump</p>
        <form onSubmit={handlePageJump} className="flex gap-2">
          <input
            type="text"
            value={pageCode}
            onChange={e => setPageCode(e.target.value)}
            placeholder="Page # or name…"
            className="flex-1 px-3 py-2 rounded-lg text-sm"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,175,55,0.2)', color: '#fff', outline: 'none' }}
          />
          <button type="submit" className="px-3 py-2 rounded-lg"
            style={{ background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37' }}>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
        {suggestions.length > 0 && (
          <div className="mt-1 rounded-lg overflow-hidden" style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.2)' }}>
            {suggestions.map(([num, page]) => (
              <button key={num} type="button"
                onClick={() => { navigate(page.path); setPageCode(''); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-white/5 transition-colors"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="font-black shrink-0" style={{ color: '#D4AF37' }}>#{num}</span>
                <span className="truncate text-white">{page.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Links */}
      <div className="p-3 space-y-1 pb-6 shrink-0" style={{ borderTop: '1px solid #1a1a1a' }}>
        <Link to="/gemini" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.25)' }}>
          <span className="text-base">👁️</span> Preview Client Flow
        </Link>
        <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:bg-white/5">
          <ArrowLeft className="w-4 h-4" /> Client Dashboard
        </Link>
        <Link to="/chat" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:bg-white/5">
          <MessageCircle className="w-4 h-4" /> Client Chat
        </Link>
      </div>
    </aside>
  );
}