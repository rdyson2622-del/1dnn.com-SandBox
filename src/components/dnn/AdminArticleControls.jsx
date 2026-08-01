import React, { useState } from 'react';
import { Pencil, Trash2, Plus, X, Save } from 'lucide-react';
import { appClient } from '@/api/appClient';
import { useQueryClient } from '@tanstack/react-query';

const GOLD = '#D4AF37';

const TRIGGER_TYPES = [
  'tax_policy', 'housing_market', 'job_market',
  'interest_rates', 'migration_data', 'employer_news', 'general'
];

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

  const field = (label, key, type = 'text', rows) => (
    <div>
      <label className="block text-xs font-bold mb-1 uppercase tracking-widest" style={{ color: GOLD }}>{label}</label>
      {rows ? (
        <textarea
          rows={rows}
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="w-full rounded-lg px-3 py-2 text-sm text-white resize-none focus:outline-none"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(212,175,55,0.25)' }}
        />
      ) : (
        <input
          type={type}
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="w-full rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(212,175,55,0.25)' }}
        />
      )}
    </div>
  );

  return (
    <div className="rounded-2xl p-5 space-y-4" style={{ background: '#111', border: `1px solid ${GOLD}` }}>
      <p className="text-xs font-black tracking-[0.3em] uppercase" style={{ color: GOLD }}>
        {initial.id ? 'Edit Article' : 'Add New Article'}
      </p>

      {field('Headline', 'headline')}
      {field('Dateline (e.g. SAN FRANCISCO —)', 'dateline')}
      {field('Video URL (YouTube, Vimeo, Loom — optional)', 'video_url')}

      <div>
        <label className="block text-xs font-bold mb-1 uppercase tracking-widest" style={{ color: GOLD }}>Trigger Type</label>
        <select
          value={form.trigger_type}
          onChange={e => setForm(f => ({ ...f, trigger_type: e.target.value }))}
          className="w-full rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
          style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.25)' }}
        >
          {TRIGGER_TYPES.map(t => (
            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold mb-1 uppercase tracking-widest" style={{ color: GOLD }}>Status</label>
        <select
          value={form.status}
          onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
          className="w-full rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
          style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.25)' }}
        >
          <option value="published">Published (visible on site)</option>
          <option value="staged">Staged (hidden)</option>
          <option value="blasted">Blasted</option>
        </select>
      </div>

      {field('Body Text', 'body', 'text', 6)}
      {field('Tags (comma separated)', 'tags')}

      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving || !form.headline}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-black disabled:opacity-50 transition-all"
          style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})` }}
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ background: 'rgba(255,255,255,0.07)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <X className="w-4 h-4" /> Cancel
        </button>
      </div>
    </div>
  );
}

// Floating Add Button + inline edit/delete overlays for articles
export function AdminAddButton({ onAdd }) {
  return (
    <button
      onClick={onAdd}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-black transition-all hover:scale-105"
      style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, boxShadow: '0 4px 14px rgba(212,175,55,0.3)' }}
    >
      <Plus className="w-4 h-4" /> Add Article / Video
    </button>
  );
}

// Renders as a sticky bar ABOVE the card (not overlaid on top, to avoid z-index issues)
export function AdminArticleOverlay({ article, onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-2 mb-1 px-1">
      <span className="text-[9px] font-black tracking-widest uppercase mr-1" style={{ color: 'rgba(212,175,55,0.6)' }}>ADMIN</span>
      <button
        onClick={() => onEdit(article)}
        className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all hover:opacity-80"
        style={{ background: '#D4AF37', color: '#000' }}
      >
        <Pencil className="w-3 h-3" /> Edit
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(article.id); }}
        className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all hover:opacity-80"
        style={{ background: '#ef4444', color: '#fff' }}
      >
        <Trash2 className="w-3 h-3" /> Delete
      </button>
    </div>
  );
}

export function AdminArticleModal({ article, onClose }) {
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const handleSave = async (data) => {
    setSaving(true);
    if (article.id) {
      await appClient.entities.DnnArticle.update(article.id, data);
    } else {
      await appClient.entities.DnnArticle.create(data);
    }
    queryClient.invalidateQueries({ queryKey: ['dnnArticlesConsumer'] });
    queryClient.invalidateQueries({ queryKey: ['dnnArticlesBlasted'] });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
      {/* Fixed back button — always visible top-left */}
      <button
        onClick={onClose}
        className="fixed top-4 left-4 z-60 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-80"
        style={{ background: 'rgba(0,0,0,0.9)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.4)' }}
      >
        <X className="w-4 h-4" /> ← Back
      </button>
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto mt-12">
        <ArticleForm initial={article} onSave={handleSave} onCancel={onClose} saving={saving} />
      </div>
    </div>
  );
}