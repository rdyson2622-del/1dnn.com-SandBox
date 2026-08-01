import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, RefreshCw, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

const statusColors = {
  not_contacted: 'bg-slate-100 text-slate-800',
  contacted: 'bg-blue-100 text-blue-800',
  in_conversation: 'bg-purple-100 text-purple-800',
  interested: 'bg-green-100 text-green-800',
  not_interested: 'bg-red-100 text-red-800',
  converted: 'bg-emerald-100 text-emerald-800'
};

export default function SkipTraceResults() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: owners = [], isLoading } = useQuery({
    queryKey: ['listing-owners'],
    queryFn: () => appClient.entities.ListingOwner.list('-updated_date', 100),
  });

  const batchJobMutation = useMutation({
    mutationFn: async () => {
      const response = await appClient.functions.invoke('skipTracePaloAlto', {});
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['listing-owners'] });
      toast.success(`Skip traced ${data.listings_processed} properties, found ${data.owners_found} owners`);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const filtered = owners.filter(owner => {
    const matchesSearch = 
      owner.owner_name?.toLowerCase().includes(search.toLowerCase()) ||
      owner.property_address?.toLowerCase().includes(search.toLowerCase()) ||
      owner.email?.toLowerCase().includes(search.toLowerCase()) ||
      owner.phone?.includes(search);
    const matchesStatus = statusFilter === 'all' || owner.contact_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Skip Trace Results</h1>
          <p className="text-muted-foreground">Processed properties and owner contact information</p>
        </div>

        <div className="bg-card border rounded-lg p-4 mb-6">
          <div className="flex gap-4 items-end flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input
                placeholder="Owner name, address, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="min-w-[150px]">
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="not_contacted">Not Contacted</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="in_conversation">In Conversation</SelectItem>
                  <SelectItem value="interested">Interested</SelectItem>
                  <SelectItem value="not_interested">Not Interested</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => batchJobMutation.mutate()}
              disabled={batchJobMutation.isPending}
              className="gap-2"
            >
              {batchJobMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Batch Skip Trace
                </>
              )}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-card border rounded-lg p-8 text-center">
            <p className="text-muted-foreground">No properties found</p>
          </div>
        ) : (
          <div className="bg-card border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-semibold text-sm">Owner Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-sm">Property Address</th>
                    <th className="text-left px-4 py-3 font-semibold text-sm">Email</th>
                    <th className="text-left px-4 py-3 font-semibold text-sm">Phone</th>
                    <th className="text-left px-4 py-3 font-semibold text-sm">Listing Price</th>
                    <th className="text-left px-4 py-3 font-semibold text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((owner) => (
                    <tr key={owner.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-medium">{owner.owner_name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {owner.property_address ? (
                          <>
                            {owner.property_address}
                            {owner.property_city && `, ${owner.property_city}`}
                            {owner.property_state && ` ${owner.property_state}`}
                          </>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {owner.email ? (
                          <a
                            href={`mailto:${owner.email}`}
                            className="text-blue-600 hover:underline flex items-center gap-1 text-sm w-fit"
                          >
                            <Mail className="w-3 h-3" />
                            {owner.email}
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {owner.phone ? (
                          <a
                            href={`tel:${owner.phone}`}
                            className="text-blue-600 hover:underline flex items-center gap-1 text-sm w-fit"
                          >
                            <Phone className="w-3 h-3" />
                            {owner.phone}
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {owner.listing_price ? `$${owner.listing_price.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={statusColors[owner.contact_status] || statusColors.not_contacted}>
                          {owner.contact_status?.replace('_', ' ') || 'Not Contacted'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t bg-muted/30 text-sm text-muted-foreground">
              Showing {filtered.length} of {owners.length} properties
            </div>
          </div>
        )}
      </div>
    </div>
  );
}