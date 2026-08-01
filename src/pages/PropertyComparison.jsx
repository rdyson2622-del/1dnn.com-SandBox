import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { motion } from 'framer-motion';
import { Plus, Home, ChevronDown } from 'lucide-react';
import AddPropertyModal from '@/components/cityguide/AddPropertyModal';
import PropertyComparisonCard from '@/components/cityguide/PropertyComparisonCard';
import SamplePropertyCard from '@/components/cityguide/SamplePropertyCard';

const GOLD = '#D4AF37';

const SAMPLE_PROPERTIES = [
  {
    id: 's1',
    address: '4821 Sundial Court',
    city: 'Scottsdale',
    state: 'AZ',
    price: 689000,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2480,
    client_rating: 4,
    fit_score: 87,
    isTopPick: true,
    photo_url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80',
    gemini_summary: 'Strong overall match. Excellent school district, walkable neighborhood, and well within budget. The commute to downtown is under 20 minutes. Top recommendation.',
    research: {
      neighborhoods: { score: 5, notes: 'Quiet cul-de-sac in a master-planned community. Very family-friendly, low crime, strong HOA maintains property values.' },
      schools: { score: 5, notes: 'Zoned for Scottsdale Unified — A-rated elementary and high school within 1 mile. Outstanding test scores.' },
      cost_of_living: { score: 4, notes: 'HOA is $180/mo. Property taxes moderate at 0.6%. Grocery and dining costs typical for Scottsdale.' },
      healthcare: { score: 4, notes: 'HonorHealth Scottsdale is 3.2 miles away. Multiple specialty clinics nearby. Excellent coverage.' },
      recreation: { score: 5, notes: 'McDowell Mountain Regional Park 8 min drive. Multiple golf courses nearby. Community pool on-site.' },
      local_character: { score: 4, notes: 'Upscale suburban feel with strong community events. Farmers market every Saturday. Dog-friendly.' },
    },
  },
  {
    id: 's2',
    address: '1103 Mesquite Ridge Rd',
    city: 'Gilbert',
    state: 'AZ',
    price: 574000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 2100,
    client_rating: 3,
    fit_score: 72,
    isTopPick: false,
    photo_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    gemini_summary: 'Solid value pick. Slightly longer commute but lower price point and newer construction. Worth keeping as a strong backup.',
    research: {
      neighborhoods: { score: 3, notes: 'Newer subdivision, still growing. Feels a bit sparse but infrastructure improving rapidly.' },
      schools: { score: 4, notes: 'Higley USD — solid B+ rated schools. Less prestigious than Scottsdale Unified but very acceptable.' },
      cost_of_living: { score: 5, notes: 'Best value on the list. Lower HOA ($95/mo), newer appliances mean fewer repairs expected.' },
      healthcare: { score: 3, notes: 'Nearest hospital is 7 miles. Adequate for routine care but further in an emergency.' },
      recreation: { score: 3, notes: 'Riparian Preserve at Water Ranch is a gem nearby. Limited trail access compared to Scottsdale.' },
      local_character: { score: 3, notes: 'Younger families, still establishing community identity. Less dining/entertainment nearby.' },
    },
  },
  {
    id: 's3',
    address: '2299 Camelback Vista Dr',
    city: 'Phoenix',
    state: 'AZ',
    price: 810000,
    bedrooms: 4,
    bathrooms: 3.5,
    sqft: 3100,
    client_rating: 2,
    fit_score: 61,
    isTopPick: false,
    photo_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
    gemini_summary: 'Beautiful home but over budget and the commute is challenging. Schools are average for the price point. Consider eliminating unless location is a priority.',
    research: {
      neighborhoods: { score: 4, notes: 'Prestigious Camelback corridor. Beautiful streetscapes. However, traffic on Camelback Rd is significant.' },
      schools: { score: 3, notes: 'Phoenix Union district — mixed results. Would need private school budget if schools are a priority.' },
      cost_of_living: { score: 2, notes: 'At top of budget. High property taxes, significant HOA fees. Leaves little financial buffer.' },
      healthcare: { score: 5, notes: 'Mayo Clinic is 10 min away. Best healthcare access on the list.' },
      recreation: { score: 4, notes: 'Camelback Mountain hiking access is world-class. Upscale gym and spa options throughout area.' },
      local_character: { score: 4, notes: 'Vibrant urban-suburban blend. Excellent restaurants, arts scene, and nightlife if relevant.' },
    },
  },
];

export default function PropertyComparison() {
  const [clientId, setClientId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const queryClient = useQueryClient();
  const myPropertiesRef = useRef(null);
  const examplesRef = useRef(null);

  useEffect(() => {
    appClient.auth.me().then(user => {
      if (user?.email) {
        appClient.entities.RelocationClient.filter({ email: user.email }, '-created_date', 1).then(clients => {
          if (clients.length > 0) setClientId(clients[0].id);
        });
      }
    });
  }, []);

  const { data: properties = [] } = useQuery({
    queryKey: ['property-candidates', clientId],
    queryFn: () => appClient.entities.PropertyCandidate.filter({ client_id: clientId }, '-created_date', 20),
    enabled: !!clientId,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['property-candidates', clientId] });

  const topPicks = properties.filter(p => p.status === 'top_pick');
  const considering = properties.filter(p => p.status === 'considering');
  const eliminated = properties.filter(p => p.status === 'eliminated');

  const scrollToExamples = () => examplesRef.current?.scrollIntoView({ behavior: 'smooth' });
  const scrollToMyProperties = () => myPropertiesRef.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen" style={{ background: '#808080' }}>
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* ── HEADER ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <p className="text-sm font-black tracking-[0.25em] mb-3" style={{ color: GOLD }}>MOST PROBABLE PROPERTIES</p>
          <h1 className="display-heading mb-3" style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2.6rem)', color: '#fff' }}>My Property Comparison</h1>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Add homes you've toured. Our team (and Gemini) will research each one across all 6 categories so you can decide with confidence.
          </p>
          {clientId && (
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold"
                style={{ background: GOLD, color: '#000' }}>
                <Plus className="w-4 h-4" /> Add a Property
              </button>
              <button
                onClick={scrollToMyProperties}
                className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}>
                My Saved Properties
              </button>
            </div>
          )}
        </motion.div>

        {/* ── HOW IT WORKS EXPLAINER (always visible) ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-3xl mx-auto mb-6">
          <div className="rounded-2xl p-8" style={{ background: '#1a1a1a', border: `1px solid rgba(212,175,55,0.25)` }}>
            <p className="text-xs font-bold tracking-[0.25em] mb-6 text-center" style={{ color: GOLD }}>HOW THIS TOOL WORKS</p>
            <div className="grid sm:grid-cols-3 gap-6 mb-8">
              {[
                { step: '1', icon: '🏠', title: "Add Homes You've Toured", desc: 'Save any property you\'re considering — paste the address or MLS link.' },
                { step: '2', icon: '🔬', title: 'We Research Each One', desc: 'Our team runs deep Gemini AI research across 6 key categories for every property.' },
                { step: '3', icon: '✅', title: 'Compare & Decide', desc: 'Side-by-side scores for neighborhoods, schools, cost of living, healthcare, recreation & more.' },
              ].map(({ step, icon, title, desc }) => (
                <div key={step} className="text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl"
                    style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)' }}>
                    {icon}
                  </div>
                  <p className="text-xs font-bold tracking-widest mb-1" style={{ color: GOLD }}>STEP {step}</p>
                  <p className="text-sm font-bold text-white mb-1">{title}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{desc}</p>
                </div>
              ))}
            </div>

            {/* 6 categories */}
            <div className="rounded-xl p-4 mb-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-bold tracking-widest text-center mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>6 RESEARCH CATEGORIES PER PROPERTY</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                {['📍 Neighborhood', '🏫 Schools', '💰 Cost of Living', '🏥 Healthcare', '🌳 Recreation', '🏘️ Local Character'].map(cat => (
                  <div key={cat} className="text-xs py-2 px-1 rounded-lg" style={{ background: 'rgba(212,175,55,0.08)', color: 'rgba(255,255,255,0.7)' }}>
                    {cat}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <button onClick={scrollToExamples}
                className="flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold mx-auto"
                style={{ background: GOLD, color: '#000' }}>
                See Example Properties <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── EXAMPLE PROPERTIES ── */}
        <div ref={examplesRef}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-4 text-center">
            <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest mb-4"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
              EXAMPLE — THIS IS WHAT YOUR COMPARISON LOOKS LIKE
            </div>
            <h2 className="text-xl font-bold text-white mb-1">3 Sample Homes — Arizona Relocation</h2>
            <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Try clicking the stars to rate a home, and "See Research" to expand the Dyson findings.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {SAMPLE_PROPERTIES.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
                <SamplePropertyCard property={p} />
              </motion.div>
            ))}
          </div>

          {/* CTA after examples */}
          <div className="text-center mb-16">
            {clientId ? (
              <button onClick={scrollToMyProperties}
                className="flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold mx-auto"
                style={{ background: GOLD, color: '#000' }}>
                Go to My Properties ↓
              </button>
            ) : (
              <div className="max-w-md mx-auto rounded-2xl p-6 text-center"
                style={{ background: '#1a1a1a', border: `1px solid rgba(212,175,55,0.3)` }}>
                <p className="text-sm font-bold text-white mb-2">Ready to use this for your own search?</p>
                <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>Complete your relocation profile to unlock your personal property comparison tool.</p>
                <Link to="/RelocationIntake">
                  <button className="px-8 py-3 rounded-full text-sm font-bold" style={{ background: GOLD, color: '#000' }}>
                    Start My Profile to Unlock →
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── MY REAL PROPERTIES (enrolled clients only) ── */}
        {clientId && (
          <div ref={myPropertiesRef}>
            {/* Section Header */}
            <div className="rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              style={{ background: 'linear-gradient(135deg, #1a1400, #0d0d0d)', border: `2px solid ${GOLD}` }}>
              <div>
                <p className="text-xs font-bold tracking-[0.25em] mb-1" style={{ color: GOLD }}>MY COMPARISON BOARD</p>
                <h2 className="text-xl font-bold text-white">Your Saved Properties</h2>
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {properties.length === 0
                    ? 'No properties added yet — start adding homes you\'ve toured.'
                    : `${properties.length} propert${properties.length === 1 ? 'y' : 'ies'} saved · ${topPicks.length} top pick${topPicks.length !== 1 ? 's' : ''} · ${considering.length} considering · ${eliminated.length} eliminated`
                  }
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold shrink-0"
                style={{ background: GOLD, color: '#000' }}>
                <Plus className="w-4 h-4" /> Add Property
              </button>
            </div>

            {properties.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background: 'rgba(212,175,55,0.1)', border: `2px solid rgba(212,175,55,0.3)` }}>
                  <Home className="w-10 h-10" style={{ color: GOLD }} />
                </div>
                <p className="text-xs font-bold tracking-widest mb-3" style={{ color: GOLD }}>NO PROPERTIES SAVED YET</p>
                <h2 className="text-xl font-bold mb-2" style={{ color: '#fff' }}>Start Adding Homes You Tour</h2>
                <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  After each home tour, add it here. Our team will run Gemini research across all 6 categories so you can compare with confidence.
                </p>
                <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-7 py-3 rounded-full text-sm font-bold mx-auto" style={{ background: GOLD, color: '#000' }}>
                  <Plus className="w-4 h-4" /> Add My First Property
                </button>
              </motion.div>
            ) : (
              <>
                {/* Top Picks */}
                {topPicks.length > 0 && (
                  <section className="mb-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-px flex-1" style={{ background: 'rgba(212,175,55,0.3)' }} />
                      <p className="text-xs font-bold tracking-widest px-3" style={{ color: GOLD }}>⭐ TOP PICKS</p>
                      <div className="h-px flex-1" style={{ background: 'rgba(212,175,55,0.3)' }} />
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {topPicks.map((p, i) => (
                        <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                          <PropertyComparisonCard property={p} rank={i + 1} onRefresh={refresh} onDelete={refresh} />
                        </motion.div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Considering */}
                {considering.length > 0 && (
                  <section className="mb-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.1)' }} />
                      <p className="text-xs font-bold tracking-widest px-3" style={{ color: 'rgba(255,255,255,0.5)' }}>CONSIDERING</p>
                      <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.1)' }} />
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {considering.map((p, i) => (
                        <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                          <PropertyComparisonCard property={p} rank={topPicks.length + i + 1} onRefresh={refresh} onDelete={refresh} />
                        </motion.div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Eliminated */}
                {eliminated.length > 0 && (
                  <section className="mb-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
                      <p className="text-xs font-bold tracking-widest px-3" style={{ color: 'rgba(255,255,255,0.25)' }}>ELIMINATED</p>
                      <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 opacity-50">
                      {eliminated.map(p => (
                        <PropertyComparisonCard key={p.id} property={p} onRefresh={refresh} onDelete={refresh} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Add more */}
                <div className="text-center mt-6 pb-10">
                  <button onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold mx-auto"
                    style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', color: GOLD }}>
                    <Plus className="w-4 h-4" /> Add Another Property
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {showAddModal && clientId && (
          <AddPropertyModal
            clientId={clientId}
            onClose={() => setShowAddModal(false)}
            onAdded={refresh}
          />
        )}
      </div>
    </div>
  );
}