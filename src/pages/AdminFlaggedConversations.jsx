import React, { useState } from 'react';
import { appClient } from '@/api/appClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Search, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const GOLD = '#D4AF37';
const statusConfig = {
  none: { color: 'bg-gray-100', textColor: 'text-gray-700', icon: null },
  reviewed: { color: 'bg-blue-100', textColor: 'text-blue-700', icon: CheckCircle2 },
  concern: { color: 'bg-yellow-100', textColor: 'text-yellow-700', icon: AlertCircle },
  fraud: { color: 'bg-red-100', textColor: 'text-red-700', icon: AlertCircle },
  resolved: { color: 'bg-green-100', textColor: 'text-green-700', icon: CheckCircle2 }
};

export default function AdminFlaggedConversations() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const queryClient = useQueryClient();

  const { data: flaggedMessages, isLoading } = useQuery({
    queryKey: ['flaggedMessages'],
    queryFn: async () => {
      const messages = await appClient.entities.ChatMessage.filter(
        { flag_status: { $ne: 'none' } },
        '-created_date'
      );
      // Enrich with client data
      const enriched = await Promise.all(
        messages.map(async (msg) => {
          const client = await appClient.entities.RelocationClient.list(null, 1).then(
            list => list.find(c => c.id === msg.client_id)
          );
          return { ...msg, client };
        })
      );
      return enriched;
    }
  });

  const updateMessageMutation = useMutation({
    mutationFn: (data) =>
      appClient.entities.ChatMessage.update(data.id, {
        flag_status: data.status,
        flag_notes: data.notes
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flaggedMessages'] });
      setSelectedMessage(null);
      setAdminNotes('');
    }
  });

  const deleteMessageMutation = useMutation({
    mutationFn: (id) => appClient.entities.ChatMessage.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flaggedMessages'] });
      setSelectedMessage(null);
    }
  });

  const suspendUserMutation = useMutation({
    mutationFn: (data) =>
      appClient.entities.User.update(data.userId, {
        is_suspended: true,
        suspension_reason: data.reason,
        suspension_date: new Date().toISOString().split('T')[0]
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flaggedMessages'] });
    }
  });

  const filteredMessages = flaggedMessages?.filter(msg => {
    const matchesStatus = selectedStatus === 'all' || msg.flag_status === selectedStatus;
    const matchesSearch = searchTerm === '' || 
      msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.client?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#000' }}>Flagged Conversations</h1>
        <p style={{ color: '#666' }}>Review and manage flagged messages</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by client or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300"
        >
          <option value="all">All Statuses</option>
          <option value="concern">Concerns</option>
          <option value="fraud">Fraud</option>
          <option value="reviewed">Reviewed</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Messages Grid */}
      <div className="space-y-3">
        {isLoading ? (
          <p style={{ color: '#999' }}>Loading flagged messages...</p>
        ) : filteredMessages.length === 0 ? (
          <p style={{ color: '#999' }}>No flagged messages found</p>
        ) : (
          filteredMessages.map((msg) => {
            const config = statusConfig[msg.flag_status];
            const Icon = config.icon;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all ${config.color}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 cursor-pointer flex-1" onClick={() => { setSelectedMessage(msg); setAdminNotes(msg.flag_notes || ''); }}>
                    {Icon && <Icon className="w-4 h-4" />}
                    <span className="font-semibold text-sm">{msg.client?.full_name || 'Unknown Client'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={config.color}>{msg.flag_status}</Badge>
                    <button onClick={() => deleteMessageMutation.mutate(msg.id)} className="p-1 rounded hover:bg-red-100 text-red-400 hover:text-red-600 transition" title="Delete message">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-sm mb-2" style={{ color: '#333' }}>{msg.content}</p>
                <p className="text-xs" style={{ color: '#666' }}>
                  {new Date(msg.created_date).toLocaleDateString()}
                </p>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Detail Panel */}
      {selectedMessage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-lg border-2"
          style={{ background: '#f9f9f9', borderColor: GOLD }}
        >
          <h3 className="text-lg font-semibold mb-4">Message Details</h3>

          <div className="mb-4">
            <p className="text-sm font-semibold mb-1" style={{ color: '#666' }}>Client</p>
            <p className="font-semibold">{selectedMessage.client?.full_name}</p>
            <p className="text-sm" style={{ color: '#999' }}>{selectedMessage.client?.email}</p>
          </div>

          <div className="mb-4">
            <p className="text-sm font-semibold mb-1" style={{ color: '#666' }}>Message Content</p>
            <p className="bg-white p-3 rounded border border-gray-200">{selectedMessage.content}</p>
          </div>

          <div className="mb-4">
            <label className="text-sm font-semibold mb-2 block" style={{ color: '#666' }}>Admin Notes</label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add notes about this message..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              rows="3"
            />
          </div>

          <div className="flex gap-2 mb-4">
            {['reviewed', 'concern', 'fraud', 'resolved'].map((status) => (
              <Button
                key={status}
                onClick={() =>
                  updateMessageMutation.mutate({
                    id: selectedMessage.id,
                    status,
                    notes: adminNotes
                  })
                }
                variant={selectedMessage.flag_status === status ? 'default' : 'outline'}
                size="sm"
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>

          {selectedMessage.client && (
            <Button
              onClick={() => {
                suspendUserMutation.mutate({
                  userId: selectedMessage.client.id,
                  reason: `Flagged message: ${selectedMessage.flag_status}`
                });
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={suspendUserMutation.isPending}
            >
              Suspend User Account
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
}