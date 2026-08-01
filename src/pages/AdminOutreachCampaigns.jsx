import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CampaignCard from '@/components/admin/CampaignCard';

export default function AdminOutreachCampaigns() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['marketing_campaigns'],
    queryFn: () => appClient.entities.MarketingCampaign.list('-created_date', 100),
    initialData: []
  });

  const { data: batchSmsLogs = [] } = useQuery({
    queryKey: ['batch_sms_logs'],
    queryFn: () => appClient.entities.BatchSMSLog.list('-sent_at', 200),
    initialData: []
  });

  const { data: optOuts = [] } = useQuery({
    queryKey: ['opt_outs'],
    queryFn: () => appClient.entities.OptOut.list('-opted_out_at', 500),
    initialData: []
  });

  // Calculate opt-out counts per campaign by city
  const optOutCounts = useMemo(() => {
    const counts = {};
    for (const log of batchSmsLogs) {
      const cityOptOuts = optOuts.filter(o => o.campaign_city === log.city).length;
      counts[log.city] = cityOptOuts;
    }
    return counts;
  }, [batchSmsLogs, optOuts]);

  // Group BatchSMSLogs by campaign (estimate: logs in same date range = same campaign)
  const batchLogsByCampaign = useMemo(() => {
    const map = {};
    for (const campaign of campaigns) {
      map[campaign.id] = batchSmsLogs.filter(log => {
        const logDate = new Date(log.sent_at);
        const startDate = campaign.start_date ? new Date(campaign.start_date) : null;
        const endDate = campaign.end_date ? new Date(campaign.end_date) : null;
        return (!startDate || logDate >= startDate) && (!endDate || logDate <= endDate);
      });
    }
    return map;
  }, [campaigns, batchSmsLogs]);

  const filteredCampaigns = campaigns.filter(c => {
    const matchSearch = c.campaign_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

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
            <h1 className="font-bold text-slate-900">Marketing Campaigns</h1>
            <p className="text-xs text-slate-500">Quick reference for all campaigns</p>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium bg-white"
          >
            <option value="all">All Status</option>
            <option value="planning">Planning</option>
            <option value="content_creation">Content Creation</option>
            <option value="scheduled">Scheduled</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
          </select>
          <Link to="/admin/marketing-campaigns">
            <Button variant="outline" size="sm">Full Editor →</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Megaphone className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No campaigns yet</p>
            <p className="text-sm mt-1">
              <Link to="/admin/marketing-campaigns" className="text-blue-600 hover:underline">Create one →</Link>
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredCampaigns.map((campaign) => {
              const logsForCampaign = batchLogsByCampaign[campaign.id] || [];
              const totalOptOuts = logsForCampaign.reduce((sum, log) => sum + (optOutCounts[log.city] || 0), 0);
              return (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  batchSmsLogs={logsForCampaign}
                  optOutCount={totalOptOuts}
                  onClick={() => setSelectedCampaign(campaign)}
                />
              );
            })}
          </div>
        )}
      </main>

    </div>
  );
}