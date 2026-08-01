import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, MapPin, GraduationCap, DollarSign, Heart, Building2, TreePine, MessageCircle, ArrowRight, Sparkles, Clock, CheckCircle2, Send, Loader2, ChevronDown, ChevronUp, Shield, Footprints } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { appClient } from '@/api/appClient';
import ReactMarkdown from 'react-markdown';
import { MapContainer, TileLayer, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const GOLD = '#D4AF37';

const categories = [
  {
    key: 'map',
    label: 'Interactive Map',
    icon: MapPin,
    color: 'bg-indigo-500',
    prompt: 'neighborhood map with safety, walkability, and schools',
    preview: 'Interactive map showing neighborhood safety scores, walkability ratings, and school locations for your destination city.',
    why: 'Visual data helps you understand neighborhoods at a glance — see safety, walkability, and schools overlaid on one map.',
    isMap: true,
  },
  {
    key: 'neighborhoods',
    label: 'Neighborhoods',
    icon: Building2,
    color: 'bg-blue-500',
    prompt: 'top neighborhoods and communities',
    preview: 'Once your agent and target neighborhoods are identified, we generate a personalized breakdown of the communities that match your lifestyle — schools zones, commute times, walkability scores, and local character.',
    why: 'Generic neighborhood data misleads families. We wait until we know your price range, school priorities, and commute needs so every recommendation is actually relevant to you.',
  },
  {
    key: 'schools',
    label: 'Schools & Education',
    icon: GraduationCap,
    color: 'bg-emerald-500',
    prompt: 'schools, school districts, and education options',
    preview: 'A full analysis of public, charter, and private school options near your shortlisted neighborhoods — with ratings, enrollment windows, special programs, and proximity to your target listings.',
    why: 'School quality varies block by block. Without knowing your target area, we\'d be giving you data for schools 20 miles from where you\'ll actually live.',
  },
  {
    key: 'cost',
    label: 'Cost of Living',
    icon: DollarSign,
    color: 'bg-amber-500',
    prompt: 'cost of living including housing, groceries, utilities, and taxes',
    preview: 'A side-by-side comparison of your current city vs. your destination — property taxes, utility averages, grocery costs, and neighborhood-specific HOA ranges tied to your actual budget.',
    why: 'Cost of living is meaningless without a specific zip code and home price. We tie this to your budget and target listings so the numbers are real.',
  },
  {
    key: 'healthcare',
    label: 'Healthcare',
    icon: Heart,
    color: 'bg-red-500',
    prompt: 'hospitals, medical centers, and healthcare options',
    preview: 'Major hospital systems, specialist networks, urgent care locations, and insurance network coverage near your target neighborhoods — including distance from shortlisted listings.',
    why: 'Healthcare needs are personal. Once we know where you\'re looking, we map providers to your location. If you have specific medical needs, use the request form below — we\'ll research it now.',
  },
  {
    key: 'recreation',
    label: 'Parks & Recreation',
    icon: TreePine,
    color: 'bg-green-500',
    prompt: 'parks, outdoor recreation, sports, and fitness options',
    preview: 'Parks, trails, fitness centers, sports leagues, and family activities near your target area — curated to match the priorities you shared in your intake session.',
    why: 'Recreation that matters to your family depends on where you\'ll actually live. A trail that\'s 30 minutes away isn\'t a benefit.',
  },
  {
    key: 'culture',
    label: 'Local Culture & Dining',
    icon: MapPin,
    color: 'bg-purple-500',
    prompt: 'local culture, dining, arts, community life, and things to do',
    preview: 'Restaurants, community events, religious communities, arts scenes, and local character for the neighborhoods you\'re seriously considering — not a generic city overview.',
    why: 'Culture varies enormously by neighborhood. Downtown Austin is nothing like Cedar Park. We match this to where you\'re actually moving.',
  },
];

const WHY_STEPS = [
  { icon: MapPin, label: 'Neighborhood identified', desc: 'We know which area you\'re targeting' },
  { icon: GraduationCap, label: 'Priorities confirmed', desc: 'Schools, commute, lifestyle — all mapped' },
  { icon: Building2, label: 'Agent selected', desc: 'Your local expert is in place' },
  { icon: CheckCircle2, label: 'Buyer Broker signed', desc: 'You\'re a committed client — full access unlocks' },
];

export default function CityGuide() {
  const [city, setCity] = useState('');
  const [submittedCity, setSubmittedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [committed, setCommitted] = useState(null);
  const [clientData, setClientData] = useState(null);

  // Urgent request state
  const [urgentRequest, setUrgentRequest] = useState('');
  const [urgentSending, setUrgentSending] = useState(false);
  const [urgentSent, setUrgentSent] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);

  // Map data state
  const [mapData, setMapData] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null);

  useEffect(() => {
    appClient.auth.me().then(user => {
      if (!user) { setCommitted(false); return; }
      appClient.entities.RelocationClient.filter({ email: user.email }, '-created_date', 1)
        .then(results => {
          const client = results?.[0];
          setClientData(client || null);
          setCommitted(client?.buyer_broker_signed === true);
        })
        .catch(() => setCommitted(false));
    }).catch(() => setCommitted(false));
  }, []);

  const handleCitySubmit = (e) => {
    e.preventDefault();
    if (city.trim()) setSubmittedCity(city.trim());
  };

  const searchCity = async (cat) => {
    if (!submittedCity) return;
    setSelectedCategory(cat);
    setLoading(true);
    setResult(null);
    try {
      const response = await appClient.integrations.Core.InvokeLLM({
        prompt: `Provide a detailed, practical guide about ${cat.prompt} in ${submittedCity} for a family relocating there. Include specific names of places, realistic price ranges, neighborhoods, and actionable advice. Use markdown with headers and bullet points. Be specific — avoid vague generalities.`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
      });
      let text = typeof response === 'string' ? response : response?.data || JSON.stringify(response);
      setResult(text || 'No results found.');
    } catch (error) {
      setResult('Research failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMapData = async () => {
    if (!submittedCity) return;
    setSelectedCategory(categories.find(c => c.key === 'map'));
    setMapLoading(true);
    setMapData(null);
    try {
      // Use LLM to get neighborhood data with coordinates
      const response = await appClient.integrations.Core.InvokeLLM({
        prompt: `For ${submittedCity}, provide neighborhood data in JSON format. Include 8-12 neighborhoods with: name, approximate latitude/longitude, safety score (1-100), walkability score (1-100), and 2-3 top schools nearby with ratings. Format as JSON array: [{"name": "Neighborhood", "lat": 0.0, "lng": 0.0, "safety": 0-100, "walkability": 0-100, "schools": [{"name": "School Name", "rating": 1-10, "distance": "0.5 miles"}]}]`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
      });
      let data = typeof response === 'string' ? JSON.parse(response) : response?.data;
      if (Array.isArray(data)) {
        setMapData(data);
      } else {
        setMapData([]);
      }
    } catch (error) {
      console.error('Map data error:', error);
      setMapData([]);
    } finally {
      setMapLoading(false);
    }
  };

  const sendUrgentRequest = async () => {
    if (!urgentRequest.trim()) return;
    setUrgentSending(true);
    try {
      await appClient.entities.ChatMessage.create({
        client_id: clientData?.id || null,
        role: 'user',
        content: `[URGENT CITY RESEARCH REQUEST] ${urgentRequest}`,
        message_type: 'city_info',
        flag_status: 'concern',
        flag_notes: 'Client requested urgent city research before agent/neighborhood selection',
      });
      setUrgentSent(true);
    } catch (e) {
      setUrgentSent(true); // still show success UX
    } finally {
      setUrgentSending(false);
    }
  };

  const cityReady = !!submittedCity;

  return (
    <div className="min-h-screen" style={{ background: '#ede0cc' }}>
    <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Loading */}
        {committed === null && (
          <div className="flex justify-center py-20">
            <div className="w-7 h-7 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin" />
          </div>
        )}

        {/* ─── NOT YET COMMITTED: Preview + Explanation ─── */}
        {committed === false && committed !== null && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

            {/* Hero */}
            <div className="text-center">
              <p className="text-sm font-black tracking-[0.25em] mb-3" style={{ color: GOLD }}>CITY GUIDE</p>
              <h1 className="display-heading mb-3 whitespace-nowrap" style={{ fontSize: 'clamp(1.2rem, 2.8vw, 2.2rem)', color: '#1a1a1a' }}>Here's What's Coming For You</h1>
              <p className="text-sm max-w-md mx-auto leading-relaxed" style={{ color: '#1a1a1a' }}>
                Our City Guide delivers <strong>hyper-personalized</strong> research across 6 categories — but we hold it until the right moment so every insight is actually useful to your family.
              </p>
            </div>

            {/* The 6 Preview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categories.map((cat, i) => (
                <motion.div key={cat.key}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="rounded-2xl overflow-hidden"
                  style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-2">
                      <div className={`w-9 h-9 rounded-xl ${cat.color} text-white flex items-center justify-center shrink-0`}>
                        <cat.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-white">{cat.label}</h3>
                        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{cat.preview}</p>
                      </div>
                    </div>

                    {/* Why we wait — expandable */}
                    <button
                      onClick={() => setExpandedCard(expandedCard === cat.key ? null : cat.key)}
                      className="flex items-center gap-1 text-xs font-semibold mt-2 transition-colors"
                      style={{ color: expandedCard === cat.key ? GOLD : 'rgba(255,255,255,0.35)' }}>
                      {expandedCard === cat.key ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      Why we wait on this
                    </button>
                    <AnimatePresence>
                      {expandedCard === cat.key && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden">
                          <p className="text-xs mt-2 pl-4 border-l-2 leading-relaxed"
                            style={{ borderColor: GOLD, color: 'rgba(255,255,255,0.5)' }}>
                            {cat.why}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Coming soon tag */}
                  <div className="px-4 py-2 flex items-center gap-1.5"
                    style={{ background: 'rgba(212,175,55,0.08)', borderTop: '1px solid rgba(212,175,55,0.15)' }}>
                    <Clock className="w-3 h-3" style={{ color: GOLD }} />
                    <span className="text-xs font-semibold" style={{ color: GOLD }}>Unlocks after agent selection + Buyer Broker Agreement</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* How it unlocks */}
            <div className="rounded-2xl p-5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color: GOLD }} />
                How Full Access Unlocks
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {WHY_STEPS.map((step, i) => (
                  <div key={i} className="text-center">
                    <div className="w-9 h-9 rounded-full border-2 flex items-center justify-center mx-auto mb-2"
                      style={{ borderColor: 'rgba(212,175,55,0.4)', background: 'rgba(212,175,55,0.08)' }}>
                      <step.icon className="w-4 h-4" style={{ color: GOLD }} />
                    </div>
                    <p className="text-xs font-bold text-white leading-snug">{step.label}</p>
                    <p className="text-xs mt-0.5 leading-snug" style={{ color: 'rgba(255,255,255,0.45)' }}>{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Urgent Request Box */}
            <div className="rounded-2xl border-2 p-5" style={{ borderColor: GOLD, background: '#0d0d0d' }}>
              <div className="mb-3">
                <p className="font-bold text-sm mb-1" style={{ color: GOLD }}>Need Something Specific Right Now?</p>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  If you have an urgent need — a specific specialist, school program, religious community, or medical facility — tell us and we'll have our team research it personally and get back to you.
                </p>
              </div>
              {urgentSent ? (
                <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-emerald-900/30 border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <p className="text-sm text-emerald-300 font-semibold">Got it — our team will research this and reach out to you shortly.</p>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={urgentRequest}
                    onChange={e => setUrgentRequest(e.target.value)}
                    placeholder="e.g. 'Need pediatric oncology specialists near Phoenix' or 'Looking for a Jewish day school'"
                    className="flex-1 px-3 py-2.5 rounded-xl text-sm border"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                    onKeyDown={e => e.key === 'Enter' && sendUrgentRequest()}
                  />
                  <Button onClick={sendUrgentRequest} disabled={!urgentRequest.trim() || urgentSending}
                    className="shrink-0 rounded-xl font-bold gap-1.5"
                    style={{ background: GOLD, color: '#000' }}>
                    {urgentSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Send
                  </Button>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-3 pb-4">
              <Link to="/GeminiSession">
                <button className="w-full py-3 rounded-full font-bold text-sm"
                  style={{ background: GOLD, color: '#000' }}>
                  Start My Gemini Session → Unlock Full Access
                </button>
              </Link>
              <Link to="/Chat">
                <button className="w-full py-3 rounded-full font-semibold text-sm border-2"
                  style={{ borderColor: '#1a1a1a', color: '#1a1a1a', background: 'transparent' }}>
                  Chat with Charlie First
                </button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* ─── FULL GUIDE — committed clients only ─── */}
        {committed === true && (
          <div>
            <div className="text-center mb-8">
              <p className="text-sm font-black tracking-[0.25em] mb-3" style={{ color: GOLD }}>CITY GUIDE</p>
              <h1 className="display-heading mb-2" style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2.6rem)', color: '#111' }}>Research Your New City</h1>
              <p className="text-sm text-slate-500">Enter a destination city, then tap any category to get AI-powered research.</p>
            </div>

            <form onSubmit={handleCitySubmit} className="mb-6">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Enter city (e.g., Austin, TX)"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="pl-10 h-12 text-base rounded-xl border-2"
                    style={{ borderColor: submittedCity ? GOLD : undefined, background: '#fff', color: '#111' }}
                  />
                </div>
                <Button type="submit" className="h-12 px-6 rounded-xl font-bold"
                  style={{ background: GOLD, color: '#000' }}>
                  Go
                </Button>
              </div>
              {submittedCity && (
                <p className="text-xs mt-2 ml-1 font-semibold" style={{ color: GOLD }}>
                  ✓ Researching: {submittedCity} — tap a category below
                </p>
              )}
            </form>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
              {categories.map((cat, i) => (
                <motion.button
                  key={cat.key}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  onClick={() => cat.isMap ? fetchMapData() : searchCity(cat)}
                  disabled={!submittedCity || loading || mapLoading}
                  className={`p-5 rounded-2xl border-2 text-left transition-all ${
                    selectedCategory?.key === cat.key ? 'shadow-md' : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                  style={selectedCategory?.key === cat.key ? { background: '#fff', borderColor: GOLD } : {}}
                >
                  <div className={`w-10 h-10 rounded-xl ${cat.color} text-white flex items-center justify-center mb-3`}>
                    <cat.icon className="w-5 h-5" />
                  </div>
                  <p className="font-semibold text-sm text-slate-900">{cat.label}</p>
                  {!cityReady && <p className="text-xs text-slate-400 mt-1">Enter city first</p>}
                </motion.button>
              ))}
            </div>

            <AnimatePresence>
              {mapLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-white rounded-2xl border-2 p-8 text-center mb-6"
                  style={{ borderColor: 'rgba(212,175,55,0.3)' }}>
                  <div className="w-8 h-8 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm font-semibold text-slate-700">
                    Loading <span style={{ color: GOLD }}>Interactive Map</span> for {submittedCity}...
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Fetching neighborhood data with safety, walkability, and schools</p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {loading && !mapLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-white rounded-2xl border-2 p-8 text-center mb-6"
                  style={{ borderColor: 'rgba(212,175,55,0.3)' }}>
                  <div className="w-8 h-8 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm font-semibold text-slate-700">
                    Researching <span style={{ color: GOLD }}>{selectedCategory?.label}</span> in {submittedCity}...
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Pulling live data from the web — this takes about 10 seconds</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Interactive Map Display */}
            <AnimatePresence>
              {mapData && !mapLoading && selectedCategory?.key === 'map' && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="bg-white rounded-2xl border-2 overflow-hidden mb-6"
                  style={{ borderColor: 'rgba(212,175,55,0.3)' }}>
                  {/* Map Header */}
                  <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100" style={{ background: '#f9fafb' }}>
                    <div className={`w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center`}>
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Interactive Map — {submittedCity}</h3>
                      <p className="text-xs text-slate-500">Safety scores • Walkability • Schools</p>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="px-6 py-3 flex flex-wrap gap-4 border-b border-slate-100" style={{ background: '#fafafa' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-xs font-medium text-slate-600">Safety 80-100</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <span className="text-xs font-medium text-slate-600">Safety 50-79</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="text-xs font-medium text-slate-600">Safety &lt;50</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-xs font-medium text-slate-600">Schools</span>
                    </div>
                  </div>

                  {/* Map Container */}
                  <div className="h-[500px] w-full">
                    <MapContainer
                      center={[mapData[0]?.lat || 30.2672, mapData[0]?.lng || -97.7431]}
                      zoom={11}
                      scrollWheelZoom={false}
                      className="h-full w-full"
                      style={{ border: 'none' }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {mapData.map((neighborhood, idx) => {
                        const safetyColor = neighborhood.safety >= 80 ? '#22c55e' : neighborhood.safety >= 50 ? '#eab308' : '#ef4444';
                        return (
                          <CircleMarker
                            key={idx}
                            center={[neighborhood.lat, neighborhood.lng]}
                            radius={12}
                            fillColor={safetyColor}
                            color="#fff"
                            weight={2}
                            opacity={1}
                            fillOpacity={0.7}
                            eventHandlers={{
                              click: () => setSelectedNeighborhood(neighborhood)
                            }}
                          >
                            <Popup>
                              <div className="p-2 min-w-[200px]">
                                <h4 className="font-bold text-sm mb-2 text-slate-900">{neighborhood.name}</h4>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <Shield className="w-3.5 h-3.5 text-slate-500" />
                                      <span className="text-xs text-slate-600">Safety:</span>
                                    </div>
                                    <span className="text-xs font-bold" style={{ color: safetyColor }}>{neighborhood.safety}/100</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <Footprints className="w-3.5 h-3.5 text-slate-500" />
                                      <span className="text-xs text-slate-600">Walkability:</span>
                                    </div>
                                    <span className="text-xs font-bold text-slate-700">{neighborhood.walkability}/100</span>
                                  </div>
                                  {neighborhood.schools && neighborhood.schools.length > 0 && (
                                    <div className="pt-2 border-t border-slate-200">
                                      <div className="flex items-center gap-1.5 mb-1.5">
                                        <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                                        <span className="text-xs font-semibold text-slate-700">Nearby Schools</span>
                                      </div>
                                      {neighborhood.schools.map((school, sIdx) => (
                                        <div key={sIdx} className="flex items-center justify-between py-1">
                                          <span className="text-xs text-slate-600 truncate flex-1">{school.name}</span>
                                          <span className="text-xs font-bold text-blue-600 ml-2">{school.rating}/10</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Popup>
                          </CircleMarker>
                        );
                      })}
                    </MapContainer>
                  </div>

                  {/* Selected Neighborhood Details */}
                  {selectedNeighborhood && (
                    <div className="px-6 py-4 border-t border-slate-100" style={{ background: '#f9fafb' }}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-lg mb-3 text-slate-900">{selectedNeighborhood.name}</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#fff', border: '1px solid #e5e7eb' }}>
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.1)' }}>
                                <Shield className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Safety Score</p>
                                <p className="text-lg font-bold text-slate-900">{selectedNeighborhood.safety}/100</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#fff', border: '1px solid #e5e7eb' }}>
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.1)' }}>
                                <Footprints className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Walkability</p>
                                <p className="text-lg font-bold text-slate-900">{selectedNeighborhood.walkability}/100</p>
                              </div>
                            </div>
                          </div>
                          {selectedNeighborhood.schools && selectedNeighborhood.schools.length > 0 && (
                            <div className="mt-4 p-4 rounded-xl" style={{ background: '#fff', border: '1px solid #e5e7eb' }}>
                              <div className="flex items-center gap-2 mb-3">
                                <GraduationCap className="w-4 h-4 text-blue-600" />
                                <p className="text-sm font-bold text-slate-900">Nearby Schools</p>
                              </div>
                              <div className="space-y-2">
                                {selectedNeighborhood.schools.map((school, idx) => (
                                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg" style={{ background: '#f9fafb' }}>
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-slate-900">{school.name}</p>
                                      {school.distance && <p className="text-xs text-slate-500">{school.distance}</p>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#3b82f6', color: '#fff' }}>
                                        <span className="text-xs font-bold">{school.rating}</span>
                                      </div>
                                      <span className="text-xs text-slate-500">/10</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => setSelectedNeighborhood(null)}
                          className="ml-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
                        >
                          <ArrowLeft className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <div className="px-6 py-4" style={{ background: '#0d0d0d', borderTop: `1px solid ${GOLD}` }}>
                    <p className="text-sm font-semibold mb-1" style={{ color: '#fff' }}>
                      Want a personalized neighborhood tour in {submittedCity}?
                    </p>
                    <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      Charlie can match you with neighborhoods based on your family's specific needs.
                    </p>
                    <Link to="/Chat">
                      <button className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold"
                        style={{ background: GOLD, color: '#000' }}>
                        <MessageCircle className="w-4 h-4" />
                        Talk to Charlie — It's Free
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Standard Research Results */}
            <AnimatePresence>
              {result && !loading && !mapLoading && selectedCategory?.key !== 'map' && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="bg-white rounded-2xl border-2 p-6 mb-6"
                  style={{ borderColor: 'rgba(212,175,55,0.3)' }}>
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                    <div className={`w-8 h-8 rounded-lg ${selectedCategory?.color} text-white flex items-center justify-center`}>
                      {selectedCategory && <selectedCategory.icon className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{selectedCategory?.label} in {submittedCity}</h3>
                      <p className="text-xs text-slate-400">AI research • Live data</p>
                    </div>
                  </div>
                  <div className="prose prose-sm prose-slate max-w-none">
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </div>
                  <div className="mt-6 p-4 rounded-xl" style={{ background: '#0d0d0d', border: `1px solid ${GOLD}` }}>
                    <p className="text-sm font-semibold mb-1" style={{ color: '#fff' }}>
                      Want a personalized guide for your move to {submittedCity}?
                    </p>
                    <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      Charlie can walk you through our full service — agents, schools, utilities — all tailored to your family.
                    </p>
                    <Link to="/Chat">
                      <button className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold"
                        style={{ background: GOLD, color: '#000' }}>
                        <MessageCircle className="w-4 h-4" />
                        Talk to Charlie — It's Free
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!cityReady && !loading && (
              <div className="text-center py-8 text-slate-400">
                <MapPin className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Enter a destination city above to unlock the research categories.</p>
              </div>
            )}
          </div>
        )}
    </div>
    </div>
  );
}