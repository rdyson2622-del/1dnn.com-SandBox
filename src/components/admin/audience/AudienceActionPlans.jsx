import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GOLD = '#D4AF37';

const ACTION_TYPES = {
  outreach_campaign: 'Outreach Campaign',
  nurture_sequence: 'Nurture Sequence',
  lead_scoring: 'Lead Scoring',
  data_enrichment: 'Data Enrichment',
  list_refinement: 'List Refinement',
  conversion_push: 'Conversion Push',
  retention: 'Retention',
  other: 'Other'
};

export default function AudienceActionPlans({ audienceId, actionPlans = [] }) {
  const [expanded, setExpanded] = useState(false);

  const statusColors = {
    pending: '#60a5fa',
    active: '#10b981',
    paused: '#f59e0b',
    completed: '#6b7280',
    cancelled: '#ef4444'
  };

  return (
    <div className="rounded-xl p-6" style={{ background: '#2a2a2a', border: `1px solid #444` }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between mb-4"
      >
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5" style={{ color: GOLD }} />
          <h3 className="text-lg font-bold" style={{ color: '#fff' }}>Action Plans</h3>
          <span className="text-xs px-2 py-1 rounded-full" style={{ background: '#1a1a1a', color: '#888' }}>
            {actionPlans.length}
          </span>
        </div>
        <span style={{ color: '#888' }}>{expanded ? '−' : '+'}</span>
      </button>

      {expanded && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
          {actionPlans.length === 0 ? (
            <div className="text-center py-6" style={{ color: '#666' }}>
              <p className="text-sm mb-3">No action plans yet</p>
              <Button size="sm" style={{ background: GOLD + '22', color: GOLD, border: `1px solid ${GOLD}` }}>
                Create First Action Plan
              </Button>
            </div>
          ) : (
            actionPlans.map((plan, i) => (
              <div
                key={plan.id}
                className="rounded-lg p-3"
                style={{ background: '#1a1a1a', borderLeft: `3px solid ${statusColors[plan.status] || '#666'}` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm" style={{ color: '#fff' }}>
                      {i + 1}. {plan.action_title}
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#888' }}>
                      {ACTION_TYPES[plan.action_type] || plan.action_type}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full" style={{ background: statusColors[plan.status] + '22', color: statusColors[plan.status] }}>
                    {plan.status}
                  </span>
                </div>
                {plan.scheduled_start_date && (
                  <p className="text-xs" style={{ color: '#666' }}>
                    {new Date(plan.scheduled_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                )}
              </div>
            ))
          )}
        </motion.div>
      )}
    </div>
  );
}