import React, { useState, useEffect } from 'react';
import { appClient } from '@/api/appClient';
import { X, Save, RefreshCw } from 'lucide-react';

const GOLD = '#D4AF37';

export default function ScriptEditorModal({ show, onClose, onSaved }) {
  const [clips, setClips] = useState(show.clips || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setClips(show.clips || []);
  }, [show]);

  const handleClipChange = (index, field, value) => {
    const updated = [...clips];
    updated[index] = { ...updated[index], [field]: value };
    setClips(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await appClient.entities.DnnBroadcast.update(show.id, { clips });
      onSaved();
    } catch (e) {
      setError(e.message);
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
        style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.3)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <p className="text-sm font-black text-white">{show.show_name || 'Show'} — Script Editor</p>
            <p className="text-[10px] text-slate-500">{show.broadcast_date} · Edit clips then re-render</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clips editor */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {clips.map((clip, i) => (
            <div key={i} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full"
                  style={{ background: clip.role === 'charlie' ? 'rgba(212,175,55,0.15)' : 'rgba(147,112,219,0.15)', color: clip.role === 'charlie' ? GOLD : '#A78BFA' }}>
                  {clip.role}
                </span>
                <span className="text-[10px] text-slate-500">Clip #{i + 1}</span>
                {clip.videoUrl && <span className="text-[9px] text-green-400">✓ rendered</span>}
              </div>
              <textarea
                value={clip.script || ''}
                onChange={(e) => handleClipChange(i, 'script', e.target.value)}
                rows={5}
                className="w-full rounded-lg p-3 text-sm text-white resize-y"
                style={{ background: '#0a0a0a', border: '1px solid rgba(212,175,55,0.15)', outline: 'none' }}
                placeholder="Enter script text…"
              />
            </div>
          ))}
          {clips.length === 0 && (
            <p className="text-center text-slate-500 text-sm py-8">No clips on this show yet.</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 shrink-0 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {error && <p className="text-xs text-red-400">✗ {error}</p>}
          <div className="flex gap-2 ml-auto">
            <button onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-bold text-white"
              style={{ background: '#333', border: '1px solid rgba(255,255,255,0.1)' }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-black transition-all disabled:opacity-50"
              style={{ background: saving ? '#666' : 'linear-gradient(135deg, #e8c84a, #D4AF37)' }}>
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? 'Saving…' : 'Save Script'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}