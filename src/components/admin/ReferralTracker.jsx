import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { CheckCircle2, Clock, AlertCircle, DollarSign, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const STATUS_CONFIG = {
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  sent: { icon: Send, color: 'text-blue-600', bg: 'bg-blue-50' },
  accepted: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
  in_progress: { icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  closed: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  rejected: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
};

export default function ReferralTracker() {
  const [filterType, setFilterType] = useState('all');

  const { data: referrals = [] } = useQuery({
    queryKey: ['referrals'],
    queryFn: () => appClient.entities.Referral.list('-created_date', 100),
    initialData: [],
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => appClient.entities.Referral.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
    },
  });

  const queryClient = useQueryClient();

  const filtered = referrals.filter((r) => {
    if (filterType === 'all') return true;
    if (filterType === 'active') return ['pending', 'sent', 'in_progress'].includes(r.status);
    if (filterType === 'closed') return r.status === 'closed';
    return r.referral_type === filterType;
  });

  const stats = {
    total: referrals.length,
    active: referrals.filter((r) => ['pending', 'sent', 'in_progress'].includes(r.status)).length,
    closed: referrals.filter((r) => r.status === 'closed').length,
    potentialFees: referrals.reduce((sum, r) => sum + (r.estimated_referral_fee || 0) + (r.estimated_mgmt_fee || 0), 0),
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Referrals', value: stats.total, color: 'blue' },
          { label: 'Active', value: stats.active, color: 'yellow' },
          { label: 'Closed', value: stats.closed, color: 'green' },
          { label: 'Potential Fees', value: `$${(stats.potentialFees / 1000).toFixed(0)}k`, color: 'purple' },
        ].map((stat) => (
          <div key={stat.label} className={`bg-${stat.color}-50 rounded-lg p-3 border border-${stat.color}-200`}>
            <p className={`text-xs font-semibold text-${stat.color}-600`}>{stat.label}</p>
            <p className="text-lg font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'active', 'closed', 'outgoing', 'incoming'].map((filter) => (
          <Button
            key={filter}
            onClick={() => setFilterType(filter)}
            variant={filterType === filter ? 'default' : 'outline'}
            size="sm"
            className="text-xs capitalize"
          >
            {filter}
          </Button>
        ))}
      </div>

      {/* Referral List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-sm">
            No referrals found
          </div>
        ) : (
          filtered.map((referral, idx) => {
            const statusConfig = STATUS_CONFIG[referral.status];
            const Icon = statusConfig.icon;
            const totalFees = (referral.estimated_referral_fee || 0) + (referral.estimated_mgmt_fee || 0);

            return (
              <motion.div
                key={referral.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                className={`${statusConfig.bg} rounded-lg p-3 border border-slate-200`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <Icon className={`w-4 h-4 mt-0.5 ${statusConfig.color} shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm">{referral.client_name}</p>
                      <p className="text-xs text-slate-600">{referral.agent_name}</p>
                      <p className="text-xs text-slate-500">
                        {referral.destination_city}, {referral.destination_state}
                      </p>
                      <div className="flex gap-2 mt-1 text-xs">
                        <span className="px-2 py-0.5 bg-white rounded border border-slate-300">
                          {referral.referral_type}
                        </span>
                        <span className="px-2 py-0.5 bg-white rounded border border-slate-300 capitalize">
                          {referral.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Fee Info */}
                  <div className="text-right shrink-0">
                    {totalFees > 0 && (
                      <div className="flex items-center gap-1 mb-2">
                        <DollarSign className="w-3 h-3 text-emerald-600" />
                        <span className="font-semibold text-emerald-600 text-sm">
                          ${totalFees.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {referral.status === 'pending' && (
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => updateMutation.mutate({ id: referral.id, status: 'sent' })}
                        className="text-xs"
                      >
                        Send
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}