import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Loader2 } from 'lucide-react';
import QAClipCard from '@/components/admin/qastudio/QAClipCard';

const GOLD = '#D4AF37';

const FAMILIES = [
  { key: 'corporate', label: '🏢 Corporate Relo', entity: 'CorporateReloClip', fn: 'corporateReloQARender' },
  { key: 'receiving', label: '🤝 Receiving Agent', entity: 'ReceivingAgentClip', fn: 'receivingAgentQARender' },
  { key: 'vetting', label: '🛡 Vetting Desk', entity: 'VettingDeskClip', fn: 'vettingDeskQARender' },
  { key: 'roadmap', label: '🗺 Roadmap', entity: 'RoadmapClip', fn: 'roadmapQARender' },
  { key: 'dnn', label: '📡 DNN National Desk', entity: 'DnnNewsClip', fn: 'dnnNewsRender' },
];

const KIND_ORDER = { intro: 0, qa: 1, outro: 2 };

export default function AdminQAScriptStudio() {
  const [tab, setTab] = useState('corporate');
  const family = FAMILIES.find(f => f.key === tab);

  const { data: clips = [], isLoading, refetch } = useQuery({
    queryKey: ['qaStudio', family.entity],
    queryFn: () => appClient.entities[family.entity].list(),
  });

  const sorted = [...clips].sort((a, b) =>
    (KIND_ORDER[a.kind] - KIND_ORDER[b.kind]) || ((a.faqIndex ?? 0) - (b.faqIndex ?? 0))
  );

  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: '#0a0a0a' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-black text-white">🎬 Q&A Script Studio</h1>
        <p className="text-sm text-slate-400 mt-1 mb-2">
          Edit, approve, and render Charlie &amp; Bob Q&amp;A scripts. Editing never triggers a render —
          rendering requires an approved script and an explicit Render click, and consumes HeyGen credits.
        </p>
        <p className="text-xs mb-6" style={{ color: GOLD }}>
          Completed videos are never replaced unless you explicitly Re-render a clip.
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {FAMILIES.map(f => (
            <button key={f.key} onClick={() => setTab(f.key)}
              className="px-4 py-2 rounded-full text-xs font-bold transition-all"
              style={{
                background: tab === f.key ? GOLD : 'rgba(212,175,55,0.1)',
                color: tab === f.key ? '#000' : GOLD,
                border: '1px solid rgba(212,175,55,0.4)',
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: GOLD }} />
          </div>
        ) : sorted.length === 0 ? (
          <p className="text-sm text-slate-400 py-8">No clips found for this section yet.</p>
        ) : (
          <div className="space-y-4">
            {sorted.map(clip => (
              <QAClipCard key={clip.id} clip={clip} entityName={family.entity}
                functionName={family.fn} onRefresh={refetch} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}