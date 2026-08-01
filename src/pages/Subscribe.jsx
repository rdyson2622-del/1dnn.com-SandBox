import React from 'react';
import PortalSubscribeForm from '@/components/portal/PortalSubscribeForm';

const GOLD = '#D4AF37';
const DYSON_LOGO = "/assets/dyson-logo.png";

export default function Subscribe() {
  return (
    <div className="min-h-full flex flex-col items-center px-6 py-10 pb-20" style={{ background: '#ede0cc' }}>
      <img src={DYSON_LOGO} alt="Dyson & Dyson" className="h-14 w-auto mb-6" />
      <p className="text-xs font-black tracking-[0.3em] uppercase mb-3 text-center" style={{ color: GOLD }}>
        DYSON &amp; DYSON · FREE SUBSCRIPTION
      </p>
      <h1 className="text-center mb-4" style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: 'clamp(1.8rem, 4.5vw, 2.75rem)',
        fontWeight: 600,
        color: '#000',
        lineHeight: 1.2,
        maxWidth: '620px'
      }}>
        Stay Ahead of Every Real Estate Move
      </h1>
      <p className="text-center text-base mb-10" style={{ color: '#1a1a1a', maxWidth: '520px' }}>
        Subscribe free and get the Dyson News Network morning brief at 6 AM, real estate alerts, and personalized solutions — plus direct messaging with your Dyson &amp; Dyson team. No cost, unsubscribe anytime.
      </p>
      <div className="w-full max-w-2xl">
        <PortalSubscribeForm portalName="Dyson Client Network" source="Subscribe Page" roleKey="client" dest="/home" />
      </div>
    </div>
  );
}