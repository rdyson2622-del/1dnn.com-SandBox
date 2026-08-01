import React from 'react';
import { Calendar, AlertCircle, CheckCircle2, TrendingDown, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const STATUS_COLORS = {
  planning: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' },
  content_creation: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  scheduled: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  active: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  completed: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
  paused: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' }
};

function getProgressColor(percentage) {
  if (percentage >= 75) return 'bg-green-500';
  if (percentage >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

function getMilestoneStatus(milestones) {
  if (!milestones?.length) return { completed: 0, total: 0, pct: 0 };
  const completed = milestones.filter(m => m.status === 'completed').length;
  return { completed, total: milestones.length, pct: Math.round((completed / milestones.length) * 100) };
}

function formatDateRange(startDate, endDate) {
  if (!startDate) return 'TBD';
  const start = new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const end = endDate ? new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
  return end ? `${start} — ${end}` : start;
}

export default function CampaignCard({ campaign, batchSmsLogs = [], optOutCount = 0, onClick }) {
  const statusConfig = STATUS_COLORS[campaign.status] || STATUS_COLORS.planning;
  const postProgress = campaign.total_posts_planned ? Math.round((campaign.posts_created || 0) / campaign.total_posts_planned * 100) : 0;
  const milestoneStatus = getMilestoneStatus(campaign.milestones);
  const lastUpdated = campaign.updated_date ? new Date(campaign.updated_date) : null;
  
  // Get SMS batch dates for this campaign (if applicable)
  const smsBatchDates = batchSmsLogs.length > 0 
    ? batchSmsLogs.map(log => new Date(log.sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }))
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`bg-white rounded-lg border-2 p-5 hover:shadow-lg transition-all cursor-pointer ${statusConfig.border}`}
    >
      <div className="space-y-4">
        {/* Header with status badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 text-base">{campaign.campaign_name}</h3>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{campaign.description}</p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${statusConfig.bg} ${statusConfig.text}`}>
            {campaign.status}
          </span>
        </div>

        {/* Posts progress bar */}
        {campaign.total_posts_planned ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs font-medium text-slate-600">Post Progress</span>
              </div>
              <span className="text-xs font-bold text-slate-700">{postProgress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${getProgressColor(postProgress)}`}
                style={{ width: `${postProgress}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">{campaign.posts_created || 0}/{campaign.total_posts_planned} posts</p>
          </div>
        ) : null}

        {/* Milestones progress bar */}
        {milestoneStatus.total > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs font-medium text-slate-600">Milestones</span>
              </div>
              <span className="text-xs font-bold text-slate-700">{milestoneStatus.pct}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${getProgressColor(milestoneStatus.pct)}`}
                style={{ width: `${milestoneStatus.pct}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">{milestoneStatus.completed}/{milestoneStatus.total} milestones</p>
          </div>
        ) : null}

        {/* Stats row - SMS focused */}
        <div className="grid grid-cols-3 gap-3">
          {/* Campaign Date Range */}
          <div>
            <div className="flex items-center gap-1 text-slate-600 mb-1">
              <Calendar className="w-3 h-3" />
            </div>
            <p className="text-xs font-medium text-slate-700">{formatDateRange(campaign.start_date, campaign.end_date)}</p>
            <p className="text-xs text-slate-400">campaign period</p>
          </div>

          {/* SMS Send Dates (from BatchSMSLog) */}
          <div>
            <div className="flex items-center gap-1 text-slate-600 mb-1">
              <Clock className="w-3 h-3" />
            </div>
            {smsBatchDates.length > 0 ? (
              <>
                <p className="text-xs font-medium text-slate-700">{smsBatchDates[0]}</p>
                <p className="text-xs text-slate-400">{smsBatchDates.length} batch{smsBatchDates.length > 1 ? 'es' : ''}</p>
              </>
            ) : (
              <>
                <p className="text-xs font-medium text-slate-500">No sends yet</p>
                <p className="text-xs text-slate-400">—</p>
              </>
            )}
          </div>

          {/* Opt-outs */}
          <div>
            <div className="flex items-center gap-1 text-slate-600 mb-1">
              {optOutCount > 0 ? <AlertCircle className="w-3 h-3 text-red-500" /> : <TrendingDown className="w-3 h-3" />}
            </div>
            <p className={`text-xs font-bold ${optOutCount > 0 ? 'text-red-600' : 'text-slate-700'}`}>{optOutCount}</p>
            <p className="text-xs text-slate-400">opt-outs</p>
          </div>
        </div>

        {/* Last updated footer */}
        {lastUpdated && (
          <div className="text-xs text-slate-400 pt-2 border-t border-slate-100">
            Updated {lastUpdated.toLocaleDateString()} at {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>
    </motion.div>
  );
}