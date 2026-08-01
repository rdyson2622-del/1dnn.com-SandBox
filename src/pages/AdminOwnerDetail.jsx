import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import PropertyHistory from '../components/admin/PropertyHistory';
import ContactNotesSection from '../components/admin/ContactNotesSection';
import CallLogForm from '../components/admin/CallLogForm';
import MoveActionSteps from '../components/admin/MoveActionSteps';

const GOLD = '#D4AF37';

export default function AdminOwnerDetail() {
  const { ownerId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCallForm, setShowCallForm] = useState(false);

  // Fetch owner
  const { data: owner, isLoading: ownerLoading } = useQuery({
    queryKey: ['listing-owner', ownerId],
    queryFn: () => appClient.entities.ListingOwner.list().then(items => 
      items.find(o => o.id === ownerId)
    ),
  });

  // Fetch related campaign
  const { data: campaign } = useQuery({
    queryKey: ['outreach-campaign', ownerId],
    queryFn: () => appClient.entities.OwnerOutreachCampaign.filter({ listing_owner_id: ownerId }).then(items => items[0]),
  });

  // Fetch move tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ['relocation-tasks', campaign?.id],
    queryFn: () => {
      if (!campaign?.id) return [];
      return appClient.entities.RelocationTask.filter({ client_id: campaign.id });
    },
    enabled: !!campaign?.id,
  });

  // Update notes mutation
  const updateNotesMutation = useMutation({
    mutationFn: (notes) => appClient.entities.ListingOwner.update(ownerId, { notes }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['listing-owner', ownerId] }),
  });

  // Log call mutation
  const logCallMutation = useMutation({
    mutationFn: async (callData) => {
      // Create a record of the call in notes
      const timestamp = new Date().toLocaleString();
      const callEntry = `\n[${timestamp}] ${callData.type}: ${callData.notes || 'No details'}`;
      const updatedNotes = (owner?.notes || '') + callEntry;
      return appClient.entities.ListingOwner.update(ownerId, { notes: updatedNotes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing-owner', ownerId] });
      setShowCallForm(false);
    },
  });

  if (ownerLoading) return <div className="p-8">Loading...</div>;
  if (!owner) return <div className="p-8">Owner not found</div>;

  return (
    <div className="min-h-screen p-8" style={{ background: '#A9A9A9' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="rounded-2xl border p-8 mb-6" style={{ background: 'rgba(255,255,255,0.9)', borderColor: 'rgba(0,0,0,0.1)' }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#000' }}>{owner.owner_name}</h1>
              <p className="text-sm mt-1" style={{ color: 'rgba(0,0,0,0.6)' }}>{owner.property_address}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold" style={{ color: GOLD }}>Status</p>
              <p className="text-sm" style={{ color: '#000' }}>{owner.contact_status}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs" style={{ color: 'rgba(0,0,0,0.5)' }}>Phone</p>
              <p className="font-semibold" style={{ color: '#000' }}>{owner.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'rgba(0,0,0,0.5)' }}>Email</p>
              <p className="font-semibold" style={{ color: '#000' }}>{owner.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'rgba(0,0,0,0.5)' }}>Listing Price</p>
              <p className="font-semibold" style={{ color: '#000' }}>${owner.listing_price?.toLocaleString() || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'rgba(0,0,0,0.5)' }}>Moving To</p>
              <p className="font-semibold" style={{ color: '#000' }}>{owner.moving_to || 'Unknown'}</p>
            </div>
          </div>

          <Button
            onClick={() => setShowCallForm(!showCallForm)}
            className="mt-6"
            style={{ background: GOLD, color: '#000' }}
          >
            <Phone className="w-4 h-4 mr-2" /> Log Call
          </Button>
        </div>

        {/* Call Form */}
        {showCallForm && (
          <CallLogForm
            onSubmit={(data) => logCallMutation.mutate(data)}
            isLoading={logCallMutation.isPending}
            onCancel={() => setShowCallForm(false)}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <PropertyHistory owner={owner} />
            <ContactNotesSection
              notes={owner.notes || ''}
              onSave={(notes) => updateNotesMutation.mutate(notes)}
              isLoading={updateNotesMutation.isPending}
            />
          </div>

          {/* Right Column */}
          <div>
            <MoveActionSteps tasks={tasks} campaign={campaign} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}