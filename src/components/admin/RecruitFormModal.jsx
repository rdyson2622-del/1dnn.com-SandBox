import React, { useState } from 'react';
import { appClient } from '@/api/appClient';
import { X, UserPlus, Save, Loader2 } from 'lucide-react';

const GOLD = '#D4AF37';
const INPUT_STYLE = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.2)', color: '#fff', outline: 'none' };

export default function RecruitFormModal({ recruit, onClose, onSaved }) {
  const [form, setForm] = useState({
    agent_name: recruit?.agent_name || '',
    email: recruit?.email || '',
    phone: recruit?.phone || '',
    city: recruit?.city || '',
    state: recruit?.state || '',
    brokerage: recruit?.brokerage || '',
    brokerage_category: recruit?.brokerage_category || 'boutique_independent',
    market_type: recruit?.market_type || 'destination',
    affiliate_type: recruit?.affiliate_type || 'receiver',
    dre_license_number: recruit?.dre_license_number || '',
    dre_license_expiration: recruit?.dre_license_expiration || '',
    dre_license_state: recruit?.dre_license_state || '',
    recruitment_source: recruit?.recruitment_source || 'manual_entry',
    daily_news_subscribed: recruit?.daily_news_subscribed || false,
    status: recruit?.status || 'pending',
    outreach_notes: recruit?.outreach_notes || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const upd = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [k]: val }));
  };

  const handleSave = async () => {
    if (!form.agent_name || !form.city) { setError('Name and city are required.'); return; }
    setSaving(true);
    setError(null);
    try {
      if (recruit?.id) {
        await appClient.entities.VettedPartner.update(recruit.id, form);
      } else {
        await appClient.entities.VettedPartner.create(form);
      }
      onSaved();
      onClose();
    } catch (e) {
      setError(e.message);
    }
    setSaving(false);
  };

  const Field = ({ label, children, full }) => (
    <div className={full ? 'col-span-2' : ''}>
      <label className="text-[10px] font-bold tracking-widest uppercase mb-1 block" style={{ color: GOLD }}>{label}</label>
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }} onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden" style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.3)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <UserPlus className="w-5 h-5" style={{ color: GOLD }} />
            <h2 className="text-lg font-black text-white">{recruit?.id ? 'Edit Affiliate' : 'Add Affiliate Recruit'}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
          <Field label="Agent Name"><input value={form.agent_name} onChange={upd('agent_name')} className="w-full px-3 py-2 rounded-lg text-sm" style={INPUT_STYLE} /></Field>
          <Field label="Email"><input value={form.email} onChange={upd('email')} className="w-full px-3 py-2 rounded-lg text-sm" style={INPUT_STYLE} /></Field>
          <Field label="Phone"><input value={form.phone} onChange={upd('phone')} className="w-full px-3 py-2 rounded-lg text-sm" style={INPUT_STYLE} /></Field>
          <Field label="City"><input value={form.city} onChange={upd('city')} className="w-full px-3 py-2 rounded-lg text-sm" style={INPUT_STYLE} /></Field>
          <Field label="State"><input value={form.state} onChange={upd('state')} className="w-full px-3 py-2 rounded-lg text-sm" style={INPUT_STYLE} /></Field>
          <Field label="Brokerage"><input value={form.brokerage} onChange={upd('brokerage')} className="w-full px-3 py-2 rounded-lg text-sm" style={INPUT_STYLE} /></Field>
          <Field label="Brokerage Category">
            <select value={form.brokerage_category} onChange={upd('brokerage_category')} className="w-full px-3 py-2 rounded-lg text-sm" style={INPUT_STYLE}>
              <option value="boutique_independent">Boutique Independent</option>
              <option value="franchise">Franchise</option>
              <option value="team">Team</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field label="Market Type">
            <select value={form.market_type} onChange={upd('market_type')} className="w-full px-3 py-2 rounded-lg text-sm" style={INPUT_STYLE}>
              <option value="destination">Destination (Receiver)</option>
              <option value="exodus">Exodus (Sender)</option>
            </select>
          </Field>
          <Field label="Affiliate Type">
            <select value={form.affiliate_type} onChange={upd('affiliate_type')} className="w-full px-3 py-2 rounded-lg text-sm" style={INPUT_STYLE}>
              <option value="sender">Sender</option>
              <option value="receiver">Receiver</option>
              <option value="both">Both</option>
            </select>
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={upd('status')} className="w-full px-3 py-2 rounded-lg text-sm" style={INPUT_STYLE}>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="converted">Converted</option>
              <option value="active">Active</option>
              <option value="declined">Declined</option>
            </select>
          </Field>
          <Field label="DRE License #"><input value={form.dre_license_number} onChange={upd('dre_license_number')} placeholder="e.g. CA #01987654" className="w-full px-3 py-2 rounded-lg text-sm" style={INPUT_STYLE} /></Field>
          <Field label="License Expiration"><input type="date" value={form.dre_license_expiration} onChange={upd('dre_license_expiration')} className="w-full px-3 py-2 rounded-lg text-sm" style={INPUT_STYLE} /></Field>
          <Field label="License State"><input value={form.dre_license_state} onChange={upd('dre_license_state')} placeholder="e.g. CA" className="w-full px-3 py-2 rounded-lg text-sm" style={INPUT_STYLE} /></Field>
          <Field label="Recruitment Source">
            <select value={form.recruitment_source} onChange={upd('recruitment_source')} className="w-full px-3 py-2 rounded-lg text-sm" style={INPUT_STYLE}>
              <option value="manual_entry">Manual Entry</option>
              <option value="csv_import">CSV Import</option>
              <option value="linkedin">LinkedIn</option>
              <option value="referral">Referral</option>
              <option value="inbound_subscribe">Inbound Subscribe</option>
              <option value="exodus_roster">Exodus Roster</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field label="Daily News Subscribed">
            <label className="flex items-center gap-2 mt-2">
              <input type="checkbox" checked={form.daily_news_subscribed} onChange={upd('daily_news_subscribed')} className="w-4 h-4" />
              <span className="text-sm text-white">Receives DNN daily broadcast</span>
            </label>
          </Field>
          <Field label="Notes" full><textarea value={form.outreach_notes} onChange={upd('outreach_notes')} rows={3} className="w-full px-3 py-2 rounded-lg text-sm" style={INPUT_STYLE} /></Field>
        </div>

        {error && <div className="px-6 pb-2"><p className="text-xs text-red-400">{error}</p></div>}

        <div className="flex justify-end gap-3 px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-bold text-slate-300 hover:text-white">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold text-black disabled:opacity-50"
            style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})` }}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save Affiliate'}
          </button>
        </div>
      </div>
    </div>
  );
}