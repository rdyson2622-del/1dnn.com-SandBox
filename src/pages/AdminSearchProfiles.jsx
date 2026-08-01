import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, CheckCircle2, XCircle, Search, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';

const GOLD = '#D4AF37';

const PROPERTY_TYPES = [
  { value: 'single_family', label: 'Single Family' },
  { value: 'condo', label: 'Condo' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'multi_family', label: 'Multi-Family' },
  { value: 'land', label: 'Land' },
];

const STATES = ['CA', 'TX', 'FL', 'NY', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI', 'NJ', 'VA', 'WA', 'AZ', 'MA', 'TN', 'IN', 'MO', 'MD', 'WI', 'CO', 'MN', 'SC', 'AL', 'LA', 'KY', 'OR', 'OK', 'CT', 'UT', 'NV', 'AR', 'MS', 'KS', 'NM', 'NE', 'WV', 'ID', 'HI', 'NH', 'ME', 'MT', 'RI', 'DE', 'SD', 'ND', 'AK', 'VT', 'WY'];

export default function AdminSearchProfiles() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [formData, setFormData] = useState({
    search_name: '',
    city: '',
    state: 'CA',
    min_price: '',
    max_price: '',
    property_types: [],
    communities: '',
    is_active: true,
    notes: '',
    bulk_locations: '',
  });

  const queryClient = useQueryClient();

  const { data: searches = [] } = useQuery({
    queryKey: ['propertySearches'],
    queryFn: () => appClient.entities.PropertySearch.list('-created_date', 100),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => {
      const communityArray = data.communities
        ? data.communities.split(',').map(c => c.trim()).filter(c => c)
        : [];
      return appClient.entities.PropertySearch.create({
        ...data,
        communities: communityArray,
        min_price: parseInt(data.min_price),
        max_price: parseInt(data.max_price),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propertySearches'] });
      setIsFormOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => {
      const communityArray = data.communities
        ? data.communities.split(',').map(c => c.trim()).filter(c => c)
        : [];
      return appClient.entities.PropertySearch.update(editingId, {
        ...data,
        communities: communityArray,
        min_price: parseInt(data.min_price),
        max_price: parseInt(data.max_price),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propertySearches'] });
      setEditingId(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => appClient.entities.PropertySearch.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propertySearches'] });
    },
  });

  const resetForm = () => {
    setFormData({
      search_name: '',
      city: '',
      state: 'CA',
      min_price: '',
      max_price: '',
      property_types: [],
      communities: '',
      is_active: true,
      notes: '',
      bulk_locations: '',
    });
    setBulkMode(false);
  };

  const handleEdit = (search) => {
    setFormData({
      search_name: search.search_name,
      city: search.city,
      state: search.state,
      min_price: search.min_price.toString(),
      max_price: search.max_price.toString(),
      property_types: search.property_types || [],
      communities: (search.communities || []).join(', '),
      is_active: search.is_active,
      notes: search.notes || '',
    });
    setEditingId(search.id);
    setIsFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#000' }}>Search Listing Profiles</h1>
          <p className="text-sm mt-1" style={{ color: '#666' }}>Save your PropStream search criteria for reference</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsFormOpen(!isFormOpen);
          }}
          style={{ background: '#D4AF37', color: '#000' }}
        >
          <Plus className="w-4 h-4 mr-2" /> New Search
        </Button>
      </div>

      {/* Form */}
      {isFormOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-6 bg-white border border-slate-200"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Search Name */}
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: '#000' }}>Search Name</label>
              <Input
                value={formData.search_name}
                onChange={(e) => setFormData({ ...formData, search_name: e.target.value })}
                placeholder="e.g., Austin Tech Workers"
                required
              />
            </div>

            {/* Mode Toggle */}
             <div>
               <label className="block text-sm font-semibold mb-3" style={{ color: '#000' }}>Search Mode</label>
               <div className="space-y-3">
                 <label className="flex items-start gap-3 cursor-pointer p-3 rounded border border-slate-200">
                   <input
                     type="radio"
                     checked={!bulkMode}
                     onChange={() => setBulkMode(false)}
                     className="mt-1"
                   />
                   <div>
                     <span className="text-sm font-medium block" style={{ color: '#000' }}>Single Location</span>
                     <span className="text-xs" style={{ color: '#999' }}>Search one city and state</span>
                   </div>
                 </label>
                 <label className="flex items-start gap-3 cursor-pointer p-3 rounded border border-slate-200">
                   <input
                     type="radio"
                     checked={bulkMode}
                     onChange={() => setBulkMode(true)}
                     className="mt-1"
                   />
                   <div>
                     <span className="text-sm font-medium block" style={{ color: '#000' }}>Bulk Locations</span>
                     <span className="text-xs" style={{ color: '#999' }}>Search multiple cities/states at once</span>
                   </div>
                 </label>
               </div>
             </div>

            {/* Location */}
            {!bulkMode ? (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: '#000' }}>City</label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Austin"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: '#000' }}>State</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  >
                    {STATES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#000' }}>Cities/Zip Codes (comma-separated)</label>
                <textarea
                  value={formData.bulk_locations}
                  onChange={(e) => setFormData({ ...formData, bulk_locations: e.target.value })}
                  placeholder="Austin TX, Denver CO, Seattle WA 98101, etc."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  rows="2"
                  required
                />
                <p className="text-xs mt-1" style={{ color: '#999' }}>Enter cities with state abbreviations or zip codes. One per line or comma-separated.</p>
              </div>
            )}

            {/* Price Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#000' }}>Min Price</label>
                <Input
                  type="number"
                  value={formData.min_price}
                  onChange={(e) => setFormData({ ...formData, min_price: e.target.value })}
                  placeholder="300000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#000' }}>Max Price</label>
                <Input
                  type="number"
                  value={formData.max_price}
                  onChange={(e) => setFormData({ ...formData, max_price: e.target.value })}
                  placeholder="750000"
                  required
                />
              </div>
            </div>

            {/* Property Types */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#000' }}>Property Types</label>
              <div className="grid grid-cols-3 gap-2">
                {PROPERTY_TYPES.map((type) => (
                  <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.property_types.includes(type.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            property_types: [...formData.property_types, type.value],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            property_types: formData.property_types.filter(t => t !== type.value),
                          });
                        }
                      }}
                    />
                    <span className="text-sm">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Communities */}
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: '#000' }}>Communities (comma-separated)</label>
              <Input
                value={formData.communities}
                onChange={(e) => setFormData({ ...formData, communities: e.target.value })}
                placeholder="South Congress, Downtown, East Austin"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: '#000' }}>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Internal notes..."
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                rows="3"
              />
            </div>

            {/* Active Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <span className="text-sm font-semibold" style={{ color: '#000' }}>Run daily searches</span>
            </label>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                style={{ background: '#D4AF37', color: '#000' }}
              >
                {editingId ? 'Update Search' : 'Create Search'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingId(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* PropStream workflow banner */}
      <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)' }}>
        <span className="text-lg">📍</span>
        <div className="flex-1">
         <p className="text-sm font-semibold" style={{ color: '#000' }}>PropStream: Search & Skip Trace</p>
         <p className="text-sm mt-1" style={{ color: '#666' }}>
           Save search criteria here for reference. In PropStream, search listings by your criteria, export the CSV results, then use the Skip Trace page to extract phone numbers and contact details for outreach.
          </p>
        </div>
        <Link to="/admin/skip-trace"
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap"
          style={{ background: GOLD, color: '#000' }}>
          Go to Skip Trace <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Searches List */}
       <div className="space-y-3">
         {searches.length === 0 ? (
           <div className="text-center py-12 rounded-lg bg-slate-50">
             <Search className="w-12 h-12 mx-auto mb-4" style={{ color: '#ccc' }} />
             <p style={{ color: '#999' }}>No search profiles yet. Create one to get started.</p>
           </div>
         ) : (
          searches.map((search, i) => (
            <motion.div
              key={search.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-white hover:shadow-md transition-all"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold" style={{ color: '#000' }}>{search.search_name}</h3>
                  {search.is_active ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <p className="text-sm" style={{ color: '#666' }}>
                  {search.city}, {search.state} • ${search.min_price.toLocaleString()} - ${search.max_price.toLocaleString()}
                </p>
                {search.property_types?.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {search.property_types.map((type) => (
                      <span key={type} className="text-xs px-2 py-1 rounded" style={{ background: '#f0f0f0', color: '#666' }}>
                        {PROPERTY_TYPES.find(t => t.value === type)?.label}
                      </span>
                    ))}
                  </div>
                )}

              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(search)}
                  className="h-8 w-8"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMutation.mutate(search.id)}
                  className="h-8 w-8"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}