import { useState, useCallback } from 'react';
import { appClient } from '@/api/appClient';

/**
 * useTalkingHead — hook to trigger a TalkingHead bubble on any page
 * 
 * Usage:
 *   const { talkingHeadProps, speak, dismiss } = useTalkingHead();
 *   <button onClick={() => speak('bob', 'Welcome to the DNN news feed...')}>Listen</button>
 *   {talkingHeadProps && <TalkingHead {...talkingHeadProps} onClose={dismiss} />}
 */
export function useTalkingHead() {
  const [talkingHeadProps, setTalkingHeadProps] = useState(null);
  const [loading, setLoading] = useState(false);

  const speak = useCallback(async (speaker = 'bob', text, videoUrl = null) => {
    if (!text) return;
    setLoading(true);
    try {
      // Generate audio via charlieSpeak backend function — returns base64 audio
      const res = await appClient.functions.invoke('charlieSpeak', { text });
      const { audio, mimeType } = res?.data || {};

      // Convert base64 to blob URL so <audio> can play it
      let audioUrl = null;
      if (audio) {
        const binary = atob(audio);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: mimeType || 'audio/mpeg' });
        audioUrl = URL.createObjectURL(blob);
      }

      setTalkingHeadProps({ speaker, audioUrl, videoUrl, autoPlay: true });
    } catch (err) {
      console.error('TalkingHead speak error:', err);
      setTalkingHeadProps({ speaker, audioUrl: null, videoUrl, autoPlay: false });
    } finally {
      setLoading(false);
    }
  }, []);

  const dismiss = useCallback(() => {
    setTalkingHeadProps(null);
  }, []);

  return { talkingHeadProps, speak, loading, dismiss };
}