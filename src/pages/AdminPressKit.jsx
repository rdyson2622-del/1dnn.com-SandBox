import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit2, Download, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const GOLD = '#D4AF37';
const ASSET_TYPES = ['press_release','headshot','logo','narrative','bio','fact_sheet','media_kit','video','other'];

const TYPE_ICONS = {
  press_release: '📰', headshot: '📸', logo: '🏷️', narrative: '📖',
  bio: '👤', fact_sheet: '📋', media_kit: '📦', video: '🎬', other: '📁',
};

const EMPTY_FORM = { title: '', asset_type: 'press_release', description: '', file_url: '', external_url: '', is_public: true, tags: [] };

export default function AdminPressKit() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filterType, setFilterType] = useState('all');
  const [uploading, setUploading] = useState(false);

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['mediaAssets'],
    queryFn: () => appClient.entities.MediaAsset.list('-created_date', 200),
  });

  const filtered = filterType === 'all' ? assets : assets.filter(a => a.asset_type === filterType);

  const openAdd = () => { setForm(EMPTY_FORM); setEditing(null); setShowForm(true); };
  const openEdit = (a) => { setForm({ ...EMPTY_FORM, ...a }); setEditing(a.id); setShowForm(true); };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await appClient.integrations.Core.UploadFile({ file });
    setForm(p => ({ ...p, file_url }));
    setUploading(false);
  };

  const save = async () => {
    const user = await appClient.auth.me();
    const data = { ...form, added_by: user?.email };
    if (editing) {
      await appClient.entities.MediaAsset.update(editing, data);
    } else {
      await appClient.entities.MediaAsset.create(data);
    }
    queryClient.invalidateQueries({ queryKey: ['mediaAssets'] });
    setShowForm(false);
  };

  const remove = async (id) => {
    if (!confirm('Delete this asset?')) return;
    await appClient.entities.MediaAsset.delete(id);
    queryClient.invalidateQueries({ queryKey: ['mediaAssets'] });
  };

  return (
    <div className="min-h-screen p-6" style={{ background: '#0a0a0a' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] mb-1" style={{ color: GOLD }}>PR & MEDIA</p>
            <h1 className="text-3xl font-bold text-white">Press Kit Assets</h1>
            <p className="text-sm mt-1 text-white">Headshots, logos, narratives & press releases — all in one place</p>
          </div>
          <div className="flex gap-3">
            <Link to="/media">
              <Button variant="outline" className="gap-2" style={{ borderColor: GOLD, color: GOLD }}>
                <Globe className="w-4 h-4" /> View Public Media Room
              </Button>
            </Link>
            <Button onClick={openAdd} className="gap-2" style={{ background: GOLD, color: '#000' }}>
              <Plus className="w-4 h-4" /> Add Asset
            </Button>
          </div>
        </div>

        {/* Type Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', ...ASSET_TYPES].map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all"
              style={{ background: filterType === t ? GOLD : '#1a1a1a', color: filterType === t ? '#000' : '#fff' }}>
              {t === 'all' ? 'All' : `${TYPE_ICONS[t] || ''} ${t.replace('_',' ')}`}
            </button>
          ))}
        </div>

        {/* Asset Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(asset => (
            <div key={asset.id} className="rounded-2xl p-5 group" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{TYPE_ICONS[asset.asset_type] || '📁'}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(asset)}><Edit2 className="w-4 h-4" style={{ color: GOLD }} /></button>
                  <button onClick={() => remove(asset.id)}><Trash2 className="w-4 h-4 text-red-500" /></button>
                </div>
              </div>
              <p className="font-bold text-white mb-1">{asset.title}</p>
              <p className="text-xs capitalize mb-2" style={{ color: GOLD }}>{asset.asset_type?.replace('_',' ')}</p>
              {asset.description && <p className="text-xs mb-3 line-clamp-2 text-white">{asset.description}</p>}
              <div className="flex items-center gap-2 mt-3">
                {asset.is_public && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>PUBLIC</span>
                )}
                {(asset.file_url || asset.external_url) && (
                  <a href={asset.file_url || asset.external_url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-bold" style={{ color: GOLD }}>
                    <Download className="w-3 h-3" /> Download / View
                  </a>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-16" style={{ color: 'rgba(255,255,255,0.3)' }}>No assets yet — add your first one above</div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="w-full max-w-lg rounded-2xl p-6 overflow-y-auto max-h-[90vh]" style={{ background: '#111', border: `1px solid ${GOLD}44` }}>
            <h2 className="text-xl font-bold text-white mb-5">{editing ? 'Edit Asset' : 'New Press Kit Asset'}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold mb-1 block" style={{ color: GOLD }}>Title *</label>
                <Input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))}
                  className="border-0" style={{ background: '#1a1a1a', color: '#fff' }} />
              </div>
              <div>
                <label className="text-xs font-bold mb-1 block" style={{ color: GOLD }}>Asset Type</label>
                <select value={form.asset_type} onChange={e => setForm(p => ({...p, asset_type: e.target.value}))}
                  className="w-full px-3 py-2 rounded-lg text-sm capitalize border-0" style={{ background: '#1a1a1a', color: '#fff' }}>
                  {ASSET_TYPES.map(t => <option key={t} value={t}>{TYPE_ICONS[t]} {t.replace('_',' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold mb-1 block" style={{ color: GOLD }}>Description</label>
                <textarea value={form.description || ''} onChange={e => setForm(p => ({...p, description: e.target.value}))} rows={2}
                  className="w-full px-3 py-2 rounded-lg text-sm resize-none border-0" style={{ background: '#1a1a1a', color: '#fff' }} />
              </div>
              <div>
                <label className="text-xs font-bold mb-1 block" style={{ color: GOLD }}>Upload File</label>
                <input type="file" onChange={handleFileUpload} className="text-sm" style={{ color: '#fff' }} />
                {uploading && <p className="text-xs mt-1" style={{ color: GOLD }}>Uploading…</p>}
                {form.file_url && <p className="text-xs mt-1 text-green-400">✓ File uploaded</p>}
              </div>
              <div>
                <label className="text-xs font-bold mb-1 block" style={{ color: GOLD }}>Or External URL</label>
                <Input value={form.external_url || ''} onChange={e => setForm(p => ({...p, external_url: e.target.value}))}
                  placeholder="https://…" className="border-0" style={{ background: '#1a1a1a', color: '#fff' }} />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="is_public" checked={form.is_public} onChange={e => setForm(p => ({...p, is_public: e.target.checked}))} />
                <label htmlFor="is_public" className="text-sm text-white">Show on public Media Room page</label>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <Button onClick={save} disabled={uploading} className="flex-1" style={{ background: GOLD, color: '#000' }}>Save Asset</Button>
              <Button onClick={() => setShowForm(false)} variant="outline" className="flex-1" style={{ color: '#fff', borderColor: '#333' }}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}