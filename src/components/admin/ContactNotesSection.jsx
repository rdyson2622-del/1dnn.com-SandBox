import React, { useState } from 'react';
import { MessageSquare, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function ContactNotesSection({ notes, onSave, isLoading }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState(notes);

  const handleSave = () => {
    onSave(editedNotes);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedNotes(notes);
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-6"
      style={{ background: 'rgba(255,255,255,0.9)', borderColor: 'rgba(0,0,0,0.1)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" style={{ color: '#D4AF37' }} />
          <h2 className="font-semibold" style={{ color: '#000' }}>Contact Notes</h2>
        </div>
        {!isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            style={{ color: '#D4AF37' }}
          >
            Edit
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editedNotes}
            onChange={(e) => setEditedNotes(e.target.value)}
            className="w-full p-3 rounded-lg border text-sm focus:outline-none"
            style={{ borderColor: 'rgba(0,0,0,0.1)', minHeight: '150px' }}
          />
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              style={{ background: '#D4AF37', color: '#000' }}
            >
              <Save className="w-4 h-4 mr-1" /> Save
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="p-3 rounded-lg text-sm whitespace-pre-wrap"
          style={{ background: 'rgba(0,0,0,0.02)', color: 'rgba(0,0,0,0.7)' }}
        >
          {editedNotes || 'No notes yet. Add notes about interactions and follow-ups.'}
        </div>
      )}
    </motion.div>
  );
}