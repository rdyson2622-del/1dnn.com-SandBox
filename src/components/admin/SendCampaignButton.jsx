import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Button } from '@/components/ui/button';
import { Send, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SendCampaignButton({ owner }) {
  const [sent, setSent] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      return appClient.functions.invoke('sendOwnerOutreachSMS', {
        listing_owner_id: owner.id,
        phone: owner.phone,
        owner_name: owner.owner_name
      });
    },
    onSuccess: () => {
      setSent(true);
      queryClient.invalidateQueries({ queryKey: ['outreach_campaigns'] });
      setTimeout(() => setSent(false), 3000);
    }
  });

  if (sent) {
    return (
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="text-xs font-semibold px-2 py-1 rounded bg-emerald-100 text-emerald-800"
      >
        ✓ Sent
      </motion.div>
    );
  }

  return (
    <Button
      size="sm"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending || !owner.phone}
      className="gap-1 text-xs h-7"
      variant="outline"
    >
      {mutation.isPending ? (
        <Loader className="w-3 h-3 animate-spin" />
      ) : (
        <Send className="w-3 h-3" />
      )}
      Send SMS
    </Button>
  );
}