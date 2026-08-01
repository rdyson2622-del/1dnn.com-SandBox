import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Download, ExternalLink, Mail, Phone } from 'lucide-react';

const DYSON_LOGO = "/assets/dyson-logo.png";
const GOLD = '#D4AF37';

const TYPE_ICONS = {
  press_release: '📰', headshot: '📸', logo: '🏷️', narrative: '📖',
  bio: '👤', fact_sheet: '📋', media_kit: '📦', video: '🎬', other: '📁',
};

const TYPE_LABELS = {
  press_release: 'Press Release', headshot: 'Headshot', logo: 'Logo',
  narrative: 'Narrative', bio: 'Bio', fact_sheet: 'Fact Sheet',
  media_kit: 'Media Kit', video: 'Video', other: 'Other',
};

export default function MediaRoom() {
  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['publicMediaAssets'],
    queryFn: () => appClient.entities.MediaAsset.filter({ is_public: true }, '-created_date', 100),
  });

  const grouped = assets.reduce((acc, a) => {
    const key = a.asset_type || 'other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});

  return (
    <div className="min-h-screen" style={{ background: '#080808' }}>
      {/* Hero */}
      <header className="relative overflow-hidden py-20 px-6 text-center"
        style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #111 100%)', borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
        <div className="max-w-3xl mx-auto">
          <img src={DYSON_LOGO} alt="Dyson & Dyson" className="h-16 w-auto mx-auto mb-6" />
          <p className="text-xs font-bold tracking-[0.4em] mb-3" style={{ color: GOLD }}>PRESS & MEDIA</p>
          <h1 className="text-5xl font-black text-white mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Media Room
          </h1>
          <p className="text-lg text-white">
            Everything you need to tell the Dyson & Dyson story. Download assets, read our narrative, and get in touch.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <a href="mailto:press@dysondyson.com" className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all hover:opacity-90"
              style={{ background: GOLD, color: '#000' }}>
              <Mail className="w-4 h-4" /> Contact Press Team
            </a>
            <a href="tel:+18583531200" className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all hover:bg-white/5"
              style={{ border: '1px solid rgba(212,175,55,0.4)', color: GOLD }}>
              <Phone className="w-4 h-4" /> (858) 353-1200
            </a>
          </div>
        </div>
      </header>

      {/* Quick Facts */}
      <section className="py-14 px-6" style={{ background: '#0d0d0d', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold tracking-[0.4em] text-center mb-8" style={{ color: GOLD }}>FAST FACTS</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { stat: '55+', label: 'Years in Real Estate' },
              { stat: '100%', label: 'Free to the Buyer' },
              { stat: '21', label: 'AI Assistants' },
              { stat: '1927', label: 'The Parallel Year' },
            ].map(f => (
              <div key={f.stat} className="rounded-2xl p-5 text-center"
                style={{ background: '#111', border: '1px solid rgba(212,175,55,0.15)' }}>
                <p className="text-3xl font-black" style={{ color: GOLD }}>{f.stat}</p>
                <p className="text-xs mt-1 text-white">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Assets */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold tracking-[0.4em] text-center mb-2" style={{ color: GOLD }}>DOWNLOADABLE ASSETS</p>
          <h2 className="text-3xl font-bold text-white text-center mb-10">Press Kit</h2>

          {isLoading && (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-white/10 border-t-yellow-500 rounded-full animate-spin" />
            </div>
          )}

          {Object.keys(grouped).length === 0 && !isLoading && (
            <p className="text-center py-10" style={{ color: 'rgba(255,255,255,0.3)' }}>Press kit assets coming soon.</p>
          )}

          {Object.entries(grouped).map(([type, items]) => (
            <div key={type} className="mb-10">
              <p className="text-sm font-bold mb-4" style={{ color: GOLD }}>
                {TYPE_ICONS[type]} {TYPE_LABELS[type] || type}
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map(asset => (
                  <div key={asset.id} className="rounded-2xl p-5 flex flex-col justify-between"
                    style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div>
                      <p className="font-bold text-white mb-1">{asset.title}</p>
                      {asset.description && (
                        <p className="text-xs mb-3 text-white">{asset.description}</p>
                      )}
                    </div>
                    {(asset.file_url || asset.external_url) && (
                      <a href={asset.file_url || asset.external_url} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 text-sm font-bold mt-3 transition-opacity hover:opacity-70"
                        style={{ color: GOLD }}>
                        <Download className="w-4 h-4" />
                        {asset.file_url ? 'Download' : 'View'}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* The Story */}
      <section className="py-16 px-6" style={{ background: '#0d0d0d', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold tracking-[0.4em] mb-2" style={{ color: GOLD }}>THE STORY</p>
          <h2 className="text-3xl font-bold text-white mb-6">The 1927 Parallel</h2>
          <p className="text-base leading-relaxed text-white">
            In 1927, a few visionaries saw the airplane not as a novelty, but as the future of travel. Bob Dyson sees AI-powered concierge relocation in the same light — not a gimmick, but the beginning of how families will move for the next 100 years. Completely free to the buyer. End-to-end service. Human + AI working together. This is the 1927 moment for real estate relocation.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 text-center" style={{ borderTop: '1px solid rgba(212,175,55,0.1)' }}>
        <img src={DYSON_LOGO} alt="Dyson & Dyson" className="h-10 w-auto mx-auto mb-3 opacity-60" />
        <p className="text-xs text-white">© {new Date().getFullYear()} Dyson & Dyson Concierge Relocation Services. All rights reserved.</p>
        <p className="text-xs mt-1 text-white">For media inquiries: press@dysondyson.com · (858) 353-1200</p>
      </footer>
    </div>
  );
}