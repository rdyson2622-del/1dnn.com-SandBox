import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { appClient } from '@/api/appClient';

const GOLD = '#D4AF37';

export default function PlanVoiceNote({ clientId, onPlanUpdated }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | recording | processing | complete
  
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(t => t.stop());
      };

      setStatus('recording');
      mediaRecorder.start();
    } catch (err) {
      console.error('Microphone error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setStatus('idle');
    }
  };

  const submitVoiceNote = async () => {
    if (!audioBlob || !clientId) return;

    setIsProcessing(true);
    setStatus('processing');

    try {
      // Upload audio file
      const uploadRes = await appClient.integrations.Core.UploadFile({ file: audioBlob });
      
      // Send to backend for Gemini analysis and plan update
      const updateRes = await appClient.functions.invoke('updateMovingPlanFromVoice', {
        client_id: clientId,
        audio_url: uploadRes.file_url,
      });

      if (updateRes.data?.success) {
        setStatus('complete');
        setAudioBlob(null);
        setTimeout(() => setStatus('idle'), 2000);
        if (onPlanUpdated) onPlanUpdated(updateRes.data.plan);
      }
    } catch (err) {
      console.error('Voice note error:', err);
      setStatus('idle');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-4 border"
      style={{ background: '#000', border: `1px solid ${GOLD}33` }}
    >
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="text-xs font-bold mb-1" style={{ color: GOLD }}>📝 UPDATE YOUR PLAN</p>
          <p className="text-xs" style={{ color: '#f5f5f5' }}>
            {status === 'idle' && audioBlob === null && 'Tell Gemini about changes to your preferences, budget, or timeline'}
            {status === 'recording' && '🎤 Recording... Speak naturally about any changes'}
            {status === 'processing' && 'Analyzing your voice note...'}
            {status === 'complete' && '✓ Plan updated successfully'}
            {audioBlob && status !== 'recording' && 'Ready to submit your voice note'}
          </p>
        </div>

        <div className="flex gap-2">
          {status === 'idle' && !audioBlob && (
            <Button
              onClick={startRecording}
              size="icon"
              className="h-9 w-9 rounded-lg"
              style={{ background: GOLD, color: '#000' }}
            >
              <Mic className="w-4 h-4" />
            </Button>
          )}

          {status === 'recording' && (
            <Button
              onClick={stopRecording}
              size="icon"
              className="h-9 w-9 rounded-lg animate-pulse"
              style={{ background: '#ef4444', color: '#fff' }}
            >
              <MicOff className="w-4 h-4" />
            </Button>
          )}

          {audioBlob && !isProcessing && (
            <>
              <Button
                onClick={() => setAudioBlob(null)}
                size="icon"
                variant="outline"
                className="h-9 w-9 rounded-lg"
                style={{ borderColor: '#555', color: '#f5f5f5' }}
              >
                ✕
              </Button>
              <Button
                onClick={submitVoiceNote}
                size="icon"
                className="h-9 w-9 rounded-lg"
                style={{ background: GOLD, color: '#000' }}
              >
                <Send className="w-4 h-4" />
              </Button>
            </>
          )}

          {isProcessing && (
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: GOLD }} />
          )}
        </div>
      </div>
    </motion.div>
  );
}