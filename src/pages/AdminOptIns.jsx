import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Mail, MessageCircle, Phone, Zap, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const SOURCE_CONFIG = {
  relocation_intake: { icon: Mail, label: 'Intake Form', color: 'bg-blue-100 text-blue-800', border: 'border-blue-300' },
  chat_initiation: { icon: MessageCircle, label: 'Chat Started', color: 'bg-purple-100 text-purple-800', border: 'border-purple-300' },
  sms_reply: { icon: Phone, label: 'SMS Reply', color: 'bg-green-100 text-green-800', border: 'border-green-300' },
  manual: { icon: AlertCircle, label: 'Manual Entry', color: 'bg-slate-100 text-slate-800', border: 'border-slate-300' }
};

const STATUS_CONFIG = {
  new: { icon: Zap, label: 'New Lead', color: 'text-amber-600' },
  contacted: { icon: Clock, label: 'Contacted', color: 'text-blue-600' },
  qualified: { icon: CheckCircle2, label: 'Qualified', color: 'text-green-600' },
  converted: { icon: CheckCircle2, label: 'Converted', color: 'text-emerald-700' },
  unresponsive: { icon: AlertCircle, label: 'Unresponsive', color: 'text-slate-500' }
};

export default function AdminOptIns() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: optIns = [], isLoading } = useQuery({
    queryKey: ['opt_ins'],
    queryFn: () => appClient.entities.OptIn.list('-opted_in_at', 500),
    initialData: [],
    refetchInterval: 5000 // Auto-refresh every 5 seconds for real-time feel
  });

  const filteredOptIns = useMemo(() => {
    return optIns.filter(opt => {
      const matchSearch = !searchTerm || 
        opt.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opt.phone?.includes(searchTerm) ||
        opt.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = statusFilter === 'all' || opt.status === statusFilter;
      const matchSource = sourceFilter === 'all' || opt.source === sourceFilter;
      
      return matchSearch && matchStatus && matchSource;
    });
  }, [optIns, searchTerm, statusFilter, sourceFilter]);

  const handleStatusChange = async (id, newStatus) => {
    await appClient.entities.OptIn.update(id, { status: newStatus });
    queryClient.invalidateQueries({ queryKey: ['opt_ins'] });
  };

  const newLeadsCount = optIns.filter(o => o.status === 'new').length;
  const todayCount = optIns.filter(o => {
    const today = new Date().toDateString();
    return new Date(o.opted_in_at).toDateString() === today;
  }).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="px-6 py-4 flex items-center gap-3 border-b border-slate-100">
          <Link to="/admin">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-bold text-slate-900">New Opt-Ins</h1>
            <p className="text-xs text-slate-500">
              {newLeadsCount} new · {todayCount} today · {optIns.length} total
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 flex gap-3 flex-wrap">
          <div className="flex-1 relative min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by email, phone, or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium bg-white"
          >
            <option value="all">All Status</option>
            <option value="new">New Lead</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="unresponsive">Unresponsive</option>
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium bg-white"
          >
            <option value="all">All Sources</option>
            <option value="relocation_intake">Intake Form</option>
            <option value="chat_initiation">Chat</option>
            <option value="sms_reply">SMS Reply</option>
            <option value="manual">Manual</option>
          </select>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredOptIns.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Zap className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No opt-ins yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOptIns.map((optIn) => {
              const sourceConfig = SOURCE_CONFIG[optIn.source] || SOURCE_CONFIG.manual;
              const statusConfig = STATUS_CONFIG[optIn.status] || STATUS_CONFIG.new;
              const SourceIcon = sourceConfig.icon;
              const StatusIcon = statusConfig.icon;
              const timeAgo = new Date(optIn.opted_in_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
              const dateStr = new Date(optIn.opted_in_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

              return (
                <div key={optIn.id} className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Name & Contact */}
                      <div className="flex items-center gap-3 mb-2">
                        <div>
                          <h3 className="font-semibold text-slate-900">{optIn.full_name || 'Unknown'}</h3>
                          <div className="flex gap-4 text-sm text-slate-600 mt-1">
                            {optIn.email && <span>{optIn.email}</span>}
                            {optIn.phone && <span>{optIn.phone}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Source badge & time */}
                      <div className="flex items-center gap-2 mt-3">
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sourceConfig.color} border ${sourceConfig.border}`}>
                          <SourceIcon className="w-3 h-3" />
                          {sourceConfig.label}
                        </div>
                        <span className="text-xs text-slate-400">{dateStr} at {timeAgo}</span>
                      </div>

                      {/* Initial data snippet */}
                      {optIn.initial_data && (
                        <div className="mt-2 text-xs text-slate-600">
                          {optIn.initial_data.destination_city && (
                            <p>📍 Moving to: <span className="font-medium">{optIn.initial_data.destination_city}</span></p>
                          )}
                          {optIn.initial_data.move_date && (
                            <p>📅 Timeline: <span className="font-medium">{optIn.initial_data.move_date}</span></p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Status selector */}
                    <div className="flex flex-col items-end gap-2">
                      <select
                        value={optIn.status}
                        onChange={(e) => handleStatusChange(optIn.id, e.target.value)}
                        className={`text-xs font-medium rounded-lg border-0 px-3 py-1.5 cursor-pointer ${
                          optIn.status === 'new' ? 'bg-amber-100 text-amber-800' :
                          optIn.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                          optIn.status === 'qualified' ? 'bg-green-100 text-green-800' :
                          optIn.status === 'converted' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-slate-100 text-slate-800'
                        }`}
                      >
                        <option value="new">New Lead</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="converted">Converted</option>
                        <option value="unresponsive">Unresponsive</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}