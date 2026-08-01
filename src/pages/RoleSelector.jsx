import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Star, Handshake, Wrench, Building2 } from 'lucide-react';
import { appClient } from '@/api/appClient';

const GOLD = '#D4AF37';
const DYSON_LOGO = "/assets/dyson-logo.png";
const DNN_LOGO = '/assets/dnn-logo.png';
const INTEL_LOGO = '/assets/intelligence-logo.png';
const STUDIO_BG = '/assets/studio-bg.png';

const PATHS = [
  {
    icon: Home,
    label: 'I am an Existing or Potential Client',
    sub: 'Full relocation management, real estate answers, city guides, and concierge service — always free to you.',
    badge: 'CLIENT CONCIERGE',
    dest: '/home',
    roleKey: 'client',
    featured: true,
  },
  {
    icon: Star,
    label: 'I am an Active Real Estate Agent or Broker',
    sub: 'Join our vetted national network and receive managed, pre-qualified relocation clients.',
    badge: 'RELOCATION AGENT NETWORK',
    dest: '/find-agent',
    roleKey: 'agent',
  },
  {
    icon: Handshake,
    label: 'I am an Inactive but licensed Real Estate Agent or Broker',
    sub: 'Send us your out-of-state client. We manage everything — your 25% referral fee is protected.',
    badge: 'REFERRAL AGENT NETWORK',
    dest: '/partner-benefits',
    roleKey: 'referral_agent',
  },
  {
    icon: Wrench,
    label: 'I am a Real Estate Vendor',
    sub: 'Movers, inspectors, contractors, and service providers supporting our relocations.',
    badge: 'VENDOR UTILITY',
    dest: '/search',
    roleKey: 'vendor',
  },
  {
    icon: Building2,
    label: 'I am a Corporate Relocation / HR Manager',
    sub: 'White-glove employee relocation with zero management fees. See how the model works.',
    badge: 'CORPORATE RELO / HR',
    dest: '/corporate-relo',
    roleKey: 'hr',
  },
];

const PORTAL_DESTS = Object.fromEntries(PATHS.map(path => [path.roleKey, path.dest]));

export default function RoleSelector() {
  const navigate = useNavigate();
  const [assignedRole, setAssignedRole] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [accessReady, setAccessReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem('dyson_portal')); } catch {}

    appClient.auth.me().then(user => {
      const admin = user?.role === 'admin';
      const assigned = admin ? null : (user?.portal_role || saved?.roleKey || null);
      setIsAdmin(admin);
      setAssignedRole(assigned);
      if (assigned) {
        sessionStorage.setItem('dyson_role', assigned);
        window.dispatchEvent(new Event('dyson_role_change'));
      }
      setAccessReady(true);
      if (!params.get('choose') && assigned) {
        navigate(PORTAL_DESTS[assigned] || saved?.dest || '/home', { replace: true });
      }
    }).catch(() => {
      const assigned = saved?.roleKey || null;
      setAssignedRole(assigned);
      setAccessReady(true);
      if (!params.get('choose') && assigned) navigate(PORTAL_DESTS[assigned], { replace: true });
    });
  }, [navigate]);

  const handleSelect = (path) => {
    const selected = !isAdmin && assignedRole
      ? PATHS.find(item => item.roleKey === assignedRole)
      : path;
    sessionStorage.setItem('dyson_role', selected.roleKey);
    window.dispatchEvent(new Event('dyson_role_change'));
    navigate(selected.dest);
  };

  const visiblePaths = isAdmin || !assignedRole
    ? PATHS
    : PATHS.filter(path => path.roleKey === assignedRole);

  if (!accessReady) return <div className="min-h-screen bg-black" />;

  return (
    <div className="bg-black">
      {/* ── Hero: DNN Studio backdrop, full screen, clean ── */}
      <section
        className="relative h-screen"
        style={{
          backgroundImage: `url('${STUDIO_BG}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />

        {/* Three pills — direct routing to News / Relocation / Intelligence */}
        <div className="absolute left-0 right-0 flex items-center justify-center gap-8 md:gap-16 px-6"
          style={{ bottom: '18%' }}>
          {[
            { word: 'News', dest: '/broadcast-show', sub: "Today's Clips" },
            { word: 'Relocation', dest: '/relo-management', sub: 'Free Access' },
            { word: 'Intelligence', dest: '/real-estate-answers', sub: 'Tell Your Story' },
          ].map((pill) => (
            <button
              key={pill.word}
              onClick={() => navigate(pill.dest)}
              className="flex flex-col items-center justify-center px-6 md:px-8 py-2 rounded-full transition-all duration-300 ease-out hover:-translate-y-1 hover:opacity-90 cursor-pointer group"
              style={{
                background: 'linear-gradient(135deg, rgba(212,180,106,0.12) 0%, rgba(212,180,106,0.04) 100%)',
                border: '1px solid rgba(212,180,106,0.45)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)',
                minWidth: '7rem',
                maxWidth: '12rem',
                height: '3.25rem',
              }}
            >
              <span
                className="uppercase whitespace-nowrap"
                style={{
                  color: '#d4b46a',
                  fontFamily: 'Cormorant Garamond, serif',
                  fontWeight: 500,
                  letterSpacing: '0.25em',
                  fontSize: pill.word.length > 6 ? '1.15rem' : '1.5rem',
                }}
              >
                {pill.word}
              </span>
              <span
                className="text-[8px] tracking-[0.2em] uppercase mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity"
                style={{ color: '#d4b46a' }}
              >
                {pill.sub}
              </span>
            </button>
          ))}
        </div>

        <div className="absolute left-0 right-0 flex flex-col items-center px-6" style={{ bottom: '6%' }}>
          <p className="text-xl md:text-2xl text-center whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Cormorant Garamond, serif' }}>
            {assignedRole && !isAdmin
              ? 'Return to your subscribed portal below.'
              : 'Select your path below and your experience will be tailored exclusively to your needs.'}
          </p>
        </div>
      </section>

      {/* ── Path Selection ── */}
      <section className="flex flex-col items-center px-6 pt-2 pb-8 bg-black">

        <div className="w-full max-w-7xl grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {visiblePaths.map((path, i) => {
            const Icon = path.icon;
            return (
              <button
                key={i}
                onClick={() => handleSelect(path)}
                className="group flex flex-col items-start text-left p-5 rounded-2xl transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl"
                style={{
                  background: path.featured
                    ? 'linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0.05) 100%)'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
                  border: `1px solid ${path.featured ? 'rgba(212,175,55,0.55)' : 'rgba(255,255,255,0.22)'}`,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4 transition-all"
                  style={{ background: 'rgba(212,175,55,0.12)', border: `1px solid rgba(212,175,55,0.3)` }}>
                  <Icon className="w-4 h-4" style={{ color: GOLD }} />
                </div>

                <span className="text-[8px] font-black tracking-[0.2em] uppercase mb-2" style={{ color: GOLD }}>
                  {path.badge}
                </span>

                <h2 className="text-white font-bold leading-snug mb-3"
                  style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.05rem' }}>
                  {path.label}
                </h2>

                <p className="text-[11px] leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {path.sub}
                </p>

                <div className="mt-auto flex items-center gap-2 text-[11px] font-bold transition-all group-hover:gap-3"
                  style={{ color: GOLD }}>
                  Enter <span>→</span>
                </div>
              </button>
            );
          })}
        </div>

        <p className="mt-8 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Dyson &amp; Dyson · 55 Years of Relocation Management
        </p>

        {/* Three-logo footer row */}
        <div className="mt-6 flex items-center justify-center gap-16 md:gap-32">
          <img src={DNN_LOGO} alt="DNN" className="w-auto object-contain" style={{ height: '60px' }} />
          <img src={DYSON_LOGO} alt="Dyson & Dyson" className="w-auto object-contain" style={{ height: '60px' }} />
          <img src={INTEL_LOGO} alt="Real Estate Intelligence" className="w-auto object-contain" style={{ height: '120px' }} />
        </div>
      </section>
    </div>
  );
}