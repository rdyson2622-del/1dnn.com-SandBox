import React from 'react';
import RecruitingVideoAssets from '@/components/admin/recruiting/RecruitingVideoAssets';
import RecruitingMessages from '@/components/admin/recruiting/RecruitingMessages';
import RecruitingBenchmarks from '@/components/admin/recruiting/RecruitingBenchmarks';

const GOLD = '#D4AF37';

export default function AdminRecruitingBroadcast() {
  return (
    <div className="min-h-screen p-8" style={{ background: '#0a0a0a' }}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <p className="text-xs font-black tracking-[0.3em] uppercase mb-2" style={{ color: GOLD }}>
            DNN NEWS & MEDIA
          </p>
          <h1 className="text-2xl md:text-3xl font-black text-white mb-2"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Agent Recruiting Broadcast
          </h1>
          <p className="text-sm max-w-2xl leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Reuse the Vetting Desk video content across social media, agent recruiting messages,
            and email campaigns inviting agents to join the Dyson &amp; Dyson Relocation Network —
            with the benchmark spreadsheet attached.
          </p>
        </div>

        <RecruitingBenchmarks />
        <RecruitingVideoAssets />
        <RecruitingMessages />
      </div>
    </div>
  );
}