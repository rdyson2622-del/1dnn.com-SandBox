import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, GraduationCap, DollarSign, Heart, TreePine, MapPin,
  ChevronDown, ChevronUp, Clock, ArrowRight, Sparkles
} from 'lucide-react';

const GOLD = '#D4AF37';

const categories = [
  {
    key: 'neighborhoods',
    label: 'Neighborhoods',
    icon: Building2,
    color: 'bg-blue-500',
    preview: 'Personalized breakdown of communities matching your lifestyle — school zones, commute times, walkability scores, and local character.',
    why: 'Generic neighborhood data misleads families. We wait until we know your price range, school priorities, and commute needs so every recommendation is actually relevant to you.',
  },
  {
    key: 'schools',
    label: 'Schools & Education',
    icon: GraduationCap,
    color: 'bg-emerald-500',
    preview: 'Full analysis of public, charter, and private school options near your shortlisted neighborhoods — ratings, enrollment windows, special programs.',
    why: 'School quality varies block by block. Without knowing your target area, we\'d be giving you data for schools 20 miles from where you\'ll actually live.',
  },
  {
    key: 'cost',
    label: 'Cost of Living',
    icon: DollarSign,
    color: 'bg-amber-500',
    preview: 'Side-by-side comparison of your current city vs. your destination — property taxes, utility averages, grocery costs, neighborhood-specific HOA ranges.',
    why: 'Cost of living is meaningless without a specific zip code and home price. We tie this to your budget and target listings so the numbers are real.',
  },
  {
    key: 'healthcare',
    label: 'Healthcare',
    icon: Heart,
    color: 'bg-red-500',
    preview: 'Major hospital systems, specialist networks, urgent care locations, and insurance network coverage near your target neighborhoods.',
    why: 'Healthcare needs are personal. Once we know where you\'re looking, we map providers to your location.',
  },
  {
    key: 'recreation',
    label: 'Parks & Recreation',
    icon: TreePine,
    color: 'bg-green-500',
    preview: 'Parks, trails, fitness centers, sports leagues, and family activities near your target area — curated to match your intake priorities.',
    why: 'Recreation that matters to your family depends on where you\'ll actually live. A trail 30 minutes away isn\'t a benefit.',
  },
  {
    key: 'culture',
    label: 'Local Culture & Dining',
    icon: MapPin,
    color: 'bg-purple-500',
    preview: 'Restaurants, community events, religious communities, arts scenes, and local character for the neighborhoods you\'re seriously considering.',
    why: 'Culture varies enormously by neighborhood. Downtown Austin is nothing like Cedar Park. We match this to where you\'re actually moving.',
  },
];

export default function CityGuideTeaser() {
  const [expandedCard, setExpandedCard] = useState(null);

  return (
    <section className="py-20 px-6 md:px-14" style={{ background: '#6b6b6b', borderTop: '1px solid rgba(212,175,55,0.15)' }}>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-bold tracking-[0.3em] mb-3" style={{ color: GOLD }}>COMING FOR YOU — AFTER YOU COMMIT</p>
          <h2 className="display-heading mb-4" style={{
            lineHeight: 1.2,
            letterSpacing: '0.28em',
            color: '#fff'
          }}>
            <span style={{ fontSize: 'clamp(1.35rem, 3vw, 2.625rem)' }}>Your Personal</span><br />
            <span className="gold-text-gradient" style={{ fontSize: 'clamp(1.17rem, 2.6vw, 2.275rem)' }}>City Intelligence Guide</span>
          </h2>
          <p className="text-base max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Once you've selected your agent and signed your Buyer Broker Agreement, Charlie unlocks a
            hyper-personalized research guide across 6 categories — all tied to <em>your</em> specific
            neighborhoods, budget, and priorities. Here's a preview of what's waiting for you.
          </p>
        </div>

        {/* Category Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl overflow-hidden"
              style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.2)' }}
            >
              <div className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl ${cat.color} text-white flex items-center justify-center shrink-0`}>
                    <cat.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold mb-1" style={{ color: '#fff', fontSize: '1.425rem' }}>{cat.label}</h3>
                    <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>{cat.preview}</p>
                  </div>
                </div>

                {/* Why we wait — expandable */}
                <button
                  onClick={() => setExpandedCard(expandedCard === cat.key ? null : cat.key)}
                  className="flex items-center gap-1 font-semibold transition-colors"
                  style={{ color: expandedCard === cat.key ? GOLD : 'rgba(255,255,255,0.35)', fontSize: '0.875rem' }}
                >
                  {expandedCard === cat.key ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  Why we personalize this
                </button>
                <AnimatePresence>
                  {expandedCard === cat.key && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-2 pl-3 leading-relaxed border-l-2"
                        style={{ borderColor: GOLD, color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem' }}>
                        {cat.why}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Unlock tag */}
              <div className="px-5 py-2.5 flex items-center gap-1.5 border-t"
                style={{ borderColor: 'rgba(212,175,55,0.15)', background: 'rgba(212,175,55,0.05)' }}>
                <Clock className="w-3 h-3" style={{ color: GOLD }} />
                <span className="font-semibold" style={{ color: 'rgba(212,175,55,0.8)', fontSize: '0.875rem' }}>
                  Unlocks after agent selection + Buyer Broker Agreement
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* How it unlocks strip */}
        <div className="rounded-2xl p-6 mb-8" style={{ background: '#1a1a1a', border: `1px solid rgba(212,175,55,0.25)` }}>
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="w-4 h-4" style={{ color: GOLD }} />
            <p className="font-bold tracking-[0.3em]" style={{ color: GOLD, fontSize: '0.875rem' }}>HOW FULL ACCESS UNLOCKS</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: MapPin, label: 'Neighborhood Identified', desc: 'We know which area you\'re targeting' },
              { icon: GraduationCap, label: 'Priorities Confirmed', desc: 'Schools, commute, lifestyle mapped' },
              { icon: Building2, label: 'Agent Selected', desc: 'Your local expert is in place' },
              { icon: Sparkles, label: 'Buyer Broker Signed', desc: 'Full access unlocks immediately' },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center mx-auto mb-2"
                  style={{ borderColor: 'rgba(212,175,55,0.4)', background: 'rgba(212,175,55,0.08)' }}>
                  <step.icon className="w-4 h-4" style={{ color: GOLD }} />
                </div>
                <p className="font-bold leading-snug mb-0.5" style={{ color: '#fff', fontSize: '0.875rem' }}>{step.label}</p>
                <p className="leading-snug" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="mb-5" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>
            Start your relocation profile and unlock personalized city intelligence when the time is right.
          </p>
          <Link to="/RelocationIntake">
            <button className="gold-btn px-8 py-3 rounded-full text-sm font-bold tracking-wide flex items-center gap-2 mx-auto">
              Start My Relocation — Unlock City Guide <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

      </div>
    </section>
  );
}