import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { appClient } from '@/api/appClient';
import { CheckCircle2, ChevronDown, ChevronUp, Copy, Check, AlertTriangle, Shield, Clock } from 'lucide-react';

const GOLD = '#D4AF37';

const STATUS_CONFIG = {
  draft:          { label: 'Draft',           color: '#888',    bg: '#88888822' },
  pending_review: { label: 'Pending Review',  color: '#f59e0b', bg: '#f59e0b22' },
  approved:       { label: 'Approved ✓',      color: '#22c55e', bg: '#22c55e22' },
  scheduled:      { label: 'Scheduled',       color: '#8b5cf6', bg: '#8b5cf622' },
  published:      { label: 'Published',       color: '#10b981', bg: '#10b98122' },
  failed:         { label: 'Failed',          color: '#ef4444', bg: '#ef444422' },
};

const LEGAL_CHECKLIST = [
  'No mention of current listing, list price, or listing agent',
  'Subject line is relocation-focused only',
  'CAN-SPAM: unsubscribe link present',
  'CAN-SPAM: physical address present',
  'Tone is helpful — not sales-pressured',
];

export default function CampaignPostReview({ campaignId }) {
  const [expandedPost, setExpandedPost] = useState(null);
  const [copied, setCopied] = useState(null);
  const [legalChecks, setLegalChecks] = useState({});
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts-review', campaignId],
    queryFn: () => appClient.entities.SocialPost.filter({ campaign_id: campaignId }, 'scheduled_date', 100),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ postId, status }) => appClient.entities.SocialPost.update(postId, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts-review', campaignId] }),
  });

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleLegalCheck = (postId, checkIndex) => {
    setLegalChecks(prev => {
      const postChecks = prev[postId] || {};
      return { ...prev, [postId]: { ...postChecks, [checkIndex]: !postChecks[checkIndex] } };
    });
  };

  const allChecksComplete = (postId) => {
    const checks = legalChecks[postId] || {};
    return LEGAL_CHECKLIST.every((_, i) => checks[i]);
  };

  const approvedCount = posts.filter(p => p.status === 'approved' || p.status === 'scheduled' || p.status === 'published').length;

  if (isLoading) return <div className="rounded-xl p-6 text-center" style={{ background: '#2a2a2a' }}><p style={{ color: '#888' }}>Loading posts...</p></div>;

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#2a2a2a', border: '1px solid #444' }}>
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #333' }}>
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5" style={{ color: GOLD }} />
          <div>
            <h3 className="text-lg font-bold" style={{ color: '#fff' }}>Email Post Review</h3>
            <p className="text-xs" style={{ color: '#888' }}>Legal review required before any email sends</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: approvedCount === posts.length && posts.length > 0 ? '#22c55e22' : '#f59e0b22', border: `1px solid ${approvedCount === posts.length && posts.length > 0 ? '#22c55e44' : '#f59e0b44'}` }}>
          <span className="text-sm font-bold" style={{ color: approvedCount === posts.length && posts.length > 0 ? '#22c55e' : '#f59e0b' }}>
            {approvedCount}/{posts.length} Approved
          </span>
        </div>
      </div>

      {/* Legal Banner */}
      <div className="px-6 py-3 flex items-start gap-3" style={{ background: 'rgba(239,68,68,0.07)', borderBottom: '1px solid rgba(239,68,68,0.2)' }}>
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
        <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
          <strong style={{ color: '#ef4444' }}>Before approving any email:</strong> Confirm no copy references the seller's current listing, listing agent, or list price. Our contact right is limited to relocation services only. Complete the legal checklist on each post before marking approved.
        </p>
      </div>

      {/* Posts */}
      <div className="divide-y" style={{ borderColor: '#333' }}>
        {posts.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p style={{ color: '#666' }}>No email posts found for this campaign.</p>
            <p className="text-xs mt-1" style={{ color: '#555' }}>Generate posts using the Content Generator above.</p>
          </div>
        ) : posts.map((post, i) => {
          const statusCfg = STATUS_CONFIG[post.status] || STATUS_CONFIG.draft;
          const isOpen = expandedPost === post.id;
          const checks = legalChecks[post.id] || {};
          const allDone = allChecksComplete(post.id);
          const scheduledDate = post.scheduled_date ? new Date(post.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;

          return (
            <div key={post.id}>
              {/* Row Header */}
              <button
                onClick={() => setExpandedPost(isOpen ? null : post.id)}
                className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-white/5 transition-all"
              >
                {/* Email number */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm"
                  style={{ background: post.status === 'approved' ? '#22c55e' : GOLD + '22', color: post.status === 'approved' ? '#000' : GOLD, border: `1px solid ${post.status === 'approved' ? '#22c55e' : GOLD + '44'}` }}>
                  {post.status === 'approved' ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm" style={{ color: '#fff' }}>
                      Email {i + 1} — {post.content_pillar || 'Campaign Email'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: statusCfg.bg, color: statusCfg.color }}>
                      {statusCfg.label}
                    </span>
                  </div>
                  {scheduledDate && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" style={{ color: '#666' }} />
                      <span className="text-xs" style={{ color: '#666' }}>Scheduled: {scheduledDate}</span>
                    </div>
                  )}
                </div>

                {isOpen ? <ChevronUp className="w-4 h-4 shrink-0" style={{ color: '#666' }} /> : <ChevronDown className="w-4 h-4 shrink-0" style={{ color: '#666' }} />}
              </button>

              {/* Expanded Content */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 space-y-4">
                      {/* Full Email Copy */}
                      <div className="rounded-xl p-4" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-bold tracking-widest" style={{ color: GOLD }}>FULL EMAIL COPY</p>
                          <button
                            onClick={() => copyToClipboard(post.selected_copy || '', post.id)}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all hover:bg-white/10"
                            style={{ color: copied === post.id ? '#22c55e' : GOLD, border: `1px solid ${copied === post.id ? '#22c55e44' : GOLD + '44'}` }}
                          >
                            {copied === post.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copied === post.id ? 'Copied!' : 'Copy Email'}
                          </button>
                        </div>
                        <pre className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'inherit' }}>
                          {post.selected_copy || post.copy_variants?.[0]?.text || 'No copy loaded yet.'}
                        </pre>
                      </div>

                      {/* Staff Notes */}
                      {post.notes && (
                        <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid ${GOLD}22` }}>
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: GOLD }} />
                          <div>
                            <p className="text-xs font-bold mb-1" style={{ color: GOLD }}>STAFF NOTE</p>
                            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>{post.notes}</p>
                          </div>
                        </div>
                      )}

                      {/* Legal Checklist */}
                      <div className="rounded-xl p-4" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <p className="text-xs font-bold tracking-widest mb-3" style={{ color: '#ef4444' }}>⚖️ LEGAL REVIEW CHECKLIST — Check each before approving</p>
                        <div className="space-y-2">
                          {LEGAL_CHECKLIST.map((item, ci) => (
                            <label key={ci} className="flex items-start gap-3 cursor-pointer group">
                              <div
                                onClick={() => toggleLegalCheck(post.id, ci)}
                                className="w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 transition-all"
                                style={{
                                  background: checks[ci] ? '#22c55e' : 'transparent',
                                  border: `2px solid ${checks[ci] ? '#22c55e' : 'rgba(255,255,255,0.3)'}`,
                                  cursor: 'pointer'
                                }}
                              >
                                {checks[ci] && <Check className="w-3 h-3 text-black" />}
                              </div>
                              <span className="text-sm" style={{ color: checks[ci] ? '#22c55e' : 'rgba(255,255,255,0.7)' }}>{item}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Approve / Flag Buttons */}
                      <div className="flex gap-3">
                        <button
                          disabled={!allDone || post.status === 'approved'}
                          onClick={() => updateStatusMutation.mutate({ postId: post.id, status: 'approved' })}
                          className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                          style={{
                            background: allDone && post.status !== 'approved' ? '#22c55e' : '#22c55e22',
                            color: allDone && post.status !== 'approved' ? '#000' : '#22c55e66',
                            cursor: allDone && post.status !== 'approved' ? 'pointer' : 'not-allowed',
                          }}
                        >
                          {post.status === 'approved' ? '✓ Approved' : !allDone ? 'Complete checklist to approve' : 'Mark Approved ✓'}
                        </button>
                        <button
                          onClick={() => updateStatusMutation.mutate({ postId: post.id, status: 'pending_review' })}
                          className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:bg-red-500/20"
                          style={{ background: '#ef444422', color: '#ef4444', border: '1px solid #ef444433' }}
                        >
                          Flag for Edit
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}