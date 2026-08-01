import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Shield, Clock, MapPin, ArrowRight } from 'lucide-react';
import IntroRequestModal from '@/components/directory/IntroRequestModal';

const GOLD = '#D4AF37';

function fmt(n) {
  if (!n) return null;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function AgentPublicCard({ agent }) {
  const [showModal, setShowModal] = useState(false);
  const isPending = !agent.status || agent.status === 'pending';

  return (
    <>
      <div className="rounded-2xl overflow-hidden transition-all hover:shadow-lg"
        style={{ background: '#fff8ee', border: '1px solid rgba(212,175,55,0.3)' }}>
        {/* Header */}
        <div className="px-5 py-4 flex items-start justify-between gap-3"
          style={{ background: 'rgba(212,175,55,0.05)', borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
          <div>
            <p className="font-black text-base" style={{ color: '#1a1a1a' }}>{agent.agent_name}</p>
            {agent.brokerage && <p className="text-xs mt-0.5" style={{ color: '#6b5c45' }}>{agent.brokerage}</p>}
            {agent.rank && (
              <p className="text-[10px] font-black tracking-wide mt-1" style={{ color: GOLD }}>
                #{agent.rank} in {agent.city}
              </p>
            )}
          </div>
          {isPending ? (
            <span className="shrink-0 flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(251,191,36,0.15)', color: '#b45309', border: '1px solid rgba(251,191,36,0.4)' }}>
              <Clock className="w-3 h-3" /> Vetting Pending
            </span>
          ) : (
            <span className="shrink-0 flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(16,185,129,0.12)', color: '#059669', border: '1px solid rgba(16,185,129,0.35)' }}>
              <Shield className="w-3 h-3" /> Dyson Vetted
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="px-5 py-4 flex gap-6">
          {agent.sales_count_2025 && (
            <div className="text-center">
              <p className="font-black text-xl" style={{ color: GOLD }}>{agent.sales_count_2025}</p>
              <p className="text-[10px] font-semibold" style={{ color: '#9b8a70' }}>2025 Sales</p>
            </div>
          )}
          {agent.sales_volume_2025 && (
            <div className="text-center">
              <p className="font-black text-xl" style={{ color: GOLD }}>{fmt(agent.sales_volume_2025)}</p>
              <p className="text-[10px] font-semibold" style={{ color: '#9b8a70' }}>2025 Volume</p>
            </div>
          )}
          {agent.avg_price_point && (
            <div className="text-center">
              <p className="font-black text-xl" style={{ color: GOLD }}>{fmt(agent.avg_price_point)}</p>
              <p className="text-[10px] font-semibold" style={{ color: '#9b8a70' }}>Avg Price</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="px-5 pb-5">
          <button onClick={() => setShowModal(true)}
            className="w-full py-3 rounded-xl font-black text-sm tracking-wide flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: '#000' }}>
            Request Introduction via Dyson Relo <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-center text-[11px] mt-2" style={{ color: '#9b8a70' }}>
            Introductions are handled by the Dyson Relocation Team
          </p>
        </div>
      </div>

      {showModal && <IntroRequestModal agentName={agent.agent_name} city={agent.city} onClose={() => setShowModal(false)} />}
    </>
  );
}

export default function VettedAgentsCity() {
  const urlParams = new URLSearchParams(window.location.search);
  // Get city slug from pathname: /vetted-agents/nashville
  const pathParts = window.location.pathname.split('/');
  const citySlug = pathParts[pathParts.length - 1] || urlParams.get('city') || '';
  const cityDisplay = citySlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['vetted_partners_city', citySlug],
    queryFn: () => appClient.entities.VettedPartner.filter({ city_slug: citySlug }, 'rank', 50),
    enabled: !!citySlug,
  });

  return (
    <div className="min-h-screen" style={{ background: '#ede0cc' }}>
      {/* SEO Hero */}
      <div className="px-8 pt-12 pb-10 text-center" style={{ background: '#0d0d0d' }}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <MapPin className="w-4 h-4" style={{ color: GOLD }} />
          <p className="text-[10px] font-black tracking-[0.35em] uppercase" style={{ color: GOLD }}>
            DYSON & DYSON · VETTED DIRECTORY
          </p>
        </div>
        <h1 className="font-black mb-2"
          style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: '#fff', letterSpacing: '0.08em' }}>
          Best Real Estate Agents in {cityDisplay}
        </h1>
        <p className="text-sm max-w-xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Georgia, serif' }}>
          Dyson & Dyson independently researches, ranks, and manages introductions to top-performing agents in {cityDisplay}.
          Every inquiry is handled by our Relocation Team — never cold.
        </p>
      </div>

      {/* Agent Grid */}
      <div className="px-6 py-10 max-w-4xl mx-auto">
        {isLoading ? (
          <div className="text-center py-16" style={{ color: GOLD }}>Loading agents…</div>
        ) : agents.length === 0 ? (
          <div className="text-center py-16 rounded-2xl" style={{ background: '#fff8ee', border: '1px solid rgba(212,175,55,0.2)' }}>
            <p className="text-2xl mb-2">🗺️</p>
            <p className="font-bold text-base mb-1" style={{ color: '#1a1a1a' }}>No agents listed for {cityDisplay} yet</p>
            <p className="text-sm" style={{ color: '#6b5c45' }}>Check back soon — we're vetting partners in this market.</p>
          </div>
        ) : (
          <>
            <p className="text-xs font-black tracking-[0.25em] uppercase mb-6" style={{ color: GOLD }}>
              {agents.length} Performance Partner{agents.length !== 1 ? 's' : ''} · {cityDisplay}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {agents.map(a => <AgentPublicCard key={a.id} agent={a} />)}
            </div>
          </>
        )}

        {/* Authority footer */}
        <div className="mt-12 rounded-2xl px-6 py-6 text-center"
          style={{ background: '#111', border: `2px solid ${GOLD}` }}>
          <p className="text-xs font-black tracking-[0.25em] uppercase mb-2" style={{ color: GOLD }}>WHY DYSON & DYSON?</p>
          <p className="text-white text-sm leading-relaxed mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            We manage the 8-phase logistics of your move — not just the transaction. Our team vets, selects, and monitors agents in {cityDisplay} so you don't have to.
          </p>
          <a href="/relo-management"
            className="inline-block px-8 py-3 rounded-full font-bold text-sm"
            style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: '#000' }}>
            Learn How We Work →
          </a>
        </div>
      </div>
    </div>
  );
}