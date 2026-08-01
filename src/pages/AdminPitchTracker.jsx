import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const GOLD = '#D4AF37';

const COLUMNS = [
  { id: 'drafted',   label: 'Drafted',   color: '#64748b' },
  { id: 'sent',      label: 'Pitched',   color: '#3b82f6' },
  { id: 'replied',   label: 'Replied',   color: GOLD },
  { id: 'hot',       label: '🔥 Hot',    color: '#ef4444' },
  { id: 'passed',    label: 'Passed',    color: '#475569' },
  { id: 'published', label: '✅ Published', color: '#22c55e' },
];

const EMPTY_FORM = { contact_id: '', contact_name: '', outlet: '', subject: '', message: '', channel: 'email', status: 'drafted', follow_up_date: '', reply_notes: '' };

export default function AdminPitchTracker() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [view, setView] = useState('kanban');

  const { data: pitches = [] } = useQuery({
    queryKey: ['mediaPitches'],
    queryFn: () => appClient.entities.MediaPitch.list('-created_date', 500),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['mediaContacts'],
    queryFn: () => appClient.entities.MediaContact.list('-created_date', 500),
  });

  const openAdd = () => { setForm(EMPTY_FORM); setEditing(null); setShowForm(true); };
  const openEdit = (p) => { setForm({ ...EMPTY_FORM, ...p }); setEditing(p.id); setShowForm(true); };

  const save = async () => {
    const contact = contacts.find(c => c.id === form.contact_id);
    const data = { ...form, contact_name: contact?.name || form.contact_name, outlet: contact?.outlet || form.outlet };
    if (editing) {
      await appClient.entities.MediaPitch.update(editing, data);
    } else {
      await appClient.entities.MediaPitch.create({ ...data, sent_at: data.status === 'sent' ? new Date().toISOString() : undefined });
    }
    // Also update the contact's pitch_status & last_contact_date if contact exists
    if (form.contact_id && (data.status === 'sent' || data.status === 'replied' || data.status === 'hot')) {
      await appClient.entities.MediaContact.update(form.contact_id, {
        pitch_status: data.status,
        last_contact_date: new Date().toISOString(),
      });
      queryClient.invalidateQueries({ queryKey: ['mediaContacts'] });
    }
    queryClient.invalidateQueries({ queryKey: ['mediaPitches'] });
    setShowForm(false);
  };

  const remove = async (id) => {
    if (!confirm('Delete this pitch?')) return;
    await appClient.entities.MediaPitch.delete(id);
    queryClient.invalidateQueries({ queryKey: ['mediaPitches'] });
  };

  const updateStatus = async (id, status) => {
    await appClient.entities.MediaPitch.update(id, { status });
    queryClient.invalidateQueries({ queryKey: ['mediaPitches'] });
  };

  return (
    <div className="min-h-screen p-6" style={{ background: '#0a0a0a' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] mb-1" style={{ color: GOLD }}>PR & MEDIA</p>
            <h1 className="text-3xl font-bold text-white">Pitch Tracker</h1>
            <p className="text-sm mt-1 text-white">{pitches.length} total pitches across {contacts.length} contacts</p>
          </div>
          <div className="flex gap-3">
            <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              {['kanban','list'].map(v => (
                <button key={v} onClick={() => setView(v)}
                  className="px-4 py-2 text-xs font-bold capitalize transition-all"
                  style={{ background: view === v ? GOLD : '#1a1a1a', color: view === v ? '#000' : '#fff' }}>
                  {v}
                </button>
              ))}
            </div>
            <Button onClick={openAdd} className="gap-2" style={{ background: GOLD, color: '#000' }}>
              <Plus className="w-4 h-4" /> New Pitch
            </Button>
          </div>
        </div>

        {/* Kanban */}
        {view === 'kanban' && (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {COLUMNS.map(col => {
              const colPitches = pitches.filter(p => p.status === col.id);
              return (
                <div key={col.id} className="rounded-2xl p-3" style={{ background: '#111', border: `1px solid ${col.color}33` }}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold" style={{ color: col.color }}>{col.label}</p>
                    <span className="text-xs rounded-full px-2 py-0.5 font-bold" style={{ background: `${col.color}22`, color: col.color }}>{colPitches.length}</span>
                  </div>
                  <div className="space-y-2">
                    {colPitches.map(p => (
                      <div key={p.id} className="rounded-xl p-3 cursor-pointer group" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)' }}
                        onClick={() => openEdit(p)}>
                        <p className="text-xs font-bold text-white truncate">{p.contact_name}</p>
                        <p className="text-[10px] text-white">{p.outlet}</p>
                        <p className="text-[10px] mt-1 truncate text-white">{p.subject}</p>
                        <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={e => { e.stopPropagation(); remove(p.id); }} className="text-red-500 text-[10px]">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* List */}
        {view === 'list' && (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#111', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['Contact','Outlet','Subject','Channel','Status','Follow-up','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold tracking-widest" style={{ color: GOLD }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pitches.map((p, i) => (
                  <tr key={p.id} style={{ background: i % 2 === 0 ? '#0d0d0d' : '#0a0a0a', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td className="px-4 py-3 font-semibold text-white">{p.contact_name}</td>
                    <td className="px-4 py-3 text-white">{p.outlet}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate text-white">{p.subject}</td>
                    <td className="px-4 py-3 capitalize text-white">{p.channel}</td>
                    <td className="px-4 py-3">
                      <select value={p.status} onChange={e => updateStatus(p.id, e.target.value)}
                        className="text-xs rounded-full px-2 py-1 font-bold capitalize border-0"
                        style={{ background: '#1a1a1a', color: GOLD }}>
                        {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-white">{p.follow_up_date || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)}><Edit2 className="w-4 h-4" style={{ color: GOLD }} /></button>
                        <button onClick={() => remove(p.id)}><Trash2 className="w-4 h-4 text-red-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pitches.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-12 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>No pitches yet — add one above</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="w-full max-w-2xl rounded-2xl p-6 overflow-y-auto max-h-[90vh]" style={{ background: '#111', border: `1px solid ${GOLD}44` }}>
            <h2 className="text-xl font-bold text-white mb-5">{editing ? 'Edit Pitch' : 'New Pitch'}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold mb-1 block" style={{ color: GOLD }}>Contact</label>
                <select value={form.contact_id} onChange={e => setForm(p => ({...p, contact_id: e.target.value}))}
                  className="w-full px-3 py-2 rounded-lg text-sm border-0" style={{ background: '#1a1a1a', color: '#fff' }}>
                  <option value="">— Select Contact —</option>
                  {contacts.map(c => <option key={c.id} value={c.id}>{c.name} — {c.outlet}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold mb-1 block" style={{ color: GOLD }}>Channel</label>
                <select value={form.channel} onChange={e => setForm(p => ({...p, channel: e.target.value}))}
                  className="w-full px-3 py-2 rounded-lg text-sm border-0" style={{ background: '#1a1a1a', color: '#fff' }}>
                  {['email','sms','linkedin','twitter','phone','in_person'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold mb-1 block" style={{ color: GOLD }}>Subject Line</label>
                <Input value={form.subject} onChange={e => setForm(p => ({...p, subject: e.target.value}))}
                  className="border-0" style={{ background: '#1a1a1a', color: '#fff' }} />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold mb-1 block" style={{ color: GOLD }}>Pitch Message</label>
                <textarea value={form.message} onChange={e => setForm(p => ({...p, message: e.target.value}))} rows={5}
                  className="w-full px-3 py-2 rounded-lg text-sm resize-none border-0" style={{ background: '#1a1a1a', color: '#fff' }} />
              </div>
              <div>
                <label className="text-xs font-bold mb-1 block" style={{ color: GOLD }}>Status</label>
                <select value={form.status} onChange={e => setForm(p => ({...p, status: e.target.value}))}
                  className="w-full px-3 py-2 rounded-lg text-sm border-0" style={{ background: '#1a1a1a', color: '#fff' }}>
                  {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold mb-1 block" style={{ color: GOLD }}>Follow-up Date</label>
                <Input type="date" value={form.follow_up_date || ''} onChange={e => setForm(p => ({...p, follow_up_date: e.target.value}))}
                  className="border-0" style={{ background: '#1a1a1a', color: '#fff' }} />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold mb-1 block" style={{ color: GOLD }}>Reply Notes</label>
                <textarea value={form.reply_notes || ''} onChange={e => setForm(p => ({...p, reply_notes: e.target.value}))} rows={2}
                  className="w-full px-3 py-2 rounded-lg text-sm resize-none border-0" style={{ background: '#1a1a1a', color: '#fff' }} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <Button onClick={save} className="flex-1" style={{ background: GOLD, color: '#000' }}>Save Pitch</Button>
              <Button onClick={() => setShowForm(false)} variant="outline" className="flex-1" style={{ color: '#fff', borderColor: '#333' }}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}