// All sound is synthesised with WebAudio: no audio files, no network.
export class AudioSys {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }
  ensure() {
    if (!this.ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AC();
      } catch {
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }
  tone(freq, dur, type = 'sine', vol = 0.12, slide = 0) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }
  blip(freq, dur = 0.07) { this.tone(freq, dur, 'square', 0.06); }
  sizzle() {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const len = ctx.sampleRate * 0.4;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) * 0.25;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type = 'highpass';
    filt.frequency.value = 3000;
    src.connect(filt).connect(ctx.destination);
    src.start();
  }
  chime() { this.tone(880, 0.12, 'sine', 0.1); setTimeout(() => this.tone(1320, 0.18, 'sine', 0.1), 90); }
  serve() {
    this.tone(523, 0.1, 'triangle', 0.12);
    setTimeout(() => this.tone(659, 0.1, 'triangle', 0.12), 90);
    setTimeout(() => this.tone(784, 0.2, 'triangle', 0.12), 180);
  }
  bad() { this.tone(220, 0.25, 'sawtooth', 0.08, -80); }
  win() {
    [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.tone(f, 0.25, 'triangle', 0.12), i * 130));
  }
}
