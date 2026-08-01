import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { FileText, Download, Mail, Loader2, CheckCircle2, Search, User, Home, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';

const DOCUMENT_TYPES = [
  {
    id: 'listing_agreement',
    label: 'Listing Agreement',
    description: 'Exclusive right to sell with relocation terms',
    icon: '📄',
    colorClass: 'bg-blue-50 border-blue-200 text-blue-800',
  },
  {
    id: 'referral_contract',
    label: 'Referral Contract',
    description: 'Agent referral & relocation management agreement',
    icon: '🤝',
    colorClass: 'bg-purple-50 border-purple-200 text-purple-800',
  },
  {
    id: 'seller_disclosure',
    label: 'Seller Disclosure',
    description: 'Property condition & relocation disclosure form',
    icon: '📋',
    colorClass: 'bg-green-50 border-green-200 text-green-800',
  },
];

function DocumentCard({ doc, campaign, agentName, agentBroker }) {
  const [loading, setLoading] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailAddress, setEmailAddress] = useState(campaign?.owner_email || '');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const payload = {
    template_type: doc.id,
    campaign_id: campaign?.id,
    overrides: {
      ...(agentName && { agent_name: agentName }),
      ...(agentBroker && { agent_broker: agentBroker }),
    },
  };

  const handleDownload = async () => {
    setLoading(true);
    const response = await appClient.functions.invoke('generateDocument', payload);
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.id}_${campaign?.owner_name?.replace(/\s+/g, '_') || 'document'}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    setLoading(false);
  };

  const handleEmail = async () => {
    if (!emailAddress) return;
    setSending(true);
    await appClient.functions.invoke('generateDocument', {
      ...payload,
      send_email: true,
      recipient_email: emailAddress,
      recipient_name: campaign?.owner_name,
    });
    setSent(true);
    setSending(false);
    setEmailOpen(false);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className={`rounded-lg border p-4 ${doc.colorClass} space-y-3`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{doc.icon}</span>
          <div>
            <p className="font-semibold text-sm">{doc.label}</p>
            <p className="text-xs opacity-75">{doc.description}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleDownload}
          disabled={loading}
          className="bg-white flex-1 gap-1 text-xs"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
          Download PDF
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setEmailOpen(!emailOpen)}
          className="bg-white flex-1 gap-1 text-xs"
        >
          {sent ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <Mail className="w-3 h-3" />}
          {sent ? 'Sent!' : 'Email'}
        </Button>
      </div>

      <AnimatePresence>
        {emailOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-2 space-y-2">
              <Input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="Enter email address..."
                className="h-8 text-xs bg-white"
              />
              <Button
                size="sm"
                onClick={handleEmail}
                disabled={sending || !emailAddress}
                className="w-full text-xs"
              >
                {sending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                Send Document
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminDocuments() {
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [search, setSearch] = useState('');
  const [agentName, setAgentName] = useState('');
  const [agentBroker, setAgentBroker] = useState('');

  const { data: campaigns = [] } = useQuery({
    queryKey: ['outreach_campaigns_docs'],
    queryFn: () => appClient.entities.OwnerOutreachCampaign.list('-created_date', 200),
    initialData: [],
  });

  const filtered = campaigns.filter((c) =>
    !search || c.owner_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.property_address?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId) || null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Document Generator</h1>
          <p className="text-sm text-slate-500 mt-1">
            Auto-fill and send PDF templates for listing agreements, referral contracts, and seller disclosures.
          </p>
        </div>

        <div className="grid grid-cols-5 gap-6">
          {/* Left: Campaign Selector */}
          <div className="col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <h2 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                <User className="w-4 h-4" /> Select Campaign
              </h2>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search owner or address..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-8 text-sm"
                />
              </div>

              <div className="space-y-1 max-h-64 overflow-y-auto">
                {filtered.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No campaigns found</p>
                ) : (
                  filtered.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCampaignId(c.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCampaignId === c.id
                          ? 'bg-slate-900 text-white'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <p className="font-medium text-sm">{c.owner_name}</p>
                      <p className={`text-xs ${selectedCampaignId === c.id ? 'text-slate-300' : 'text-slate-400'}`}>
                        {c.property_address}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Selected Campaign Info */}
            {selectedCampaign && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-slate-200 p-4 space-y-2"
              >
                <h2 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                  <Home className="w-4 h-4" /> Campaign Details
                </h2>
                <div className="text-xs text-slate-600 space-y-1">
                  <p><span className="font-medium">Owner:</span> {selectedCampaign.owner_name}</p>
                  <p><span className="font-medium">Phone:</span> {selectedCampaign.owner_phone || '—'}</p>
                  <p><span className="font-medium">Property:</span> {selectedCampaign.property_address}</p>
                  {selectedCampaign.listing_price && (
                    <p><span className="font-medium">List Price:</span> ${selectedCampaign.listing_price?.toLocaleString()}</p>
                  )}
                  {selectedCampaign.destination_city && (
                    <p className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="font-medium">Moving to:</span> {selectedCampaign.destination_city}, {selectedCampaign.destination_state}
                    </p>
                  )}
                  <p><span className="font-medium">Stage:</span> <span className="capitalize">{selectedCampaign.workflow_stage}</span></p>
                </div>
              </motion.div>
            )}

            {/* Optional Agent Override */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <h2 className="font-semibold text-slate-800 text-sm">Agent Info (for Referral Contract)</h2>
              <div>
                <Label className="text-xs">Agent Name</Label>
                <Input
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="Receiving agent name..."
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Brokerage</Label>
                <Input
                  value={agentBroker}
                  onChange={(e) => setAgentBroker(e.target.value)}
                  placeholder="Brokerage name..."
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Right: Document Cards */}
          <div className="col-span-3 space-y-4">
            {!selectedCampaign ? (
              <div className="bg-white rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center h-64 text-slate-400">
                <FileText className="w-10 h-10 mb-3 opacity-40" />
                <p className="font-medium text-sm">Select a campaign to generate documents</p>
                <p className="text-xs mt-1">Documents will be auto-filled with campaign data</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Documents for {selectedCampaign.owner_name}
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    {DOCUMENT_TYPES.map((doc) => (
                      <DocumentCard
                        key={doc.id}
                        doc={doc}
                        campaign={selectedCampaign}
                        agentName={agentName}
                        agentBroker={agentBroker}
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
                  <p className="font-semibold mb-1">📌 How documents are filled</p>
                  <p>All fields (owner name, property address, listing price, destination city/state) are automatically pulled from the selected campaign. Agent name and brokerage can be customized on the left for referral contracts.</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}