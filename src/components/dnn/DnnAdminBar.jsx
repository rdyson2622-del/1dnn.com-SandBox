import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import { appClient } from '@/api/appClient';
import { useQueryClient } from '@tanstack/react-query';

const GOLD = '#D4AF37';

const TRIGGER_TYPES = [
  'tax_policy', 'housing_market', 'job_market',
  'interest_rates', 'migration_data', 'employer_news', 'general'
];

const STATUSES = ['published', 'staged', 'blasted'];

const emptyForm = {
  headline: '',
  dateline: '',
  body: '',
  video_url: '',
  trigger_type: 'general',
  status: 'published',
  tags: '',
};

function ArticleForm({ initial = {}, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    headline: initial.headline || '',
    dateline: initial.dateline || '',
    body: initial.body || '',
    video_url: initial.video_url || '',
    trigger_type: initial.trigger_type || 'general',
    status: initial.status || 'published',
    tags: (initial.tags || []).join(', '),
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    onSave({
      headline: form.headline,
      dateline: form.dateline,
      body: form.body,
      video_url: form.video_url || undefined,
      trigger_type: form.trigger_type,
      status: form.status,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      generated_date: initial.generated_date || new Date().toISOString(),
    });
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(212,175,55,0.3)',
    color: '#fff',
  };

  return (
    <div className="rounded-2xl p-5 space-y-4 mt-4" style={{ background: '#111', border: `1px solid ${GOLD}` }}>
      <p className="text-xs font-black tracking-[0.3em] uppercase" style={{ color: GOLD }}>
        {initial.id ? '✏️ Edit Article' : '➕ New Article / Video'}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold mb-1 uppercase tracking-widest" style={{ color: GOLD }}>Headline *</label>
          <input value={form.headline} onChange={e => set('headline', e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none" style={inputStyle} />
        </div>
        <div>
          <label className="block text-[10px] font-bold mb-1 uppercase tracking-widest" style={{ color: GOLD }}>Dateline (e.g. SAN DIEGO —)</label>
          <input value={form.dateline} onChange={e => set('dateline', e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none" style={inputStyle} />
        </div>
        <div>
          <label className="block text-[10px] font-bold mb-1 uppercase tracking-widest" style={{ color: GOLD }}>Video URL (YouTube / Vimeo / Loom)</label>
          <input value={form.video_url} onChange={e => set('video_url', e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none" style={inputStyle} />
        </div>
        <div>
          <label className="block text-[10px] font-bold mb-1 uppercase tracking-widest" style={{ color: GOLD }}>Tags (comma separated)</label>
          <input value={form.tags} onChange={e => set('tags', e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none" style={inputStyle} />
        </div>
        <div>
          <label className="block text-[10px] font-bold mb-1 uppercase tracking-widest" style={{ color: GOLD }}>Trigger Type</label>
          <select value={form.trigger_type} onChange={e => set('trigger_type', e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none" style={{ ...inputStyle }}>
            {TRIGGER_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold mb-1 uppercase tracking-widest" style={{ color: GOLD }}>Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none" style={{ ...inputStyle }}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold mb-1 uppercase tracking-widest" style={{ color: GOLD }}>Body Text</label>
        <textarea rows={6} value={form.body} onChange={e => set('body', e.target.value)}
          className="w-full rounded-lg px-3 py-2 text-sm resize-none focus:outline-none" style={inputStyle} />
      </div>

      <div className="flex gap-3 pt-1">
        <button onClick={handleSave} disabled={saving || !form.headline}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-black disabled:opacity-50"
          style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})` }}>
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
        </button>
        <button onClick={onCancel}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'rgba(255,255,255,0.07)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}>
          <X className="w-4 h-4" /> Cancel
        </button>
      </div>
    </div>
  );
}

export default function DnnAdminBar({ articles, isAdmin }) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  if (!isAdmin) return null;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['dnnArticlesConsumer'] });
    queryClient.invalidateQueries({ queryKey: ['dnnArticlesBlasted'] });
  };

  const handleAdd = async (data) => {
    setSaving(true);
    await appClient.entities.DnnArticle.create(data);
    invalidate();
    setSaving(false);
    setAdding(false);
  };

  const handleEdit = async (id, data) => {
    setSaving(true);
    await appClient.entities.DnnArticle.update(id, data);
    invalidate();
    setSaving(false);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this article?')) return;
    await appClient.entities.DnnArticle.delete(id);
    invalidate();
  };

  return (
    <div className="w-full mb-8 rounded-2xl overflow-hidden" style={{ border: `2px solid ${GOLD}`, background: '#0d0d0d' }}>
      {/* Header bar */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-4"
        style={{ background: 'rgba(212,175,55,0.12)' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-black tracking-[0.3em] uppercase" style={{ color: GOLD }}>🛠 Admin — DNN Article Manager</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(212,175,55,0.2)', color: GOLD }}>
            {articles.length} articles
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/50">Click to {open ? 'hide' : 'expand'}</span>
          {open ? <ChevronUp className="w-4 h-4" style={{ color: GOLD }} /> : <ChevronDown className="w-4 h-4" style={{ color: GOLD }} />}
        </div>
      </button>

      {open && (
        <div className="px-6 py-5 space-y-4">
          {/* Add new button */}
          {!adding && (
            <button onClick={() => setAdding(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-black"
              style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})` }}>
              <Plus className="w-4 h-4" /> Add New Article / Video
            </button>
          )}

          {adding && (
            <ArticleForm
              onSave={handleAdd}
              onCancel={() => setAdding(false)}
              saving={saving}
            />
          )}

          {/* Article list */}
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {articles.map(article => (
              <div key={article.id}>
                {editingId === article.id ? (
                  <ArticleForm
                    initial={article}
                    onSave={(data) => handleEdit(article.id, data)}
                    onCancel={() => setEditingId(null)}
                    saving={saving}
                  />
                ) : (
                  <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{article.headline}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] uppercase tracking-wider" style={{ color: GOLD }}>{article.status}</span>
                        {article.video_url && <span className="text-[10px] text-purple-400 uppercase tracking-wider">● VIDEO</span>}
                        <span className="text-[10px] text-white/30">{article.trigger_type?.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => setEditingId(article.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-80"
                        style={{ background: 'rgba(212,175,55,0.2)', color: GOLD }}>
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                      <button onClick={() => handleDelete(article.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-80"
                        style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}