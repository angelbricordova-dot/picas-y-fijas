// Sonidos sintetizados (sin archivos): el "clac" de la ficha, los puntos y la victoria.
import { getPref, setPref } from './session';

let ctx: AudioContext | null = null;
let enabled = getPref('sound', true);

export const soundOn = () => enabled;
export function setSound(on: boolean) {
  enabled = on;
  setPref('sound', on);
}

function audio(): AudioContext | null {
  if (!enabled) return null;
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Ficha de dominó apoyándose en la mesa. */
export function clack(strength = 1) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime;
  const len = Math.floor(a.sampleRate * 0.05);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 6);
  const src = a.createBufferSource();
  src.buffer = buf;
  const bp = a.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 2400 + Math.random() * 500;
  bp.Q.value = 1.4;
  const g = a.createGain();
  g.gain.value = 0.55 * strength;
  src.connect(bp).connect(g).connect(a.destination);
  src.start(t);
  const o = a.createOscillator();
  const og = a.createGain();
  o.frequency.setValueAtTime(180, t);
  o.frequency.exponentialRampToValueAtTime(70, t + 0.06);
  og.gain.setValueAtTime(0.18 * strength, t);
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  o.connect(og).connect(a.destination);
  o.start(t);
  o.stop(t + 0.09);
}

function blip(freq: number, at: number, dur = 0.07, vol = 0.12, type: OscillatorType = 'triangle') {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + at;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  o.frequency.exponentialRampToValueAtTime(freq * 1.25, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

/** Un punto por cada fija (agudo) y cada pica (más grave), al ritmo de la animación. */
export function pips(fijas: number, picas: number, step = 0.085, start = 0.32) {
  for (let i = 0; i < fijas; i++) blip(880 + i * 90, start + i * step);
  for (let i = 0; i < picas; i++) blip(520 + i * 50, start + (fijas + i) * step, 0.06, 0.09);
}

export function tap() {
  blip(1400, 0, 0.025, 0.04, 'sine');
}

export function fanfare() {
  [523, 659, 784, 1047, 1319].forEach((f, i) => blip(f, i * 0.09, 0.16, 0.13));
}

export function sadTrombone() {
  [392, 370, 349, 311].forEach((f, i) => blip(f, i * 0.18, 0.22, 0.08, 'sawtooth'));
}

export function buzz(ms: number | number[] = 12) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* sin vibración */
  }
}
