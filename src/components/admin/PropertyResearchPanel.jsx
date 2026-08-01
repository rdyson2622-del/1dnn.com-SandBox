import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Sparkles, Save, Loader2 } from 'lucide-react';

const GOLD = '#D4AF37';

const CATEGORIES = [
  { key: 'neighborhoods', label: 'Neighborhoods', icon: '🏘️' },
  { key: 'schools', label: 'Schools & Education', icon: '🎓' },
  { key: 'cost_of_living', label: 'Cost of Living', icon: '💰' },
  { key: 'healthcare', label: 'Healthcare', icon: '❤️' },
  { key: 'recreation', label: 'Recreation', icon: '🌿' },
  { key: 'local_character', label: 'Local Character', icon: '✨' },
];

const RATING_OPTIONS = [
  { value: 'green', label: '🟢 Good', color: '#22c55e' },
  { value: 'yellow', label: '🟡 Mixed', color: '#D4AF37' },
  { value: 'red', label: '🔴 Concern', color: '#ef4444' },
];

export default function PropertyResearchPanel({ clientId }) {
  const queryClient = useQueryClient();

  const { data: properties = [] } = useQuery({
    queryKey: ['property-candidates', clientId],
    queryFn: () => appClient.entities.PropertyCandidate.filter({ client_id: clientId }, '-created_date', 20),
    enabled: !!clientId,
  });

  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const selected = properties.find(p => p.id === selectedId);

  const loadProperty = (p) => {
    setSelectedId(p.id);
    const f = { gemini_summary: p.gemini_summary || '', fit_score: p.fit_score || '' };
    CATEGORIES.forEach(c => {
      f[`${c.key}_rating`] = p[c.key]?.rating || '';
      f[`${c.key}_score`] = p[c.key]?.score || '';
      f[`${c.key}_notes`] = p[c.key]?.notes || '';
    });
    setForm(f);
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    const update = {
      gemini_summary: form.gemini_summary,
      fit_score: form.fit_score ? parseFloat(form.fit_score) : undefined,
      gemini_researched: true,
    };
    CATEGORIES.forEach(c => {
      update[c.key] = {
        rating: form[`${c.key}_rating`] || undefined,
        score: form[`${c.key}_score`] ? parseFloat(form[`${c.key}_score`]) : undefined,
        notes: form[`${c.key}_notes`] || undefined,
      };
    });
    await appClient.entities.PropertyCandidate.update(selectedId, update);
    queryClient.invalidateQueries({ queryKey: ['property-candidates', clientId] });
    setSaving(false);
  };

  const handleGeminiResearch = async () => {
    if (!selected) return;
    setGenerating(true);
    try {
      const result = await appClient.integrations.Core.InvokeLLM({
        prompt: `You are a real estate research expert. Research this property for a relocation buyer and provide detailed findings across 6 categories.

Property: ${selected.address}, ${selected.city}, ${selected.state}
Price: ${selected.price ? '$' + selected.price.toLocaleString() : 'unknown'}
Bedrooms: ${selected.bedrooms || 'unknown'}, Bathrooms: ${selected.bathrooms || 'unknown'}

For each category, provide:
1. A rating (green=good, yellow=mixed, red=concern)
2. A score from 1-5
3. 2-3 sentences of specific findings

Categories: neighborhoods, schools, cost_of_living, healthcare, recreation, local_character

Also provide an overall summary (2-3 sentences) of this property's fit for a relocating family.
Calculate an overall fit_score from 0-100.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            neighborhoods: { type: 'object', properties: { rating: { type: 'string' }, score: { type: 'number' }, notes: { type: 'string' } } },
            schools: { type: 'object', properties: { rating: { type: 'string' }, score: { type: 'number' }, notes: { type: 'string' } } },
            cost_of_living: { type: 'object', properties: { rating: { type: 'string' }, score: { type: 'number' }, notes: { type: 'string' } } },
            healthcare: { type: 'object', properties: { rating: { type: 'string' }, score: { type: 'number' }, notes: { type: 'string' } } },
            recreation: { type: 'object', properties: { rating: { type: 'string' }, score: { type: 'number' }, notes: { type: 'string' } } },
            local_character: { type: 'object', properties: { rating: { type: 'string' }, score: { type: 'number' }, notes: { type: 'string' } } },
            gemini_summary: { type: 'string' },
            fit_score: { type: 'number' },
          }
        }
      });

      // Populate form with Gemini results
      const newForm = { gemini_summary: result.gemini_summary || '', fit_score: result.fit_score || '' };
      CATEGORIES.forEach(c => {
        const data = result[c.key] || {};
        newForm[`${c.key}_rating`] = data.rating || '';
        newForm[`${c.key}_score`] = data.score || '';
        newForm[`${c.key}_notes`] = data.notes || '';
      });
      setForm(newForm);
    } catch (e) {
      console.error('Gemini research error:', e);
    }
    setGenerating(false);
  };

  if (properties.length === 0) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Client hasn't added any properties yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Property selector */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {properties.map(p => (
          <button key={p.id} onClick={() => loadProperty(p)}
            className="p-4 rounded-xl text-left transition-all"
            style={{
              background: selectedId === p.id ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${selectedId === p.id ? GOLD : 'rgba(255,255,255,0.1)'}`,
            }}>
            <p className="text-sm font-bold truncate" style={{ color: '#fff' }}>{p.address}</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{p.city}, {p.state}</p>
            {p.gemini_researched && <span className="text-xs font-bold" style={{ color: '#22c55e' }}>✓ Researched</span>}
            {!p.gemini_researched && <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Pending research</span>}
          </button>
        ))}
      </div>

      {/* Research form */}
      {selected && (
        <div className="rounded-2xl p-6" style={{ background: '#0d0d0d', border: `1px solid rgba(212,175,55,0.25)` }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-bold tracking-widest" style={{ color: GOLD }}>RESEARCH PANEL</p>
              <h3 className="font-bold" style={{ color: '#fff' }}>{selected.address}</h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleGeminiResearch}
                disabled={generating}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold"
                style={{ background: 'rgba(212,175,55,0.15)', border: `1px solid ${GOLD}`, color: GOLD }}>
                {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {generating ? 'Researching...' : 'Auto-Research with Gemini'}
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold"
                style={{ background: GOLD, color: '#000' }}>
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          {/* Category inputs */}
          <div className="space-y-4">
            {CATEGORIES.map(({ key, label, icon }) => (
              <div key={key} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-sm font-bold mb-3" style={{ color: '#fff' }}>{icon} {label}</p>
                <div className="grid grid-cols-3 gap-3 mb-2">
                  {/* Rating */}
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Rating</label>
                    <select
                      value={form[`${key}_rating`] || ''}
                      onChange={e => set(`${key}_rating`, e.target.value)}
                      className="w-full rounded-lg px-2 py-1.5 text-xs"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}>
                      <option value="">—</option>
                      {RATING_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>
                  {/* Score */}
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Score (1-5)</label>
                    <input type="number" min="1" max="5" step="0.5"
                      value={form[`${key}_score`] || ''}
                      onChange={e => set(`${key}_score`, e.target.value)}
                      className="w-full rounded-lg px-2 py-1.5 text-xs"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} />
                  </div>
                </div>
                {/* Notes */}
                <textarea
                  value={form[`${key}_notes`] || ''}
                  onChange={e => set(`${key}_notes`, e.target.value)}
                  rows={2}
                  placeholder="Research findings..."
                  className="w-full rounded-lg px-3 py-2 text-xs resize-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', outline: 'none' }} />
              </div>
            ))}

            {/* Overall fit score */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: GOLD }}>Overall Fit Score (0-100)</label>
                <input type="number" min="0" max="100"
                  value={form.fit_score || ''}
                  onChange={e => set('fit_score', e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} />
              </div>
            </div>

            {/* Gemini summary */}
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: GOLD }}>✨ Gemini Overall Assessment</label>
              <textarea
                value={form.gemini_summary || ''}
                onChange={e => set('gemini_summary', e.target.value)}
                rows={3}
                placeholder="Overall summary of this property's fit..."
                className="w-full rounded-xl px-4 py-2.5 text-sm resize-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(212,175,55,0.2)`, color: '#fff', outline: 'none' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}