import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Video, Plus, Link, Upload, Trash2, Copy, ExternalLink, CheckCircle2 } from 'lucide-react';

const GOLD = '#D4AF37';

const CATEGORIES = [
  { value: 'intro', label: 'Intro / Who We Are' },
  { value: 'process', label: 'Our Process' },
  { value: 'testimonial', label: 'Testimonial' },
  { value: 'market_update', label: 'Market Update' },
  { value: 'how_to', label: 'How-To' },
  { value: 'other', label: 'Other' },
];

const CAT_COLORS = {
  intro: '#D4AF37',
  process: '#60a5fa',
  testimonial: '#22c55e',
  market_update: '#f97316',
  how_to: '#a78bfa',
  other: '#6b7280',
};

function getEmbedUrl(url) {
  if (!url) return null;
  if (url.includes('youtube.com/watch')) {
    const id = new URL(url).searchParams.get('v');
    return `https://www.youtube.com/embed/${id}`;
  }
  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  if (url.includes('vimeo.com/')) {
    const id = url.split('vimeo.com/')[1]?.split('?')[0];
    return `https://player.vimeo.com/video/${id}`;
  }
  if (url.includes('loom.com/share/')) {
    const id = url.split('loom.com/share/')[1]?.split('?')[0];
    return `https://www.loom.com/embed/${id}`;
  }
  return null;
}

const EMPTY_FORM = {
  title: '',
  description: '',
  category: 'intro',
  source_type: 'link',
  video_url: '',
  tags: '',
  is_active: true,
};

export default function AdminVideoLibrary() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(null);
  const [filterCat, setFilterCat] = useState('all');
  const [previewId, setPreviewId] = useState(null);

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['video-library'],
    queryFn: () => appClient.entities.VideoLibrary.list('-created_date', 200),
  });

  const filtered = filterCat === 'all' ? videos : videos.filter(v => v.category === filterCat);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await appClient.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, file_url, source_type: 'upload' }));
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.title) return;
    setSaving(true);
    const user = await appClient.auth.me();
    await appClient.entities.VideoLibrary.create({
      ...form,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      added_by: user?.email,
    });
    queryClient.invalidateQueries({ queryKey: ['video-library'] });
    setForm(EMPTY_FORM);
    setShowForm(false);
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this video?')) return;
    await appClient.entities.VideoLibrary.delete(id);
    queryClient.invalidateQueries({ queryKey: ['video-library'] });
  };

  const copyUrl = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getVideoUrl = (v) => v.source_type === 'upload' ? v.file_url : v.video_url;

  return (
    <div className="min-h-screen p-6" style={{ background: '#0a0a0a' }}>
      <div className="w-full mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.15)', border: `1px solid ${GOLD}40` }}>
              <Video className="w-5 h-5" style={{ color: GOLD }} />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">Video Library</h1>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{videos.length} video{videos.length !== 1 ? 's' : ''} stored</p>
            </div>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold"
            style={{ background: GOLD, color: '#000' }}>
            <Plus className="w-4 h-4" />
            Add Video
          </button>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="rounded-2xl p-6 mb-6" style={{ background: '#111', border: `1px solid ${GOLD}40` }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: GOLD }}>Add New Video</p>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-bold mb-1 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Bob's Intro Video"
                  className="w-full rounded-xl px-4 py-2.5 text-sm"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} />
              </div>
              <div>
                <label className="text-xs font-bold mb-1 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full rounded-xl px-4 py-2.5 text-sm"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-bold mb-1 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="What is this video about?"
                rows={2}
                className="w-full rounded-xl px-4 py-2.5 text-sm resize-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} />
            </div>

            {/* Source type toggle */}
            <div className="flex gap-2 mb-4">
              {['link', 'upload'].map(type => (
                <button key={type} onClick={() => setForm(f => ({ ...f, source_type: type }))}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold"
                  style={{ background: form.source_type === type ? GOLD : 'rgba(255,255,255,0.06)', color: form.source_type === type ? '#000' : 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {type === 'link' ? <Link className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
                  {type === 'link' ? 'Paste Link' : 'Upload File'}
                </button>
              ))}
            </div>

            {form.source_type === 'link' ? (
              <div className="mb-4">
                <label className="text-xs font-bold mb-1 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Video URL (Loom, YouTube, Vimeo)</label>
                <input value={form.video_url} onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))}
                  placeholder="https://loom.com/share/..."
                  className="w-full rounded-xl px-4 py-2.5 text-sm"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} />
              </div>
            ) : (
              <div className="mb-4">
                <label className="text-xs font-bold mb-1 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Upload Video File</label>
                <label className="flex items-center gap-3 w-full rounded-xl px-4 py-3 cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)' }}>
                  <Upload className="w-4 h-4" style={{ color: GOLD }} />
                  <span className="text-sm" style={{ color: form.file_url ? '#22c55e' : 'rgba(255,255,255,0.4)' }}>
                    {uploading ? 'Uploading...' : form.file_url ? '✓ File uploaded' : 'Click to upload video'}
                  </span>
                  <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            )}

            <div className="mb-4">
              <label className="text-xs font-bold mb-1 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Tags (comma-separated)</label>
              <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                placeholder="intro, bob, relocation"
                className="w-full rounded-xl px-4 py-2.5 text-sm"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} />
            </div>

            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving || !form.title || uploading}
                className="px-6 py-2.5 rounded-full text-sm font-bold disabled:opacity-40"
                style={{ background: GOLD, color: '#000' }}>
                {saving ? 'Saving...' : 'Save Video'}
              </button>
              <button onClick={() => setShowForm(false)}
                className="px-6 py-2.5 rounded-full text-sm font-bold"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-5">
          {[{ value: 'all', label: 'All' }, ...CATEGORIES].map(c => (
            <button key={c.value} onClick={() => setFilterCat(c.value)}
              className="px-4 py-1.5 rounded-full text-xs font-bold"
              style={{ background: filterCat === c.value ? GOLD : 'rgba(255,255,255,0.06)', color: filterCat === c.value ? '#000' : 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Video Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-white/10 border-t-yellow-400 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <Video className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No videos yet. Click "Add Video" to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filtered.map(v => {
              const url = getVideoUrl(v);
              const embedUrl = v.source_type === 'link' ? getEmbedUrl(url) : null;
              const isPreview = previewId === v.id;
              return (
                <div key={v.id} className="rounded-2xl overflow-hidden flex flex-col"
                  style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>

                  {/* Thumbnail / Embed */}
                  <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
                    {isPreview && embedUrl ? (
                      <iframe src={embedUrl} className="w-full h-full" allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope" />
                    ) : isPreview && v.source_type === 'upload' && url ? (
                      <video src={url} controls className="w-full h-full object-contain" />
                    ) : (
                      <button onClick={() => setPreviewId(isPreview ? null : v.id)}
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <div className="w-14 h-14 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(212,175,55,0.2)', border: `2px solid ${GOLD}60` }}>
                          <Video className="w-6 h-6" style={{ color: GOLD }} />
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-bold text-white leading-tight">{v.title}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                        style={{ background: `${CAT_COLORS[v.category]}20`, color: CAT_COLORS[v.category] }}>
                        {CATEGORIES.find(c => c.value === v.category)?.label || v.category}
                      </span>
                    </div>

                    {v.description && (
                      <p className="text-xs mb-2 line-clamp-2" style={{ color: 'rgba(255,255,255,0.4)' }}>{v.description}</p>
                    )}

                    {v.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {v.tags.map(t => (
                          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-auto">
                      <span className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}>
                        {v.source_type === 'upload' ? '📁 Uploaded' : '🔗 Link'}
                      </span>
                      <div className="flex gap-1 ml-auto">
                        {url && (
                          <button onClick={() => copyUrl(url, v.id)}
                            title="Copy URL"
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                            style={{ background: copied === v.id ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)' }}>
                            {copied === v.id ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.4)' }} />}
                          </button>
                        )}
                        {url && v.source_type === 'link' && (
                          <a href={url} target="_blank" rel="noopener noreferrer"
                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <ExternalLink className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.4)' }} />
                          </a>
                        )}
                        <button onClick={() => handleDelete(v.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ background: 'rgba(239,68,68,0.08)' }}>
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}