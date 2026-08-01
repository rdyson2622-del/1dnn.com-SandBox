import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap, Mail, MessageCircle, Phone, TrendingDown, Users, Percent, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const SOURCE_CONFIG = {
  relocation_intake: { icon: Mail, label: 'Intake Form', color: '#3B82F6' },
  chat_initiation: { icon: MessageCircle, label: 'Chat', color: '#8B5CF6' },
  sms_reply: { icon: Phone, label: 'SMS Reply', color: '#10B981' },
  manual: { icon: Users, label: 'Manual', color: '#6B7280' }
};

const STATUS_COLORS = {
  new: '#F59E0B',
  contacted: '#3B82F6',
  qualified: '#10B981',
  converted: '#059669',
  unresponsive: '#EF4444'
};

export default function AdminOutreachPipeline() {
  const [timeRange, setTimeRange] = useState('all');
  const [selectedCampaigns, setSelectedCampaigns] = useState([]); // empty = all campaigns

  const { data: campaigns = [] } = useQuery({
    queryKey: ['marketing_campaigns'],
    queryFn: () => appClient.entities.MarketingCampaign.list('-created_date', 100),
    initialData: []
  });

  const { data: optIns = [] } = useQuery({
    queryKey: ['opt_ins'],
    queryFn: () => appClient.entities.OptIn.list('-opted_in_at', 1000),
    initialData: [],
    refetchInterval: 10000
  });

  const { data: optOuts = [] } = useQuery({
    queryKey: ['opt_outs'],
    queryFn: () => appClient.entities.OptOut.list('-opted_out_at', 1000),
    initialData: [],
    refetchInterval: 10000
  });

  const { data: batchSmsLogs = [] } = useQuery({
    queryKey: ['batch_sms_logs'],
    queryFn: () => appClient.entities.BatchSMSLog.list('-sent_at', 500),
    initialData: []
  });

  // Filter by time range and campaign
  const filteredOptIns = useMemo(() => {
    const now = new Date();
    return optIns.filter(opt => {
      const date = new Date(opt.opted_in_at);
      const timeMatch = 
        timeRange === 'all' ? true :
        timeRange === '7days' ? (now - date) / (1000 * 60 * 60 * 24) <= 7 :
        timeRange === '30days' ? (now - date) / (1000 * 60 * 60 * 24) <= 30 : true;
      
      // If campaigns selected, match by campaign date range
      if (selectedCampaigns.length > 0) {
        return timeMatch && selectedCampaigns.some(cid => {
          const c = campaigns.find(x => x.id === cid);
          if (!c) return false;
          const startDate = c.start_date ? new Date(c.start_date) : null;
          const endDate = c.end_date ? new Date(c.end_date) : null;
          return (!startDate || date >= startDate) && (!endDate || date <= endDate);
        });
      }
      return timeMatch;
    });
  }, [optIns, timeRange, selectedCampaigns, campaigns]);

  const filteredOptOuts = useMemo(() => {
    const now = new Date();
    return optOuts.filter(opt => {
      const date = new Date(opt.opted_out_at);
      const timeMatch = 
        timeRange === 'all' ? true :
        timeRange === '7days' ? (now - date) / (1000 * 60 * 60 * 24) <= 7 :
        timeRange === '30days' ? (now - date) / (1000 * 60 * 60 * 24) <= 30 : true;
      
      // If campaigns selected, match by campaign date range
      if (selectedCampaigns.length > 0) {
        return timeMatch && selectedCampaigns.some(cid => {
          const c = campaigns.find(x => x.id === cid);
          if (!c) return false;
          const startDate = c.start_date ? new Date(c.start_date) : null;
          const endDate = c.end_date ? new Date(c.end_date) : null;
          return (!startDate || date >= startDate) && (!endDate || date <= endDate);
        });
      }
      return timeMatch;
    });
  }, [optOuts, timeRange, selectedCampaigns, campaigns]);

  // Calculate funnel metrics
  const bySource = useMemo(() => {
    const map = {};
    filteredOptIns.forEach(opt => {
      if (!map[opt.source]) map[opt.source] = { new: 0, contacted: 0, qualified: 0, converted: 0, unresponsive: 0 };
      map[opt.source][opt.status]++;
    });
    return map;
  }, [filteredOptIns]);

  const totalOptIns = filteredOptIns.length;
  const converted = filteredOptIns.filter(o => o.status === 'converted').length;
  const conversionRate = totalOptIns > 0 ? ((converted / totalOptIns) * 100).toFixed(1) : 0;
  const totalOptOuts = filteredOptOuts.length;

  // Calculate total sends for selected campaigns
  const totalSends = useMemo(() => {
    if (selectedCampaigns.length === 0) {
      return batchSmsLogs.reduce((sum, log) => sum + (log.sent_count || 0), 0);
    }
    return batchSmsLogs
      .filter(log => {
        return selectedCampaigns.some(cid => {
          const c = campaigns.find(x => x.id === cid);
          if (!c) return false;
          const logDate = new Date(log.sent_at);
          const startDate = c.start_date ? new Date(c.start_date) : null;
          const endDate = c.end_date ? new Date(c.end_date) : null;
          return (!startDate || logDate >= startDate) && (!endDate || logDate <= endDate);
        });
      })
      .reduce((sum, log) => sum + (log.sent_count || 0), 0);
  }, [batchSmsLogs, selectedCampaigns, campaigns]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="px-6 py-4 flex items-center gap-3 border-b border-slate-100">
          <Link to="/admin">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-bold text-slate-900">Lead Engagement Pipeline</h1>
            <p className="text-xs text-slate-500">Real-time opt-in/opt-out funnel & conversion tracking</p>
          </div>
        </div>

        {/* Time Range & Campaign Filter */}
        <div className="px-6 py-4 space-y-4">
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All Time' },
              { key: '30days', label: 'Last 30 Days' },
              { key: '7days', label: 'Last 7 Days' }
            ].map(opt => (
              <button
                key={opt.key}
                onClick={() => setTimeRange(opt.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === opt.key
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {campaigns.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCampaigns([])}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCampaigns.length === 0
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Campaigns
              </button>
              {campaigns.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCampaigns(prev =>
                    prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id]
                  )}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                    selectedCampaigns.includes(c.id)
                      ? 'bg-purple-100 text-purple-700 border border-purple-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Megaphone className="w-3 h-3" />
                  {c.campaign_name}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Top-level Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-slate-200 p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">SMS Sends</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{totalSends}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-blue-500 opacity-20" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-xl border border-slate-200 p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Opt-Ins</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{totalOptIns}</p>
              </div>
              <Zap className="w-8 h-8 text-amber-500 opacity-20" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-slate-200 p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Converted</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">{converted}</p>
              </div>
              <Users className="w-8 h-8 text-emerald-500 opacity-20" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-xl border border-slate-200 p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Conversion Rate</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{conversionRate}%</p>
              </div>
              <Percent className="w-8 h-8 text-blue-500 opacity-20" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl border border-slate-200 p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Opt-Outs</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{totalOptOuts}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500 opacity-20" />
            </div>
          </motion.div>
        </div>

        {/* Funnel by Source */}
        <div className="grid gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Opt-In Funnel by Source</h2>

            <div className="space-y-6">
              {Object.entries(SOURCE_CONFIG).map(([source, config]) => {
                const SourceIcon = config.icon;
                const metrics = bySource[source] || { new: 0, contacted: 0, qualified: 0, converted: 0, unresponsive: 0 };
                const total = Object.values(metrics).reduce((a, b) => a + b, 0);
                if (total === 0) return null;

                const statuses = [
                  { key: 'new', label: 'New', color: STATUS_COLORS.new },
                  { key: 'contacted', label: 'Contacted', color: STATUS_COLORS.contacted },
                  { key: 'qualified', label: 'Qualified', color: STATUS_COLORS.qualified },
                  { key: 'converted', label: 'Converted', color: STATUS_COLORS.converted },
                  { key: 'unresponsive', label: 'Unresponsive', color: STATUS_COLORS.unresponsive }
                ];

                return (
                  <motion.div
                    key={source}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border-l-4 pl-5 py-2"
                    style={{ borderColor: config.color }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <SourceIcon className="w-5 h-5" style={{ color: config.color }} />
                      <h3 className="font-semibold text-slate-900">{config.label}</h3>
                      <span className="text-xs font-bold text-slate-500">({total})</span>
                    </div>

                    <div className="flex gap-3 flex-wrap">
                      {statuses.map(status => {
                        const count = metrics[status.key] || 0;
                        if (count === 0) return null;
                        const pct = ((count / total) * 100).toFixed(0);
                        return (
                          <div key={status.key} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: status.color }} />
                            <span className="text-sm font-medium text-slate-700">
                              {status.label} <span className="text-slate-500">({count})</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3 flex gap-1 h-2 rounded-full overflow-hidden bg-slate-100">
                      {statuses.map(status => {
                        const count = metrics[status.key] || 0;
                        const width = ((count / total) * 100);
                        return (
                          <div
                            key={status.key}
                            className="transition-all"
                            style={{
                              width: `${width}%`,
                              background: status.color,
                              display: width > 0 ? 'block' : 'none'
                            }}
                          />
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex gap-3 flex-wrap">
          <Link to="/admin/opt-ins">
            <Button variant="outline" className="gap-2">
              <Zap className="w-4 h-4" />
              View All Opt-Ins →
            </Button>
          </Link>
          <Button variant="outline" className="gap-2">
            <TrendingDown className="w-4 h-4" />
            Opt-Out Report →
          </Button>
        </div>
      </main>
    </div>
  );
}