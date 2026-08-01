import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appClient } from '@/api/appClient';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import PlanVoiceNote from '@/components/dashboard/PlanVoiceNote';
import RelocationProfileCard from '@/components/dashboard/RelocationProfileCard';
import DashboardServicePreviews from '@/components/dashboard/DashboardServicePreviews';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import ClientMessages from '@/components/dashboard/ClientMessages';
import { toast } from "@/components/ui/use-toast";
import CharliePagePresenter from '@/components/charlie/CharliePagePresenter';

const PORTAL_PAGE_KEYS = {
  client: 'portal-client',
  agent: 'portal-relocation-agent',
  referral_agent: 'portal-referral-agent',
  vendor: 'portal-vendor',
};

const DYSON_LOGO = "/assets/dyson-logo.png";
const GOLD = '#D4AF37';

export default function Dashboard() {
  const [clientId, setClientId] = useState(null);
  const [isCommitting, setIsCommitting] = useState(false);
  const [portalRole, setPortalRole] = useState(() => sessionStorage.getItem('dyson_role') || 'client');
  const navigate = useNavigate();

  useEffect(() => {
    const onRoleChange = () => setPortalRole(sessionStorage.getItem('dyson_role') || 'client');
    window.addEventListener('dyson_role_change', onRoleChange);
    return () => window.removeEventListener('dyson_role_change', onRoleChange);
  }, []);

  useEffect(() => {
    const fetchClient = async () => {
      const isAuthed = await appClient.auth.isAuthenticated();
      if (!isAuthed) return;
      const user = await appClient.auth.me().catch(() => null);
      if (user?.email) {
        const clients = await appClient.entities.RelocationClient.filter({ email: user.email }, '-created_date', 1);
        if (clients.length > 0) setClientId(clients[0].id);
      }
    };
    fetchClient();
  }, []);

  // NEW: Function to handle the "Commit" action
  const handleCommit = async () => {
    if (!clientId) return;
    setIsCommitting(true);
    try {
      // Creates a new 'Commitment' task in your database
      await appClient.entities.RelocationTask.create({
        client: clientId,
        title: "Client Committed to Relocation",
        status: "Completed",
        description: "User clicked 'Yes, I Want to Commit' from the dashboard."
      });
      
      toast({
        title: "Commitment Confirmed!",
        description: "Your relocation concierge has been notified. We're moving forward!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not save commitment. Please call (858) 353-1200.",
        variant: "destructive"
      });
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#ede0cc' }}>
      {/* Charlie explainer video — one per portal view */}
      <CharliePagePresenter key={portalRole} pageKey={PORTAL_PAGE_KEYS[portalRole] || 'portal-client'} />
      <main className="max-w-5xl mx-auto px-6 pt-8 pb-16 space-y-8">
        {clientId ? (
          <>
            <RelocationProfileCard clientId={clientId} />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl p-8 text-center"
              style={{ background: 'linear-gradient(145deg, #1a1a1a, #000)', border: `2px solid ${GOLD}` }}
            >
              <h3 className="text-xl font-bold text-white mb-2">Ready to make your move official?</h3>
              <p className="text-gray-400 mb-6 italic">"Where your lifestyle takes you next starts with one decision."</p>
              <button
                onClick={handleCommit}
                disabled={isCommitting}
                className="px-10 py-4 rounded-full font-bold transition-all hover:scale-105 active:scale-95"
                style={{ background: GOLD, color: '#000' }}
              >
                {isCommitting ? "Shedding Wings..." : "YES, I WANT TO COMMIT"}
              </button>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <PlanVoiceNote clientId={clientId} />
            </motion.div>

            <ActivityFeed clientId={clientId} />

            {/* Direct Messaging */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="w-4 h-4" style={{ color: GOLD }} />
                <p className="text-xs font-bold tracking-[0.2em]" style={{ color: GOLD }}>DIRECT MESSAGE YOUR CONCIERGE TEAM</p>
              </div>
              <ClientMessages clientId={clientId} />
            </motion.div>
          </>
        ) : null}

        {/* Full service previews — visible to all */}
        <DashboardServicePreviews clientId={clientId} />
      </main>
    </div>
  );
}