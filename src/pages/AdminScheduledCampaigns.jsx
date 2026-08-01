import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Button } from '@/components/ui/button';
import { Calendar, Pause, Play, X, MapPin } from 'lucide-react';

const STATUS_COLORS = {
  scheduled: 'bg-amber-100 text-amber-700',
  sending:   'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  paused:    'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-100 text-red-600',
};

export default function AdminScheduledCampaigns() {
  const queryClient = useQueryClient();
  const [updating, setUpdating] = useState(null);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['scheduledCampaigns'],
    queryFn: () => appClient.entities.ScheduledCampaign.list('-scheduled_for', 200),
    refetchInterval: 15000,
  });

  const updateStatus = async (id, status) => {
    setUpdating(id);
    await appClient.entities.ScheduledCampaign.update(id, { status });
    queryClient.invalidateQueries({ queryKey: ['scheduledCampaigns'] });
    setUpdating(null);
  };

  const upcoming = campaigns.filter(c => ['scheduled', 'paused'].includes(c.status));
  const active   = campaigns.filter(c => c.status === 'sending');
  const past     = campaigns.filter(c => ['completed', 'cancelled'].includes(c.status));

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  const CampaignCard = ({ campaign }) => {
    const scheduledDate = new Date(campaign.scheduled_for);
    const isPast = scheduledDate < new Date();

    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="p-2 bg-slate-100 rounded-lg shrink-0">
            <MapPin className="w-4 h-4 text-slate-600" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 truncate">{campaign.city}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {campaign.owner_count} recipients ·{' '}
              <span className={isPast && campaign.status === 'scheduled' ? 'text-red-500 font-medium' : ''}>
                {scheduledDate.toLocaleString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                  hour: 'numeric', minute: '2-digit', hour12: true,
                })}
              </span>
            </p>
            {campaign.notes && <p className="text-xs text-slate-400 mt-0.5 truncate">{campaign.notes}</p>}
            {campaign.sent_count != null && (
              <p className="text-xs text-green-600 mt-0.5">
                ✓ {campaign.sent_count} sent · {campaign.failed_count || 0} failed
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[campaign.status]}`}>
            {campaign.status}
          </span>

          {campaign.status === 'scheduled' && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1 text-xs"
                disabled={updating === campaign.id}
                onClick={() => updateStatus(campaign.id, 'paused')}
              >
                <Pause className="w-3 h-3" /> Pause
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1 text-xs border-red-300 text-red-600 hover:bg-red-50"
                disabled={updating === campaign.id}
                onClick={() => updateStatus(campaign.id, 'cancelled')}
              >
                <X className="w-3 h-3" /> Cancel
              </Button>
            </>
          )}

          {campaign.status === 'paused' && (
            <>
              <Button
                size="sm"
                className="h-8 gap-1 text-xs bg-amber-600 hover:bg-amber-700"
                disabled={updating === campaign.id}
                onClick={() => updateStatus(campaign.id, 'scheduled')}
              >
                <Play className="w-3 h-3" /> Resume
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1 text-xs border-red-300 text-red-600 hover:bg-red-50"
                disabled={updating === campaign.id}
                onClick={() => updateStatus(campaign.id, 'cancelled')}
              >
                <X className="w-3 h-3" /> Cancel
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Scheduled Campaigns</h1>
          <p className="text-sm text-slate-500 mt-1">
            {upcoming.length} upcoming · {active.length} sending · {past.length} completed
          </p>
        </div>

        {active.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-blue-700 uppercase tracking-widest mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" /> Currently Sending
            </h2>
            <div className="space-y-3">
              {active.map(c => <CampaignCard key={c.id} campaign={c} />)}
            </div>
          </div>
        )}

        {upcoming.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-amber-700 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Upcoming
            </h2>
            <div className="space-y-3">
              {upcoming.map(c => <CampaignCard key={c.id} campaign={c} />)}
            </div>
          </div>
        )}

        {past.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Past</h2>
            <div className="space-y-3">
              {past.map(c => <CampaignCard key={c.id} campaign={c} />)}
            </div>
          </div>
        )}

        {campaigns.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No scheduled campaigns yet</p>
            <p className="text-sm mt-1">Use "Schedule for Later" from the Listing Owners page to create one.</p>
          </div>
        )}
      </div>
    </div>
  );
}