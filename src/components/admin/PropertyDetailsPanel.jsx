import React, { useState } from 'react';
import { appClient } from '@/api/appClient';
import { ChevronDown, Loader, AlertCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function PropertyDetailsPanel({ campaign, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const fetchPropertyDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await appClient.functions.invoke('propstreamPropertyDetails', {
        property_address: campaign.property_address,
        city: campaign.property_address?.split(',')[1]?.trim() || '',
        state: campaign.destination_state || 'CA',
        zip: '',
      });

      if (response.status === 200) {
        setData(response.data);
        setExpanded(true);
      } else {
        setError(response.data?.error || 'Failed to fetch property details');
      }
    } catch (err) {
      setError(err.message || 'Error fetching property data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
      <button
        onClick={() => (!expanded && !data ? fetchPropertyDetails() : setExpanded(!expanded))}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-slate-900">Property Intelligence</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t border-slate-200 p-4 space-y-4 bg-white"
        >
          {loading ? (
            <div className="flex items-center gap-2 text-slate-600">
              <Loader className="w-4 h-4 animate-spin" />
              <span className="text-sm">Fetching property data...</span>
            </div>
          ) : error ? (
            <div className="flex items-start gap-2 text-red-600 bg-red-50 p-3 rounded">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          ) : data ? (
            <>
              {/* Full Details */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 p-3 rounded">
                  <p className="text-xs text-slate-500 font-semibold">BEDS/BATHS</p>
                  <p className="text-slate-900 font-semibold">{data.full_details.beds}/{data.full_details.baths}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded">
                  <p className="text-xs text-slate-500 font-semibold">SQ FT</p>
                  <p className="text-slate-900 font-semibold">{data.full_details.sqft?.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded">
                  <p className="text-xs text-slate-500 font-semibold">YEAR BUILT</p>
                  <p className="text-slate-900 font-semibold">{data.full_details.year_built}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded">
                  <p className="text-xs text-slate-500 font-semibold">PROPERTY TYPE</p>
                  <p className="text-slate-900 font-semibold">{data.full_details.property_type}</p>
                </div>
              </div>

              {/* Valuations */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-500">VALUATIONS</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Assessed Value:</span>
                  <span className="font-semibold text-slate-900">
                    ${data.assessed_value?.toLocaleString() || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Estimated Value:</span>
                  <span className="font-semibold text-slate-900">
                    ${data.estimated_value?.toLocaleString() || 'N/A'}
                  </span>
                </div>
                {data.owner_equity && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Owner Equity:</span>
                    <span className="font-semibold text-green-600">
                      ${data.owner_equity.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Tax History */}
              {data.tax_history?.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <p className="text-xs font-semibold text-slate-500">TAX HISTORY</p>
                  <div className="space-y-1 text-sm">
                    {data.tax_history.map((year, idx) => (
                      <div key={idx} className="flex justify-between text-slate-600">
                        <span>{year.year}:</span>
                        <span className="font-medium">${year.amount?.toLocaleString() || 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Comps */}
              {data.recent_comps?.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <p className="text-xs font-semibold text-slate-500">RECENT COMPS (Similar properties sold nearby)</p>
                  <div className="space-y-1 text-sm">
                    {data.recent_comps.map((comp, idx) => (
                      <div key={idx} className="bg-blue-50 p-2 rounded">
                        <div className="flex justify-between">
                          <span className="text-slate-700">{comp.address}</span>
                          <span className="font-semibold text-blue-900">
                            ${comp.sale_price?.toLocaleString() || 'N/A'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{comp.sale_date}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={() => setExpanded(false)}
                variant="outline"
                size="sm"
                className="w-full mt-2"
              >
                Collapse
              </Button>
            </>
          ) : (
            <Button
              onClick={fetchPropertyDetails}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Loading...' : 'Fetch Property Details'}
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
}