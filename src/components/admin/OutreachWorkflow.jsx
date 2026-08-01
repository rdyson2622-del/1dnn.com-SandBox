import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, User, CheckCircle2, Zap, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STAGES = [
  { key: 'outreach', label: 'Outreach', icon: MessageSquare, color: 'bg-blue-500' },
  { key: 'response', label: 'Response', icon: User, color: 'bg-amber-500' },
  { key: 'profile_complete', label: 'Profile Complete', icon: CheckCircle2, color: 'bg-emerald-500' },
  { key: 'processing', label: 'Processing', icon: Zap, color: 'bg-purple-500' },
  { key: 'closed', label: 'Closed', icon: Flag, color: 'bg-slate-500' }
];

export default function OutreachWorkflow({ campaign, onStageChange, onEdit }) {
  const currentIndex = STAGES.findIndex(s => s.key === campaign.workflow_stage);

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Workflow Progress</h3>
          <span className="text-xs text-slate-500">{campaign.workflow_stage}</span>
        </div>
        <div className="flex gap-1">
          {STAGES.map((stage, idx) => {
            const isActive = idx <= currentIndex;
            const isCurrent = idx === currentIndex;
            return (
              <motion.div
                key={stage.key}
                className={`flex-1 h-2 rounded-full transition-all ${
                  isActive ? stage.color : 'bg-slate-200'
                } ${isCurrent ? 'ring-2 ring-offset-2 ring-slate-900' : ''}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: idx * 0.1 }}
              />
            );
          })}
        </div>
      </div>

      {/* Stage Cards */}
      <div className="grid grid-cols-5 gap-2">
        {STAGES.map((stage, idx) => {
          const isActive = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = stage.icon;

          return (
            <motion.button
              key={stage.key}
              onClick={() => onStageChange(stage.key)}
              className={`p-3 rounded-lg border-2 transition-all text-center text-xs font-medium ${
                isCurrent
                  ? `border-slate-900 ${stage.color} text-white`
                  : isActive
                  ? `border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100`
                  : `border-slate-200 bg-white text-slate-400`
              }`}
              whileHover={{ scale: 1.05 }}
            >
              <Icon className="w-4 h-4 mx-auto mb-1" />
              <span className="text-xs">{stage.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Current Stage Actions */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <p className="text-sm font-semibold text-slate-900 mb-3">
          {STAGES[currentIndex].label} Actions
        </p>

        {campaign.workflow_stage === 'outreach' && (
          <div className="space-y-2 text-xs text-slate-600">
            <p>✓ SMS sent on {new Date(campaign.sms_sent_date).toLocaleDateString()}</p>
            <p>Waiting for owner response...</p>
          </div>
        )}

        {campaign.workflow_stage === 'response' && (
          <div className="space-y-2 text-xs text-slate-600">
            <p>✓ Owner responded on {new Date(campaign.response_date).toLocaleDateString()}</p>
            <p>Moving to: {campaign.destination_city}, {campaign.destination_state}</p>
            <p>Budget: {campaign.destination_price_range}</p>
            <Button size="sm" className="mt-2 w-full" onClick={onEdit}>
              Edit Profile & Next Stage
            </Button>
          </div>
        )}

        {campaign.workflow_stage === 'profile_complete' && (
          <div className="space-y-2 text-xs text-slate-600">
            <p>✓ Owner profile captured</p>
            <p>Ready to send to Charlie for destination matching</p>
            <Button size="sm" className="mt-2 w-full" onClick={() => onStageChange('processing')}>
              Move to Processing
            </Button>
          </div>
        )}

        {campaign.workflow_stage === 'processing' && (
          <div className="space-y-2 text-xs text-slate-600">
            <p>✓ Charlie is researching destination</p>
            <p>Gathering market data and agent recommendations...</p>
          </div>
        )}

        {campaign.workflow_stage === 'closed' && (
          <div className="space-y-2 text-xs text-slate-600">
            <p>✓ Campaign completed</p>
            <p>Owner has been matched and contacted</p>
          </div>
        )}
      </div>

      {/* Notes */}
      {campaign.notes && (
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <p className="text-xs font-semibold text-blue-900 mb-1">Notes:</p>
          <p className="text-xs text-blue-800">{campaign.notes}</p>
        </div>
      )}
    </div>
  );
}