import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { appClient } from '@/api/appClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit3, Trash2, Target } from 'lucide-react';
import AudienceBuilder from '@/components/admin/audience/AudienceBuilder';
import AudienceActionPlans from '@/components/admin/audience/AudienceActionPlans';

const GOLD = '#D4AF37';

export default function AdminTargetAudiences() {
  const [selectedAudience, setSelectedAudience] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Fetch audiences
  const { data: audiences = [], isLoading } = useQuery({
    queryKey: ['audiences'],
    queryFn: () => appClient.entities.TargetAudienceProfile.list('-created_date', 100),
  });

  // Delete audience
  const deleteMutation = useMutation({
    mutationFn: (audienceId) => appClient.entities.TargetAudienceProfile.delete(audienceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audiences'] });
      setSelectedAudience(null);
    },
  });

  const filteredAudiences = audiences.filter(a =>
    a.audience_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColors = {
    prospect: '#60a5fa',
    active_outreach: '#f59e0b',
    in_campaign: '#8b5cf6',
    converted: '#10b981',
    archived: '#6b7280'
  };

  return (
    <div className="min-h-screen" style={{ background: '#1a1a1a' }}>
      {/* Header */}
      <div className="px-6 py-4 border-b" style={{ borderColor: '#333' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#fff' }}>Target Audiences</h1>
            <p style={{ color: '#888' }}>Manage high-probability audience segments and action plans</p>
          </div>
          <Button
            onClick={() => {
              setSelectedAudience(null);
              setShowBuilder(true);
            }}
            className="gap-2"
            style={{ background: GOLD, color: '#000' }}
          >
            <Plus className="w-4 h-4" /> New Audience
          </Button>
        </div>

        {/* Search */}
        <Input
          placeholder="Search audiences..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm border-0 rounded-lg h-9"
          style={{ background: '#2a2a2a', color: '#fff' }}
        />
      </div>

      <div className="grid grid-cols-3 gap-6 p-6 max-w-7xl">
        {/* Audience List */}
        <div className="col-span-1">
          <div className="rounded-xl p-4 overflow-y-auto max-h-[70vh]" style={{ background: '#2a2a2a', border: '1px solid #333' }}>
            {isLoading ? (
              <p style={{ color: '#888' }}>Loading...</p>
            ) : filteredAudiences.length === 0 ? (
              <p style={{ color: '#666' }}>No audiences yet</p>
            ) : (
              <div className="space-y-2">
                {filteredAudiences.map(audience => (
                  <motion.button
                    key={audience.id}
                    onClick={() => setSelectedAudience(audience)}
                    className="w-full text-left p-3 rounded-lg transition-all"
                    style={{
                      background: selectedAudience?.id === audience.id ? GOLD + '22' : '#333',
                      border: selectedAudience?.id === audience.id ? `1px solid ${GOLD}` : '1px solid #444',
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-sm" style={{ color: '#fff' }}>
                          {audience.audience_name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-1 rounded-full" style={{ background: statusColors[audience.status] + '33', color: statusColors[audience.status] }}>
                            {audience.status}
                          </span>
                          <span className="text-xs" style={{ color: '#888' }}>
                            {audience.estimated_size || '?'} contacts
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate(audience.id);
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

        {/* Audience Details + Builder */}
        <div className="col-span-2">
          <AnimatePresence mode="wait">
            {showBuilder ? (
              <motion.div key="builder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AudienceBuilder
                  audience={selectedAudience}
                  onClose={() => {
                    setShowBuilder(false);
                    queryClient.invalidateQueries({ queryKey: ['audiences'] });
                  }}
                />
              </motion.div>
            ) : selectedAudience ? (
              <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AudienceDetail
                  audience={selectedAudience}
                  onEdit={() => setShowBuilder(true)}
                />
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl p-8 text-center" style={{ background: '#2a2a2a', border: '1px dashed #444' }}>
                <Target className="w-12 h-12 mx-auto mb-3" style={{ color: GOLD }} />
                <p style={{ color: '#888' }}>Select an audience to view details or create a new one</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function AudienceDetail({ audience, onEdit }) {
  const { data: actionPlans = [] } = useQuery({
    queryKey: ['actionPlans', audience.id],
    queryFn: () => appClient.entities.AudienceActionPlan.filter({ audience_id: audience.id }, 'sequence_order', 100),
  });

  return (
    <div className="space-y-4">
      {/* Audience Overview */}
      <div className="rounded-xl p-6" style={{ background: '#2a2a2a', border: `1px solid ${GOLD}44` }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#fff' }}>{audience.audience_name}</h2>
            <p style={{ color: '#aaa' }}>{audience.description}</p>
          </div>
          <Button onClick={onEdit} variant="outline" size="sm" className="gap-1">
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-lg p-3" style={{ background: '#1a1a1a' }}>
            <p className="text-xs" style={{ color: '#888' }}>Type</p>
            <p className="font-bold text-sm mt-1" style={{ color: '#fff' }}>{audience.audience_type?.replace(/_/g, ' ')}</p>
          </div>
          <div className="rounded-lg p-3" style={{ background: '#1a1a1a' }}>
            <p className="text-xs" style={{ color: '#888' }}>Size</p>
            <p className="font-bold text-sm mt-1" style={{ color: GOLD }}>{audience.estimated_size || '?'} contacts</p>
          </div>
          <div className="rounded-lg p-3" style={{ background: '#1a1a1a' }}>
            <p className="text-xs" style={{ color: '#888' }}>Move Probability</p>
            <p className="font-bold text-sm mt-1" style={{ color: '#fff' }}>{audience.estimated_move_probability?.replace(/_/g, ' ')}</p>
          </div>
        </div>

        {/* Cities */}
        {audience.primary_cities?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-bold mb-2" style={{ color: '#888' }}>PRIMARY CITIES</p>
            <div className="flex flex-wrap gap-2">
              {audience.primary_cities.map(city => (
                <span key={city} className="px-3 py-1 rounded-full text-sm" style={{ background: '#1a1a1a', color: '#aaa' }}>
                  {city}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Legal Notes */}
        {audience.legal_compliance_notes && (
          <div className="p-3 rounded-lg text-sm" style={{ background: '#333', borderLeft: `3px solid ${GOLD}` }}>
            <p className="text-xs font-bold mb-1" style={{ color: GOLD }}>LEGAL COMPLIANCE</p>
            <p style={{ color: '#ddd' }}>{audience.legal_compliance_notes}</p>
          </div>
        )}
      </div>

      {/* Action Plans */}
      <AudienceActionPlans audienceId={audience.id} actionPlans={actionPlans} />
    </div>
  );
}