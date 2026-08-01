// Charlie voice — routed exclusively through Google Cloud TTS via charlieSpeak backend function
// Voice: en-US-Chirp3-HD-Charon (deep authoritative male)
// AUTO-INTERRUPT: Charlie stops immediately when the user starts speaking.

import { appClient } from '@/api/appClient';

let currentAudio = null;
let interruptRecognition = null;
let onInterruptCallback = null;

function cleanText(text) {
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/#+\s/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[👉👋🎙️🗺️🤝🎉]/g, '')
    .replace(/\n+/g, ' ')
    .trim();
}

// Start a background microphone listener that interrupts Charlie if the user speaks
function startInterruptListener(onInterrupt) {
  stopInterruptListener(); // clear any existing

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return;

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = true; // fire as soon as sound detected
  recognition.continuous = false;
  recognition.maxAlternatives = 1;

  recognition.onspeechstart = () => {
    // User voice detected — stop Charlie immediately
    stopCharlie();
    stopInterruptListener();
    if (onInterrupt) onInterrupt();
  };

  recognition.onresult = (event) => {
    // Also catch on result in case onspeechstart didn't fire
    stopCharlie();
    stopInterruptListener();
    const transcript = event.results[0][0].transcript;
    if (onInterrupt) onInterrupt(transcript);
  };

  recognition.onerror = () => stopInterruptListener();
  recognition.onend = () => { interruptRecognition = null; };

  interruptRecognition = recognition;
  onInterruptCallback = onInterrupt;

  try {
    recognition.start();
  } catch (e) {
    // already started or not available
  }
}

function stopInterruptListener() {
  if (interruptRecognition) {
    try { interruptRecognition.stop(); } catch (e) {}
    interruptRecognition = null;
  }
  onInterruptCallback = null;
}

export async function speakAsCharlie(text, onEnd, onStart, onInterrupted) {
  stopCharlie(); // always cancel previous before starting new
  stopInterruptListener();

  const clean = cleanText(text);
  if (!clean) return;

  try {
    const res = await appClient.functions.invoke('charlieSpeak', { text: clean });
    const { audio, mimeType } = res.data;
    if (!audio) return;

    const binary = atob(audio);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: mimeType || 'audio/wav' });
    const url = URL.createObjectURL(blob);

    const audioEl = new Audio(url);
    currentAudio = audioEl;

    if (onStart) onStart();

    // Start interrupt listener as soon as audio begins playing
    audioEl.onplay = () => {
      startInterruptListener((transcript) => {
        URL.revokeObjectURL(url);
        currentAudio = null;
        if (onInterrupted) onInterrupted(transcript);
        else if (onEnd) onEnd(transcript); // treat interrupt like end, pass transcript
      });
    };

    audioEl.onended = () => {
      stopInterruptListener();
      URL.revokeObjectURL(url);
      currentAudio = null;
      if (onEnd) onEnd();
    };

    audioEl.onerror = () => {
      stopInterruptListener();
      URL.revokeObjectURL(url);
      currentAudio = null;
      if (onEnd) onEnd();
    };

    audioEl.play().catch((e) => {
      // Autoplay blocked (no user gesture yet, or permissions denied) — fail silently
      stopInterruptListener();
      URL.revokeObjectURL(url);
      currentAudio = null;
      if (onEnd) onEnd();
    });
  } catch (e) {
    console.warn('Charlie TTS failed:', e.message);
    stopInterruptListener();
    if (onEnd) onEnd();
  }
}

export function stopCharlie() {
  stopInterruptListener();
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

export function isCharlieSpeaking() {
  return currentAudio !== null && !currentAudio.paused;
}