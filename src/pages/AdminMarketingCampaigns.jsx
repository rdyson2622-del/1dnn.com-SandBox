import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { appClient } from '@/api/appClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit3, Trash2, Zap } from 'lucide-react';
import CampaignBuilder from '@/components/admin/marketing/CampaignBuilder';
import CampaignContentGenerator from '@/components/admin/marketing/CampaignContentGenerator';
import CampaignScheduleCalendar from '@/components/admin/marketing/CampaignScheduleCalendar';
import CampaignPostReview from '@/components/admin/marketing/CampaignPostReview';

const GOLD = '#D4AF37';

export default function AdminMarketingCampaigns() {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Fetch campaigns
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => appClient.entities.MarketingCampaign.list('-created_date', 100),
  });

  // Delete campaign
  const deleteMutation = useMutation({
    mutationFn: (campaignId) => appClient.entities.MarketingCampaign.delete(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setSelectedCampaign(null);
    },
  });

  const filteredCampaigns = campaigns.filter(c =>
    c.campaign_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColors = {
    planning: '#60a5fa',
    content_creation: '#f59e0b',
    scheduled: '#8b5cf6',
    active: '#10b981',
    completed: '#6b7280',
    paused: '#ef4444'
  };

  return (
    <div className="min-h-screen" style={{ background: '#1a1a1a' }}>
      {/* Header */}
      <div className="px-6 py-4 border-b" style={{ borderColor: '#333' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#fff' }}>Marketing Campaigns</h1>
            <p style={{ color: '#888' }}>Plan, create, and schedule multi-platform campaigns</p>
          </div>
          <Button
            onClick={() => {
              setSelectedCampaign(null);
              setShowBuilder(true);
            }}
            className="gap-2"
            style={{ background: GOLD, color: '#000' }}
          >
            <Plus className="w-4 h-4" /> New Campaign
          </Button>
        </div>

        {/* Search */}
        <Input
          placeholder="Search campaigns..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm border-0 rounded-lg h-9"
          style={{ background: '#2a2a2a', color: '#fff' }}
        />
      </div>

      <div className="grid grid-cols-3 gap-6 p-6 max-w-7xl">
        {/* Campaign List */}
        <div className="col-span-1">
          <div className="rounded-xl p-4 overflow-y-auto max-h-[70vh]" style={{ background: '#2a2a2a', border: '1px solid #333' }}>
            {isLoading ? (
              <p style={{ color: '#888' }}>Loading...</p>
            ) : filteredCampaigns.length === 0 ? (
              <p style={{ color: '#666' }}>No campaigns yet</p>
            ) : (
              <div className="space-y-2">
                {filteredCampaigns.map(campaign => (
                  <motion.button
                    key={campaign.id}
                    onClick={() => setSelectedCampaign(campaign)}
                    className="w-full text-left p-3 rounded-lg transition-all"
                    style={{
                      background: selectedCampaign?.id === campaign.id ? GOLD + '22' : '#333',
                      border: selectedCampaign?.id === campaign.id ? `1px solid ${GOLD}` : '1px solid #444',
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm" style={{ color: '#fff' }}>
                          {campaign.campaign_name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-1 rounded-full" style={{ background: statusColors[campaign.status] + '33', color: statusColors[campaign.status] }}>
                            {campaign.status}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate(campaign.id);
                        }}
                        className="p-1 hover:bg-red-500/20 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" style={{ color: '#ef4444' }} />
                      </button>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Campaign Details + Builder */}
        <div className="col-span-2">
          <AnimatePresence mode="wait">
            {showBuilder ? (
              <motion.div key="builder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <CampaignBuilder
                  campaign={selectedCampaign}
                  onClose={() => {
                    setShowBuilder(false);
                    queryClient.invalidateQueries({ queryKey: ['campaigns'] });
                  }}
                />
              </motion.div>
            ) : selectedCampaign ? (
              <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <CampaignDetail
                  campaign={selectedCampaign}
                  onEdit={() => setShowBuilder(true)}
                />
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl p-8 text-center" style={{ background: '#2a2a2a', border: '1px dashed #444' }}>
                <Zap className="w-12 h-12 mx-auto mb-3" style={{ color: GOLD }} />
                <p style={{ color: '#888' }}>Select a campaign to view details or create a new one</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function CampaignDetail({ campaign, onEdit }) {
  const { data: posts = [] } = useQuery({
    queryKey: ['posts', campaign.id],
    queryFn: () => appClient.entities.SocialPost.filter({ campaign_id: campaign.id }, '-created_date', 100),
  });

  const postsCreated = posts.filter(p => p.status !== 'draft').length;
  const postsScheduled = posts.filter(p => p.status === 'scheduled').length;

  return (
    <div className="space-y-4">
      {/* Campaign Overview */}
      <div className="rounded-xl p-6" style={{ background: '#2a2a2a', border: `1px solid ${GOLD}44` }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#fff' }}>{campaign.campaign_name}</h2>
            <p style={{ color: '#aaa' }}>{campaign.description}</p>
          </div>
          <Button onClick={onEdit} variant="outline" size="sm" className="gap-1">
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="rounded-lg p-3" style={{ background: '#1a1a1a' }}>
            <p className="text-xs" style={{ color: '#888' }}>Theme</p>
            <p className="font-bold text-sm mt-1" style={{ color: '#fff' }}>{campaign.theme}</p>
          </div>
          <div className="rounded-lg p-3" style={{ background: '#1a1a1a' }}>
            <p className="text-xs" style={{ color: '#888' }}>Budget</p>
            <p className="font-bold text-sm mt-1" style={{ color: GOLD }}>${campaign.budget || 0}</p>
          </div>
          <div className="rounded-lg p-3" style={{ background: '#1a1a1a' }}>
            <p className="text-xs" style={{ color: '#888' }}>Posts Created</p>
            <p className="font-bold text-sm mt-1" style={{ color: '#fff' }}>{postsCreated}/{campaign.total_posts_planned || 0}</p>
          </div>
          <div className="rounded-lg p-3" style={{ background: '#1a1a1a' }}>
            <p className="text-xs" style={{ color: '#888' }}>Scheduled</p>
            <p className="font-bold text-sm mt-1" style={{ color: '#fff' }}>{postsScheduled}</p>
          </div>
        </div>

        {/* Platforms */}
        <div>
          <p className="text-xs font-bold mb-2" style={{ color: '#888' }}>PLATFORMS</p>
          <div className="flex flex-wrap gap-2">
            {campaign.platforms?.map(p => (
              <span key={p} className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: GOLD + '22', color: GOLD, border: `1px solid ${GOLD}33` }}>
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Email Post Review — Legal sign-off before sending */}
      <CampaignPostReview campaignId={campaign.id} />

      {/* Content Generator */}
      <CampaignContentGenerator campaignId={campaign.id} />

      {/* Schedule Calendar */}
      <CampaignScheduleCalendar campaignId={campaign.id} />
    </div>
  );
}