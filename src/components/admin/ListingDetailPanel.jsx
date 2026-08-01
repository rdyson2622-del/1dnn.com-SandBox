import React, { useState } from 'react';
import { X, Mail, Phone, Zap, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { appClient } from '@/api/appClient';
import { motion } from 'framer-motion';

export default function ListingDetailPanel({ listing, onClose }) {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState(null);

  const generateSellerTemplate = async () => {
    setLoading(true);
    try {
      const response = await appClient.functions.invoke('generateSellerTemplate', {
        listing_id: listing.id,
        seller_name: listing.seller_name || 'Homeowner',
        property_address: listing.property_address,
        destination_hint: null,
      });
      setTemplates(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 400 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 400 }}
      className="fixed inset-y-0 right-0 w-full max-w-lg bg-slate-900 shadow-2xl overflow-y-auto z-50 border-l"
      style={{ borderColor: '#222' }}
    >
      {/* Header */}
      <div className="sticky top-0 bg-slate-900 px-6 py-4 border-b" style={{ borderColor: '#222' }}>
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg" style={{ color: '#fff' }}>Listing Details</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" style={{ color: '#D4AF37' }} />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Property Summary */}
        <div>
          <h3 className="font-bold mb-3" style={{ color: '#D4AF37' }}>PROPERTY</h3>
          <div className="space-y-2 text-sm">
            <p style={{ color: '#fff' }}><strong>{listing.property_address}</strong></p>
            <p style={{ color: '#999' }}>{listing.city}, {listing.state} {listing.zip}</p>
            <p style={{ color: '#D4AF37' }} className="text-lg font-bold">${(listing.price / 1000000).toFixed(1)}M</p>
            {listing.bedrooms && (
              <p style={{ color: '#999' }}>{listing.bedrooms} BR • {listing.bathrooms} BA • {listing.sqft ? (listing.sqft / 1000).toFixed(1) + 'k' : 'N/A'} Sq Ft</p>
            )}
          </div>
        </div>

        {/* Listing Agent */}
        {listing.list_agent_name && (
          <div>
            <h3 className="font-bold mb-3" style={{ color: '#D4AF37' }}>LISTING AGENT</h3>
            <div className="space-y-2 text-sm">
              <p style={{ color: '#fff' }}><strong>{listing.list_agent_name}</strong></p>
              {listing.list_agent_email && (
                <p style={{ color: '#999' }} className="flex items-center gap-2">
                  <Mail className="w-3 h-3" /> {listing.list_agent_email}
                </p>
              )}
              {listing.list_agent_phone && (
                <p style={{ color: '#999' }} className="flex items-center gap-2">
                  <Phone className="w-3 h-3" /> {listing.list_agent_phone}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Market Details */}
        <div>
          <h3 className="font-bold mb-3" style={{ color: '#D4AF37' }}>MARKET STATS</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div style={{ background: '#111', padding: '12px', borderRadius: '8px' }}>
              <p style={{ color: '#999' }}>Days on Market</p>
              <p style={{ color: '#fff' }} className="font-bold">{listing.days_on_market || 'N/A'}</p>
            </div>
            <div style={{ background: '#111', padding: '12px', borderRadius: '8px' }}>
              <p style={{ color: '#999' }}>Status</p>
              <p style={{ color: '#D4AF37' }} className="font-bold capitalize">{listing.status}</p>
            </div>
          </div>
        </div>

        {/* Outreach Section */}
        <div className="border-t pt-6" style={{ borderColor: '#222' }}>
          <h3 className="font-bold mb-4" style={{ color: '#D4AF37' }}>SELLER OUTREACH</h3>

          {!templates ? (
            <Button
              onClick={generateSellerTemplate}
              disabled={loading}
              className="w-full gold-btn text-sm font-bold mb-4"
            >
              <Zap className="w-4 h-4 mr-2" />
              {loading ? 'Generating...' : 'Generate Outreach Templates'}
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-xs mb-2" style={{ color: '#D4AF37' }}>EMAIL TEMPLATE</h4>
                <div
                  className="p-4 rounded-lg text-xs leading-relaxed whitespace-pre-wrap"
                  style={{ background: '#0a0a0a', color: '#999' }}
                >
                  {templates.emailTemplate}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 w-full text-xs"
                  onClick={() => navigator.clipboard.writeText(templates.emailTemplate)}
                >
                  <Mail className="w-3 h-3 mr-1" /> Copy Email
                </Button>
              </div>

              <div>
                <h4 className="font-semibold text-xs mb-2" style={{ color: '#D4AF37' }}>OUTREACH LETTER</h4>
                <div
                  className="p-4 rounded-lg text-xs leading-relaxed whitespace-pre-wrap"
                  style={{ background: '#0a0a0a', color: '#999' }}
                >
                  {templates.docTemplate}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 w-full text-xs"
                  onClick={() => navigator.clipboard.writeText(templates.docTemplate)}
                >
                  <FileText className="w-3 h-3 mr-1" /> Copy Letter
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <h4 className="font-semibold text-xs mb-3" style={{ color: '#D4AF37' }}>NEXT STEPS</h4>
          <ul className="space-y-2 text-xs" style={{ color: '#999' }}>
            <li className="flex gap-2">
              <CheckCircle2 className="w-3 h-3 shrink-0 mt-0.5" style={{ color: '#D4AF37' }} />
              <span>Look up seller contact info via CrissCross</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="w-3 h-3 shrink-0 mt-0.5" style={{ color: '#D4AF37' }} />
              <span>Send seller email or letter</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="w-3 h-3 shrink-0 mt-0.5" style={{ color: '#D4AF37' }} />
              <span>Track response and moving destination</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="w-3 h-3 shrink-0 mt-0.5" style={{ color: '#D4AF37' }} />
              <span>If no seller response → contact listing agent with referral proposal</span>
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}