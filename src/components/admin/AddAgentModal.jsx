import React, { useState } from 'react';
import { X } from 'lucide-react';
import { appClient } from '@/api/appClient';

const GOLD = '#D4AF37';

const EMPTY = {
  agent_name: '', city: '', state: '', brokerage: '', rank: '',
  phone: '', email: '', sales_count_2025: '', sales_volume_2025: '',
  avg_price_point: '', market_type: 'destination', brokerage_category: 'boutique_independent',
  status: 'pending', outreach_notes: ''
};

export default function AddAgentModal({ onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      rank: form.rank ? parseInt(form.rank) : null,
      sales_count_2025: form.sales_count_2025 ? parseInt(form.sales_count_2025) : null,
      sales_volume_2025: form.sales_volume_2025 ? parseFloat(String(form.sales_volume_2025).replace(/[$,]/g, '')) : null,
      avg_price_point: form.avg_price_point ? parseFloat(String(form.avg_price_point).replace(/[$,]/g, '')) : null,
      city_slug: form.city.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    };
    await appClient.entities.VettedPartner.create(payload);
    setSaving(false);
    onSaved();
    onClose();
  };

  const field = (label, key, type = 'text', placeholder = '') => (
    <div>
      <label className="text-[10px] font-black tracking-widest uppercase block mb-1" style={{ color: GOLD }}>{label}</label>
      <input type={type} placeholder={placeholder} value={form[key]}
        onChange={e => set(key, e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-sm outline-none"
        style={{ background: '#ede0cc', border: '1px solid rgba(212,175,55,0.4)', color: '#1a1a1a' }} />
    </div>
  );

  const sel = (label, key, options) => (
    <div>
      <label className="text-[10px] font-black tracking-widest uppercase block mb-1" style={{ color: GOLD }}>{label}</label>
      <select value={form[key]} onChange={e => set(key, e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-sm outline-none"
        style={{ background: '#ede0cc', border: '1px solid rgba(212,175,55,0.4)', color: '#1a1a1a' }}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}
        style={{ background: '#fff8ee', border: `2px solid ${GOLD}`, maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between sticky top-0" style={{ background: '#0d0d0d' }}>
          <div>
            <p className="text-[10px] font-black tracking-[0.3em] uppercase" style={{ color: GOLD }}>MASTER ROSTER</p>
            <p className="text-white font-bold text-sm mt-0.5">Add Agent Manually</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <form onSubmit={handleSave} className="px-6 py-6 space-y-4">
          {/* Required */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">{field('Agent Name *', 'agent_name', 'text', 'Full name')}</div>
            {field('City *', 'city', 'text', 'e.g. Nashville')}
            {field('State', 'state', 'text', 'e.g. TN')}
          </div>

          {/* Brokerage */}
          <div className="grid grid-cols-2 gap-3">
            {field('Brokerage', 'brokerage', 'text', 'Firm name')}
            {field('Rank', 'rank', 'number', '1')}
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-3">
            {field('Phone', 'phone', 'tel', '(555) 000-0000')}
            {field('Email', 'email', 'email', 'agent@email.com')}
          </div>

          {/* Sales */}
          <div className="grid grid-cols-3 gap-3">
            {field('Sales Count', 'sales_count_2025', 'number', '0')}
            {field('Sales Volume', 'sales_volume_2025', 'text', '$0')}
            {field('Avg Price', 'avg_price_point', 'text', '$0')}
          </div>

          {/* Dropdowns */}
          <div className="grid grid-cols-2 gap-3">
            {sel('Market Type', 'market_type', [
              ['destination', 'Destination / Receiver'],
              ['exodus', 'Exodus / Sender'],
            ])}
            {sel('Brokerage Category', 'brokerage_category', [
              ['boutique_independent', 'Boutique Independent'],
              ['franchise', 'Franchise'],
              ['team', 'Team'],
              ['other', 'Other'],
            ])}
          </div>
          {sel('Status', 'status', [
            ['pending', 'Pending'],
            ['active', 'Active'],
            ['contacted', 'Contacted'],
            ['converted', 'Converted'],
            ['declined', 'Declined'],
          ])}

          {/* Notes */}
          <div>
            <label className="text-[10px] font-black tracking-widest uppercase block mb-1" style={{ color: GOLD }}>Notes</label>
            <textarea rows={2} value={form.outreach_notes} onChange={e => set('outreach_notes', e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{ background: '#ede0cc', border: '1px solid rgba(212,175,55,0.4)', color: '#1a1a1a' }} />
          </div>

          <button type="submit" disabled={!form.agent_name || !form.city || saving}
            className="w-full py-3 rounded-full font-black text-sm tracking-wide transition-all hover:scale-[1.02] disabled:opacity-50"
            style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: '#000' }}>
            {saving ? 'Saving…' : 'Add Agent to Roster →'}
          </button>
        </form>
      </div>
    </div>
  );
}