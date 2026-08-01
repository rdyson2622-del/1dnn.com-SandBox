import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function OwnerForm({ open, onClose, owner, onSave }) {
  const [form, setForm] = useState({
    owner_name: '',
    email: '',
    phone: '',
    property_address: '',
    property_city: '',
    property_state: '',
    listing_price: '',
    moving_to: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (owner) {
      setForm({
        owner_name: owner.owner_name || '',
        email: owner.email || '',
        phone: owner.phone || '',
        property_address: owner.property_address || '',
        property_city: owner.property_city || '',
        property_state: owner.property_state || '',
        listing_price: owner.listing_price || '',
        moving_to: owner.moving_to || '',
        notes: owner.notes || '',
      });
    } else {
      setForm({
        owner_name: '',
        email: '',
        phone: '',
        property_address: '',
        property_city: '',
        property_state: '',
        listing_price: '',
        moving_to: '',
        notes: '',
      });
    }
  }, [owner, open]);

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      ...form,
      listing_price: form.listing_price ? parseFloat(form.listing_price) : undefined,
    });
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{owner ? 'Edit Owner' : 'Add Owner'}</DialogTitle>
        </DialogHeader>
        <form autoComplete="off" style={{ WebkitAutocomplete: 'off' }} onSubmit={(e) => e.preventDefault()}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input value={form.owner_name} onChange={(e) => setForm(f => ({ ...f, owner_name: e.target.value }))} placeholder="John Smith" autoComplete="off" data-lpignore="true" data-1p-ignore />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(555) 123-4567" autoComplete="off" data-lpignore="true" data-1p-ignore />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@email.com" type="email" autoComplete="off" data-lpignore="true" data-1p-ignore />
            </div>
            <div>
              <Label>Property Address *</Label>
              <Input value={form.property_address} onChange={(e) => setForm(f => ({ ...f, property_address: e.target.value }))} placeholder="123 Main St" autoComplete="off" data-lpignore="true" data-1p-ignore />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>City</Label>
                <Input value={form.property_city} onChange={(e) => setForm(f => ({ ...f, property_city: e.target.value }))} placeholder="Austin" autoComplete="off" data-lpignore="true" data-1p-ignore />
              </div>
              <div>
                <Label>State</Label>
                <Input value={form.property_state} onChange={(e) => setForm(f => ({ ...f, property_state: e.target.value }))} placeholder="TX" autoComplete="off" data-lpignore="true" data-1p-ignore />
              </div>
              <div>
                <Label>Price</Label>
                <Input type="number" value={form.listing_price} onChange={(e) => setForm(f => ({ ...f, listing_price: e.target.value }))} placeholder="450000" autoComplete="off" data-lpignore="true" data-1p-ignore />
              </div>
            </div>
            <div>
              <Label>Moving To</Label>
              <Input value={form.moving_to} onChange={(e) => setForm(f => ({ ...f, moving_to: e.target.value }))} placeholder="Destination city" autoComplete="off" data-lpignore="true" data-1p-ignore />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional notes..." rows={2} />
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!form.owner_name || !form.property_address || saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}