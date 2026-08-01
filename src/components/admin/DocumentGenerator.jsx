import React, { useState } from 'react';
import { appClient } from '@/api/appClient';
import { FileText, Download, Mail, Loader2, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';

const DOCUMENT_TYPES = [
  {
    id: 'listing_agreement',
    label: 'Listing Agreement',
    description: 'Exclusive right to sell with relocation terms',
    color: 'blue',
  },
  {
    id: 'referral_contract',
    label: 'Referral Contract',
    description: 'Agent referral & relocation management fee agreement',
    color: 'purple',
  },
  {
    id: 'seller_disclosure',
    label: 'Seller Disclosure',
    description: 'Property condition & relocation disclosure form',
    color: 'green',
  },
];

export default function DocumentGenerator({ campaign }) {
  const [expanded, setExpanded] = useState(false);
  const [loadingDoc, setLoadingDoc] = useState(null);
  const [emailDoc, setEmailDoc] = useState(null);
  const [emailAddress, setEmailAddress] = useState(campaign?.owner_email || '');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sentDoc, setSentDoc] = useState(null);

  const handleDownload = async (templateType) => {
    setLoadingDoc(templateType);
    const response = await appClient.functions.invoke('generateDocument', {
      template_type: templateType,
      campaign_id: campaign?.id,
    });

    // The function returns binary PDF, accessed via blob
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateType}_${campaign?.owner_name?.replace(/\s+/g, '_') || 'document'}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    setLoadingDoc(null);
  };

  const handleSendEmail = async (templateType) => {
    if (!emailAddress) return;
    setSendingEmail(true);
    await appClient.functions.invoke('generateDocument', {
      template_type: templateType,
      campaign_id: campaign?.id,
      send_email: true,
      recipient_email: emailAddress,
      recipient_name: campaign?.owner_name,
    });
    setSentDoc(templateType);
    setSendingEmail(false);
    setEmailDoc(null);
    setTimeout(() => setSentDoc(null), 3000);
  };

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      {/* Header toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-600" />
          <span className="font-semibold text-slate-800 text-sm">Document Generator</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-3 bg-white">
              {DOCUMENT_TYPES.map((doc) => {
                const isLoading = loadingDoc === doc.id;
                const isSent = sentDoc === doc.id;
                const isEmailOpen = emailDoc === doc.id;

                return (
                  <div key={doc.id} className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-3 bg-slate-50">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{doc.label}</p>
                        <p className="text-xs text-slate-500">{doc.description}</p>
                      </div>
                      <div className="flex gap-2">
                        {/* Download Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(doc.id)}
                          disabled={isLoading}
                          className="h-7 text-xs gap-1"
                        >
                          {isLoading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Download className="w-3 h-3" />
                          )}
                          PDF
                        </Button>

                        {/* Email Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEmailDoc(isEmailOpen ? null : doc.id)}
                          className="h-7 text-xs gap-1"
                        >
                          {isSent ? (
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                          ) : (
                            <Mail className="w-3 h-3" />
                          )}
                          {isSent ? 'Sent!' : 'Email'}
                        </Button>
                      </div>
                    </div>

                    {/* Email Sub-panel */}
                    <AnimatePresence>
                      {isEmailOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-3 border-t border-slate-200 bg-white space-y-2">
                            <Label className="text-xs text-slate-600">Send to email address</Label>
                            <div className="flex gap-2">
                              <Input
                                type="email"
                                value={emailAddress}
                                onChange={(e) => setEmailAddress(e.target.value)}
                                placeholder="owner@example.com"
                                className="h-8 text-xs"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleSendEmail(doc.id)}
                                disabled={sendingEmail || !emailAddress}
                                className="h-8 text-xs whitespace-nowrap"
                              >
                                {sendingEmail ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  'Send Now'
                                )}
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}