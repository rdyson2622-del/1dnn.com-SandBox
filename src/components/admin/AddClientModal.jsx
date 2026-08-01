import React, { useState } from 'react';
import { X } from 'lucide-react';
import { appClient } from '@/api/appClient';

const GOLD = '#D4AF37';

const BUDGET_OPTIONS = [
  { value: 'under_200k', label: 'Under $200k' },
  { value: '200k_400k', label: '$200k – $400k' },
  { value: '400k_600k', label: '$400k – $600k' },
  { value: '600k_800k', label: '$600k – $800k' },
  { value: '800k_1m',   label: '$800k – $1M' },
  { value: 'over_1m',   label: 'Over $1M' },
];

// Buyer / Relocation priorities
const BUYER_PRIORITIES = [
  { value: 'schools', label: 'Schools' },
  { value: 'commute', label: 'Commute' },
  { value: 'nightlife', label: 'Nightlife' },
  { value: 'walkability', label: 'Walkability' },
  { value: 'safety', label: 'Safety' },
  { value: 'nature', label: 'Nature' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'religious_community', label: 'Religious Community' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'dining', label: 'Dining' },
  { value: 'arts_culture', label: 'Arts & Culture' },
  { value: 'sports_recreation', label: 'Sports & Recreation' },
];

// Seller-specific priorities
const SELLER_PRIORITIES = [
  { value: 'top_dollar', label: 'Top Dollar / Max Price' },
  { value: 'fast_close', label: 'Fast Close' },
  { value: 'as_is_sale', label: 'As-Is Sale' },
  { value: 'minimal_showings', label: 'Minimal Showings' },
  { value: 'flexible_possession', label: 'Flexible Possession Date' },
  { value: 'cash_offer', label: 'Cash Offer Preferred' },
  { value: 'no_contingencies', label: 'No Contingencies' },
  { value: 'leaseback', label: 'Leaseback Option' },
  { value: 'staging_help', label: 'Staging Assistance' },
  { value: 'pre_market_exposure', label: 'Pre-Market Exposure' },
  { value: 'strong_marketing', label: 'Strong Marketing Package' },
  { value: 'bridge_financing', label: 'Bridge Financing' },
];

// Combined for relocation / both_local
const RELOCATION_PRIORITIES = [...BUYER_PRIORITIES, ...SELLER_PRIORITIES];

const getPrioritiesByType = (clientType) => {
  if (clientType === 'seller_only') return SELLER_PRIORITIES;
  if (clientType === 'buyer_only') return BUYER_PRIORITIES;
  return RELOCATION_PRIORITIES; // relocation + both_local get all
};

const ENGAGEMENT_OPTIONS = [
  { value: 'hands_on', label: 'Hands-On (daily digests)' },
  { value: 'full_access', label: 'Full Access (real-time)' },
  { value: 'delegate', label: 'Delegate (expert-led)' },
];

const CLIENT_TYPES = [
  { value: 'relocation', label: '🔄 Full Relocation', desc: 'Buying & Selling across markets' },
  { value: 'buyer_only', label: '🏠 Buyer Only', desc: 'Purchasing without selling' },
  { value: 'seller_only', label: '📋 Seller / Listing', desc: 'Selling their current home' },
  { value: 'both_local', label: '🔁 Buy & Sell Local', desc: 'Both transactions in same market' },
];

export default function AddClientModal({ isOpen, onClose, onCreated }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    current_city: '',
    destination_city: '',
    move_date: '',
    budget: '',
    family_size: '',
    priorities: [],
    engagement_preference: 'hands_on',
    notes: '',
    status: 'new_lead',
    client_type: 'relocation',
    listing_address: '',
    listing_price: '',
    listing_agent_name: '',
  });

  if (!isOpen) return null;

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const togglePriority = (p) => {
    setForm(f => ({
      ...f,
      priorities: f.priorities.includes(p)
        ? f.priorities.filter(x => x !== p)
        : [...f.priorities, p],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) { alert('Full Name is required.'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        email: form.email.trim() || `noemail_${Date.now()}@placeholder.com`,
        family_size: form.family_size ? parseInt(form.family_size) : undefined,
        listing_price: form.listing_price ? form.listing_price : undefined,
      };
      // Remove empty strings
      Object.keys(payload).forEach(k => { if (payload[k] === '' || payload[k] === undefined) delete payload[k]; });
      const created = await appClient.entities.RelocationClient.create(payload);
      onCreated(created);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/70" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
          style={{ background: '#111', border: '1px solid rgba(212,175,55,0.3)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 shrink-0"
            style={{ borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-0.5" style={{ color: GOLD }}>Admin Panel</p>
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Add New Client</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Scrollable form */}
          <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

            {/* Contact Info */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase mb-3" style={{ color: GOLD }}>Contact Information</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-white">Full Name *</label>
                  <input required value={form.full_name} onChange={e => set('full_name', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-white">Email</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-white">Phone</label>
                  <input value={form.phone} onChange={e => set('phone', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-white">Family Size</label>
                  <input type="number" min="1" value={form.family_size} onChange={e => set('family_size', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }} />
                </div>
              </div>
            </div>

            {/* Client Type */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase mb-3" style={{ color: GOLD }}>Client Type</p>
              <div className="grid grid-cols-2 gap-2">
                {CLIENT_TYPES.map(ct => (
                  <button key={ct.value} type="button" onClick={() => set('client_type', ct.value)}
                    className="flex flex-col items-start px-3 py-2.5 rounded-xl text-left transition-all"
                    style={{
                      background: form.client_type === ct.value ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)',
                      border: form.client_type === ct.value ? `1.5px solid ${GOLD}` : '1.5px solid rgba(255,255,255,0.1)',
                    }}>
                    <span className="text-sm font-bold text-white">{ct.label}</span>
                    <span className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{ct.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Listing / Seller Details */}
            {(form.client_type === 'seller_only' || form.client_type === 'both_local' || form.client_type === 'relocation') && (
              <div>
                <p className="text-[10px] font-bold tracking-[0.25em] uppercase mb-3" style={{ color: GOLD }}>
                  {form.client_type === 'seller_only' ? 'Listing Details' : 'Property Being Sold'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold mb-1 text-white">Property Address</label>
                    <input value={form.listing_address} onChange={e => set('listing_address', e.target.value)}
                      placeholder="123 Main St, City, State"
                      className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-white">Listing Price</label>
                    <input value={form.listing_price} onChange={e => set('listing_price', e.target.value)}
                      placeholder="e.g. 850000"
                      className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-white">Listing Agent Name</label>
                    <input value={form.listing_agent_name} onChange={e => set('listing_agent_name', e.target.value)}
                      placeholder="Agent name (if assigned)"
                      className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Relocation / Buying Details */}
            {(form.client_type === 'relocation' || form.client_type === 'buyer_only' || form.client_type === 'both_local') && (
              <div>
                <p className="text-[10px] font-bold tracking-[0.25em] uppercase mb-3" style={{ color: GOLD }}>
                  {form.client_type === 'buyer_only' ? 'Purchase Details' : form.client_type === 'both_local' ? 'Purchase Details' : 'Relocation Details'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {form.client_type !== 'buyer_only' && (
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-white">Moving From</label>
                      <input value={form.current_city} onChange={e => set('current_city', e.target.value)}
                        placeholder="City, State"
                        className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }} />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-white">
                      {form.client_type === 'both_local' ? 'Target Area / Neighborhood' : 'Moving To'}{form.client_type === 'relocation' ? ' *' : ''}
                    </label>
                    <input
                      required={form.client_type === 'relocation'}
                      value={form.destination_city} onChange={e => set('destination_city', e.target.value)}
                      placeholder="City, State"
                      className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-white">Target Date</label>
                    <input type="date" value={form.move_date} onChange={e => set('move_date', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-white">Budget Range</label>
                    <select value={form.budget} onChange={e => set('budget', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
                      style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.12)' }}>
                      <option value="">Select budget</option>
                      {BUDGET_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Status & Engagement */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase mb-3" style={{ color: GOLD }}>Pipeline & Engagement</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-white">Initial Status</label>
                  <select value={form.status} onChange={e => set('status', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
                    style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.12)' }}>
                    <option value="new_lead">New Lead</option>
                    <option value="in_consultation">In Consultation</option>
                    <option value="actively_searching">Actively Searching</option>
                    <option value="under_contract">Under Contract</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-white">Engagement Preference</label>
                  <select value={form.engagement_preference} onChange={e => set('engagement_preference', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
                    style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.12)' }}>
                    {ENGAGEMENT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Priorities — context-aware by client type */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold tracking-[0.25em] uppercase" style={{ color: GOLD }}>
                  {form.client_type === 'seller_only' ? 'Seller Priorities' :
                   form.client_type === 'buyer_only' ? 'Buyer Priorities' :
                   'Client Priorities'}
                </p>
                {form.priorities.length > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(212,175,55,0.15)', color: GOLD }}>
                    {form.priorities.length} selected
                  </span>
                )}
              </div>

              {/* Seller priorities group */}
              {(form.client_type === 'seller_only' || form.client_type === 'relocation' || form.client_type === 'both_local') && (
                <div className="mb-3">
                  {(form.client_type === 'relocation' || form.client_type === 'both_local') && (
                    <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>Seller Goals</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {SELLER_PRIORITIES.map(p => (
                      <button key={p.value} type="button" onClick={() => togglePriority(p.value)}
                        className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                        style={{
                          background: form.priorities.includes(p.value) ? GOLD : 'rgba(255,100,50,0.07)',
                          color: form.priorities.includes(p.value) ? '#000' : 'rgba(255,255,255,0.6)',
                          border: form.priorities.includes(p.value) ? 'none' : '1px solid rgba(255,100,50,0.2)',
                        }}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Buyer priorities group */}
              {(form.client_type === 'buyer_only' || form.client_type === 'relocation' || form.client_type === 'both_local') && (
                <div>
                  {(form.client_type === 'relocation' || form.client_type === 'both_local') && (
                    <p className="text-[9px] font-bold uppercase tracking-widest mb-2 mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Buyer / Lifestyle Goals</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {BUYER_PRIORITIES.map(p => (
                      <button key={p.value} type="button" onClick={() => togglePriority(p.value)}
                        className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                        style={{
                          background: form.priorities.includes(p.value) ? GOLD : 'rgba(255,255,255,0.06)',
                          color: form.priorities.includes(p.value) ? '#000' : 'rgba(255,255,255,0.6)',
                          border: form.priorities.includes(p.value) ? 'none' : '1px solid rgba(255,255,255,0.12)',
                        }}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-white">Internal Notes</label>
              <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                rows={3}
                placeholder="Any notes about this client..."
                className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none resize-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }} />
            </div>

          </form>

          {/* Footer */}
          <div className="shrink-0 px-6 py-4 flex justify-end gap-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-colors hover:bg-white/10">
              Cancel
            </button>
            <button type="submit" onClick={handleSubmit} disabled={saving}
              className="px-6 py-2.5 rounded-full text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: '#000' }}>
              {saving ? 'Creating...' : 'Create Client'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}