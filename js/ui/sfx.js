// Efectos de sonido sintetizados con WebAudio (sin archivos) y vibración.
let ctx = null;
let soundOn = true;
let vibeOn = true;

export function configureSfx({ sound, vibe }) {
  soundOn = sound;
  vibeOn = vibe;
}

function ac() {
  if (!soundOn) return null;
  try {
    ctx ||= new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq, dur, { type = "sine", gain = 0.12, delay = 0, slide = 0 } = {}) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime + delay;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export function buzz(pattern) {
  if (vibeOn) navigator.vibrate?.(pattern);
}

export const sfx = {
  tap: () => tone(620, 0.05, { type: "triangle", gain: 0.05 }),
  pick: () => tone(820, 0.06, { type: "triangle", gain: 0.06 }),
  good: () => {
    tone(660, 0.1, { type: "triangle" });
    tone(990, 0.16, { type: "triangle", delay: 0.09 });
    buzz(18);
  },
  bad: () => {
    tone(220, 0.22, { type: "square", gain: 0.05, slide: -90 });
    buzz([40, 50, 40]);
  },
  star: (i = 0) => tone(880 * Math.pow(1.26, i), 0.22, { gain: 0.1, delay: 0 }),
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, { type: "triangle", delay: i * 0.09 })),
  levelup: () => [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.2, { type: "triangle", delay: i * 0.07, gain: 0.09 })),
  tick: () => tone(1200, 0.03, { type: "square", gain: 0.03 }),
  coin: () => {
    tone(1318, 0.08, { type: "square", gain: 0.04 });
    tone(1760, 0.14, { type: "square", gain: 0.04, delay: 0.07 });
  },
  lose: () => [392, 330, 262].forEach((f, i) => tone(f, 0.22, { type: "triangle", delay: i * 0.13, gain: 0.08 })),
};
