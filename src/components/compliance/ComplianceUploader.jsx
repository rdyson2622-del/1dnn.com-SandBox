import React, { useRef, useState } from 'react';
import { appClient } from '@/api/appClient';
import { Upload, Loader2 } from 'lucide-react';

const GOLD = '#D4AF37';

const SOURCES = [
  { value: 'dre', label: 'Dept. of Real Estate (DRE)' },
  { value: 'association_of_realtors', label: 'Association of Realtors (C.A.R.)' },
  { value: 'title_company', label: 'Title Company' },
  { value: 'escrow_company', label: 'Escrow Company' },
  { value: 'brokerage_internal', label: 'Brokerage Internal' },
  { value: 'other', label: 'Other' },
];

export default function ComplianceUploader({ onUploaded }) {
  const inputRef = useRef(null);
  const [source, setSource] = useState('other');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setBusy(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress(`Uploading ${i + 1} of ${files.length}: ${file.name}`);
      const { file_url } = await appClient.integrations.Core.UploadFile({ file });
      const record = await appClient.entities.ComplianceDocument.create({
        file_name: file.name,
        file_url,
        source,
        status: 'uploaded',
      });
      setProgress(`Reviewing ${i + 1} of ${files.length}: ${file.name}`);
      onUploaded?.(record);
      // Kick off AI review (don't block the next upload on it finishing)
      appClient.functions.invoke('complianceReviewDocument', { documentId: record.id })
        .finally(() => onUploaded?.());
    }
    setBusy(false);
    setProgress('');
    if (inputRef.current) inputRef.current.value = '';
    onUploaded?.();
  };

  return (
    <div className="rounded-2xl p-5" style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.3)' }}>
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <p className="text-sm font-bold text-white mb-1">Upload documents for review</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
            PDF, PNG or JPG — purchase agreements, disclosures, DRE/C.A.R. forms, title &amp; escrow docs. AI review starts automatically.
          </p>
        </div>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(212,175,55,0.3)', color: '#fff' }}
        >
          {SOURCES.map(s => <option key={s.value} value={s.value} style={{ color: '#000' }}>{s.label}</option>)}
        </select>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all hover:scale-105 disabled:opacity-60"
          style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: '#000' }}
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {busy ? 'Working…' : 'Upload & Review'}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg"
          className="hidden"
          onChange={handleFiles}
        />
      </div>
      {progress && (
        <p className="mt-3 text-xs font-medium" style={{ color: GOLD }}>{progress}</p>
      )}
    </div>
  );
}