import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, MapPin, Home, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AddListingDialog from '../components/admin/AddListingDialog';
import ListingDetailPanel from '../components/admin/ListingDetailPanel';

const DYSON_LOGO = "/assets/dyson-logo.png";

export default function AdminListingSearch() {
  const [searchCity, setSearchCity] = useState('');
  const [searchPrice, setSearchPrice] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const queryClient = useQueryClient();

  const { data: listings = [] } = useQuery({
    queryKey: ['listings'],
    queryFn: () => appClient.entities.ListingImport.list('-list_date', 100),
    initialData: [],
  });

  const filteredListings = listings.filter((l) => {
    const cityMatch = !searchCity || l.city.toLowerCase().includes(searchCity.toLowerCase());
    const priceMatch = !searchPrice || (l.price >= parseInt(searchPrice) && l.price < parseInt(searchPrice) + 500000);
    return cityMatch && priceMatch;
  });

  const createMutation = useMutation({
    mutationFn: (data) => appClient.entities.ListingImport.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      setShowAddDialog(false);
    },
  });

  return (
    <div>
      {/* Header */}
      <header className="sticky top-0 z-40" style={{ background: 'rgba(255,255,255,0.8)', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/Admin">
              <Button variant="ghost" size="icon" className="h-8 w-8" style={{ color: '#D4AF37' }}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-black" style={{ color: '#000' }}>Listing Search</h1>
              <p className="text-xs" style={{ color: 'rgba(0,0,0,0.6)' }}>Find & analyze properties for seller outreach</p>
            </div>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="gap-2 gold-btn text-sm">
            <Plus className="w-4 h-4" /> Add Listing
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
         <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 mb-8"
          style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,0,0,0.1)' }}
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold mb-2 block" style={{ color: '#000' }}>CITY</label>
              <Input
                placeholder="Austin, TX..."
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.9)', borderColor: 'rgba(0,0,0,0.1)' }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold mb-2 block" style={{ color: '#000' }}>PRICE RANGE START</label>
              <Input
                type="number"
                placeholder="e.g., 500000"
                value={searchPrice}
                onChange={(e) => setSearchPrice(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.9)', borderColor: 'rgba(0,0,0,0.1)' }}
              />
            </div>
          </div>
        </motion.div>

        {/* Results */}
        <div className="space-y-4">
          {filteredListings.length === 0 ? (
            <div className="text-center py-12" style={{ color: '#fff' }}>
              <Home className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No listings found. Add your first listing to begin seller outreach.</p>
            </div>
          ) : (
            filteredListings.map((listing) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedListing(listing)}
                className="rounded-2xl p-6 cursor-pointer transition-all hover:scale-102"
                style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,0,0,0.1)' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: '#000' }}>{listing.property_address}</h3>
                    <p className="text-sm mt-1" style={{ color: 'rgba(0,0,0,0.6)' }}>
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {listing.city}, {listing.state} {listing.zip}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black" style={{ color: '#D4AF37' }}>
                      ${(listing.price / 1000000).toFixed(1)}M
                    </p>
                    <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37' }}>
                      {listing.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 py-4 border-t border-b" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                  <div>
                    <p className="text-xs" style={{ color: 'rgba(0,0,0,0.6)' }}>BEDS</p>
                    <p className="font-bold mt-1" style={{ color: '#000' }}>{listing.bedrooms || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'rgba(0,0,0,0.6)' }}>BATHS</p>
                    <p className="font-bold mt-1" style={{ color: '#000' }}>{listing.bathrooms || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'rgba(0,0,0,0.6)' }}>SQ FT</p>
                    <p className="font-bold mt-1" style={{ color: '#000' }}>{listing.sqft ? (listing.sqft / 1000).toFixed(1) + 'k' : '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'rgba(0,0,0,0.6)' }}>DOM</p>
                    <p className="font-bold mt-1" style={{ color: '#000' }}>{listing.days_on_market || '—'}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-2">
                    {listing.list_agent_name && (
                      <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(212,175,55,0.08)', color: '#D4AF37' }}>
                        Agent: {listing.list_agent_name}
                      </span>
                    )}
                    {listing.source && (
                      <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: '#999' }}>
                        {listing.source.replace('_', ' ').toUpperCase()}
                      </span>
                    )}
                  </div>
                  <Button size="sm" variant="outline" className="text-xs">
                    View & Outreach <Zap className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>

      <AddListingDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSubmit={(data) => createMutation.mutate(data)}
      />

      {selectedListing && (
        <ListingDetailPanel
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
        />
      )}
    </div>
  );
}