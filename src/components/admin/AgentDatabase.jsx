import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Plus, Trash2, Edit2, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function AgentDatabase() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    broker: '',
    office_location: '',
    specialty_markets: [],
    license_number: '',
    years_experience: '',
    referral_fee_standard: '25',
    mgmt_fee_rate: '15',
    is_active: true,
    notes: '',
  });

  const queryClient = useQueryClient();

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: () => appClient.entities.Agent.list('-created_date', 200),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => appClient.entities.Agent.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      setIsFormOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => appClient.entities.Agent.update(editingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      setEditingId(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => appClient.entities.Agent.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      broker: '',
      office_location: '',
      specialty_markets: [],
      license_number: '',
      years_experience: '',
      referral_fee_standard: '25',
      mgmt_fee_rate: '15',
      is_active: true,
      notes: '',
    });
  };

  const handleEdit = (agent) => {
    setFormData({
      name: agent.name,
      email: agent.email,
      phone: agent.phone || '',
      broker: agent.broker,
      office_location: agent.office_location,
      specialty_markets: agent.specialty_markets || [],
      license_number: agent.license_number || '',
      years_experience: agent.years_experience || '',
      referral_fee_standard: (agent.referral_fee_standard || 25).toString(),
      mgmt_fee_rate: (agent.mgmt_fee_rate || 15).toString(),
      is_active: agent.is_active,
      notes: agent.notes || '',
    });
    setEditingId(agent.id);
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

  const filtered = agents.filter((a) =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.broker.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.office_location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Agent Network</h3>
        <Button
          onClick={() => {
            resetForm();
            setIsFormOpen(true);
          }}
          size="sm"
          className="gap-2"
        >
          <Plus className="w-4 h-4" /> Add Agent
        </Button>
      </div>

      {/* Search */}
      <Input
        placeholder="Search agents or brokers..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="h-8 text-sm"
      />

      {/* Agent List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="w-4 h-4 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-sm">
            No agents found
          </div>
        ) : (
          filtered.map((agent, idx) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              className="bg-slate-50 rounded-lg p-3 border border-slate-200 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm">{agent.name}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                    <MapPin className="w-3 h-3" />
                    {agent.office_location}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{agent.broker}</p>
                  <div className="flex gap-2 mt-2 text-xs">
                    {agent.email && (
                      <a
                        href={`mailto:${agent.email}`}
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <Mail className="w-3 h-3" />
                        Email
                      </a>
                    )}
                    {agent.phone && (
                      <a
                        href={`tel:${agent.phone}`}
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <Phone className="w-3 h-3" />
                        Call
                      </a>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(agent)}
                    className="h-7 w-7"
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(agent.id)}
                    className="h-7 w-7"
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </Button>
                </div>
              </div>

              {/* Fee Info */}
              <div className="flex gap-3 mt-2 text-xs">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                  Referral: {agent.referral_fee_standard || 25}%
                </span>
                <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded">
                  Mgmt: {agent.mgmt_fee_rate || 15}%
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Agent' : 'Add New Agent'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">License #</Label>
                <Input
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Broker *</Label>
                <Input
                  value={formData.broker}
                  onChange={(e) => setFormData({ ...formData, broker: e.target.value })}
                  required
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Office Location *</Label>
                <Input
                  value={formData.office_location}
                  onChange={(e) => setFormData({ ...formData, office_location: e.target.value })}
                  required
                  className="text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Referral Fee %</Label>
                <Input
                  type="number"
                  value={formData.referral_fee_standard}
                  onChange={(e) => setFormData({ ...formData, referral_fee_standard: e.target.value })}
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Management Fee %</Label>
                <Input
                  type="number"
                  value={formData.mgmt_fee_rate}
                  onChange={(e) => setFormData({ ...formData, mgmt_fee_rate: e.target.value })}
                  className="text-sm"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Notes</Label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                rows="2"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingId ? 'Update' : 'Add'} Agent</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}