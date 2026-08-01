import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Sparkles, ExternalLink, Trash2, FileStack, Camera, Loader } from 'lucide-react';
import Shard2Header from '@/components/shard2/Shard2Header';
import PageFormModal from '@/components/shard2/PageFormModal';

export default function Shard2Pages() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [modalPage, setModalPage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(null);
  const [capturing, setCapturing] = useState(null);
  const [captureMsg, setCaptureMsg] = useState(null);

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ['shard2Pages'],
    queryFn: () => appClient.entities.DysonPage.list('displayOrder', 200),
  });
  const { data: explainers = [] } = useQuery({
    queryKey: ['shard2Explainers'],
    queryFn: () => appClient.entities.CharliePageExplainer.list('-created_date', 500),
  });

  const explainerForPage = (pageId) => explainers.find(e => e.pageId === pageId);

  const openAdd = () => { setModalPage(null); setShowModal(true); };
  const openEdit = (page) => { setModalPage(page); setShowModal(true); };

  const handleSaved = () => {
    setShowModal(false);
    queryClient.invalidateQueries({ queryKey: ['shard2Pages'] });
  };

  const handleDelete = async (page) => {
    if (!confirm(`Delete "${page.pageTitle}"?`)) return;
    await appClient.entities.DysonPage.delete(page.id);
    queryClient.invalidateQueries({ queryKey: ['shard2Pages'] });
  };

  // Capture a clean 1920x1080 16:9 background from the page's public URL,
  // upload it to public storage, and save it to pageScreenshotUrl (+ any explainer).
  const handleCapture = async (page) => {
    if (!page.pageUrl) {
      setCaptureMsg({ id: page.id, type: 'err', text: 'Add a public Page URL first.' });
      return;
    }
    setCapturing(page.id);
    setCaptureMsg(null);
    const res = await appClient.functions.invoke('shard2CapturePageScreenshot', { pageId: page.id });
    if (res.data?.success) {
      setCaptureMsg({ id: page.id, type: 'ok', text: 'Background captured.' });
      await queryClient.invalidateQueries({ queryKey: ['shard2Pages'] });
      await queryClient.invalidateQueries({ queryKey: ['shard2Explainers'] });
    } else {
      setCaptureMsg({ id: page.id, type: 'err', text: res.data?.error || 'Capture failed.' });
    }
    setCapturing(null);
  };

  // Create an explainer from a page, then jump to the script editor.
  // Copies Charlie defaults from Shard2Settings so avatarId / voiceId / box config are never empty.
  const handleCreateExplainer = async (page) => {
    setCreating(page.id);
    let explainer = explainerForPage(page.id);
    if (!explainer) {
      const settingsArr = await appClient.entities.Shard2Settings.filter({ singleton_key: 'default' });
      const settings = settingsArr?.[0] || {};

      explainer = await appClient.entities.CharliePageExplainer.create({
        pageId: page.id,
        pageKey: page.pageKey,
        pageTitle: page.pageTitle,
        pageUrl: page.pageUrl,
        pageScreenshotUrl: page.pageScreenshotUrl,
        rawPageText: page.pageText,
        scriptStatus: 'new',
        renderStatus: 'not_started',
        avatarId: settings.defaultAvatarId || '',
        voiceId: settings.defaultVoiceId || '',
        charliePosition: settings.defaultCharliePosition || 'upper_right',
        charlieBoxWidth: settings.defaultCharlieBoxWidth || 480,
        charlieBoxHeight: settings.defaultCharlieBoxHeight || 270,
      });
      await queryClient.invalidateQueries({ queryKey: ['shard2Explainers'] });
    }
    setCreating(null);
    navigate(`/admin/shard2/scripts?explainer=${explainer.id}`);
  };

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0d' }}>
      <Shard2Header />
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        <div className="flex items-center justify-between">
          <p className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: '#D4AF37' }}>Dyson Pages Manager</p>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-black"
            style={{ background: 'linear-gradient(135deg, #e8c84a, #D4AF37)' }}>
            <Plus className="w-4 h-4" /> Add Page
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><div className="w-6 h-6 border-4 border-slate-800 border-t-yellow-500 rounded-full animate-spin" /></div>
        ) : pages.length === 0 ? (
          <div className="rounded-xl p-12 text-center" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)' }}>
            <FileStack className="w-10 h-10 mx-auto mb-3 opacity-20 text-white" />
            <p className="text-sm text-slate-500">No pages yet. Add your first Dysonhomes page to get started.</p>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th className="px-4 py-3 font-bold">Page Title</th>
                  <th className="px-4 py-3 font-bold">Type</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold">Script</th>
                  <th className="px-4 py-3 font-bold">Video</th>
                  <th className="px-4 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map(page => {
                  const ex = explainerForPage(page.id);
                  const hasScript = ex && ['generated', 'needs_review', 'approved'].includes(ex.scriptStatus);
                  const hasVideo = ex && ex.renderStatus === 'completed';
                  return (
                    <tr key={page.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-20 aspect-video rounded overflow-hidden flex-shrink-0"
                            style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)' }}>
                            {page.pageScreenshotUrl ? (
                              <img src={page.pageScreenshotUrl} alt="bg" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Camera className="w-3.5 h-3.5 text-slate-700" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-white">{page.pageTitle}</p>
                            {page.pageUrl && <p className="text-[11px] text-slate-600 truncate max-w-[220px]">{page.pageUrl}</p>}
                            {captureMsg?.id === page.id && (
                              <p className="text-[10px] mt-0.5" style={{ color: captureMsg.type === 'err' ? '#f87171' : '#4ade80' }}>{captureMsg.text}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{page.pageType?.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: page.status === 'active' ? 'rgba(74,222,128,0.12)' : 'rgba(148,163,184,0.12)', color: page.status === 'active' ? '#4ade80' : '#94a3b8' }}>
                          {page.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{hasScript ? <span className="text-green-400">✓</span> : <span className="text-slate-700">—</span>}</td>
                      <td className="px-4 py-3">{hasVideo ? <span className="text-green-400">✓</span> : <span className="text-slate-700">—</span>}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 justify-end">
                          {page.pageUrl && (
                            <a href={page.pageUrl} target="_blank" rel="noreferrer"
                              className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400" title="Open page">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button onClick={() => handleCapture(page)} disabled={capturing === page.id}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50"
                            style={{ background: 'rgba(96,165,250,0.12)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' }}
                            title="Capture 1920×1080 background from page URL">
                            {capturing === page.id ? <Loader className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
                            {capturing === page.id ? '...' : 'Capture BG'}
                          </button>
                          <button onClick={() => openEdit(page)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400" title="Edit">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleCreateExplainer(page)} disabled={creating === page.id}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50"
                            style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}>
                            <Sparkles className="w-3 h-3" /> {creating === page.id ? '...' : (explainerForPage(page.id) ? 'Open Script' : 'Create Explainer')}
                          </button>
                          <button onClick={() => handleDelete(page)} className="p-1.5 rounded-lg hover:bg-red-400/10 text-slate-400 hover:text-red-400" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && <PageFormModal page={modalPage} onClose={() => setShowModal(false)} onSaved={handleSaved} />}
    </div>
  );
}