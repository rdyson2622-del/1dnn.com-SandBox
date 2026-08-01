import React, { useState, useEffect } from 'react';
import { X, Share2, ChevronRight, Headphones, Copy, Check, Mail, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const GOLD = '#D4AF37';

/**
 * ArticleReaderModal — full-screen readable overlay for DNN articles.
 * Replaces the narrow inline "Read/Hide" card expansion.
 */
export default function ArticleReaderModal({ article, onClose, onListen, onListenBob }) {
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!article) return null;

  const paragraphs = (article.body || '').split('\n').filter(p => p.trim());

  const shareText = `📡 DNN Intelligence Bureau\n\n${article.headline}\n\n${paragraphs[0] || ''}\n\n— Read more at dysonanddyson.com/dnn-news`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-start justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose}
        style={{ background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(8px)' }} />

      {/* Reader panel */}
      <div className="relative w-full max-w-3xl mx-4 my-4 md:my-8 rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: '#121212',
          border: `1px solid ${GOLD}33`,
          maxHeight: 'calc(100vh - 2rem)',
        }}>

        {/* Sticky header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 shrink-0"
          style={{ background: '#1a1a1a', borderBottom: `1px solid ${GOLD}22` }}>
          <div className="flex items-center gap-3 min-w-0">
            <img src="/assets/dyson-logo.png"
              alt="DNN" className="h-7 w-auto shrink-0" />
            <span className="text-[10px] font-black tracking-[0.25em] uppercase" style={{ color: GOLD }}>Intelligence Brief</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setShowShare(v => !v)}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: showShare ? `${GOLD}15` : 'transparent',
                color: showShare ? GOLD : 'rgba(255,255,255,0.5)',
                border: `1px solid ${showShare ? GOLD + '40' : 'rgba(255,255,255,0.1)'}`,
              }}>
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
            <button onClick={onClose} aria-label="Close"
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
              style={{ color: 'rgba(255,255,255,0.6)' }}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-6 md:px-12 py-8">

          {/* Tags + dateline */}
          <div className="flex items-center gap-3 mb-4">
            {article.trigger_type && (
              <span className="text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.07)', color: GOLD }}>
                {(article.trigger_type || 'general').replace(/_/g, ' ')}
              </span>
            )}
            {article.dateline && (
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{article.dateline}</span>
            )}
          </div>

          {/* Headline */}
          <h1 className="font-bold leading-tight mb-6"
            style={{
              color: '#ffffff',
              fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
              fontFamily: 'Cormorant Garamond, serif',
              letterSpacing: '0.01em',
            }}>
            {article.headline}
          </h1>

          {/* Listen button */}
          {onListen && (
            <button
              onClick={() => onListen(`${article.headline}. ${article.body || ''}`)}
              className="flex items-center gap-2 mb-6 px-4 py-2 rounded-lg text-xs font-bold transition-all hover:opacity-80"
              style={{ background: `${GOLD}12`, color: GOLD, border: `1px solid ${GOLD}30` }}>
              <Headphones className="w-4 h-4" /> Listen to this brief
            </button>
          )}

          {/* Body — readable typography */}
          <div className="space-y-5">
            {paragraphs.map((para, i) => (
              <p key={i}
                className="leading-relaxed"
                style={{
                  color: 'rgba(255,255,255,0.82)',
                  fontSize: '1.0625rem',
                  lineHeight: 1.75,
                  fontFamily: 'Inter, sans-serif',
                }}>
                {para}
              </p>
            ))}
          </div>

          {/* Tags */}
          {article.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {article.tags.map(t => (
                <span key={t} className="text-[11px] px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Dyson Solutions */}
          {(article.client_solution || article.agent_solution || article.vendor_solution) && (
            <div className="mt-8 rounded-xl p-5 space-y-3"
              style={{ background: `${GOLD}08`, border: `1px solid ${GOLD}25` }}>
              <p className="text-[10px] font-black tracking-[0.25em] uppercase" style={{ color: GOLD }}>Dyson Solutions</p>
              {article.client_solution && (
                <div className="flex gap-3">
                  <span className="text-[10px] font-bold tracking-widest uppercase shrink-0 mt-1" style={{ color: '#60a5fa' }}>Client</span>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.78)' }}>{article.client_solution}</p>
                </div>
              )}
              {article.agent_solution && (
                <div className="flex gap-3">
                  <span className="text-[10px] font-bold tracking-widest uppercase shrink-0 mt-1" style={{ color: GOLD }}>Agent</span>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.78)' }}>{article.agent_solution}</p>
                </div>
              )}
              {article.vendor_solution && (
                <div className="flex gap-3">
                  <span className="text-[10px] font-bold tracking-widest uppercase shrink-0 mt-1" style={{ color: '#4ade80' }}>Vendor</span>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.78)' }}>{article.vendor_solution}</p>
                </div>
              )}
            </div>
          )}

          {/* Share panel */}
          {showShare && (
            <div className="mt-6 rounded-xl p-4 space-y-3"
              style={{ background: `${GOLD}08`, border: `1px solid ${GOLD}25` }}>
              <p className="text-xs font-black tracking-widest uppercase" style={{ color: GOLD }}>Share This Brief</p>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={handleCopy}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all"
                  style={{
                    background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: copied ? '#4ade80' : '#fff',
                  }}>
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button onClick={() => {
                  const subject = encodeURIComponent(`DNN Intelligence: ${article.headline}`);
                  const body = encodeURIComponent(shareText);
                  window.open(`mailto:?subject=${subject}&body=${body}`);
                }}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all"
                  style={{ background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.2)', color: '#60a5fa' }}>
                  <Mail className="w-3.5 h-3.5" /> Email
                </button>
                <button onClick={() => {
                  const body = encodeURIComponent(`📡 DNN Intelligence: ${article.headline}\n\n${paragraphs[0] || ''}\n\nFull brief: dysonanddyson.com/dnn-news`);
                  window.open(`sms:?body=${body}`);
                }}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all"
                  style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>
                  <MessageSquare className="w-3.5 h-3.5" /> Text
                </button>
              </div>
            </div>
          )}

          {/* Ask Charlie CTA */}
          <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <Link to="/chat"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-black transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #e8c84a, #D4AF37)' }}>
              Ask Charlie About This <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}