import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CallLogForm({ onSubmit, isLoading, onCancel }) {
  const [callType, setCallType] = useState('outbound');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ type: callType, notes });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-2xl border p-6 mb-6"
      style={{ background: 'rgba(255,255,255,0.95)', borderColor: 'rgba(0,0,0,0.1)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold" style={{ color: '#000' }}>Log Call</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-gray-600 mb-2">Call Type</label>
          <select
            value={callType}
            onChange={(e) => setCallType(e.target.value)}
            className="w-full p-2 border rounded-lg text-sm focus:outline-none"
            style={{ borderColor: 'rgba(0,0,0,0.1)' }}
          >
            <option value="outbound">Outbound Call</option>
            <option value="inbound">Inbound Call</option>
            <option value="voicemail">Left Voicemail</option>
            <option value="text">Sent Text/SMS</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-2">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Summarize the call outcome, topics discussed, next steps..."
            className="w-full p-2 border rounded-lg text-sm focus:outline-none"
            style={{ borderColor: 'rgba(0,0,0,0.1)', minHeight: '100px' }}
          />
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={isLoading}
            style={{ background: '#D4AF37', color: '#000' }}
          >
            {isLoading ? 'Saving...' : 'Log Call'}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </motion.div>
  );
}