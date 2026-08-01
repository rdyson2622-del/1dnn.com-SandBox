import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function AdminActiveCampaigns() {
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [queuedCampaigns, setQueuedCampaigns] = useState([]);

  // Fetch all batch logs and refresh every 5 seconds for active campaigns
  const { data: batchLogs = [] } = useQuery({
    queryKey: ['batchSmsLogs'],
    queryFn: () => appClient.entities.BatchSMSLog.list('-sent_at', 100),
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });

  // Calculate active and queued campaigns
  useEffect(() => {
    const now = new Date();
    
    const active = [];
    const queued = [];

    batchLogs.forEach(log => {
      const sentAt = new Date(log.sent_at);
      const totalMinutes = log.sent_count * 3;
      const elapsedMinutes = (now - sentAt) / 60000;

      if (elapsedMinutes < totalMinutes) {
        // Still in progress
        const elapsedMs = now - sentAt;
        const estimatedSent = Math.min(log.sent_count, Math.floor(elapsedMinutes / 3));
        const remainingMinutes = Math.max(0, totalMinutes - elapsedMinutes);
        const progress = Math.min(100, Math.round((estimatedSent / log.sent_count) * 100));
        
        active.push({
          ...log,
          estimatedSent,
          remainingMinutes,
          progress,
          eta: new Date(now.getTime() + remainingMinutes * 60000),
        });
      } else if (elapsedMinutes < 10 && log.failed_count === 0) {
        // Recently completed successfully (show as "just sent")
        queued.push({
          ...log,
          status: 'completed',
          completedAt: sentAt,
        });
      }
    });

    setActiveCampaigns(active);
    setQueuedCampaigns(queued);
  }, [batchLogs]);

  const totalQueued = activeCampaigns.reduce((sum, c) => sum + c.sent_count, 0);
  const totalSent = activeCampaigns.reduce((sum, c) => sum + c.estimatedSent, 0);
  const totalFailed = activeCampaigns.reduce((sum, c) => sum + (c.failed_count || 0), 0);

  return (
    <div className="min-h-screen bg-white">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/admin/owners">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Active Campaigns</h1>
            <p className="text-sm text-slate-500 mt-1">
              {activeCampaigns.length > 0
                ? `${activeCampaigns.length} cities sending • ${totalSent}/${totalQueued} sent • ${totalFailed} failed`
                : 'No active campaigns'}
            </p>
          </div>
        </div>

        {/* Stats Bar */}
        {activeCampaigns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-50 rounded-lg border border-slate-200 p-4"
            >
              <p className="text-xs text-slate-500 font-medium">Total Queued</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{totalQueued}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-blue-50 rounded-lg border border-blue-200 p-4"
            >
              <p className="text-xs text-blue-600 font-medium">Sent So Far</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{totalSent}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-red-50 rounded-lg border border-red-200 p-4"
            >
              <p className="text-xs text-red-600 font-medium">Failed</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{totalFailed}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-amber-50 rounded-lg border border-amber-200 p-4"
            >
              <p className="text-xs text-amber-600 font-medium">Cities Active</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">{activeCampaigns.length}</p>
            </motion.div>
          </div>
        )}

        {/* Recently Completed */}
        {queuedCampaigns.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Recently Sent</h2>
            <div className="space-y-2">
              {queuedCampaigns.map(camp => (
                <div key={camp.id} className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-emerald-900">{camp.city}</p>
                    <p className="text-xs text-emerald-700">{camp.sent_count} messages sent {new Date(camp.sent_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Campaign Cards */}
        {activeCampaigns.length === 0 && queuedCampaigns.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Send className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No active campaigns</p>
            <p className="text-sm mt-1">Start sending from the Listing Owners page</p>
            <Link to="/admin/owners" className="mt-4 inline-block">
              <Button variant="outline">Go to Listing Owners</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {activeCampaigns.map((campaign) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{campaign.city}</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Started {new Date(campaign.sent_at).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
                    In Progress
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">
                      {campaign.estimatedSent} / {campaign.sent_count} sent
                    </span>
                    <span className="text-sm text-slate-500">
                      {campaign.remainingMinutes > 60
                        ? `${(campaign.remainingMinutes / 60).toFixed(1)}h remaining`
                        : `${Math.ceil(campaign.remainingMinutes)}m remaining`}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${campaign.progress}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Send className="w-4 h-4 text-blue-600" />
                      <span className="text-xs text-blue-600 font-medium">Queued</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">{campaign.sent_count}</p>
                  </div>

                  <div className="bg-red-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="text-xs text-red-600 font-medium">Failed</span>
                    </div>
                    <p className="text-2xl font-bold text-red-900">{campaign.failed_count || 0}</p>
                  </div>

                  <div className="bg-amber-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span className="text-xs text-amber-600 font-medium">ETA</span>
                    </div>
                    <p className="text-lg font-bold text-amber-900">
                      {campaign.eta.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}