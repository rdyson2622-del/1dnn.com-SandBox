import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { BookOpen, Edit2, Video, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const GOLD = '#D4AF37';

const STATUS_CONFIG = {
  submitted:    { color: '#60a5fa', label: 'Submitted' },
  in_review:   { color: '#fbbf24', label: 'In Review' },
  white_labeled: { color: '#c084fc', label: 'White-Labeled' },
  published:   { color: '#4ade80', label: 'Published' },
  rejected:    { color: '#f87171', label: 'Rejected' },
};

function StoryReviewModal({ story, onClose, onSaved }) {
  const [whiteLabeled, setWhiteLabeled] = useState(story.white_labeled_body || story.story_body || '');
  const [publishedAs, setPublishedAs] = useState(story.published_as || story.story_title || '');
  const [status, setStatus] = useState(story.status || 'in_review');
  const [notes, setNotes] = useState(story.notes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await appClient.entities.BureauStory.update(story.id, { white_labeled_body: whiteLabeled, published_as: publishedAs, status, notes });
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <Dialog open onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-2xl bg-slate-950 border-slate-800 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Review Story — {story.submitter_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Original story */}
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">Original Submission</p>
            <div className="rounded-lg p-3 text-sm text-slate-300 leading-relaxed" style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="font-bold text-white mb-1">{story.story_title}</p>
              <p>{story.story_body}</p>
              {story.outcome && <p className="mt-2 font-semibold" style={{ color: GOLD }}>Outcome: {story.outcome}</p>}
            </div>
          </div>

          {/* White-label editor */}
          <div>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: GOLD }}>White-Labeled DNN Version</p>
            <Input value={publishedAs} onChange={e => setPublishedAs(e.target.value)} placeholder="Published headline..." className="bg-slate-900 border-slate-700 text-white mb-2" />
            <textarea value={whiteLabeled} onChange={e => setWhiteLabeled(e.target.value)} rows={6}
              placeholder="Edit story for DNN voice — remove agent/lender names if needed, strengthen narrative..."
              className="w-full px-3 py-2 rounded-md text-sm bg-slate-900 border border-slate-700 text-white focus:outline-none resize-none" />
            <p className="text-xs text-slate-500 mt-1">Remove specific agent/lender names. Write as a DNN client story. The submitter's brand is protected via attribution tag only.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-slate-400 block mb-1">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="w-full h-9 border border-slate-700 rounded-md px-2 text-sm bg-slate-900 text-white">
                <option value="submitted">Submitted</option>
                <option value="in_review">In Review</option>
                <option value="white_labeled">White-Labeled (Ready)</option>
                <option value="published">Published on DNN</option>
                <option value="rejected">Rejected</option>
              </select></div>
            <div><label className="text-xs text-slate-400 block mb-1">Internal Notes</label>
              <Input value={notes} onChange={e => setNotes(e.target.value)} className="bg-slate-900 border-slate-700 text-white" /></div>
          </div>

          {story.video_url && (
            <div className="rounded-lg p-3" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <p className="text-xs font-bold text-indigo-400 mb-1">Video Submission</p>
              <a href={story.video_url} target="_blank" rel="noreferrer" className="text-xs text-blue-400 underline break-all">{story.video_url}</a>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-slate-700 text-white">Cancel</Button>
          <Button onClick={handleSave} disabled={saving} style={{ background: 'linear-gradient(135deg,#e8c84a,#D4AF37)', color: '#000', fontWeight: 700 }}>
            {saving ? 'Saving...' : 'Save Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StoryCard({ story, onReview }) {
  const [open, setOpen] = useState(false);
  const sc = STATUS_CONFIG[story.status] || STATUS_CONFIG.submitted;

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}>
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center gap-4 px-4 py-3 text-left">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-xs"
          style={{ background: story.submitter_type === 'lender' ? 'rgba(96,165,250,0.1)' : 'rgba(212,175,55,0.1)', color: story.submitter_type === 'lender' ? '#60a5fa' : GOLD }}>
          {story.submitter_type === 'lender' ? '$' : '🏠'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{story.story_title}</p>
          <p className="text-xs text-slate-500">{story.submitter_name} · {story.submitter_type} · {story.origin_city || '?'} → {story.destination_city || '?'}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ color: sc.color, background: `${sc.color}18`, border: `1px solid ${sc.color}30` }}>{sc.label}</span>
          {story.video_url && <Video className="w-3.5 h-3.5 text-indigo-400" />}
          {open ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t space-y-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-sm text-slate-300 leading-relaxed pt-3">{story.story_body?.slice(0, 300)}{story.story_body?.length > 300 ? '...' : ''}</p>
          {story.outcome && <p className="text-xs font-semibold" style={{ color: GOLD }}>Outcome: {story.outcome}</p>}
          {story.white_labeled_body && (
            <div className="rounded-lg p-3 text-xs text-slate-400" style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}>
              <p className="font-bold text-yellow-400 mb-1 uppercase tracking-widest text-[10px]">White-Labeled Version</p>
              {story.published_as && <p className="font-bold text-white mb-1">{story.published_as}</p>}
              {story.white_labeled_body?.slice(0, 200)}...
            </div>
          )}
          <Button size="sm" onClick={() => onReview(story)} className="gap-1.5 text-xs font-bold"
            style={{ background: 'rgba(212,175,55,0.15)', color: GOLD, border: '1px solid rgba(212,175,55,0.3)' }}>
            <Edit2 className="w-3 h-3" /> Review & White-Label
          </Button>
        </div>
      )}
    </div>
  );
}

export default function AdminBureauStories() {
  const [reviewStory, setReviewStory] = useState(null);
  const [filter, setFilter] = useState('all');
  const qc = useQueryClient();

  const { data: stories = [] } = useQuery({
    queryKey: ['bureauStories'],
    queryFn: () => appClient.entities.BureauStory.list('-created_date', 200),
  });

  const filtered = filter === 'all' ? stories : stories.filter(s => s.status === filter);
  const counts = Object.fromEntries(Object.keys(STATUS_CONFIG).map(k => [k, stories.filter(s => s.status === k).length]));

  return (
    <div className="min-h-screen p-6" style={{ background: '#0a0a0a' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5" style={{ color: GOLD }} />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase" style={{ color: GOLD }}>DNN Bureau</span>
          </div>
          <h1 className="display-heading text-white mb-2" style={{ fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', letterSpacing: '0.12em' }}>STORY CAMPAIGN HUB</h1>
          <p className="text-sm italic leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem' }}>
            Agent and lender story submissions — review, white-label, and publish to DNN or video campaigns.
          </p>
        </div>

        {/* Stats + Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => setFilter('all')}
            className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
            style={{ background: filter === 'all' ? GOLD : 'rgba(255,255,255,0.07)', color: filter === 'all' ? '#000' : '#fff' }}>
            All ({stories.length})
          </button>
          {Object.entries(STATUS_CONFIG).map(([key, val]) => (
            <button key={key} onClick={() => setFilter(key)}
              className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
              style={{ background: filter === key ? val.color : `${val.color}15`, color: filter === key ? '#000' : val.color, border: `1px solid ${val.color}30` }}>
              {val.label} ({counts[key] || 0})
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.length === 0 && <p className="text-xs text-slate-500 text-center py-12">No stories {filter !== 'all' ? `with status "${filter}"` : 'submitted yet'}.</p>}
          {filtered.map(s => <StoryCard key={s.id} story={s} onReview={setReviewStory} />)}
        </div>
      </div>

      {reviewStory && (
        <StoryReviewModal
          story={reviewStory}
          onClose={() => setReviewStory(null)}
          onSaved={() => { qc.invalidateQueries({ queryKey: ['bureauStories'] }); }}
        />
      )}
    </div>
  );
}