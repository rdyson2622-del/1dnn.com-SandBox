import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import DashboardServicePreviews from '@/components/dashboard/DashboardServicePreviews';

const GOLD = '#D4AF37';
const DYSON_LOGO = "/assets/dyson-logo.png";

export default function AgentLanding() {
  return (
    <div className="min-h-screen" style={{ background: '#ede0cc' }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-14 py-4"
        style={{ background: '#000', borderBottom: '1px solid rgba(212,175,55,0.12)' }}>
        <img src={DYSON_LOGO} alt="Dyson & Dyson" className="h-12 w-auto" />
        <Link to="/Home" className="flex items-center gap-2 text-sm font-semibold transition-all hover:opacity-70" style={{ color: '#fff' }}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </nav>

      {/* Hero */}
      <div className="px-6 pt-12 pb-4 text-center" style={{ background: '#0d0d0d' }}>
        <p className="text-xs font-black tracking-[0.3em] uppercase mb-2" style={{ color: GOLD }}>PRN AGENT PORTAL</p>
        <h1 className="display-heading mb-3" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', letterSpacing: '0.12em', color: '#fff' }}>
          Your Clients Full-Service Dashboard
        </h1>
        <p className="text-sm max-w-xl mx-auto mb-8" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Georgia, serif' }}>
          Every tool your referred clients use — powered by Dyson & Dyson's 55-year ecosystem.
        </p>
      </div>

      {/* Service Previews — agent view */}
      <DashboardServicePreviews heading="Your Clients Full-Service Dashboard" />
    </div>
  );
}