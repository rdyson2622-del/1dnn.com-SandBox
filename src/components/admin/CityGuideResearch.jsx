import React, { useState } from 'react';
import { appClient } from '@/api/appClient';
import { Button } from '@/components/ui/button';
import { MapPin, BookOpen, GraduationCap, DollarSign, Heart, TreePine, Building2, Loader2, Send, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const GOLD = '#D4AF37';

const categories = [
  { key: 'neighborhoods', label: 'Neighborhoods', icon: Building2, prompt: 'top neighborhoods and communities' },
  { key: 'schools', label: 'Schools & Education', icon: GraduationCap, prompt: 'schools, school districts, and education options' },
  { key: 'cost', label: 'Cost of Living', icon: DollarSign, prompt: 'cost of living including housing, groceries, utilities, and taxes' },
  { key: 'healthcare', label: 'Healthcare', icon: Heart, prompt: 'hospitals, medical centers, and healthcare options' },
  { key: 'recreation', label: 'Parks & Recreation', icon: TreePine, prompt: 'parks, outdoor recreation, sports, and fitness options' },
  { key: 'culture', label: 'Local Culture', icon: MapPin, prompt: 'local culture, dining, arts, community life, and things to do' },
];

export default function CityGuideResearch({ client }) {
  const [activeCategory, setActiveCategory] = useState(null);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(null);
  const [pushed, setPushed] = useState({});

  const city = client?.destination_city;

  const research = async (cat) => {
    if (!city) return;
    setLoading(cat.key);
    setActiveCategory(cat.key);
    try {
      const response = await appClient.integrations.Core.InvokeLLM({
        prompt: `Provide a detailed, practical guide about ${cat.prompt} in ${city} for a family relocating there. Include specific names, realistic price ranges, and actionable advice. Use markdown with headers and bullet points. Be specific.`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
      });
      const text = typeof response === 'string' ? response : response?.data || JSON.stringify(response);
      setResults(prev => ({ ...prev, [cat.key]: text }));
    } catch (e) {
      setResults(prev => ({ ...prev, [cat.key]: 'Research failed. Try again.' }));
    } finally {
      setLoading(null);
    }
  };

  const pushToClient = async (cat) => {
    if (!results[cat.key] || !client?.id) return;
    await appClient.entities.ContentApproval.create({
      client_id: client.id,
      source: 'recommendation',
      content_type: 'city_info',
      title: `${cat.label} in ${city}`,
      content: results[cat.key],
      status: 'approved',
    });
    setPushed(prev => ({ ...prev, [cat.key]: true }));
  };

  if (!city) return (
    <div className="text-center py-8 text-slate-400 text-sm">No destination city set for this client.</div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="w-4 h-4" style={{ color: GOLD }} />
        <h3 className="font-bold text-slate-800">City Guide Research — {city}</h3>
        <span className="text-xs text-slate-400 ml-1">(admin only • uses AI credits)</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => research(cat)}
            disabled={loading === cat.key}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-left transition-all text-sm font-semibold hover:shadow-sm disabled:opacity-60"
            style={{
              borderColor: activeCategory === cat.key ? GOLD : '#e2e8f0',
              background: activeCategory === cat.key ? 'rgba(212,175,55,0.06)' : '#fff',
              color: '#333',
            }}
          >
            {loading === cat.key
              ? <Loader2 className="w-4 h-4 animate-spin shrink-0 text-amber-500" />
              : <cat.icon className="w-4 h-4 shrink-0 text-slate-500" />
            }
            {cat.label}
          </button>
        ))}
      </div>

      {activeCategory && results[activeCategory] && (
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-600 tracking-wide">
              {categories.find(c => c.key === activeCategory)?.label?.toUpperCase()} — {city}
            </p>
            {pushed[activeCategory] ? (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                <CheckCircle className="w-3.5 h-3.5" /> Pushed to client
              </span>
            ) : (
              <Button size="sm" className="gap-1.5 h-7 text-xs"
                style={{ background: GOLD, color: '#000' }}
                onClick={() => pushToClient(categories.find(c => c.key === activeCategory))}>
                <Send className="w-3 h-3" /> Push to Client
              </Button>
            )}
          </div>
          <div className="p-4 prose prose-sm prose-slate max-w-none text-sm">
            <ReactMarkdown>{results[activeCategory]}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}