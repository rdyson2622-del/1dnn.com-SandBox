import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw, Send, Trash2, Eye, EyeOff, CheckCircle, Clock, Globe, Pencil, Save, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DNN_REVIEW_FEED_ITEMS } from '@/data/dnnSeedRecords';

const DYSON_VOICE = `You are the DNN Intelligence Bureau — the editorial arm of Dyson & Dyson Real Estate Concierge. Write in the "1927 Parallel" style: authoritative, sophisticated, slightly cinematic. Think a trusted financial journalist who appreciates the drama of the American migration story. No fluff. No clickbait. Lead with the data, end with the implication for a homeowner considering a move. Each brief: 3-4 short paragraphs, under 300 words. Author: "DNN Intelligence Bureau" — no external source links or bylines visible.`;

export default function DnnNewsFeed() {
  const [generating, setGenerating] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [blastModal, setBlastModal] = useState(null); // article to blast
  const [blasting, setBlasting] = useState(false);
  const [blastResult, setBlastResult] = useState(null);
  const [blastTier, setBlastTier] = useState('all');
  const queryClient = useQueryClient();

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['dnnArticles'],
    queryFn: () => appClient.entities.DnnArticle.list('-created_date', 100),
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const { data: subCount } = useQuery({
    queryKey: ['dnnSubCount'],
    queryFn: async () => {
      const subs = await appClient.entities.DnnSubscriber.list('-created_date', 1);
      return subs.length; // rough count
    },
  });

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerationError('');
    try {
      const request = appClient.integrations.Core.InvokeLLM({
      prompt: `${DYSON_VOICE}

Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.

Search the web for 5 "relocation-triggering" news stories from the past 48 hours covering: California tax policy, Bay Area housing/jobs, Arizona housing boom, Florida migration surge, New York cost of living, mortgage rate moves, remote work mandates, or major employer relocations.

For each story, write a DNN brief in the 1927 Parallel style. Return JSON:
{
  "briefs": [
    {
      "headline": "string — punchy, under 12 words, present tense",
      "dateline": "CITY NAME — ",
      "body": "3-4 paragraphs under 300 words. Authoritative, cinematic. End with implication for a homeowner considering relocating.",
      "tags": ["relevant", "tags"],
      "trigger_type": "tax_policy | housing_market | job_market | interest_rates | migration_data | employer_news"
    }
  ]
}`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          briefs: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                headline: { type: 'string' },
                dateline: { type: 'string' },
                body: { type: 'string' },
                tags: { type: 'array', items: { type: 'string' } },
                trigger_type: { type: 'string' },
              }
            }
          }
        }
      }
      });
      const res = await Promise.race([
        request,
        new Promise((_, reject) => setTimeout(() => reject(new Error('The news scan took too long. Please try again.')), 75_000)),
      ]);

      const briefs = res?.briefs || [];
      for (const brief of briefs) {
        await appClient.entities.DnnArticle.create({
          headline: brief.headline,
          dateline: brief.dateline,
          body: brief.body,
          tags: brief.tags || [],
          trigger_type: brief.trigger_type,
          status: 'staged',
          generated_date: new Date().toISOString(),
        });
      }
      queryClient.invalidateQueries({ queryKey: ['dnnArticles'] });
    } catch (error) {
      setGenerationError(error?.message || 'The news scan could not be completed.');
    } finally {
      setGenerating(false);
    }
  };

  const handleRestoreLiveFeed = async () => {
    setRestoring(true);
    setGenerationError('');
    try {
      const existingHeadlines = new Set(articles.map((article) => article.headline));
      const missing = DNN_REVIEW_FEED_ITEMS.filter((article) => !existingHeadlines.has(article.headline));
      if (missing.length) await appClient.entities.DnnArticle.bulkCreate(missing);
      await queryClient.invalidateQueries({ queryKey: ['dnnArticles'] });
    } catch (error) {
      setGenerationError(error?.message || 'The starter feed could not be restored.');
    } finally {
      setRestoring(false);
    }
  };

  const handleBlast = async () => {
    if (!blastModal) return;
    setBlasting(true);
    setBlastResult(null);
    const res = await appClient.functions.invoke('dnnBlastArticle', {
      article_id: blastModal.id,
      tier_filter: blastTier,
    });
    setBlastResult(res.data);
    setBlasting(false);
    if (res.data?.success) queryClient.invalidateQueries({ queryKey: ['dnnArticles'] });
  };

  const updateStatus = async (id, status) => {
    await appClient.entities.DnnArticle.update(id, { status });
    queryClient.invalidateQueries({ queryKey: ['dnnArticles'] });
  };

  const openBlastModal = (article) => {
    setBlastModal(article);
    setBlastResult(null);
    setBlastTier('all');
  };

  const deleteArticle = async (id) => {
    if (!confirm('Delete this brief?')) return;
    await appClient.entities.DnnArticle.delete(id);
    queryClient.invalidateQueries({ queryKey: ['dnnArticles'] });
  };

  const TRIGGER_COLORS = {
    tax_policy: 'bg-red-900/40 text-red-300 border-red-800',
    housing_market: 'bg-blue-900/40 text-blue-300 border-blue-800',
    job_market: 'bg-purple-900/40 text-purple-300 border-purple-800',
    interest_rates: 'bg-amber-900/40 text-amber-300 border-amber-800',
    migration_data: 'bg-green-900/40 text-green-300 border-green-800',
    employer_news: 'bg-indigo-900/40 text-indigo-300 border-indigo-800',
  };

  const STATUS_COLORS = {
    staged: 'text-yellow-400',
    published: 'text-green-400',
    blasted: 'text-blue-400',
    archived: 'text-slate-500',
  };

  const staged = articles.filter(a => a.status === 'staged');
  const published = articles.filter(a => a.status !== 'staged' && a.status !== 'archived');
  const archived = articles.filter(a => a.status === 'archived');

  return (
    <div className="min-h-screen p-6" style={{ background: '#0a0a0a' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-5 h-5" style={{ color: '#D4AF37' }} />
              <span className="text-xs font-bold tracking-[0.3em] uppercase" style={{ color: '#D4AF37' }}>Dyson News Network</span>
            </div>
            <h1 className="text-2xl font-black text-white">News Feed — Staging</h1>
            <p className="text-sm text-slate-400 mt-1">AI-generated briefs in review. Approve before pushing live.</p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              onClick={handleRestoreLiveFeed}
              disabled={restoring || generating}
              variant="outline"
              className="gap-2 font-bold border-yellow-700 text-yellow-300"
            >
              {restoring
                ? <><RefreshCw className="w-4 h-4 animate-spin" />Restoring...</>
                : <><Globe className="w-4 h-4" />Restore Live Feed</>}
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={generating || restoring}
              className="gap-2 font-bold"
              style={{ background: 'linear-gradient(135deg, #e8c84a, #D4AF37, #b8920a)', color: '#000' }}
            >
              {generating
                ? <><RefreshCw className="w-4 h-4 animate-spin" />Scanning web...</>
                : <><Sparkles className="w-4 h-4" />Generate Today's Briefs</>}
            </Button>
          </div>
        </div>

        {generationError && (
          <div className="mb-6 rounded-xl border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {generationError}
          </div>
        )}

        {generating && (
          <div className="mb-6 rounded-xl border p-4 flex items-center gap-3" style={{ background: 'rgba(212,175,55,0.07)', borderColor: 'rgba(212,175,55,0.2)' }}>
            <RefreshCw className="w-5 h-5 animate-spin" style={{ color: '#D4AF37' }} />
            <div>
              <p className="text-sm font-semibold text-white">The AI Reporter is scanning the web...</p>
              <p className="text-xs text-slate-400">Finding relocation-triggering news and writing briefs in the 1927 Parallel style. Usually takes 20–40 seconds.</p>
            </div>
          </div>
        )}

        {isLoading && <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-slate-700 border-t-yellow-400 rounded-full animate-spin" /></div>}

        {/* Staged */}
        {staged.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-yellow-400" />
              <h2 className="text-sm font-bold tracking-widest text-yellow-400 uppercase">Awaiting Review ({staged.length})</h2>
            </div>
            <div className="space-y-3">
              {staged.map(article => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  expanded={expandedId === article.id}
                  onToggle={() => setExpandedId(expandedId === article.id ? null : article.id)}
                  onStatusChange={updateStatus}
                  onDelete={deleteArticle}
                  onBlast={openBlastModal}
                  triggerColors={TRIGGER_COLORS}
                  statusColors={STATUS_COLORS}
                />
              ))}
            </div>
          </div>
        )}

        {/* Published */}
        {published.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <h2 className="text-sm font-bold tracking-widest text-green-400 uppercase">Approved / Distributed ({published.length})</h2>
            </div>
            <div className="space-y-3">
              {published.map(article => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  expanded={expandedId === article.id}
                  onToggle={() => setExpandedId(expandedId === article.id ? null : article.id)}
                  onStatusChange={updateStatus}
                  onDelete={deleteArticle}
                  onBlast={openBlastModal}
                  triggerColors={TRIGGER_COLORS}
                  statusColors={STATUS_COLORS}
                />
              ))}
            </div>
          </div>
        )}

        {!isLoading && articles.length === 0 && (
          <div className="text-center py-24">
            <Globe className="w-12 h-12 mx-auto mb-4 text-slate-700" />
            <p className="text-slate-400 font-medium">No briefs yet.</p>
            <p className="text-slate-600 text-sm mt-1">Click "Generate Today's Briefs" to have the AI Reporter scan the web.</p>
          </div>
        )}
      </div>

      {/* Blast Modal */}
      {blastModal && (
        <Dialog open onOpenChange={v => { if (!v) { setBlastModal(null); setBlastResult(null); } }}>
          <DialogContent className="sm:max-w-md" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-400" /> Blast to Subscribers
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-lg p-3" style={{ background: '#1a1a1a' }}>
                <p className="text-xs text-slate-400 mb-1">Article</p>
                <p className="text-sm font-semibold text-white">{blastModal.headline}</p>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Send to which tier?</label>
                <div className="grid grid-cols-2 gap-2">
                  {[['all','All Subscribers'],['tier1','Tier 1 — Free'],['tier2','Tier 2 — Paid'],['tier3','Tier 3 — VIP']].map(([v, l]) => (
                    <button key={v} onClick={() => setBlastTier(v)}
                      className="py-2 px-3 rounded-lg text-xs font-semibold transition border"
                      style={{
                        background: blastTier === v ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.04)',
                        borderColor: blastTier === v ? '#D4AF37' : 'rgba(255,255,255,0.1)',
                        color: blastTier === v ? '#D4AF37' : '#94a3b8',
                      }}>{l}</button>
                  ))}
                </div>
              </div>
              {blastResult && (
                <div className={`rounded-lg px-4 py-3 text-sm ${blastResult.success ? 'bg-green-900/30 border border-green-700 text-green-300' : 'bg-red-900/30 border border-red-700 text-red-300'}`}>
                  {blastResult.success
                    ? `✓ Sent to ${blastResult.sent} subscribers. ${blastResult.failed > 0 ? `${blastResult.failed} failed.` : 'All delivered.'}`
                    : `✗ Error: ${blastResult.error}`}
                </div>
              )}
            </div>
            <DialogFooter>
              <button onClick={() => { setBlastModal(null); setBlastResult(null); }}
                className="px-4 py-2 rounded-lg text-sm border text-slate-400 hover:text-white transition"
                style={{ borderColor: 'rgba(255,255,255,0.1)' }}>Cancel</button>
              <button onClick={handleBlast} disabled={blasting || blastResult?.success}
                className="px-4 py-2 rounded-lg text-sm font-bold text-black flex items-center gap-2 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #e8c84a, #D4AF37, #b8920a)' }}>
                {blasting ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Sending...</> : <><Send className="w-3.5 h-3.5" />Send Blast</>}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function ArticleCard({ article, expanded, onToggle, onStatusChange, onDelete, onBlast, triggerColors, statusColors }) {
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    headline: article.headline || '',
    dateline: article.dateline || '',
    body: article.body || '',
    video_url: article.video_url || '',
    tags: (article.tags || []).join(', '),
  });
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const handleSave = async () => {
    setSaving(true);
    await appClient.entities.DnnArticle.update(article.id, {
      headline: editForm.headline,
      dateline: editForm.dateline,
      body: editForm.body,
      video_url: editForm.video_url || undefined,
      tags: editForm.tags ? editForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    });
    queryClient.invalidateQueries({ queryKey: ['dnnArticles'] });
    setSaving(false);
    setEditing(false);
  };

  const triggerLabel = article.trigger_type?.replace(/_/g, ' ') || 'general';
  const tagColor = triggerColors[article.trigger_type] || 'bg-slate-800 text-slate-400 border-slate-700';

  return (
    <div className="rounded-xl overflow-hidden border" style={{ background: '#111', borderColor: 'rgba(255,255,255,0.08)' }}>
      <div className="px-5 py-4">
        {editing ? (
          <div className="space-y-3">
            <p className="text-xs font-black tracking-widest uppercase mb-2" style={{ color: '#D4AF37' }}>Editing Article</p>
            {[
              ['Headline', 'headline', 'input'],
              ['Dateline', 'dateline', 'input'],
              ['Video URL (YouTube/Loom/Vimeo)', 'video_url', 'input'],
              ['Body', 'body', 'textarea'],
              ['Tags (comma separated)', 'tags', 'input'],
            ].map(([label, key, type]) => (
              <div key={key}>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1">{label}</label>
                {type === 'textarea' ? (
                  <textarea rows={6} value={editForm[key]}
                    onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white resize-none focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }} />
                ) : (
                  <input type="text" value={editForm[key]}
                    onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }} />
                )}
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-black disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #e8c84a, #D4AF37)' }}>
                <Save className="w-3 h-3" /> {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setEditing(false)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold"
                style={{ background: 'rgba(255,255,255,0.07)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>
                <X className="w-3 h-3" /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${tagColor}`}>{triggerLabel}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${statusColors[article.status] || 'text-slate-400'}`}>● {article.status}</span>
                  {article.video_url && <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">● VIDEO</span>}
                  <span className="text-[10px] text-slate-600">{article.generated_date ? new Date(article.generated_date).toLocaleDateString() : ''}</span>
                </div>
                <h3 className="text-white font-bold text-base leading-snug">{article.headline}</h3>
                {article.dateline && <p className="text-xs text-slate-500 mt-0.5 font-mono">{article.dateline}</p>}
                {article.video_url && <p className="text-[10px] text-purple-400 mt-0.5 truncate">{article.video_url}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                <button onClick={() => setEditing(true)}
                  className="text-yellow-400 hover:opacity-70 transition">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={onToggle} className="text-slate-500 hover:text-white transition">
                  {expanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {expanded && (
              <div className="mt-4 border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{article.body}</p>
                {article.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {article.tags.map(t => (
                      <span key={t} className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">#{t}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {article.status === 'staged' && (
                <>
                  <button onClick={() => onStatusChange(article.id, 'published')}
                    className="text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition"
                    style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }}>
                    <CheckCircle className="w-3 h-3" /> Publish to Site
                  </button>
                  <button onClick={() => onBlast(article)}
                    className="text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition"
                    style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' }}>
                    <Send className="w-3 h-3" /> Blast to Subscribers
                  </button>
                  <button onClick={() => onStatusChange(article.id, 'archived')}
                    className="text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition"
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>
                    Archive
                  </button>
                </>
              )}
              {article.status !== 'staged' && (
                <button onClick={() => onStatusChange(article.id, 'staged')}
                  className="text-xs px-3 py-1.5 rounded-lg font-semibold transition"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>
                  Move to Staging
                </button>
              )}
              <button onClick={() => onDelete(article.id)}
                className="text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ml-auto"
                style={{ color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
