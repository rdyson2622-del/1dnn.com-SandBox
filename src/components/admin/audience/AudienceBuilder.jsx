import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { appClient } from '@/api/appClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Check, Loader2 } from 'lucide-react';

const GOLD = '#D4AF37';
const AUDIENCE_TYPES = ['recently_listed_homes', 'title_affiliate_data', 'corporate_relocations', 'rental_expiration', 'lease_end_dates', 'custom_list', 'other'];
const MOVE_PROBABILITY = ['very_high', 'high', 'moderate', 'low'];
const STATUSES = ['prospect', 'active_outreach', 'in_campaign', 'converted', 'archived'];
const CONTACT_METHODS = ['email', 'sms', 'phone', 'direct_mail', 'social_media', 'referral'];

export default function AudienceBuilder({ audience, onClose }) {
  const [form, setForm] = useState({
    audience_name: '',
    description: '',
    audience_type: 'custom_list',
    primary_cities: [],
    estimated_size: 0,
    key_characteristics: [],
    data_source: '',
    legal_compliance_notes: '',
    contact_method_preference: [],
    estimated_move_probability: 'high',
    move_timeline: '',
    destination_cities: [],
    status: 'prospect',
    notes: '',
  });

  const [newCity, setNewCity] = useState('');
  const [newChar, setNewChar] = useState('');
  const [newDestCity, setNewDestCity] = useState('');
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (audience) setForm(audience);
  }, [audience]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (audience?.id) {
        return appClient.entities.TargetAudienceProfile.update(audience.id, form);
      } else {
        return appClient.entities.TargetAudienceProfile.create(form);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audiences'] });
      onClose();
    },
  });

  const handleSave = async () => {
    setSaving(true);
    await saveMutation.mutate();
    setSaving(false);
  };

  const toggleContactMethod = (method) => {
    setForm(prev => ({
      ...prev,
      contact_method_preference: prev.contact_method_preference?.includes(method)
        ? prev.contact_method_preference.filter(m => m !== method)
        : [...(prev.contact_method_preference || []), method]
    }));
  };

  const addCity = (type) => {
    if (type === 'primary' && newCity.trim()) {
      setForm(prev => ({
        ...prev,
        primary_cities: [...(prev.primary_cities || []), newCity]
      }));
      setNewCity('');
    }
    if (type === 'dest' && newDestCity.trim()) {
      setForm(prev => ({
        ...prev,
        destination_cities: [...(prev.destination_cities || []), newDestCity]
      }));
      setNewDestCity('');
    }
  };

  const addChar = () => {
    if (newChar.trim()) {
      setForm(prev => ({
        ...prev,
        key_characteristics: [...(prev.key_characteristics || []), newChar]
      }));
      setNewChar('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-6 space-y-5 max-h-[70vh] overflow-y-auto"
      style={{ background: '#2a2a2a', border: `1px solid ${GOLD}44` }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: '#fff' }}>
          {audience ? 'Edit Audience' : 'New Audience'}
        </h2>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded">
          <X className="w-5 h-5" style={{ color: '#888' }} />
        </button>
      </div>

      {/* Basic Info */}
      <div className="space-y-3">
        <div>
          <label className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>Audience Name</label>
          <Input
            value={form.audience_name}
            onChange={(e) => setForm(prev => ({ ...prev, audience_name: e.target.value }))}
            placeholder="e.g., Recently Listed Seniors in LA"
            className="mt-1 border-0 rounded-lg h-9"
            style={{ background: '#1a1a1a', color: '#fff' }}
          />
        </div>

        <div>
          <label className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="What makes this audience valuable?"
            className="mt-1 w-full p-2 rounded-lg border-0 text-sm"
            style={{ background: '#1a1a1a', color: '#fff' }}
            rows={2}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>Type</label>
            <select
              value={form.audience_type}
              onChange={(e) => setForm(prev => ({ ...prev, audience_type: e.target.value }))}
              className="mt-1 w-full p-2 rounded-lg border-0 text-sm"
              style={{ background: '#1a1a1a', color: '#fff' }}
            >
              {AUDIENCE_TYPES.map(t => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>Estimated Size</label>
            <Input
              type="number"
              value={form.estimated_size || 0}
              onChange={(e) => setForm(prev => ({ ...prev, estimated_size: parseInt(e.target.value) }))}
              placeholder="0"
              className="mt-1 border-0 rounded-lg h-9"
              style={{ background: '#1a1a1a', color: '#fff' }}
            />
          </div>

          <div>
            <label className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
              className="mt-1 w-full p-2 rounded-lg border-0 text-sm"
              style={{ background: '#1a1a1a', color: '#fff' }}
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cities */}
      <div className="space-y-2">
        <label className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>Primary Cities</label>
        <div className="flex gap-2">
          <Input
            value={newCity}
            onChange={(e) => setNewCity(e.target.value)}
            placeholder="Add city..."
            onKeyPress={(e) => e.key === 'Enter' && addCity('primary')}
            className="border-0 rounded-lg h-9 flex-1"
            style={{ background: '#1a1a1a', color: '#fff' }}
          />
          <Button onClick={() => addCity('primary')} size="sm" style={{ background: GOLD, color: '#000' }}>+</Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {form.primary_cities?.map((city, i) => (
            <span key={i} className="px-2 py-1 rounded text-xs" style={{ background: '#1a1a1a', color: '#aaa' }}>
              {city} <button onClick={() => setForm(p => ({ ...p, primary_cities: p.primary_cities.filter((_, idx) => idx !== i) }))} className="ml-1">✕</button>
            </span>
          ))}
        </div>
      </div>

      {/* Move Probability & Timeline */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>Move Probability</label>
          <select
            value={form.estimated_move_probability}
            onChange={(e) => setForm(prev => ({ ...prev, estimated_move_probability: e.target.value }))}
            className="mt-1 w-full p-2 rounded-lg border-0 text-sm"
            style={{ background: '#1a1a1a', color: '#fff' }}
          >
            {MOVE_PROBABILITY.map(p => (
              <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>Timeline</label>
          <Input
            value={form.move_timeline}
            onChange={(e) => setForm(prev => ({ ...prev, move_timeline: e.target.value }))}
            placeholder="e.g., 3-6 months"
            className="mt-1 border-0 rounded-lg h-9"
            style={{ background: '#1a1a1a', color: '#fff' }}
          />
        </div>
      </div>

      {/* Contact Methods */}
      <div>
        <label className="text-sm font-semibold mb-2 block" style={{ color: '#f5f5f5' }}>Preferred Contact Methods</label>
        <div className="grid grid-cols-3 gap-2">
          {CONTACT_METHODS.map(m => (
            <button
              key={m}
              onClick={() => toggleContactMethod(m)}
              className="px-2 py-1.5 rounded text-xs font-medium transition-all"
              style={{
                background: form.contact_method_preference?.includes(m) ? GOLD + '33' : '#1a1a1a',
                color: form.contact_method_preference?.includes(m) ? GOLD : '#888',
                border: form.contact_method_preference?.includes(m) ? `1px solid ${GOLD}` : '1px solid #333'
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Legal Notes */}
      <div>
        <label className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>Legal Compliance Notes</label>
        <textarea
          value={form.legal_compliance_notes}
          onChange={(e) => setForm(prev => ({ ...prev, legal_compliance_notes: e.target.value }))}
          placeholder="TCPA, GDPR, and other compliance info..."
          className="mt-1 w-full p-2 rounded-lg border-0 text-sm"
          style={{ background: '#1a1a1a', color: '#fff' }}
          rows={2}
        />
      </div>

      {/* Save */}
      <div className="flex gap-3 justify-end pt-2 border-t" style={{ borderColor: '#444' }}>
        <Button onClick={onClose} variant="outline" size="sm">Cancel</Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          size="sm"
          style={{ background: GOLD, color: '#000' }}
          className="gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Save
        </Button>
      </div>
    </motion.div>
  );
}