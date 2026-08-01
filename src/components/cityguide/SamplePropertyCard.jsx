import React, { useState } from 'react';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';

const GOLD = '#D4AF37';

const CATEGORIES = [
  { key: 'neighborhoods', label: 'Neighborhoods', icon: '🏘️' },
  { key: 'schools', label: 'Schools & Education', icon: '🎓' },
  { key: 'cost_of_living', label: 'Cost of Living', icon: '💰' },
  { key: 'healthcare', label: 'Healthcare', icon: '❤️' },
  { key: 'recreation', label: 'Recreation', icon: '🌿' },
  { key: 'local_character', label: 'Local Character', icon: '✨' },
];

export default function SamplePropertyCard({ property }) {
  const [expanded, setExpanded] = useState(false);
  const [rating, setRating] = useState(property.client_rating || 0);
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{
        border: property.isTopPick ? `2px solid ${GOLD}` : '1px solid rgba(255,255,255,0.1)',
        background: property.isTopPick ? 'rgba(212,175,55,0.05)' : '#0d0d0d',
      }}>
      {/* Photo */}
      {property.photo_url && (
        <div className="w-full h-44 overflow-hidden">
          <img src={property.photo_url} alt={property.address} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="p-5">
        {property.isTopPick && (
          <div className="inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-3"
            style={{ background: 'rgba(212,175,55,0.15)', color: GOLD, border: `1px solid ${GOLD}` }}>
            ⭐ TOP PICK (example)
          </div>
        )}

        <p className="font-bold text-sm text-white leading-tight">{property.address}</p>
        <p className="text-xs mt-0.5 mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>{property.city}, {property.state}</p>
        <p className="text-xl font-bold mb-2" style={{ color: GOLD }}>${property.price.toLocaleString()}</p>

        <div className="flex gap-3 text-xs mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
          <span>{property.bedrooms} bd</span>
          <span>{property.bathrooms} ba</span>
          <span>{property.sqft.toLocaleString()} sqft</span>
        </div>

        {/* Interactive star rating */}
        <div className="mb-3">
          <p className="text-xs mb-1.5 font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>YOUR RATING (try it)</p>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(n => (
              <button
                key={n}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHoverRating(n)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <Star className="w-5 h-5 transition-all" style={{
                  color: n <= (hoverRating || rating) ? GOLD : 'rgba(255,255,255,0.15)',
                  fill: n <= (hoverRating || rating) ? GOLD : 'transparent',
                }} />
              </button>
            ))}
            {rating > 0 && <span className="text-xs ml-1 self-center" style={{ color: GOLD }}>{['','Poor','Fair','Good','Great','Perfect!'][rating]}</span>}
          </div>
        </div>

        {/* Fit score bar */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div className="h-2 rounded-full" style={{ width: `${property.fit_score}%`, background: GOLD }} />
          </div>
          <span className="text-xs font-bold" style={{ color: GOLD }}>{property.fit_score}% fit</span>
        </div>

        {/* Research badge */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} />
          <span className="text-xs" style={{ color: '#22c55e' }}>6/6 categories researched</span>
        </div>

        {/* Status tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {['Considering','⭐ Top Pick','Eliminated'].map((label, i) => (
            <span key={i} className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                border: `1px solid ${i === (property.isTopPick ? 1 : 0) ? GOLD : 'rgba(255,255,255,0.1)'}`,
                color: i === (property.isTopPick ? 1 : 0) ? GOLD : 'rgba(255,255,255,0.3)',
              }}>
              {label}
            </span>
          ))}
        </div>

        <button onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? 'Hide Research' : 'See Research'}
        </button>
      </div>

      {expanded && (
        <div className="px-5 pb-5 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xs font-bold tracking-widest pt-4" style={{ color: GOLD }}>DYSON RESEARCH FINDINGS</p>
          {CATEGORIES.map(({ key, label, icon }) => (
            <div key={key} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>{icon} {label}</span>
                <span className="text-xs font-bold" style={{ color: GOLD }}>{property.research[key].score}/5</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{property.research[key].notes}</p>
            </div>
          ))}
          {property.gemini_summary && (
            <div className="rounded-xl p-3" style={{ background: 'rgba(212,175,55,0.08)', border: `1px solid ${GOLD}` }}>
              <p className="text-xs font-bold mb-1" style={{ color: GOLD }}>✨ GEMINI OVERALL ASSESSMENT</p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>{property.gemini_summary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}