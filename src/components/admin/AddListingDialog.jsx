import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AddListingDialog({ open, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    property_address: '',
    city: '',
    state: '',
    zip: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    list_agent_name: '',
    list_agent_email: '',
    list_agent_phone: '',
    source: 'manual_entry',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: parseInt(formData.price),
      bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
      bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
      sqft: formData.sqft ? parseInt(formData.sqft) : null,
    });
    setFormData({
      property_address: '',
      city: '',
      state: '',
      zip: '',
      price: '',
      bedrooms: '',
      bathrooms: '',
      sqft: '',
      list_agent_name: '',
      list_agent_email: '',
      list_agent_phone: '',
      source: 'manual_entry',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Listing</DialogTitle>
          <DialogDescription>Enter property details and listing agent info</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Property Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Property Information</h3>

            <div>
              <Label htmlFor="address" className="text-xs">Address *</Label>
              <Input
                id="address"
                required
                value={formData.property_address}
                onChange={(e) => setFormData({ ...formData, property_address: e.target.value })}
                placeholder="123 Main St"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="city" className="text-xs">City *</Label>
                <Input
                  id="city"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Austin"
                />
              </div>
              <div>
                <Label htmlFor="state" className="text-xs">State *</Label>
                <Input
                  id="state"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="TX"
                  maxLength="2"
                />
              </div>
              <div>
                <Label htmlFor="zip" className="text-xs">ZIP</Label>
                <Input
                  id="zip"
                  value={formData.zip}
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  placeholder="78701"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="price" className="text-xs">List Price *</Label>
              <Input
                id="price"
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="500000"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="beds" className="text-xs">Bedrooms</Label>
                <Input
                  id="beds"
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                  placeholder="4"
                />
              </div>
              <div>
                <Label htmlFor="baths" className="text-xs">Bathrooms</Label>
                <Input
                  id="baths"
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                  placeholder="2"
                />
              </div>
              <div>
                <Label htmlFor="sqft" className="text-xs">Sq Ft</Label>
                <Input
                  id="sqft"
                  type="number"
                  value={formData.sqft}
                  onChange={(e) => setFormData({ ...formData, sqft: e.target.value })}
                  placeholder="3500"
                />
              </div>
            </div>
          </div>

          {/* Agent Info */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="text-sm font-semibold">Listing Agent</h3>

            <div>
              <Label htmlFor="agent_name" className="text-xs">Agent Name</Label>
              <Input
                id="agent_name"
                value={formData.list_agent_name}
                onChange={(e) => setFormData({ ...formData, list_agent_name: e.target.value })}
                placeholder="John Smith"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="agent_email" className="text-xs">Email</Label>
                <Input
                  id="agent_email"
                  type="email"
                  value={formData.list_agent_email}
                  onChange={(e) => setFormData({ ...formData, list_agent_email: e.target.value })}
                  placeholder="agent@brokerage.com"
                />
              </div>
              <div>
                <Label htmlFor="agent_phone" className="text-xs">Phone</Label>
                <Input
                  id="agent_phone"
                  value={formData.list_agent_phone}
                  onChange={(e) => setFormData({ ...formData, list_agent_phone: e.target.value })}
                  placeholder="(512) 555-0123"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="source" className="text-xs">Data Source</Label>
              <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual_entry">Manual Entry</SelectItem>
                  <SelectItem value="idx_feed">IDX Feed</SelectItem>
                  <SelectItem value="zillow">Zillow</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="gold-btn">
              Add Listing
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}