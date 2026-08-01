import React, { useState, useEffect } from 'react';
import { appClient } from '@/api/appClient';
import { Save, Loader } from 'lucide-react';
import Shard2Header from '@/components/shard2/Shard2Header';

const inputStyle = { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(212,175,55,0.2)' };

const DEFAULTS = {
  defaultAvatarId: '', defaultVoiceId: '',
  defaultVideoWidth: 1920, defaultVideoHeight: 1080,
  defaultCharliePosition: 'upper_right', defaultCharlieBoxWidth: 480, defaultCharlieBoxHeight: 270,
  n8nRenderWebhookUrl: '',
};

export default function Shard2Settings() {
  const [form, setForm] = useState(DEFAULTS);
  const [recordId, setRecordId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    appClient.entities.Shard2Settings.filter({ singleton_key: 'default' }).then(arr => {
      if (arr?.[0]) {
        setRecordId(arr[0].id);
        setForm({ ...DEFAULTS, ...arr[0] });
      }
      setLoading(false);
    });
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true); setMsg(null);
    const payload = {
      ...form,
      singleton_key: 'default',
      defaultVideoWidth: Number(form.defaultVideoWidth) || 1920,
      defaultVideoHeight: Number(form.defaultVideoHeight) || 1080,
      defaultCharlieBoxWidth: Number(form.defaultCharlieBoxWidth) || 480,
      defaultCharlieBoxHeight: Number(form.defaultCharlieBoxHeight) || 270,
    };
    if (recordId) {
      await appClient.entities.Shard2Settings.update(recordId, payload);
    } else {
      const created = await appClient.entities.Shard2Settings.create(payload);
      setRecordId(created.id);
    }
    setMsg('Settings saved.');
    setSaving(false);
  };

  const Field = ({ label, k, type = 'text' }) => (
    <div>
      <label className="text-[11px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">{label}</label>
      <input type={type} value={form[k]} onChange={e => set(k, e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none" style={inputStyle} />
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0d' }}>
      <Shard2Header />
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <p className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: '#D4AF37' }}>Shard 2 Settings</p>

        <div className="rounded-lg px-4 py-3 text-xs leading-relaxed" style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)', color: '#93c5fd' }}>
          Non-secret defaults only. Keep HeyGen, Cloudinary and Gemini API keys inside n8n credentials — not here.
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader className="w-6 h-6 animate-spin" style={{ color: '#D4AF37' }} /></div>
        ) : (
          <div className="rounded-xl p-5 space-y-4" style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.2)' }}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Default Avatar ID (Charlie)" k="defaultAvatarId" />
              <Field label="Default Voice ID (Charlie)" k="defaultVoiceId" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Video Width" k="defaultVideoWidth" type="number" />
              <Field label="Video Height" k="defaultVideoHeight" type="number" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Charlie Position</label>
                <select value={form.defaultCharliePosition} onChange={e => set('defaultCharliePosition', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none" style={inputStyle}>
                  {['upper_right', 'upper_left', 'lower_right', 'lower_left'].map(p => <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <Field label="Box Width" k="defaultCharlieBoxWidth" type="number" />
              <Field label="Box Height" k="defaultCharlieBoxHeight" type="number" />
            </div>
            <Field label="n8n Render Webhook URL (optional)" k="n8nRenderWebhookUrl" />

            {msg && <p className="text-xs text-green-400">{msg}</p>}

            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-black disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #e8c84a, #D4AF37)' }}>
              {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}