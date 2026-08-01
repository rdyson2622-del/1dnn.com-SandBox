import React from 'react';
import { Home, DollarSign, MapPin, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PropertyHistory({ owner }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-6"
      style={{ background: 'rgba(255,255,255,0.9)', borderColor: 'rgba(0,0,0,0.1)' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Home className="w-5 h-5" style={{ color: '#D4AF37' }} />
        <h2 className="font-semibold" style={{ color: '#000' }}>Property Details</h2>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 mt-1 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Address</p>
            <p className="text-sm font-medium" style={{ color: '#000' }}>{owner.property_address}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <DollarSign className="w-4 h-4 mt-1 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Listed Price</p>
            <p className="text-sm font-medium" style={{ color: '#000' }}>
              ${owner.listing_price?.toLocaleString() || 'N/A'}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Calendar className="w-4 h-4 mt-1 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Last Contacted</p>
            <p className="text-sm font-medium" style={{ color: '#000' }}>
              {owner.last_contacted ? new Date(owner.last_contacted).toLocaleDateString() : 'Never'}
            </p>
          </div>
        </div>

        {owner.listing_url && (
          <div className="pt-3 border-t border-gray-200">
            <a
              href={owner.listing_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium"
              style={{ color: '#D4AF37' }}
            >
              View Listing →
            </a>
          </div>
        )}
      </div>
    </motion.div>
  );
}