import React, { useState } from 'react';
import { appClient } from '@/api/appClient';
import { X } from 'lucide-react';

const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,175,55,0.2)' };

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[11px] font-bold text-slate-400 block mb-1 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

export default function PageFormModal({ page, onClose, onSaved }) {
  const [form, setForm] = useState({
    pageTitle: page?.pageTitle || '',
    pageKey: page?.pageKey || '',
    pageUrl: page?.pageUrl || '',
    pageRoute: page?.pageRoute || '',
    pageType: page?.pageType || 'service_page',
    pageText: page?.pageText || '',
    pageSummary: page?.pageSummary || '',
    pageScreenshotUrl: page?.pageScreenshotUrl || '',
    status: page?.status || 'active',
    displayOrder: page?.displayOrder ?? 0,
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.pageTitle.trim()) return;
    setSaving(true);
    const data = { ...form, displayOrder: Number(form.displayOrder) || 0 };
    if (page) {
      await appClient.entities.DysonPage.update(page.id, data);
    } else {
      await appClient.entities.DysonPage.create(data);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div className="rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.3)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">{page ? 'Edit Page' : 'Add Page'}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4">
          <Field label="Page Title">
            <input value={form.pageTitle} onChange={e => set('pageTitle', e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none" style={inputStyle} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Page Key (slug)">
              <input value={form.pageKey} onChange={e => set('pageKey', e.target.value)} placeholder="relocation-services"
                className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none" style={inputStyle} />
            </Field>
            <Field label="In-app Route">
              <input value={form.pageRoute} onChange={e => set('pageRoute', e.target.value)} placeholder="/relo-management"
                className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none" style={inputStyle} />
            </Field>
          </div>

          <Field label="Public Page URL">
            <input value={form.pageUrl} onChange={e => set('pageUrl', e.target.value)} placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none" style={inputStyle} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Page Type">
              <select value={form.pageType} onChange={e => set('pageType', e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none" style={inputStyle}>
                {['consumer_page', 'service_page', 'presentation_page', 'explainer_page'].map(t => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none" style={inputStyle}>
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </Field>
          </div>

          <Field label="Screenshot URL (Cloudinary background)">
            <input value={form.pageScreenshotUrl} onChange={e => set('pageScreenshotUrl', e.target.value)} placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none" style={inputStyle} />
          </Field>

          <Field label="Page Summary">
            <input value={form.pageSummary} onChange={e => set('pageSummary', e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none" style={inputStyle} />
          </Field>

          <Field label="Page Content / Copy">
            <textarea value={form.pageText} onChange={e => set('pageText', e.target.value)} rows={6}
              placeholder="Paste the page copy that Charlie's script will be based on..."
              className="w-full px-3 py-2 rounded-lg text-sm text-white resize-none focus:outline-none" style={inputStyle} />
          </Field>

          <Field label="Display Order">
            <input type="number" value={form.displayOrder} onChange={e => set('displayOrder', e.target.value)}
              className="w-32 px-3 py-2 rounded-lg text-sm text-white focus:outline-none" style={inputStyle} />
          </Field>
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={handleSave} disabled={saving || !form.pageTitle.trim()}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-bold text-black disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #e8c84a, #D4AF37)' }}>
            {saving ? 'Saving...' : 'Save Page'}
          </button>
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-400 border"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}