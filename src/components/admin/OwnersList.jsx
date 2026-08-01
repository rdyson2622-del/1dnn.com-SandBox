import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, Trash2, Edit2, MoreHorizontal, Send, CheckCircle2, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { appClient } from '@/api/appClient';
import OwnerSMSScriptModal from './OwnerSMSScriptModal';

const statusColors = {
  not_contacted: 'bg-slate-100 text-slate-600',
  contacted: 'bg-blue-100 text-blue-700',
  in_conversation: 'bg-amber-100 text-amber-700',
  interested: 'bg-emerald-100 text-emerald-700',
  not_interested: 'bg-red-100 text-red-700',
  converted: 'bg-purple-100 text-purple-700',
};

export default function OwnersList({ owners, onEdit, onDelete, onStatusChange, onSmsSent }) {
  const [sending, setSending] = useState(null);
  const [sent, setSent] = useState({});
  const [error, setError] = useState(null);
  const [scriptOwner, setScriptOwner] = useState(null);

  const getDataEnv = () => localStorage.getItem('dnn_data_env') || 'prod';

  const sendSMS = async (owner) => {
    if (!owner.phone) { setError(`No phone number for ${owner.owner_name}`); return; }
    setSending(owner.id);
    setError(null);
    try {
      await appClient.functions.invoke('sendOwnerOutreachSMS', {
        listing_owner_id: owner.id,
        phone: owner.phone,
        owner_name: owner.owner_name,
        property_address: owner.property_address,
        data_env: getDataEnv(),
      });
      setSent(prev => ({ ...prev, [owner.id]: true }));
      onStatusChange?.(owner.id, 'contacted');
      onSmsSent?.();
    } catch (e) {
      setError(`Failed to send to ${owner.owner_name}: ${e.message}`);
    } finally {
      setSending(null);
    }
  };

  if (!owners?.length) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p className="font-medium">No listing owners yet</p>
        <p className="text-sm mt-1">Add owners who are moving to start outreach</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {scriptOwner && <OwnerSMSScriptModal owner={scriptOwner} onClose={() => setScriptOwner(null)} />}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</div>
      )}
      {owners.map((owner, i) => (
        <motion.div
          key={owner.id}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900">{owner.owner_name}</h3>
              <p className="text-sm text-slate-600 mt-1">{owner.property_address}</p>
              {owner.property_city && (
                <p className="text-xs text-slate-500">
                  {owner.property_city}{owner.property_state ? `, ${owner.property_state}` : ''}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                {owner.email && (
                  <a href={`mailto:${owner.email}`} className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {owner.email}
                  </a>
                )}
                {owner.phone && (
                  <a href={`tel:${owner.phone}`} className="text-xs text-slate-500 hover:underline flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {owner.phone}
                  </a>
                )}
              </div>
              <div className="flex gap-2 mt-3">
                <Badge className={`${statusColors[owner.contact_status] || statusColors.not_contacted} border-0 text-xs`}>
                  {(owner.contact_status || 'not_contacted').replace(/_/g, ' ')}
                </Badge>
                {owner.listing_price && (
                  <Badge variant="outline" className="text-xs">${(owner.listing_price / 1000).toFixed(0)}k</Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2 items-center">
              {owner.phone && (
                sent[owner.id] || owner.contact_status === 'contacted' || owner.contact_status === 'in_conversation' ? (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Sent
                  </span>
                ) : (
                  <Button
                    size="sm"
                    disabled={sending === owner.id}
                    onClick={() => sendSMS(owner)}
                    className="gap-1 text-xs h-8 bg-slate-900 hover:bg-slate-700 text-white"
                  >
                    {sending === owner.id ? (
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-3 h-3" />
                    )}
                    Send SMS
                  </Button>
                )
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700" onClick={() => setScriptOwner(owner)} title="View SMS Script">
                <FileText className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(owner)}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => onDelete(owner.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onStatusChange(owner.id, 'contacted')}>Mark Contacted</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(owner.id, 'in_conversation')}>In Conversation</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(owner.id, 'interested')}>Mark Interested</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(owner.id, 'converted')}>Mark Converted</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(owner.id, 'not_interested')}>Not Interested</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
