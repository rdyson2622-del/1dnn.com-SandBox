// Synthesized "breaking news" broadcast open — no audio files needed.
// Big network-news sting: sub-bass pulse, urgent teletype ticks, four escalating
// timpani hits with brass-style stacked chords, a dramatic rising sweep,
// a noise crash, and a huge final major-chord impact. ~4.2 seconds.
export function playNewsSting() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const master = ctx.createGain();
  master.gain.value = 0.7;
  master.connect(ctx.destination);

  const now = ctx.currentTime;
  const END = 4.2;

  // Deep pulsing sub drone
  const drone = ctx.createOscillator();
  drone.type = 'sawtooth';
  drone.frequency.value = 55;
  const droneLFO = ctx.createOscillator();
  droneLFO.frequency.value = 4;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.08;
  const droneGain = ctx.createGain();
  droneGain.gain.setValueAtTime(0.0001, now);
  droneGain.gain.exponentialRampToValueAtTime(0.28, now + 0.12);
  droneGain.gain.exponentialRampToValueAtTime(0.0001, now + END);
  droneLFO.connect(lfoGain).connect(droneGain.gain);
  const droneFilter = ctx.createBiquadFilter();
  droneFilter.type = 'lowpass';
  droneFilter.frequency.value = 220;
  drone.connect(droneFilter).connect(droneGain).connect(master);
  drone.start(now); drone.stop(now + END + 0.1);
  droneLFO.start(now); droneLFO.stop(now + END + 0.1);

  // Urgent teletype ticks (newsroom pulse)
  for (let i = 0; i < 22; i++) {
    const t = now + 0.1 + i * 0.14;
    if (t > now + 3.0) break;
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 1600 + (i % 2) * 400;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.05, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
    osc.connect(g).connect(master);
    osc.start(t); osc.stop(t + 0.05);
  }

  // Four escalating timpani hits, each with a stacked brass-style chord stab
  [0, 0.5, 1.0, 1.5].forEach((t, i) => {
    // Timpani
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    const f = 85 + i * 25;
    osc.frequency.setValueAtTime(f * 2.2, now + t);
    osc.frequency.exponentialRampToValueAtTime(f, now + t + 0.12);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.65, now + t);
    g.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.45);
    osc.connect(g).connect(master);
    osc.start(now + t); osc.stop(now + t + 0.5);

    // Brass stab — detuned saws a fifth apart
    [f * 2, f * 3, f * 2 * 1.01].forEach(bf => {
      const b = ctx.createOscillator();
      b.type = 'sawtooth';
      b.frequency.value = bf;
      const bg = ctx.createGain();
      bg.gain.setValueAtTime(0.09 + i * 0.02, now + t);
      bg.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.35);
      const bfilter = ctx.createBiquadFilter();
      bfilter.type = 'lowpass';
      bfilter.frequency.value = 1800;
      b.connect(bfilter).connect(bg).connect(master);
      b.start(now + t); b.stop(now + t + 0.4);
    });
  });

  // Dramatic rising sweep into the climax
  const sweep = ctx.createOscillator();
  sweep.type = 'sawtooth';
  sweep.frequency.setValueAtTime(180, now + 1.8);
  sweep.frequency.exponentialRampToValueAtTime(1400, now + 3.0);
  const sweepGain = ctx.createGain();
  sweepGain.gain.setValueAtTime(0.0001, now + 1.8);
  sweepGain.gain.exponentialRampToValueAtTime(0.22, now + 2.9);
  sweepGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.15);
  sweep.connect(sweepGain).connect(master);
  sweep.start(now + 1.8); sweep.stop(now + 3.15);

  // Noise crash (cymbal) at the climax
  const noiseLen = ctx.sampleRate * 1.2;
  const noiseBuf = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
  const nd = noiseBuf.getChannelData(0);
  for (let i = 0; i < noiseLen; i++) nd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / noiseLen, 2);
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuf;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'highpass';
  noiseFilter.frequency.value = 4000;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.3, now + 3.0);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.1);
  noise.connect(noiseFilter).connect(noiseGain).connect(master);
  noise.start(now + 3.0);

  // Huge final major-chord impact (root, third, fifth, octave) + sub thump
  [110, 138.6, 165, 220, 330].forEach((f, i) => {
    const osc = ctx.createOscillator();
    osc.type = i < 2 ? 'triangle' : 'sawtooth';
    osc.frequency.value = f;
    const g = ctx.createGain();
    g.gain.setValueAtTime(i < 2 ? 0.3 : 0.12, now + 3.0);
    g.gain.exponentialRampToValueAtTime(0.0001, now + END);
    const fl = ctx.createBiquadFilter();
    fl.type = 'lowpass';
    fl.frequency.value = 2500;
    osc.connect(fl).connect(g).connect(master);
    osc.start(now + 3.0); osc.stop(now + END + 0.05);
  });
  const sub = ctx.createOscillator();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(120, now + 3.0);
  sub.frequency.exponentialRampToValueAtTime(50, now + 3.3);
  const subGain = ctx.createGain();
  subGain.gain.setValueAtTime(0.7, now + 3.0);
  subGain.gain.exponentialRampToValueAtTime(0.0001, now + END);
  sub.connect(subGain).connect(master);
  sub.start(now + 3.0); sub.stop(now + END + 0.05);

  setTimeout(() => ctx.close(), 4600);
}