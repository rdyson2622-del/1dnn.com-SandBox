import React, { useState } from 'react';
import { appClient } from '@/api/appClient';
import { Star, ExternalLink, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

const GOLD = '#D4AF37';

const CATEGORIES = [
  { key: 'neighborhoods', label: 'Neighborhoods', icon: '🏘️' },
  { key: 'schools', label: 'Schools & Education', icon: '🎓' },
  { key: 'cost_of_living', label: 'Cost of Living', icon: '💰' },
  { key: 'healthcare', label: 'Healthcare', icon: '❤️' },
  { key: 'recreation', label: 'Recreation', icon: '🌿' },
  { key: 'local_character', label: 'Local Character', icon: '✨' },
];

const STATUS_LABELS = {
  considering: { label: 'Considering', color: 'rgba(255,255,255,0.5)' },
  top_pick: { label: '⭐ Top Pick', color: GOLD },
  eliminated: { label: 'Eliminated', color: '#ef4444' },
  offer_made: { label: 'Offer Made', color: '#22c55e' },
  selected: { label: '🏠 Selected!', color: '#22c55e' },
};

const RATING_COLORS = { green: '#22c55e', yellow: GOLD, red: '#ef4444' };

export default function PropertyComparisonCard({ property, rank, onRefresh, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleStatusChange = async (status) => {
    await appClient.entities.PropertyCandidate.update(property.id, { status });
    onRefresh();
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    await appClient.entities.PropertyCandidate.delete(property.id);
    onDelete();
  };

  const researchedCount = CATEGORIES.filter(c => property[c.key]?.notes).length;
  const isResearched = researchedCount > 0;

  return (
    <div className="rounded-2xl overflow-hidden" style={{
      border: property.status === 'top_pick' ? `2px solid ${GOLD}` : '1px solid rgba(255,255,255,0.1)',
      background: property.status === 'top_pick' ? 'rgba(212,175,55,0.05)' : '#0d0d0d',
    }}>
      {/* Property Header */}
      <div className="p-5">
        {/* Photo */}
        {property.photo_url && (
          <div className="w-full h-40 rounded-xl overflow-hidden mb-4">
            <img src={property.photo_url} alt={property.address} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Address + rank + delete */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            {rank && (
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5"
                style={{ background: property.status === 'top_pick' ? GOLD : 'rgba(255,255,255,0.1)', color: property.status === 'top_pick' ? '#000' : 'rgba(255,255,255,0.5)' }}>
                {rank}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-bold text-sm leading-tight" style={{ color: '#fff' }}>{property.address}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{property.city}, {property.state}</p>
            </div>
          </div>
          {confirmDelete ? (
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={handleDelete}
                className="px-2 py-1 rounded-full text-xs font-bold"
                style={{ background: '#ef4444', color: '#fff' }}>
                Confirm
              </button>
              <button onClick={() => setConfirmDelete(false)}
                className="px-2 py-1 rounded-full text-xs"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={handleDelete}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-500/20 shrink-0 transition-colors"
              title="Remove property">
              <Trash2 className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.3)' }} />
            </button>
          )}
        </div>

        {/* Price & specs */}
        {property.price && (
          <p className="text-xl font-bold mb-2" style={{ color: GOLD }}>
            ${property.price.toLocaleString()}
          </p>
        )}
        <div className="flex gap-3 text-xs mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {property.bedrooms && <span>{property.bedrooms} bd</span>}
          {property.bathrooms && <span>{property.bathrooms} ba</span>}
          {property.sqft && <span>{property.sqft.toLocaleString()} sqft</span>}
        </div>

        {/* Client star rating */}
        {property.client_rating > 0 && (
          <div className="flex gap-1 mb-3">
            {[1,2,3,4,5].map(n => (
              <Star key={n} className="w-4 h-4" style={{
                color: n <= property.client_rating ? GOLD : 'rgba(255,255,255,0.15)',
                fill: n <= property.client_rating ? GOLD : 'transparent',
              }} />
            ))}
          </div>
        )}

        {/* Fit score */}
        {property.fit_score > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div className="h-2 rounded-full transition-all" style={{ width: `${property.fit_score}%`, background: GOLD }} />
            </div>
            <span className="text-xs font-bold" style={{ color: GOLD }}>{property.fit_score}% fit</span>
          </div>
        )}

        {/* Research status */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full" style={{ background: isResearched ? '#22c55e' : 'rgba(255,255,255,0.2)' }} />
          <span className="text-xs" style={{ color: isResearched ? '#22c55e' : 'rgba(255,255,255,0.4)' }}>
            {isResearched ? `${researchedCount}/6 categories researched` : 'Research pending'}
          </span>
        </div>

        {/* Status selector */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {Object.entries(STATUS_LABELS).map(([key, { label, color }]) => (
            <button
              key={key}
              onClick={() => handleStatusChange(key)}
              className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
              style={{
                background: property.status === key ? 'rgba(255,255,255,0.15)' : 'transparent',
                border: `1px solid ${property.status === key ? color : 'rgba(255,255,255,0.1)'}`,
                color: property.status === key ? color : 'rgba(255,255,255,0.4)',
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Links */}
        <div className="flex gap-2">
          {property.listing_url && (
            <a href={property.listing_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', color: GOLD }}>
              <ExternalLink className="w-3 h-3" /> View Listing
            </a>
          )}
          <button onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ml-auto"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? 'Hide' : 'Research'}
          </button>
        </div>
      </div>

      {/* Research Details */}
      {expanded && (
        <div className="px-5 pb-5 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xs font-bold tracking-widest pt-4" style={{ color: GOLD }}>DYSON RESEARCH FINDINGS</p>

          {/* Client notes */}
          {property.client_notes && (
            <div className="rounded-xl p-3" style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}>
              <p className="text-xs font-bold mb-1" style={{ color: GOLD }}>YOUR TOUR NOTES</p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>{property.client_notes}</p>
            </div>
          )}

          {CATEGORIES.map(({ key, label, icon }) => {
            const data = property[key];
            return (
              <div key={key} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>{icon} {label}</span>
                  {data?.rating && (
                    <div className="w-3 h-3 rounded-full" style={{ background: RATING_COLORS[data.rating] }} />
                  )}
                  {data?.score && (
                    <span className="text-xs font-bold" style={{ color: GOLD }}>{data.score}/5</span>
                  )}
                </div>
                {data?.notes
                  ? <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{data.notes}</p>
                  : <p className="text-xs italic" style={{ color: 'rgba(255,255,255,0.25)' }}>Research in progress...</p>
                }
              </div>
            );
          })}

          {/* Gemini Summary */}
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