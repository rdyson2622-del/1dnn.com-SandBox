import React, { useState } from 'react';
import { Sparkles, Save, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { appClient } from '@/api/appClient';
import { useQueryClient } from '@tanstack/react-query';

const GOLD = '#D4AF37';

export default function ClientGeminiTab({ client }) {
  const queryClient = useQueryClient();
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(client.notes || '');
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [geminiOutput, setGeminiOutput] = useState('');

  const handleSaveNotes = async () => {
    setSaving(true);
    await appClient.entities.RelocationClient.update(client.id, { notes });
    setSaving(false);
    setEditingNotes(false);
    queryClient.invalidateQueries({ queryKey: ['relocation-client', client.id] });
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setGeminiOutput('');
    const prompt = `
You are a luxury relocation concierge reviewing a client profile. 
Analyze the following client data and produce a structured relocation advisory summary including:
1. Client Overview (1 paragraph)
2. Top neighborhood recommendations for their destination (3 neighborhoods with why they fit)
3. Key concerns or risks to address proactively
4. Recommended next steps for the team

CLIENT DATA:
Name: ${client.full_name}
From: ${client.current_city || 'unknown'}
Moving To: ${client.destination_city}
Budget: ${client.budget || 'not specified'}
Move Date: ${client.move_date || 'TBD'}
Family Size: ${client.family_size || 'not specified'}
Priorities: ${(client.priorities || []).join(', ') || 'not specified'}
Notes/Intake: ${client.notes || 'none'}
`.trim();

    const result = await appClient.integrations.Core.InvokeLLM({ prompt, add_context_from_internet: true });
    setGeminiOutput(result);
    setGenerating(false);
  };

  return (
    <div className="space-y-6">
      {/* Generate AI advisory */}
      <div className="rounded-2xl border p-6" style={{ background: 'rgba(255,255,255,0.9)', borderColor: 'rgba(0,0,0,0.1)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" style={{ color: GOLD }} />
            <h2 className="font-bold text-base" style={{ color: '#000' }}>AI Relocation Advisory</h2>
          </div>
          <Button onClick={handleGenerate} disabled={generating} size="sm"
            style={{ background: GOLD, color: '#000' }} className="gap-2 font-bold">
            <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Analyzing...' : 'Generate with AI'}
          </Button>
        </div>
        <p className="text-xs mb-4" style={{ color: 'rgba(0,0,0,0.5)' }}>
          Uses client profile + live web context to produce neighborhood recommendations, risk flags, and next steps.
        </p>

        {generating && (
          <div className="flex items-center gap-3 py-8 justify-center">
            <div className="w-6 h-6 border-4 border-slate-200 border-t-yellow-500 rounded-full animate-spin" />
            <span className="text-sm" style={{ color: 'rgba(0,0,0,0.5)' }}>Gemini is analyzing {client.destination_city}...</span>
          </div>
        )}

        {geminiOutput && !generating && (
          <div className="rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap"
            style={{ background: '#f9f7f0', border: `1px solid ${GOLD}33`, color: '#2a2a2a' }}>
            {geminiOutput}
          </div>
        )}

        {!geminiOutput && !generating && (
          <div className="rounded-xl p-6 text-center"
            style={{ background: '#f9f9f9', border: '1px dashed rgba(0,0,0,0.12)' }}>
            <p className="text-sm" style={{ color: 'rgba(0,0,0,0.4)' }}>
              Click "Generate with AI" to get a full relocation advisory for {client.full_name}.
            </p>
          </div>
        )}
      </div>

      {/* Intake notes / Gemini session transcript */}
      <div className="rounded-2xl border p-6" style={{ background: 'rgba(255,255,255,0.9)', borderColor: 'rgba(0,0,0,0.1)' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-base" style={{ color: '#000' }}>Intake Notes & Session Transcript</h2>
          {!editingNotes && (
            <Button size="sm" variant="outline" onClick={() => setEditingNotes(true)} className="text-xs">Edit / Add</Button>
          )}
        </div>
        <p className="text-xs mb-3" style={{ color: 'rgba(0,0,0,0.45)' }}>
          Paste Gemini session transcripts, call notes, or any intake data here.
        </p>

        {editingNotes ? (
          <div className="space-y-3">
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={12}
              placeholder="Paste Gemini session transcript, interview summary, call notes..."
              className="w-full text-sm rounded-xl border px-4 py-3 resize-none leading-relaxed"
              style={{ borderColor: 'rgba(0,0,0,0.15)', background: '#fafafa', color: '#000' }}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setEditingNotes(false)}>Cancel</Button>
              <Button size="sm" disabled={saving} onClick={handleSaveNotes}
                style={{ background: GOLD, color: '#000' }} className="gap-1.5">
                <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Notes'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap min-h-24"
            style={{ background: '#f9f9f9', color: notes ? '#2a2a2a' : 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,0,0,0.06)' }}>
            {notes || 'No transcript or notes yet. Click "Edit / Add" to paste session data.'}
          </div>
        )}
      </div>
    </div>
  );
}