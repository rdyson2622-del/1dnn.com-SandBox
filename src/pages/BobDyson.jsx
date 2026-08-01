import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { CORPORATE_PROFILE } from '../lib/corporateProfile';
import BobDysonCharlieCircle from '@/components/charlie/BobDysonCharlieCircle';

const GOLD = '#D4AF37';
const DYSON_LOGO = "/assets/dyson-logo.png";

export default function BobDyson() {
  return (
    <div className="min-h-screen py-16 px-6 md:px-14" style={{ background: '#ede0cc', color: '#1a1a1a' }}>
      <div className="max-w-7xl mx-auto">
        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm mb-10" style={{ color: 'rgba(26,26,26,0.5)' }}>
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-14 md:pr-48">
          <p className="text-xs font-bold tracking-[0.3em] mb-4" style={{ color: GOLD }}>BACKED BY EXPERIENCE</p>
          <h1 className="display-heading mb-4 whitespace-nowrap" style={{ fontSize: 'clamp(1.48rem, 3.28vw, 2.62rem)', letterSpacing: '0.22em', color: '#1a1a1a' }}>
            THE DYSON & DYSON COMPANIES
          </h1>
          <h2 className="display-heading" style={{ fontSize: 'clamp(1.08rem, 2.7vw, 1.98rem)', letterSpacing: '0.18em', color: GOLD }}>
            55 Years, 1000+ Properties, 1600+ Office Network
          </h2>
        </motion.div>

        {/* Bio Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="rounded-2xl p-8 mb-8"
          style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.25)' }}
        >
          <p className="text-base leading-relaxed mb-4" style={{ color: '#ffffff' }}>
            Bob Dyson began his career as a corporate jet pilot and Chief Pilot for the Governor of Oklahoma at age 20. He strategically acquired over 1,000 properties across multiple states while building Red Carpet Corporation of America, establishing a legacy of managing 1,600+ offices nationwide.
          </p>
          <p className="text-base leading-relaxed mb-4" style={{ color: '#ffffff' }}>
            That foundation of expertise — refined over 55+ years — is what Dyson & Dyson brings to every client today. After selling the company, Bob founded Dyson & Dyson Concierge Relocation Services and established Dyson News Network (DNN), which delivers real estate intelligence to millions.
          </p>
          <p className="text-base leading-relaxed mb-6" style={{ color: '#ffffff' }}>
            Today, he leads a team combining hands-on real estate expertise with cutting-edge AI to serve families nationwide.
          </p>
          <blockquote className="text-sm italic leading-relaxed" style={{ color: GOLD, borderLeft: `3px solid ${GOLD}`, paddingLeft: '1rem' }}>
            "{CORPORATE_PROFILE.bobsDedication}"
          </blockquote>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-xl font-semibold mb-10"
          style={{ color: '#4a4a4a' }}
        >
          <span style={{ color: GOLD }}>At The Dyson & Dyson Companies:</span> We don't sell real estate. We manage your entire move.
        </motion.p>

        {/* CTA */}
        <div className="text-center">
          <Link to="/RelocationIntake">
            <button className="gold-btn px-8 py-3 rounded-full text-sm font-bold tracking-wide inline-flex items-center gap-2">
              Let's Plan My Relocation Move <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
      {/* Charlie circle — Bob Dyson story */}
      <BobDysonCharlieCircle />
    </div>
  );
}