import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Globe, Bell, Share2, BookOpen, TrendingUp, Shield, DollarSign, ChevronRight, Mail, MessageSquare, Copy, Check, X, Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';
import DnnAdminBar from '@/components/dnn/DnnAdminBar';
import TalkingHead from '@/components/avatar/TalkingHead';
import { useTalkingHead } from '@/hooks/useTalkingHead';
import ArticleReaderModal from '@/components/dnn/ArticleReaderModal';

import DnnBroadcastPresenter from '@/components/dnn/DnnBroadcastPresenter';
import DnnComparisonSection from '@/components/dnn/DnnComparisonSection';


const DNN_LOGO = "/assets/dyson-logo.png";

const TRIGGER_LABELS = {
  tax_policy: 'TAX POLICY',
  housing_market: 'HOUSING MARKET',
  job_market: 'JOB MARKET',
  interest_rates: 'INTEREST RATES',
  migration_data: 'MIGRATION DATA',
  employer_news: 'EMPLOYER NEWS',
  general: 'GENERAL',
};

const TRIGGER_COLORS = {
  tax_policy: 'rgba(239,68,68,0.15)',
  housing_market: 'rgba(59,130,246,0.15)',
  job_market: 'rgba(168,85,247,0.15)',
  interest_rates: 'rgba(245,158,11,0.15)',
  migration_data: 'rgba(34,197,94,0.15)',
  employer_news: 'rgba(99,102,241,0.15)',
  general: 'rgba(255,255,255,0.07)',
};

const TRIGGER_TEXT = {
  tax_policy: '#f87171',
  housing_market: '#60a5fa',
  job_market: '#c084fc',
  interest_rates: '#fbbf24',
  migration_data: '#4ade80',
  employer_news: '#818cf8',
  general: '#94a3b8',
};

// --- Subscribe Banner ---
function SubscribeBanner() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await appClient.functions.invoke('dnnSubscribe', { email, full_name: name, source: 'DNN News Page' });
    } catch (_) {}
    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="rounded-2xl p-6 text-center mb-8" style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.3)' }}>
        <p className="text-yellow-400 font-bold text-sm mb-1">✓ You're on the list</p>
        <p className="text-slate-500 text-xs">DNN Intelligence Briefs will be delivered directly to you. Welcome to the network.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5 mb-8" style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.25)' }}>
      <div className="flex items-center gap-2 mb-2">
        <Bell className="w-4 h-4" style={{ color: '#D4AF37' }} />
        <p className="text-sm font-bold text-white">Get DNN Intelligence in Your Inbox</p>
      </div>
      <p className="text-xs text-slate-500 mb-3 leading-relaxed">
        Daily market-moving briefs curated by the DNN AI Bureau — relocation intelligence localized to your destination markets.
      </p>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          placeholder="Your name (optional)"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        />
        <div className="flex gap-2">
          <input
            type="email"
            required
            placeholder="Your email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
          <button type="submit" disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-bold text-black transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #e8c84a, #D4AF37)' }}>
            {loading ? '...' : 'Subscribe'}
          </button>
        </div>
      </form>
    </div>
  );
}

// --- Charlie Education Strip ---
function CharlieEducationStrip() {
  const pillars = [
    {
      icon: TrendingUp,
      color: '#60a5fa',
      title: 'Relocation Intelligence',
      description: 'DNN tracks migration data, job market shifts, and housing trends — so you relocate with confidence, not guesswork.',
      href: '/chat',
      cta: 'Ask Charlie',
    },
    {
      icon: Shield,
      color: '#D4AF37',
      title: 'Your Verified Agent',
      description: "Every DNN partner agent is vetted by Bob Dyson's team. DRE-verified, production-screened, and matched to your move.",
      href: '/my-agent',
      cta: 'Meet My Agent',
    },
    {
      icon: DollarSign,
      color: '#4ade80',
      title: 'Financial Network',
      description: 'DNN-approved lenders in your destination market — DRE-compliant introductions, white-labeled rate intelligence.',
      href: '/financial-services',
      cta: 'Coming Soon',
    },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-4 h-4" style={{ color: '#D4AF37' }} />
        <p className="text-xs font-black tracking-[0.2em] uppercase" style={{ color: '#D4AF37' }}>The DNN Network</p>
      </div>
      <div className="space-y-3">
        {pillars.map((p) => {
          const Icon = p.icon;
          return (
            <Link key={p.title} to={p.href}
              className="flex items-start gap-4 p-4 rounded-xl transition-all hover:opacity-80"
              style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: `${p.color}18`, border: `1px solid ${p.color}30` }}>
                <Icon className="w-4 h-4" style={{ color: p.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white mb-0.5">{p.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{p.description}</p>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold shrink-0 mt-1" style={{ color: p.color }}>
                {p.cta} <ChevronRight className="w-3 h-3" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// --- Share Panel ---
function SharePanel({ article, onClose }) {
  const [copied, setCopied] = useState(false);

  const shareText = `📡 DNN Intelligence Bureau\n\n${article.headline}\n\n${article.body?.split('\n')[0]}\n\n— Read more at dysonanddyson.com/dnn-news\n\nFree relocation intelligence delivered daily. Subscribe: dysonanddyson.com`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`DNN Intelligence: ${article.headline}`);
    const body = encodeURIComponent(shareText);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleSMS = () => {
    const body = encodeURIComponent(`📡 DNN Intelligence: ${article.headline}\n\n${article.body?.split('\n')[0]}\n\nFull brief: dysonanddyson.com/dnn-news`);
    window.open(`sms:?body=${body}`);
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `DNN Intelligence: ${article.headline}`,
        text: shareText,
        url: `${window.location.origin}/dnn-news`,
      });
    }
  };

  return (
    <div className="mt-3 rounded-xl p-4 space-y-3" style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)' }} onClick={e => e.stopPropagation()}>
      <p className="text-xs font-black tracking-widest uppercase" style={{ color: '#D4AF37' }}>Share This Brief</p>
      <div className="rounded-lg p-3 text-xs text-slate-400 leading-relaxed" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <p className="text-yellow-400 font-bold mb-1">📡 DNN Intelligence Bureau</p>
        <p className="text-white font-semibold mb-1">{article.headline}</p>
        <p className="text-slate-500 truncate">{article.body?.split('\n')[0]}</p>
        <p className="text-slate-600 mt-1 text-[10px]">— dysonanddyson.com/dnn-news</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={handleCopy} className="flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all"
          style={{ background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: copied ? '#4ade80' : '#fff' }}>
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy Text'}
        </button>
        <button onClick={handleEmail} className="flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all"
          style={{ background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.2)', color: '#60a5fa' }}>
          <Mail className="w-3.5 h-3.5" /> Email
        </button>
        <button onClick={handleSMS} className="flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all"
          style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>
          <MessageSquare className="w-3.5 h-3.5" /> Text
        </button>
        {navigator.share && (
          <button onClick={handleNativeShare} className="flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all"
            style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.2)', color: '#D4AF37' }}>
            <Share2 className="w-3.5 h-3.5" /> More
          </button>
        )}
      </div>
      <button onClick={onClose} className="w-full text-center text-xs text-slate-600 hover:text-slate-400 transition-colors py-1">
        Close
      </button>
    </div>
  );
}

// --- Audio Player ---
function AudioPlayer({ url }) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-4 py-3 mt-3"
      style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
      <span className="text-xs font-black tracking-widest uppercase shrink-0" style={{ color: '#D4AF37' }}>🎙 Listen</span>
      <audio controls className="flex-1 h-8" style={{ accentColor: '#D4AF37' }}>
        <source src={url} type="audio/wav" />
      </audio>
    </div>
  );
}

// --- Compact Article Card (text briefs) ---
function CompactArticleCard({ article, isAdmin, onEdit, onDelete, onListenBob, onRead }) {
  const [showShare, setShowShare] = useState(false);
  const bgColor = TRIGGER_COLORS[article.trigger_type] || TRIGGER_COLORS.general;
  const textColor = TRIGGER_TEXT[article.trigger_type] || TRIGGER_TEXT.general;
  const label = TRIGGER_LABELS[article.trigger_type] || 'GENERAL';

  return (
    <div className="rounded-xl p-4 transition-all relative group"
      style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.2)' }}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <span className="text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full"
            style={{ background: bgColor, color: textColor }}>
            {label}
          </span>
          <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{article.dateline}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isAdmin && (
            <>
              <button onClick={(e) => { e.stopPropagation(); onEdit?.(article); }}
                className="text-xs font-bold px-2 py-1 rounded-lg pointer-events-auto z-[100] transition-all hover:scale-105"
                style={{ background: '#1a1a1a', border: '1px solid #00ccff', color: '#00ccff' }}>
                ✎
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDelete?.(article.id); }}
                className="text-xs font-bold px-2 py-1 rounded-lg pointer-events-auto z-[100] transition-all hover:scale-105"
                style={{ background: '#1a1a1a', border: '1px solid #ff3333', color: '#ff3333' }}>
                🗑
              </button>
            </>
          )}
          <button onClick={(e) => { e.stopPropagation(); setShowShare(v => !v); }}
            className="shrink-0 text-xs font-semibold px-2 py-1 rounded-full transition-all"
            style={{ color: showShare ? '#D4AF37' : 'rgba(255,255,255,0.3)', background: showShare ? 'rgba(212,175,55,0.1)' : 'transparent' }}>
            <Share2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      <h3 className="font-bold text-sm leading-snug mb-2" style={{ color: '#fff' }}>
        {article.headline}
      </h3>

      {article.audio_url && <AudioPlayer url={article.audio_url} />}

      {/* Preview snippet — first paragraph only */}
      <p className="text-xs leading-relaxed line-clamp-3 mt-2" style={{ color: 'rgba(255,255,255,0.55)' }}>
        {article.body?.split('\n').filter(p => p.trim())[0]}
      </p>

      <button
        onClick={() => onRead?.(article)}
        className="flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase mt-3 transition-all hover:opacity-80"
        style={{ color: '#D4AF37' }}>
        Read Full Article <ChevronRight className="w-3 h-3" />
      </button>

      {showShare && (
        <div className="mt-2 pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <SharePanel article={article} onClose={() => setShowShare(false)} />
        </div>
      )}
    </div>
  );
}

// --- Get YouTube thumbnail ---
function getYouTubeThumbnail(url) {
  if (!url) return null;
  let id = null;
  if (url.includes('youtu.be/')) {
    id = url.split('youtu.be/')[1]?.split('?')[0];
  } else if (url.includes('youtube.com')) {
    try { id = new URL(url).searchParams.get('v'); } catch (_) {}
  }
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

// --- Get embeddable video src ---
function getEmbedSrc(url) {
  if (!url) return url;
  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${id}?autoplay=1`;
  }
  if (url.includes('youtube.com/watch')) {
    try {
      const id = new URL(url).searchParams.get('v');
      return `https://www.youtube.com/embed/${id}?autoplay=1`;
    } catch (_) {}
  }
  return url;
}

// --- Video Thumbnail Card ---
function VideoThumbnail({ article, isAdmin, onEdit, onDelete }) {
  const [playing, setPlaying] = useState(false);
  const realVideoUrl = article.video_url && !article.video_url.startsWith('heygen:pending:') ? article.video_url : null;
  const isDirectMp4 = realVideoUrl && (realVideoUrl.includes('.mp4') || realVideoUrl.includes('.webm')) && !realVideoUrl.includes('heygen.com');
  const thumbnail = getYouTubeThumbnail(realVideoUrl);

  if (!realVideoUrl) return null;

  // If playing, show the native video player inline
  if (playing && isDirectMp4) {
    return (
      <div className="relative w-full rounded-xl overflow-hidden" style={{ background: '#000', border: '1px solid rgba(212,175,55,0.3)' }}>
        <video
          src={realVideoUrl}
          controls
          autoPlay
          playsInline
          preload="auto"
          crossOrigin="anonymous"
          style={{ width: '100%', display: 'block', borderRadius: '12px' }}
          onError={(e) => console.warn('Video load error:', e)}
        />
        <button
          onClick={() => setPlaying(false)}
          className="absolute top-2 right-2 text-white text-xs px-2 py-1 rounded-lg font-bold"
          style={{ background: 'rgba(0,0,0,0.7)' }}
        >✕</button>
      </div>
    );
  }

  if (playing && !isDirectMp4) {
    return (
      <div className="relative w-full rounded-xl overflow-hidden" style={{ aspectRatio: '16/9', background: '#000', border: '1px solid rgba(212,175,55,0.3)' }}>
        <iframe
          src={realVideoUrl.includes('heygen.com/embeds') ? realVideoUrl : getEmbedSrc(realVideoUrl)}
          title={article.headline}
          width="100%"
          height="100%"
          style={{ width: '100%', height: '100%', border: 'none' }}
          frameBorder="0"
          allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        <button
          onClick={() => setPlaying(false)}
          className="absolute top-2 right-2 text-white text-xs px-2 py-1 rounded-lg font-bold"
          style={{ background: 'rgba(0,0,0,0.7)' }}
        >✕</button>
      </div>
    );
  }

  // Thumbnail / play button state
  return (
    <div
      className="relative w-full aspect-video rounded-xl overflow-hidden group cursor-pointer"
      style={{ background: '#111', border: '1px solid rgba(212,175,55,0.2)' }}
      onClick={() => setPlaying(true)}
    >
      {thumbnail ? (
        <img src={thumbnail} alt={article.headline} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 px-4"
          style={{ background: 'linear-gradient(135deg, #1c1c1c 0%, #141414 100%)' }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
            style={{ background: 'rgba(212,175,55,0.92)', boxShadow: '0 0 40px rgba(212,175,55,0.3)' }}>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#000', marginLeft: '3px' }}>
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </div>
          <p className="text-[10px] font-black tracking-widest uppercase text-center" style={{ color: '#D4AF37' }}>▶ Play Video</p>
          <p className="text-[9px] text-center leading-relaxed line-clamp-2" style={{ color: 'rgba(255,255,255,0.5)' }}>{article.headline}</p>
        </div>
      )}
      {thumbnail && (
        <>
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.3)' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-2xl"
              style={{ background: 'rgba(212,175,55,0.92)', boxShadow: '0 0 40px rgba(212,175,55,0.3)' }}>
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#000', marginLeft: '3px' }}>
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
          </div>
        </>
      )}
      {/* DNN Logo Bug */}
      <div className="absolute top-2 left-2 z-10 pointer-events-none flex items-center gap-1.5 px-2 py-1 rounded-lg"
        style={{ background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(212,175,55,0.4)', backdropFilter: 'blur(4px)' }}>
        <img src={DNN_LOGO} alt="DNN" className="h-4 w-auto" />
        <span className="text-[9px] font-black tracking-[0.2em] uppercase" style={{ color: '#D4AF37' }}>LIVE</span>
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#ef4444' }} />
      </div>
      {isAdmin && (
        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-[100] opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); onEdit?.(article); }}
            className="px-2 py-1.5 rounded-lg text-xs font-bold text-white pointer-events-auto"
            style={{ background: '#1a1a1a', border: '1px solid #00ccff', boxShadow: '0 0 8px #00ccff' }}>✎</button>
          <button onClick={(e) => { e.stopPropagation(); onDelete?.(article.id); }}
            className="px-2 py-1.5 rounded-lg text-xs font-bold text-white pointer-events-auto"
            style={{ background: '#1a1a1a', border: '1px solid #ff3333', boxShadow: '0 0 8px #ff3333' }}>🗑</button>
        </div>
      )}
    </div>
  );
}





// --- Main Page ---
// v2
export default function ConsumerDnnNews() {
  const { talkingHeadProps, speak, loading: talkLoading, dismiss } = useTalkingHead();

  const HARDCODED_VIDEO = {
    id: '__hardcoded__',
    headline: 'DNN Intelligence Report',
    video_url: 'https://app.heygen.com/embeds/1b0ea329a2d448079a01f67ea3559ac6',
  };

  const [isAdmin, setIsAdmin] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [readingArticle, setReadingArticle] = useState(null);
  const [destinationMarket, setDestinationMarket] = useState(() => new URLSearchParams(window.location.search).get('market') || localStorage.getItem('dnn_destination_market') || '');
  const queryClient = useQueryClient();

  useEffect(() => {
    appClient.auth.me().then(user => {
      if (user?.role === 'admin') setIsAdmin(true);
      const savedMarket = user?.destination_city || user?.destination_market;
      if (savedMarket) {
        localStorage.setItem('dnn_destination_market', savedMarket);
        setDestinationMarket(savedMarket);
      }
    }).catch(() => {});
  }, []);

  const handleEditArticle = (article) => {
    setEditingArticle(article);
    setEditForm({
      headline: article.headline || '',
      dateline: article.dateline || '',
      body: article.body || '',
      video_url: article.video_url || '',
      trigger_type: article.trigger_type || 'general',
      tags: (article.tags || []).join(', '),
    });
  };

  const handleSaveArticle = async () => {
    if (!editingArticle) return;
    setSavingEdit(true);
    await appClient.entities.DnnArticle.update(editingArticle.id, {
      headline: editForm.headline,
      dateline: editForm.dateline,
      body: editForm.body,
      video_url: editForm.video_url || undefined,
      trigger_type: editForm.trigger_type,
      tags: editForm.tags ? editForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    });
    queryClient.invalidateQueries({ queryKey: ['dnnArticlesConsumer'] });
    queryClient.invalidateQueries({ queryKey: ['dnnArticlesBlasted'] });
    setSavingEdit(false);
    setEditingArticle(null);
  };

  const handleDeleteArticle = async (id) => {
    if (!confirm('Delete this article?')) return;
    await appClient.entities.DnnArticle.delete(id);
    queryClient.invalidateQueries({ queryKey: ['dnnArticlesConsumer'] });
    queryClient.invalidateQueries({ queryKey: ['dnnArticlesBlasted'] });
  };

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['dnnArticlesConsumer'],
    queryFn: () => appClient.entities.DnnArticle.filter({ status: 'published' }, '-generated_date', 50),
  });

  const { data: blasted = [] } = useQuery({
    queryKey: ['dnnArticlesBlasted'],
    queryFn: () => appClient.entities.DnnArticle.filter({ status: 'blasted' }, '-generated_date', 50),
  });

  const allArticles = useMemo(() => {
    const market = destinationMarket.split(',')[0].trim().toLowerCase();
    const marketRank = (article) => {
      if (!market) return article.scope === 'national' ? 1 : 0;
      const searchable = [article.dateline, article.headline, ...(article.tags || [])].join(' ').toLowerCase();
      if (article.scope === 'local' && searchable.includes(market)) return 0;
      if (article.scope === 'national') return 1;
      return 2;
    };

    return [...articles, ...blasted].sort((a, b) => {
      const rankDifference = marketRank(a) - marketRank(b);
      if (rankDifference) return rankDifference;
      return new Date(b.generated_date || b.created_date) - new Date(a.generated_date || a.created_date);
    });
  }, [articles, blasted, destinationMarket]);

  const textArticles = allArticles;

  return (
    <div className="min-h-screen" style={{ background: '#ede0cc' }}>

      {/* Header */}
      <div className="sticky top-0 z-20 px-8 py-4 flex items-center justify-between"
        style={{ background: '#1a1a1a', borderBottom: '1px solid rgba(212,175,55,0.15)', backdropFilter: 'blur(10px)' }}>
        <div className="flex items-center gap-4">
          <img src={DNN_LOGO} alt="DNN" className="h-10 w-auto" />
          <div>
            <p className="text-sm font-black tracking-[0.35em] uppercase" style={{ color: '#D4AF37' }}>DNN</p>
            <p className="text-xs tracking-widest uppercase" style={{ color: '#ffffff' }}>Real Estate Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.assign('/broadcast-show')}
            className="flex items-center gap-2 text-sm font-black tracking-widest px-4 py-2 rounded-full transition-all hover:scale-105"
            style={{ color: '#000', background: 'linear-gradient(135deg, #e8c84a, #D4AF37)', boxShadow: '0 0 20px rgba(212,175,55,0.35)' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#ef4444' }} />
            LIVE BROADCAST
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="w-full px-8 md:px-16 py-14 text-center"
        style={{ borderBottom: '1px solid rgba(212,175,55,0.12)', background: '#ede0cc' }}>
        <div className="inline-flex items-center gap-2 mb-5 px-5 py-2 rounded-full text-xs font-black tracking-[0.3em] uppercase"
          style={{ background: '#000', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37' }}>
          <Globe className="w-3.5 h-3.5" /> Intelligence Bureau
        </div>
        <h1 className="display-heading mb-4"
          style={{ fontSize: 'clamp(1.7rem, 4.25vw, 3.4rem)', letterSpacing: '0.15em', color: '#1a1a1a', lineHeight: 1.05 }}>
          REAL ESTATE NEWS
        </h1>
        <p className="text-base leading-relaxed mx-auto mb-6" style={{ color: '#4a4a4a', maxWidth: '560px' }}>
          Market-moving news curated daily by DNN's AI Intelligence Bureau — localized to the markets that matter to your move.
        </p>

      </div>

      {/* Charlie circle — fixed below header; z-[300] so the full-screen player covers edit/trash buttons */}
      <div className="fixed top-36 right-4 md:top-40 md:right-6 z-[300]">
        <DnnBroadcastPresenter />
      </div>

      {/* Articles Feed */}
      <div className="w-full px-6 md:px-12 lg:px-20 md:pr-44 py-10 max-w-7xl mx-auto">
        {isAdmin && window.location.pathname.includes('/admin') && <DnnAdminBar articles={allArticles} isAdmin={isAdmin} />}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1" style={{ background: 'rgba(212,175,55,0.15)' }} />
          <span className="display-heading" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', letterSpacing: '0.3em', color: '#D4AF37' }}>Today's Briefs</span>
          <div className="h-px flex-1" style={{ background: 'rgba(212,175,55,0.15)' }} />
        </div>

        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-slate-800 border-t-yellow-500 rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && allArticles.length === 0 && (
          <div className="text-center py-24 space-y-4">
            <Globe className="w-12 h-12 mx-auto" style={{ color: 'rgba(212,175,55,0.3)' }} />
            <p className="display-heading text-lg" style={{ color: 'rgba(26,26,26,0.4)', letterSpacing: '0.15em' }}>BRIEF IN PREPARATION</p>
            <p className="text-sm" style={{ color: 'rgba(26,26,26,0.3)' }}>Our AI Bureau publishes daily — check back shortly.</p>
          </div>
        )}

        {!isLoading && allArticles.length > 0 && (
          <div className="flex gap-6 items-start">

            {/* Text briefs — flex-1 to fill available space */}
            <div className="flex-1 min-w-0 space-y-3">
              <p className="text-sm font-black tracking-[0.2em] uppercase px-3 py-2 text-center" style={{ color: '#1a1a1a' }}>
                {destinationMarket ? `${destinationMarket.split(',')[0]} News + National Briefs` : 'News Briefs'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {textArticles.map(article => (
                  <div key={article.id} className="relative">
                    <CompactArticleCard
                       article={article}
                       isAdmin={isAdmin}
                       onEdit={handleEditArticle}
                       onDelete={handleDeleteArticle}
                       onListenBob={(text) => speak('bob', text)}
                       onRead={setReadingArticle}
                     />
                    {/* Listen to full article button */}
                    <button
                      onClick={() => speak('bob', `${article.headline}. ${article.body || ''}`)}
                      disabled={talkLoading}
                      className="absolute top-3 right-16 flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full transition-all hover:opacity-80 disabled:opacity-40"
                      style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}
                      title="Listen to this article"
                    >
                      <Headphones className="w-3 h-3" />
                      {talkLoading ? '...' : 'Listen'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Videos — always shown on large screens */}
            <div className="hidden lg:block shrink-0 w-[320px] space-y-3">
              <p className="text-sm font-black tracking-[0.2em] uppercase px-3 py-2 text-center" style={{ color: '#1a1a1a' }}>Featured Videos</p>
              {allArticles.filter(a => a.video_url && !a.video_url.startsWith('heygen:pending:')).length > 0 ? (
                <div className="space-y-3">
                  {allArticles
                    .filter(a => a.video_url && !a.video_url.startsWith('heygen:pending:'))
                    .slice(0, 10)
                    .map(article => (
                      <VideoThumbnail
                        key={article.id}
                        article={article}
                        isAdmin={isAdmin}
                        onEdit={handleEditArticle}
                        onDelete={handleDeleteArticle}
                      />
                    ))}
                </div>
              ) : (
                <VideoThumbnail
                  article={HARDCODED_VIDEO}
                  isAdmin={false}
                />
              )}
            </div>

          </div>
        )}
      </div>

      {/* Competitive Comparison — Why DNN Is Different */}
      <div style={{ background: '#ede0cc', borderTop: '1px solid rgba(212,175,55,0.12)' }}>
        <DnnComparisonSection />
      </div>

      {/* Below the fold — subscribe + network */}
      <div className="w-full px-6 md:px-12 lg:px-20 pb-16 max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8" style={{ borderTop: '1px solid rgba(212,175,55,0.15)', paddingTop: '3rem' }}>
          <div className="h-px flex-1" style={{ background: 'rgba(212,175,55,0.15)' }} />
          <span className="text-xs font-black tracking-[0.3em] uppercase" style={{ color: '#D4AF37' }}>Stay Connected</span>
          <div className="h-px flex-1" style={{ background: 'rgba(212,175,55,0.15)' }} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SubscribeBanner />
          <CharlieEducationStrip />
        </div>

        {/* Footer */}
        <div className="mt-12 text-center pb-4" style={{ borderTop: '1px solid rgba(212,175,55,0.08)', paddingTop: '2rem' }}>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-16" style={{ background: 'rgba(212,175,55,0.2)' }} />
            <img src={DNN_LOGO} alt="DNN" className="w-auto" style={{ height: '49px' }} />
            <div className="h-px w-16" style={{ background: 'rgba(212,175,55,0.2)' }} />
          </div>
          <p className="text-xs tracking-widest uppercase" style={{ color: '#1a1a1a' }}>DNN Intelligence Bureau · AI-generated · For informational purposes only</p>
          <p className="text-xs mt-1" style={{ color: '#1a1a1a' }}>Dyson & Dyson Real Estate Concierge · CA DRE #02303118</p>
        </div>
      </div>

      {/* Full-screen Article Reader */}
      {readingArticle && (
        <ArticleReaderModal
          article={readingArticle}
          onClose={() => setReadingArticle(null)}
          onListen={(text) => speak('bob', text)}
          onListenBob={(text) => speak('bob', text)}
        />
      )}

      {/* Talking Head Bubble */}
      {talkingHeadProps && (
        <TalkingHead
          {...talkingHeadProps}
          onClose={dismiss}
        />
      )}

      {/* Edit Modal */}
      {editingArticle && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.3)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Edit Article</h2>
              <button onClick={() => setEditingArticle(null)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1 uppercase">Headline</label>
                <input
                  type="text"
                  value={editForm.headline}
                  onChange={e => setEditForm({ ...editForm, headline: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(212,175,55,0.2)' }}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1 uppercase">Dateline</label>
                <input
                  type="text"
                  value={editForm.dateline}
                  onChange={e => setEditForm({ ...editForm, dateline: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(212,175,55,0.2)' }}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1 uppercase">Video URL</label>
                <input
                  type="text"
                  value={editForm.video_url}
                  onChange={e => setEditForm({ ...editForm, video_url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(212,175,55,0.2)' }}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1 uppercase">Trigger Type</label>
                <select
                  value={editForm.trigger_type}
                  onChange={e => setEditForm({ ...editForm, trigger_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(212,175,55,0.2)' }}
                >
                  {['tax_policy', 'housing_market', 'job_market', 'interest_rates', 'migration_data', 'employer_news', 'general'].map(t => (
                    <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1 uppercase">Body Text</label>
                <textarea
                  value={editForm.body}
                  onChange={e => setEditForm({ ...editForm, body: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 rounded-lg text-sm text-white resize-none focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(212,175,55,0.2)' }}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1 uppercase">Tags (comma separated)</label>
                <input
                  type="text"
                  value={editForm.tags}
                  onChange={e => setEditForm({ ...editForm, tags: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(212,175,55,0.2)' }}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={handleSaveArticle} disabled={savingEdit}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-bold text-black disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #e8c84a, #D4AF37)' }}>
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => setEditingArticle(null)}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-400 border"
                style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
