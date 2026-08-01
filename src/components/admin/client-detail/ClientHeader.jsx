import React from 'react';
import { Phone, Mail, MessageSquare } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { appClient } from '@/api/appClient';
import { useQueryClient } from '@tanstack/react-query';

const GOLD = '#D4AF37';

const statusColors = {
  new_lead: 'bg-slate-100 text-slate-600',
  in_consultation: 'bg-blue-100 text-blue-700',
  actively_searching: 'bg-amber-100 text-amber-700',
  under_contract: 'bg-purple-100 text-purple-700',
  moved: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-green-100 text-green-700',
  inactive: 'bg-red-100 text-red-700',
};

export default function ClientHeader({ client }) {
  const queryClient = useQueryClient();

  const handleStatusChange = async (newStatus) => {
    await appClient.entities.RelocationClient.update(client.id, { status: newStatus });
    queryClient.invalidateQueries({ queryKey: ['relocation-client', client.id] });
  };

  return (
    <div className="rounded-2xl border p-5 mb-6" style={{ background: 'rgba(255,255,255,0.92)', borderColor: 'rgba(0,0,0,0.1)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold" style={{ color: '#000' }}>{client.full_name}</h1>
          <p className="text-sm" style={{ color: 'rgba(0,0,0,0.5)' }}>
            {client.current_city && `${client.current_city} → `}{client.destination_city}
          </p>
        </div>
        <Select value={client.status || 'new_lead'} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-44 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new_lead">New Lead</SelectItem>
            <SelectItem value="in_consultation">In Consultation</SelectItem>
            <SelectItem value="actively_searching">Actively Searching</SelectItem>
            <SelectItem value="under_contract">Under Contract</SelectItem>
            <SelectItem value="moved">Moved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quick contact row */}
      <div className="flex flex-wrap gap-2">
        {client.phone && (
          <a href={`tel:${client.phone}`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:opacity-80"
            style={{ background: '#000', color: '#fff' }}>
            <Phone className="w-3.5 h-3.5" /> {client.phone}
          </a>
        )}
        {client.email && (
          <a href={`mailto:${client.email}`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:opacity-80"
            style={{ background: 'rgba(0,0,0,0.08)', color: '#000' }}>
            <Mail className="w-3.5 h-3.5" /> {client.email}
          </a>
        )}
        {client.phone && (
          <a href={`sms:${client.phone}`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:opacity-80"
            style={{ background: `${GOLD}22`, color: '#7a6000', border: `1px solid ${GOLD}55` }}>
            <MessageSquare className="w-3.5 h-3.5" /> Text
          </a>
        )}
        <span className="text-xs self-center ml-auto" style={{ color: 'rgba(0,0,0,0.4)' }}>
          Client since {new Date(client.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
    </div>
  );
}