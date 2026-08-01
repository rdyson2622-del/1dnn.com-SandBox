import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { appClient } from '@/api/appClient';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, ImagePlus, Copy, Check } from 'lucide-react';

const GOLD = '#D4AF37';

export default function CampaignContentGenerator({ campaignId }) {
  const [selectedPlatform, setSelectedPlatform] = useState('linkedin');
  const [selectedPillar, setSelectedPillar] = useState('testimonials');
  const [copyVariants, setCopyVariants] = useState([]);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [copied, setCopied] = useState(null);

  const platforms = ['linkedin', 'facebook', 'instagram', 'tiktok', 'email'];
  const pillars = ['testimonials', 'tips', 'behind-the-scenes', 'client-success', 'industry-news'];

  const handleGenerateCopy = async () => {
    setGenerating(true);
    try {
      const res = await appClient.functions.invoke('generateCampaignContent', {
        campaignId,
        action: 'generate_copy',
        platform: selectedPlatform,
        contentPillar: selectedPillar,
      });
      setCopyVariants(res.data?.variants || []);
    } catch (error) {
      console.error(error);
    }
    setGenerating(false);
  };

  const handleGenerateImage = async () => {
    setGeneratingImage(true);
    try {
      const res = await appClient.functions.invoke('generateCampaignContent', {
        campaignId,
        action: 'generate_image',
        contentPillar: selectedPillar,
      });
      setGeneratedImage(res.data?.image_url);
    } catch (error) {
      console.error(error);
    }
    setGeneratingImage(false);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="rounded-xl p-6" style={{ background: '#2a2a2a', border: `1px solid #444` }}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5" style={{ color: GOLD }} />
        <h3 className="text-lg font-bold" style={{ color: '#fff' }}>Content Generator</h3>
      </div>

      {/* Platform & Pillar Selection */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs font-semibold" style={{ color: '#888' }}>PLATFORM</label>
          <div className="flex flex-wrap gap-1 mt-2">
            {platforms.map(p => (
              <button
                key={p}
                onClick={() => setSelectedPlatform(p)}
                className="px-2.5 py-1 rounded text-xs font-medium transition-all"
                style={{
                  background: selectedPlatform === p ? GOLD + '33' : '#1a1a1a',
                  color: selectedPlatform === p ? GOLD : '#888',
                  border: selectedPlatform === p ? `1px solid ${GOLD}` : '1px solid #333'
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold" style={{ color: '#888' }}>CONTENT PILLAR</label>
          <div className="flex flex-wrap gap-1 mt-2">
            {pillars.map(p => (
              <button
                key={p}
                onClick={() => setSelectedPillar(p)}
                className="px-2.5 py-1 rounded text-xs font-medium transition-all"
                style={{
                  background: selectedPillar === p ? GOLD + '33' : '#1a1a1a',
                  color: selectedPillar === p ? GOLD : '#888',
                  border: selectedPillar === p ? `1px solid ${GOLD}` : '1px solid #333'
                }}
              >
                {p.replace(/-/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generator Buttons */}
      <div className="flex gap-3 mb-4">
        <Button
          onClick={handleGenerateCopy}
          disabled={generating}
          className="gap-2 flex-1"
          style={{ background: GOLD, color: '#000' }}
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate Copy Variants
        </Button>
        <Button
          onClick={handleGenerateImage}
          disabled={generatingImage}
          className="gap-2 flex-1"
          style={{ background: GOLD, color: '#000' }}
        >
          {generatingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
          Generate Image
        </Button>
      </div>

      {/* Copy Variants */}
      <AnimatePresence>
        {copyVariants.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 mb-4">
            <p className="text-xs font-semibold" style={{ color: '#888' }}>COPY VARIANTS</p>
            {copyVariants.map((v, i) => (
              <div key={i} className="rounded-lg p-3" style={{ background: '#1a1a1a' }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-xs px-2 py-1 rounded-full" style={{ background: GOLD + '22', color: GOLD }}>
                      {v.tone}
                    </span>
                    <span className="text-xs ml-2" style={{ color: '#888' }}>{v.word_count} words</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(v.text, v.variant_id)}
                    className="p-1.5 hover:bg-white/10 rounded transition-all"
                  >
                    {copied === v.variant_id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" style={{ color: GOLD }} />}
                  </button>
                </div>
                <p className="text-sm" style={{ color: '#ddd' }}>{v.text}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Image */}
      <AnimatePresence>
        {generatedImage && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-semibold mb-2" style={{ color: '#888' }}>GENERATED IMAGE</p>
            <img src={generatedImage} alt="Generated" className="w-full rounded-lg mb-3 max-h-64 object-cover" />
            <Button
              onClick={() => {
                navigator.clipboard.writeText(generatedImage);
                setCopied('image');
                setTimeout(() => setCopied(null), 2000);
              }}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {copied === 'image' ? '✓ Copied URL' : 'Copy Image URL'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}