/**
 * Charlie Script Utilities
 * 
 * Use these helpers to prepare text before sending to speakAsCharlie().
 * Charlie reads headlines and key values only — not body copy.
 */

/**
 * Generates a brief inter-card silence gap using Web Audio API.
 * Call this between speakAsCharlie() calls for natural pacing.
 * @param {number} durationMs - silence duration in milliseconds (default 600ms)
 * @returns {Promise<void>}
 */
export function silenceGap(durationMs = 600) {
  return new Promise((resolve) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * (durationMs / 1000)), ctx.sampleRate);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => {
        ctx.close();
        resolve();
      };
      source.start();
    } catch {
      setTimeout(resolve, durationMs);
    }
  });
}

/**
 * Extracts only headings and short key phrases from a block of text.
 * Use this to build a Charlie-ready script from display copy.
 * @param {string} text
 * @returns {string}
 */
export function extractScript(text) {
  if (!text) return '';
  const clean = text.replace(/[*_#`]/g, '').trim();
  const lines = clean.split('\n').map(l => l.trim()).filter(Boolean);

  return lines
    .filter(line => {
      const words = line.split(/\s+/).length;
      return words <= 10 || /\d/.test(line);
    })
    .join('. ');
}

/**
 * Speaks a sequence of scripts with silence gaps between each.
 * @param {string[]} scripts - array of text strings
 * @param {Function} speakFn - the speakAsCharlie function
 * @param {number} gapMs - silence gap between items (default 700ms)
 */
export async function speakSequence(scripts, speakFn, gapMs = 700) {
  for (let i = 0; i < scripts.length; i++) {
    if (!scripts[i]?.trim()) continue;
    await new Promise((resolve) => speakFn(scripts[i], null, resolve));
    if (i < scripts.length - 1) {
      await silenceGap(gapMs);
    }
  }
}