import React, { useState } from 'react';
import { MapPin, Calendar, DollarSign, Users, Home, Star, FileText, Save, UserCheck, FileSignature } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { appClient } from '@/api/appClient';
import { useQueryClient } from '@tanstack/react-query';

const GOLD = '#D4AF37';

const budgetLabels = {
  under_200k: 'Under $200K',
  '200k_400k': '$200K–$400K',
  '400k_600k': '$400K–$600K',
  '600k_800k': '$600K–$800K',
  '800k_1m': '$800K–$1M',
  over_1m: 'Over $1M',
};

function InfoRow({ icon: IconComp, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b last:border-b-0" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
      <IconComp className="w-4 h-4 mt-0.5 shrink-0" style={{ color: GOLD }} />
      <div>
        <p className="text-xs" style={{ color: 'rgba(0,0,0,0.45)' }}>{label}</p>
        <p className="text-sm font-medium" style={{ color: '#000' }}>{value}</p>
      </div>
    </div>
  );
}

export default function ClientProfileTab({ client }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: client.full_name || '',
    email: client.email || '',
    phone: client.phone || '',
    current_city: client.current_city || '',
    destination_city: client.destination_city || '',
    budget: client.budget || '',
    move_date: client.move_date || '',
    family_size: client.family_size || '',
    assigned_agent: client.assigned_agent || '',
    agent_name: client.agent_name || '',
    agent_selected_date: client.agent_selected_date || '',
    buyer_broker_signed: client.buyer_broker_signed || false,
    buyer_broker_signed_date: client.buyer_broker_signed_date || '',
    notes: client.notes || '',
  });

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    await appClient.entities.RelocationClient.update(client.id, {
      ...form,
      family_size: form.family_size ? parseInt(form.family_size) : undefined,
      buyer_broker_signed: form.buyer_broker_signed,
    });
    setSaving(false);
    setEditing(false);
    queryClient.invalidateQueries({ queryKey: ['relocation-client', client.id] });
  };

  const priorities = client.priorities || [];

  if (editing) {
    return (
      <div className="rounded-2xl border p-6 space-y-4" style={{ background: 'rgba(255,255,255,0.9)', borderColor: 'rgba(0,0,0,0.1)' }}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-lg" style={{ color: '#000' }}>Edit Profile</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
            <Button size="sm" disabled={saving} onClick={handleSave} style={{ background: GOLD, color: '#000' }}>
              <Save className="w-3.5 h-3.5 mr-1.5" /> {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label className="text-xs">Full Name</Label><Input value={form.full_name} onChange={e => update('full_name', e.target.value)} /></div>
          <div><Label className="text-xs">Phone</Label><Input value={form.phone} onChange={e => update('phone', e.target.value)} /></div>
          <div className="col-span-2"><Label className="text-xs">Email</Label><Input value={form.email} onChange={e => update('email', e.target.value)} /></div>
          <div><Label className="text-xs">Current City</Label><Input value={form.current_city} onChange={e => update('current_city', e.target.value)} /></div>
          <div><Label className="text-xs">Destination City</Label><Input value={form.destination_city} onChange={e => update('destination_city', e.target.value)} /></div>
          <div>
            <Label className="text-xs">Budget</Label>
            <Select value={form.budget} onValueChange={v => update('budget', v)}>
              <SelectTrigger><SelectValue placeholder="Select budget" /></SelectTrigger>
              <SelectContent>
                {Object.entries(budgetLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">Move Date</Label><Input type="date" value={form.move_date} onChange={e => update('move_date', e.target.value)} /></div>
          <div><Label className="text-xs">Family Size</Label><Input type="number" value={form.family_size} onChange={e => update('family_size', e.target.value)} /></div>
          <div><Label className="text-xs">Assigned Agent Email</Label><Input value={form.assigned_agent} onChange={e => update('assigned_agent', e.target.value)} /></div>
          <div><Label className="text-xs">Agent Full Name</Label><Input value={form.agent_name} onChange={e => update('agent_name', e.target.value)} /></div>
          <div><Label className="text-xs">Agent Selected Date</Label><Input type="date" value={form.agent_selected_date} onChange={e => update('agent_selected_date', e.target.value)} /></div>
          <div className="flex items-center gap-3 pt-5">
            <input type="checkbox" id="broker_signed" checked={form.buyer_broker_signed}
              onChange={e => update('buyer_broker_signed', e.target.checked)} className="w-4 h-4 accent-amber-500" />
            <Label htmlFor="broker_signed" className="text-xs cursor-pointer">Buyer Broker Agreement Signed</Label>
          </div>
          <div><Label className="text-xs">Buyer Broker Signed Date</Label><Input type="date" value={form.buyer_broker_signed_date} onChange={e => update('buyer_broker_signed_date', e.target.value)} /></div>
        </div>
        <div>
          <Label className="text-xs">Admin Notes</Label>
          <textarea value={form.notes} onChange={e => update('notes', e.target.value)}
            rows={4} className="w-full text-sm rounded-lg border px-3 py-2 resize-none"
            style={{ borderColor: 'rgba(0,0,0,0.15)', background: '#fafafa' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Core Info */}
      <div className="rounded-2xl border p-6" style={{ background: 'rgba(255,255,255,0.9)', borderColor: 'rgba(0,0,0,0.1)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-base" style={{ color: '#000' }}>Relocation Details</h2>
          <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="text-xs">Edit</Button>
        </div>
        <InfoRow icon={MapPin} label="Current Location" value={client.current_city} />
        <InfoRow icon={MapPin} label="Moving To" value={client.destination_city} />
        <InfoRow icon={Calendar} label="Planned Move Date" value={client.move_date ? new Date(client.move_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null} />
        <InfoRow icon={DollarSign} label="Budget" value={budgetLabels[client.budget]} />
        <InfoRow icon={Users} label="Family Size" value={client.family_size ? `${client.family_size} person${client.family_size > 1 ? 's' : ''}` : null} />
        <InfoRow icon={Home} label="Assigned Agent Email" value={client.assigned_agent} />
        <InfoRow icon={UserCheck} label="Agent Name" value={client.agent_name} />
        <InfoRow icon={Calendar} label="Agent Selected" value={client.agent_selected_date ? new Date(client.agent_selected_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null} />
      </div>

      {/* Buyer Broker Status */}
      <div className="rounded-2xl border p-5" style={{ background: client.buyer_broker_signed ? 'rgba(34,197,94,0.06)' : 'rgba(245,158,11,0.06)', borderColor: client.buyer_broker_signed ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)' }}>
        <div className="flex items-center gap-2 mb-1">
          <FileSignature className="w-4 h-4" style={{ color: client.buyer_broker_signed ? '#22c55e' : '#f59e0b' }} />
          <h3 className="font-bold text-sm" style={{ color: '#000' }}>Buyer Broker Agreement</h3>
          <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${client.buyer_broker_signed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            {client.buyer_broker_signed ? '✓ Signed' : 'Pending'}
          </span>
        </div>
        {client.buyer_broker_signed_date && (
          <p className="text-xs" style={{ color: 'rgba(0,0,0,0.5)' }}>
            Signed {new Date(client.buyer_broker_signed_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        )}
        {!client.buyer_broker_signed && (
          <p className="text-xs mt-1" style={{ color: 'rgba(0,0,0,0.5)' }}>
            City Guide access is locked until this is signed.
          </p>
        )}
      </div>

      {/* Priorities & Notes */}
      <div className="space-y-4">
        {priorities.length > 0 && (
          <div className="rounded-2xl border p-5" style={{ background: 'rgba(255,255,255,0.9)', borderColor: 'rgba(0,0,0,0.1)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4" style={{ color: GOLD }} />
              <h3 className="font-bold text-sm" style={{ color: '#000' }}>Priorities</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {priorities.map(p => (
                <span key={p} className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ background: `${GOLD}18`, color: '#7a6000', border: `1px solid ${GOLD}44` }}>
                  {p.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {client.notes && (
          <div className="rounded-2xl border p-5" style={{ background: 'rgba(255,255,255,0.9)', borderColor: 'rgba(0,0,0,0.1)' }}>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4" style={{ color: GOLD }} />
              <h3 className="font-bold text-sm" style={{ color: '#000' }}>Admin Notes / Intake Summary</h3>
            </div>
            <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: 'rgba(0,0,0,0.7)' }}>{client.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}