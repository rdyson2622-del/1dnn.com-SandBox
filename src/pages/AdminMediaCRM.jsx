import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Star, Edit2, Trash2, ExternalLink, Search } from 'lucide-react';

const GOLD = '#D4AF37';
const OUTLET_TYPES = ['local_news','national_tech','real_estate_trade','podcast','newsletter','tv_radio','other'];
const PITCH_STATUSES = ['not_contacted','pitched','replied','hot','passed','published'];

const STATUS_COLORS = {
  not_contacted: 'bg-slate-700 text-slate-300',
  pitched: 'bg-blue-900 text-blue-300',
  replied: 'bg-amber-900 text-amber-300',
  hot: 'bg-red-900 text-red-400',
  passed: 'bg-slate-800 text-slate-400',
  published: 'bg-green-900 text-green-400',
};

const EMPTY_FORM = {
  name: '', outlet: '', outlet_type: 'real_estate_trade', beat: '',
  email: '', phone: '', twitter: '', linkedin_url: '', profile_url: '',
  sentiment_score: 3, pitch_status: 'not_contacted', notes: '',
};

export default function AdminMediaCRM() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['mediaContacts'],
    queryFn: () => appClient.entities.MediaContact.list('-created_date', 500),
  });

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name?.toLowerCase().includes(q) || c.outlet?.toLowerCase().includes(q) || c.beat?.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'all' || c.pitch_status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openAdd = () => { setForm(EMPTY_FORM); setEditing(null); setShowForm(true); };
  const openEdit = (c) => { setForm({ ...EMPTY_FORM, ...c }); setEditing(c.id); setShowForm(true); };

  const save = async () => {
    if (editing) {
      await appClient.entities.MediaContact.update(editing, form);
    } else {
      await appClient.entities.MediaContact.create(form);
    }
    queryClient.invalidateQueries({ queryKey: ['mediaContacts'] });
    setShowForm(false);
  };

  const remove = async (id) => {
    if (!confirm('Delete this contact?')) return;
    await appClient.entities.MediaContact.delete(id);
    queryClient.invalidateQueries({ queryKey: ['mediaContacts'] });
  };

  return (
    <div className="min-h-screen p-6" style={{ background: '#0a0a0a' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] mb-1" style={{ color: GOLD }}>PR & MEDIA</p>
            <h1 className="text-3xl font-bold text-white">Media CRM</h1>
            <p className="text-sm mt-1 text-white">Track journalists, outlets, beats & pitch status</p>
          </div>
          <Button onClick={openAdd} className="gap-2" style={{ background: GOLD, color: '#000' }}>
            <Plus className="w-4 h-4" /> Add Contact
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, outlet, beat…"
              className="pl-9 text-sm border-0" style={{ background: '#1a1a1a', color: '#fff' }} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', ...PITCH_STATUSES].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{ background: filterStatus === s ? GOLD : '#1a1a1a', color: filterStatus === s ? '#000' : '#fff' }}>
                {s === 'all' ? 'All' : s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
          {PITCH_STATUSES.map(s => {
            const count = contacts.filter(c => c.pitch_status === s).length;
            return (
              <div key={s} className="rounded-xl p-3 text-center" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-xl font-bold text-white">{count}</p>
                <p className="text-[10px] mt-0.5 capitalize text-white">{s.replace('_',' ')}</p>
              </div>
            );
          })}
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#111', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['Contact','Outlet / Type','Beat','Status','Sentiment','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold tracking-widest" style={{ color: GOLD }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} style={{ background: i % 2 === 0 ? '#0d0d0d' : '#0a0a0a', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-white">{c.name}</p>
                    {c.email && <p className="text-xs text-white">{c.email}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-white">{c.outlet}</p>
                    <p className="text-xs capitalize text-white">{c.outlet_type?.replace('_',' ')}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-white">{c.beat || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[c.pitch_status] || ''}`}>
                      {c.pitch_status?.replace('_',' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(n => (
                        <Star key={n} className="w-3 h-3" fill={n <= (c.sentiment_score||0) ? GOLD : 'none'} style={{ color: GOLD }} />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {c.profile_url && <a href={c.profile_url} target="_blank" rel="noreferrer"><ExternalLink className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.4)' }} /></a>}
                      <button onClick={() => openEdit(c)}><Edit2 className="w-4 h-4" style={{ color: GOLD }} /></button>
                      <button onClick={() => remove(c.id)}><Trash2 className="w-4 h-4 text-red-500" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>No contacts found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="w-full max-w-2xl rounded-2xl p-6 overflow-y-auto max-h-[90vh]" style={{ background: '#111', border: `1px solid ${GOLD}44` }}>
            <h2 className="text-xl font-bold text-white mb-5">{editing ? 'Edit Contact' : 'New Media Contact'}</h2>
            <div className="grid grid-cols-2 gap-4">
              {[['name','Name *'],['outlet','Outlet *'],['beat','Beat / Topics'],['email','Email'],['phone','Phone'],['twitter','Twitter Handle'],['linkedin_url','LinkedIn URL'],['profile_url','Profile / Article URL']].map(([field, label]) => (
                <div key={field}>
                  <label className="text-xs font-bold mb-1 block" style={{ color: GOLD }}>{label}</label>
                  <Input value={form[field] || ''} onChange={e => setForm(p => ({...p,[field]:e.target.value}))}
                    className="border-0 text-sm" style={{ background: '#1a1a1a', color: '#fff' }} />
                </div>
              ))}
              <div>
                <label className="text-xs font-bold mb-1 block" style={{ color: GOLD }}>Outlet Type</label>
                <select value={form.outlet_type} onChange={e => setForm(p => ({...p,outlet_type:e.target.value}))}
                  className="w-full px-3 py-2 rounded-lg text-sm capitalize" style={{ background: '#1a1a1a', color: '#fff', border: 'none' }}>
                  {OUTLET_TYPES.map(t => <option key={t} value={t}>{t.replace('_',' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold mb-1 block" style={{ color: GOLD }}>Pitch Status</label>
                <select value={form.pitch_status} onChange={e => setForm(p => ({...p,pitch_status:e.target.value}))}
                  className="w-full px-3 py-2 rounded-lg text-sm capitalize" style={{ background: '#1a1a1a', color: '#fff', border: 'none' }}>
                  {PITCH_STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold mb-1 block" style={{ color: GOLD }}>Sentiment (1-5)</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button" onClick={() => setForm(p => ({...p,sentiment_score:n}))}>
                      <Star className="w-6 h-6 transition-all" fill={n <= form.sentiment_score ? GOLD : 'none'} style={{ color: GOLD }} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold mb-1 block" style={{ color: GOLD }}>Notes</label>
                <textarea value={form.notes || ''} onChange={e => setForm(p => ({...p,notes:e.target.value}))} rows={3}
                  className="w-full px-3 py-2 rounded-lg text-sm resize-none" style={{ background: '#1a1a1a', color: '#fff', border: 'none' }} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <Button onClick={save} className="flex-1" style={{ background: GOLD, color: '#000' }}>Save Contact</Button>
              <Button onClick={() => setShowForm(false)} variant="outline" className="flex-1" style={{ color: '#fff', borderColor: '#333' }}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}