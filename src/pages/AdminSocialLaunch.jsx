import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, CheckCheck, Linkedin, Send, ExternalLink, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { appClient } from '@/api/appClient';
import { motion } from 'framer-motion';

const LAUNCH_CAMPAIGN_NAME = 'dysonrelo.com Launch — Social Media';

const SEED_POSTS = [
  {
    label: 'Post 1 — The Introduction',
    platform: 'linkedin',
    content_pillar: 'Launch Announcement',
    status: 'approved',
    linkedin: `Big news — after 54 years in real estate, we just launched something that changes everything about how families relocate.

Introducing dysonrelo.com — your AI-powered concierge relocation manager.

✅ Charlie (our AI advisor) researches your destination 24/7
✅ We vet and present the top local agents — you pick
✅ We manage every step of your move — schools, utilities, logistics
✅ Completely FREE to relocating families

Whether you're moving across the country or across the state, you no longer have to figure it out alone.

Try it tonight → dysonrelo.com

#Relocation #RealEstate #AIAdvisor #DysonRelo #MovingMadeSimple`,

    loomly: `Big news — after 54 years in real estate, we just launched something that changes everything about how families relocate.

Introducing dysonrelo.com — your AI-powered concierge relocation manager.

✅ Charlie (our AI) researches your destination 24/7
✅ We vet and present top local agents — you pick
✅ We manage every step — schools, utilities, logistics
✅ Completely FREE to relocating families

Try it tonight → dysonrelo.com

#Relocation #RealEstate #MovingMadeSimple #DysonRelo`,
  },
  {
    label: 'Post 2 — The Value Hook',
    platform: 'linkedin',
    content_pillar: 'Value Proposition',
    status: 'approved',
    linkedin: `Most families spend 200+ hours managing a relocation on their own.

Wrong schools. Wrong neighborhood. Wrong agent.

We built dysonrelo.com to fix that.

Our AI advisor Charlie handles:
🏠 Deep neighborhood research
🎓 School district analysis
💰 Cost of living comparisons
🤝 Curated agent matching in your destination city
📦 Full move logistics coordination

You focus on your family. We handle the rest.

And it's free.

Start your relocation profile → dysonrelo.com

#ConciergeRelocation #RealEstate #MovingTips #DysonRelo #FamilyMove`,

    loomly: `Most families spend 200+ hours managing a relocation alone.

Wrong schools. Wrong neighborhood. Wrong agent.

We built dysonrelo.com to fix that.

Charlie (our AI) handles:
🏠 Neighborhood research
🎓 School district analysis
💰 Cost of living comparisons
🤝 Agent matching in your destination city

You focus on your family. We handle the rest. And it's free.

Start your profile → dysonrelo.com

#ConciergeRelocation #RealEstate #MovingTips #DysonRelo`,
  },
];

const PLATFORMS = [
  { key: 'facebook', label: 'Facebook', color: '#1877F2' },
  { key: 'tiktok', label: 'TikTok', color: '#000' },
  { key: 'youtube', label: 'YouTube', color: '#FF0000' },
  { key: 'instagram', label: 'Instagram', color: '#E1306C' },
];

export default function AdminSocialLaunch() {
  const [copied, setCopied] = useState(null);
  const [posting, setPosting] = useState(null);
  const [posted, setPosted] = useState({});
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);
  const [campaignId, setCampaignId] = useState(null);
  const [seeding, setSeeding] = useState(true);

  useEffect(() => {
    seedCampaignAndPosts();
  }, []);

  const seedCampaignAndPosts = async () => {
    setSeeding(true);
    try {
      // Find or create the launch campaign
      const existingCampaigns = await appClient.entities.MarketingCampaign.filter({ campaign_name: LAUNCH_CAMPAIGN_NAME });
      let campaign;
      if (existingCampaigns.length > 0) {
        campaign = existingCampaigns[0];
      } else {
        campaign = await appClient.entities.MarketingCampaign.create({
          campaign_name: LAUNCH_CAMPAIGN_NAME,
          target_audience: 'relocating_families',
          status: 'active',
          platforms: ['linkedin', 'facebook', 'tiktok', 'youtube', 'instagram'],
          description: '2-post launch campaign announcing dysonrelo.com to the world.',
          key_messages: [
            '54 years of real estate experience behind an AI platform',
            'Charlie handles the entire relocation — free of charge',
            'We vet and present local agents — you pick',
          ],
          total_posts_planned: 2,
          theme: 'Platform Launch',
        });
      }
      setCampaignId(campaign.id);

      // Find or create the posts
      const existingPosts = await appClient.entities.SocialPost.filter({ campaign_id: campaign.id });

      const seededPosts = [];
      for (let i = 0; i < SEED_POSTS.length; i++) {
        const seed = SEED_POSTS[i];
        const existing = existingPosts.find(p => p.content_pillar === seed.content_pillar);
        if (existing) {
          seededPosts.push({ ...existing, label: seed.label, linkedin: existing.selected_copy || seed.linkedin, loomly: seed.loomly });
        } else {
          const created = await appClient.entities.SocialPost.create({
            campaign_id: campaign.id,
            platform: seed.platform,
            content_pillar: seed.content_pillar,
            selected_copy: seed.linkedin,
            copy_variants: [
              { variant_id: 'linkedin', text: seed.linkedin, tone: 'professional', selected: true },
              { variant_id: 'loomly', text: seed.loomly, tone: 'friendly', selected: false },
            ],
            hashtags: seed.linkedin.match(/#\w+/g) || [],
            cta: 'visit_app',
            cta_url: 'https://dysonrelo.com',
            status: seed.status,
            notes: seed.label,
          });
          seededPosts.push({ ...created, label: seed.label, linkedin: seed.linkedin, loomly: seed.loomly });
        }
      }
      setPosts(seededPosts);

      // Update campaign post count
      await appClient.entities.MarketingCampaign.update(campaign.id, { posts_created: seededPosts.length });
    } catch (err) {
      setError('Setup error: ' + err.message);
    } finally {
      setSeeding(false);
    }
  };

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const postToLinkedIn = async (post, idx) => {
    setPosting(idx);
    setError(null);
    try {
      await appClient.functions.invoke('postToLinkedIn', { text: post.linkedin });
      // Mark post as published in DB
      await appClient.entities.SocialPost.update(post.id, {
        status: 'published',
        published_date: new Date().toISOString(),
      });
      setPosted(prev => ({ ...prev, [idx]: true }));
    } catch (err) {
      setError(`Post ${idx + 1} failed: ${err.message}`);
    } finally {
      setPosting(null);
    }
  };

  if (seeding) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500">Syncing with Marketing Campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 px-6 py-4 flex items-center gap-3">
        <Link to="/admin">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="font-bold text-slate-900">Social Media Launch</h1>
          <p className="text-xs text-slate-500">2-post campaign — dysonrelo.com launch</p>
        </div>
        {campaignId && (
          <Link to="/admin/marketing-campaigns">
            <Button variant="outline" size="sm" className="gap-1 text-xs">
              <Zap className="w-3 h-3" /> View in Marketing Campaigns
            </Button>
          </Link>
        )}
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-8">

        {/* Oracle Strategy Section */}
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-300 rounded-2xl p-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-amber-900 mb-3">📡 The Oracle of Relocation Strategy</h2>
            <p className="text-sm text-amber-800 leading-relaxed mb-4">
              Position <strong>Bob Dyson</strong> as the "Oracle of Relocation" — leveraging his 54-year industry legacy. No competitor can match this combination of scale, longevity, and current AI adoption.
            </p>
            
            <div className="space-y-3 mb-5">
              <div className="bg-white rounded-lg p-3 border border-amber-200">
                <p className="text-xs font-bold text-amber-900 uppercase tracking-widest mb-1">💼 Content Pillar 1: Then vs Now</p>
                <p className="text-sm text-amber-800">Historic vs. modern real estate comparisons. Side-by-side snapshots: 1972, 1995, 2010, and today. Data-driven, shareable.</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-amber-200">
                <p className="text-xs font-bold text-amber-900 uppercase tracking-widest mb-1">🤖 Content Pillar 2: AI Charlie Spotlights</p>
                <p className="text-sm text-amber-800">Showcasing precision. Short-form demos of Charlie in action: answering neighborhood questions, comparing schools, guiding through commitment.</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-amber-200">
                <p className="text-xs font-bold text-amber-900 uppercase tracking-widest mb-1">🎬 Content Pillar 3: The 1927 Parallel</p>
                <p className="text-sm text-amber-800">Authority deep dives. Frames Charlie as the "talkie moment" for real estate — connecting synchronized sound in film to voice-to-voice AI.</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border-l-4 border-amber-400">
              <p className="text-xs font-bold text-amber-900 uppercase tracking-widest mb-2">📅 Posting Cadence</p>
              <p className="text-sm text-amber-800"><strong>3x weekly</strong> across LinkedIn and Instagram. Consistent 90-day run builds momentum before paid amplification.</p>
              <p className="text-xs text-amber-700 mt-2">✦ Every comment replied to within 24h. Every DM from relocating family routed to Charlie intake.</p>
            </div>
          </div>
        </div>

        {/* Loomly reminder */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <ExternalLink className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Loomly Workflow</p>
            <p className="text-xs text-blue-700 mt-0.5">Copy each "Loomly / Other Platforms" script below and paste into <strong>loomly.com</strong> for Facebook, TikTok, YouTube & Instagram. LinkedIn posts directly from this page.</p>
          </div>
        </div>

        {/* Oracle of Relocation Strategy */}
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-300 rounded-2xl p-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-amber-900 mb-3">🔮 The Oracle of Relocation Strategy</h2>
            <p className="text-sm text-amber-800 leading-relaxed mb-4">
              Position <strong>Bob Dyson</strong> as the "Oracle of Relocation" — leveraging his 54-year industry legacy. No competitor can match this combination of scale, longevity, and current AI adoption.
            </p>
            
            <div className="space-y-3 mb-5">
              <div className="bg-white rounded-lg p-3 border border-amber-200">
                <p className="text-xs font-bold text-amber-900 uppercase tracking-widest mb-1">💼 Content Pillar 1: Then vs Now</p>
                <p className="text-sm text-amber-800">Historic vs. modern real estate comparisons. Side-by-side snapshots: 1972, 1995, 2010, and today. Data-driven, shareable.</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-amber-200">
                <p className="text-xs font-bold text-amber-900 uppercase tracking-widest mb-1">🤖 Content Pillar 2: AI Charlie Spotlights</p>
                <p className="text-sm text-amber-800">Showcasing precision. Short-form demos of Charlie in action: answering neighborhood questions, comparing schools, guiding through commitment.</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-amber-200">
                <p className="text-xs font-bold text-amber-900 uppercase tracking-widest mb-1">🎬 Content Pillar 3: The 1927 Parallel</p>
                <p className="text-sm text-amber-800">Authority deep dives. Frames Charlie as the "talkie moment" for real estate — connecting synchronized sound in film to voice-to-voice AI.</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border-l-4 border-amber-400">
              <p className="text-xs font-bold text-amber-900 uppercase tracking-widest mb-2">📅 Posting Cadence</p>
              <p className="text-sm text-amber-800"><strong>3x weekly</strong> across LinkedIn and Instagram. Consistent 90-day run builds momentum before paid amplification.</p>
              <p className="text-xs text-amber-700 mt-2">✨ Every comment replied to within 24h. Every DM from relocating family routed to Charlie intake.</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
        )}

        {posts.map((post, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
          >
            {/* Post Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Campaign Drop {i + 1}</span>
                <p className="font-semibold text-slate-900 mt-0.5">{post.label || post.notes}</p>
              </div>
              <div className="flex items-center gap-2">
                {post.status === 'published' || posted[i] ? (
                  <span className="text-xs font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full flex items-center gap-1">
                    <CheckCheck className="w-3 h-3" /> Posted to LinkedIn
                  </span>
                ) : (
                  <span className="text-xs font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
                    Approved — Ready to Post
                  </span>
                )}
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* LinkedIn Section */}
              <div className="rounded-xl border border-[#0A66C2]/30 bg-[#0A66C2]/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                    <span className="text-sm font-semibold text-[#0A66C2]">LinkedIn</span>
                    <span className="text-xs text-slate-400">— posts directly from here</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyText(post.linkedin, `li-${i}`)}
                    className="gap-1 text-xs"
                  >
                    {copied === `li-${i}` ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied === `li-${i}` ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <pre className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">{post.linkedin}</pre>
                <Button
                  onClick={() => postToLinkedIn(post, i)}
                  disabled={posting === i || post.status === 'published' || posted[i]}
                  className="w-full gap-2 bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white"
                >
                  {posting === i ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Posting...</>
                  ) : post.status === 'published' || posted[i] ? (
                    <><CheckCheck className="w-4 h-4" /> Posted ✓</>
                  ) : (
                    <><Send className="w-4 h-4" /> Post to LinkedIn Now</>
                  )}
                </Button>
              </div>

              {/* Loomly / Other Platforms Section */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-700">Loomly / Other Platforms</span>
                    <div className="flex gap-1.5">
                      {PLATFORMS.map(p => (
                        <span key={p.key} className="text-xs px-2 py-0.5 rounded-full text-white font-semibold" style={{ background: p.color }}>
                          {p.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyText(post.loomly, `lm-${i}`)}
                    className="gap-1 text-xs shrink-0"
                  >
                    {copied === `lm-${i}` ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied === `lm-${i}` ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <pre className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">{post.loomly}</pre>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Timing & Approval Guidance */}
        <div className="bg-slate-100 border border-slate-300 rounded-xl p-4 space-y-3 text-sm text-slate-800">
          <div>
            <p className="font-semibold mb-2">✅ Post Approval Status</p>
            <p>Both posts are approved and ready to launch. LinkedIn posts directly from this interface. Loomly posts go to Facebook, TikTok, YouTube, and Instagram.</p>
          </div>
          <div className="border-t border-slate-300 pt-3">
            <p className="font-semibold mb-2">📅 Posting Strategy</p>
            <p><strong>Post 1</strong> — Tonight. Best window: 6–8pm PT</p>
            <p><strong>Post 2</strong> — 48–72 hours later for maximum reach without overlap.</p>
          </div>
        </div>
      </main>
    </div>
  );
}