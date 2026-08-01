import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { appClient } from '@/api/appClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Check, Loader2 } from 'lucide-react';

const GOLD = '#D4AF37';
const AUDIENCES = ['relocating_families', 'real_estate_agents', 'corporate_hr', 'general_awareness', 'lead_nurture', 'existing_clients'];
const PLATFORMS = ['linkedin', 'facebook', 'instagram', 'tiktok', 'twitter', 'youtube', 'pinterest', 'email', 'sms'];
const STATUSES = ['planning', 'content_creation', 'scheduled', 'active', 'completed', 'paused'];

export default function CampaignBuilder({ campaign, onClose }) {
  const [form, setForm] = useState({
    campaign_name: '',
    theme: '',
    target_audience: 'relocating_families',
    budget: 0,
    status: 'planning',
    start_date: '',
    end_date: '',
    platforms: [],
    description: '',
    key_messages: [],
    total_posts_planned: 0,
  });
  const [newMessage, setNewMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (campaign) {
      setForm(campaign);
    }
  }, [campaign]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (campaign?.id) {
        return appClient.entities.MarketingCampaign.update(campaign.id, form);
      } else {
        return appClient.entities.MarketingCampaign.create(form);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      onClose();
    },
  });

  const handleSave = async () => {
    setSaving(true);
    await saveMutation.mutate();
    setSaving(false);
  };

  const togglePlatform = (p) => {
    setForm(prev => ({
      ...prev,
      platforms: prev.platforms?.includes(p)
        ? prev.platforms.filter(x => x !== p)
        : [...(prev.platforms || []), p]
    }));
  };

  const addMessage = () => {
    if (newMessage.trim()) {
      setForm(prev => ({
        ...prev,
        key_messages: [...(prev.key_messages || []), newMessage]
      }));
      setNewMessage('');
    }
  };

  const removeMessage = (i) => {
    setForm(prev => ({
      ...prev,
      key_messages: prev.key_messages?.filter((_, idx) => idx !== i)
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="rounded-xl p-6 space-y-6"
      style={{ background: '#2a2a2a', border: `1px solid ${GOLD}44` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold" style={{ color: '#fff' }}>
          {campaign ? 'Edit Campaign' : 'New Campaign'}
        </h2>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded">
          <X className="w-5 h-5" style={{ color: '#888' }} />
        </button>
      </div>

      {/* Campaign Basics */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>Campaign Name</label>
          <Input
            value={form.campaign_name}
            onChange={(e) => setForm(prev => ({ ...prev, campaign_name: e.target.value }))}
            placeholder="e.g., Q2 Relocating Families"
            className="mt-2 border-0 rounded-lg h-9"
            style={{ background: '#1a1a1a', color: '#fff' }}
          />
        </div>
        <div>
          <label className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>Theme</label>
          <Input
            value={form.theme}
            onChange={(e) => setForm(prev => ({ ...prev, theme: e.target.value }))}
            placeholder="Campaign narrative"
            className="mt-2 border-0 rounded-lg h-9"
            style={{ background: '#1a1a1a', color: '#fff' }}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Campaign overview and goals"
          className="mt-2 w-full p-3 rounded-lg border-0 text-sm"
          style={{ background: '#1a1a1a', color: '#fff' }}
          rows={3}
        />
      </div>

      {/* Audience & Budget */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>Target Audience</label>
          <select
            value={form.target_audience}
            onChange={(e) => setForm(prev => ({ ...prev, target_audience: e.target.value }))}
            className="mt-2 w-full p-2 rounded-lg border-0 text-sm"
            style={{ background: '#1a1a1a', color: '#fff' }}
          >
            {AUDIENCES.map(a => (
              <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>Budget</label>
          <Input
            type="number"
            value={form.budget || 0}
            onChange={(e) => setForm(prev => ({ ...prev, budget: parseFloat(e.target.value) }))}
            placeholder="0"
            className="mt-2 border-0 rounded-lg h-9"
            style={{ background: '#1a1a1a', color: '#fff' }}
          />
        </div>
        <div>
          <label className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
            className="mt-2 w-full p-2 rounded-lg border-0 text-sm"
            style={{ background: '#1a1a1a', color: '#fff' }}
          >
            {STATUSES.map(s => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>Start Date</label>
          <Input
            type="date"
            value={form.start_date || ''}
            onChange={(e) => setForm(prev => ({ ...prev, start_date: e.target.value }))}
            className="mt-2 border-0 rounded-lg h-9"
            style={{ background: '#1a1a1a', color: '#fff' }}
          />
        </div>
        <div>
          <label className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>End Date</label>
          <Input
            type="date"
            value={form.end_date || ''}
            onChange={(e) => setForm(prev => ({ ...prev, end_date: e.target.value }))}
            className="mt-2 border-0 rounded-lg h-9"
            style={{ background: '#1a1a1a', color: '#fff' }}
          />
        </div>
      </div>

      {/* Platforms */}
      <div>
        <label className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>Platforms</label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {PLATFORMS.map(p => (
            <button
              key={p}
              onClick={() => togglePlatform(p)}
              className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: form.platforms?.includes(p) ? GOLD + '33' : '#1a1a1a',
                color: form.platforms?.includes(p) ? GOLD : '#aaa',
                border: form.platforms?.includes(p) ? `1px solid ${GOLD}` : '1px solid #333'
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Key Messages */}
      <div>
        <label className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>Key Messages</label>
        <div className="flex gap-2 mt-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Add a message..."
            onKeyPress={(e) => e.key === 'Enter' && addMessage()}
            className="border-0 rounded-lg h-9"
            style={{ background: '#1a1a1a', color: '#fff' }}
          />
          <Button onClick={addMessage} size="sm" style={{ background: GOLD, color: '#000' }}>+</Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {form.key_messages?.map((msg, i) => (
            <span key={i} className="px-3 py-1 rounded-full text-sm flex items-center gap-2" style={{ background: '#1a1a1a', color: '#aaa' }}>
              {msg}
              <button onClick={() => removeMessage(i)} className="hover:opacity-70"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      </div>

      {/* Posts Planned */}
      <div>
        <label className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>Total Posts Planned</label>
        <Input
          type="number"
          value={form.total_posts_planned || 0}
          onChange={(e) => setForm(prev => ({ ...prev, total_posts_planned: parseInt(e.target.value) }))}
          placeholder="0"
          className="mt-2 border-0 rounded-lg h-9"
          style={{ background: '#1a1a1a', color: '#fff' }}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4">
        <Button onClick={onClose} variant="outline">Cancel</Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          style={{ background: GOLD, color: '#000' }}
          className="gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Campaign'}
        </Button>
      </div>
    </motion.div>
  );
}