// Confeti en canvas para celebrar 3 estrellas, jefes y subidas de nivel.
import { reducedMotion } from "./dom.js";

const COLORS = ["#FFC933", "#2F6DB0", "#1E9E62", "#E5484D", "#8B5CF6", "#FFFFFF"];

export function confetti(n = 110) {
  if (reducedMotion()) return;
  const c = document.createElement("canvas");
  c.className = "confetti";
  document.body.append(c);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = (c.width = innerWidth * dpr), H = (c.height = innerHeight * dpr);
  const g = c.getContext("2d");
  const parts = Array.from({ length: n }, () => ({
    x: W / 2 + (Math.random() - 0.5) * W * 0.3,
    y: H * 0.35,
    vx: (Math.random() - 0.5) * 16 * dpr,
    vy: (-Math.random() * 14 - 6) * dpr,
    s: (Math.random() * 6 + 4) * dpr,
    r: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.3,
    c: COLORS[(Math.random() * COLORS.length) | 0],
  }));
  const t0 = performance.now();
  const frame = (t) => {
    g.clearRect(0, 0, W, H);
    for (const p of parts) {
      p.vy += 0.45 * dpr;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      g.save();
      g.translate(p.x, p.y);
      g.rotate(p.r);
      g.fillStyle = p.c;
      g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      g.restore();
    }
    if (t - t0 < 2600) requestAnimationFrame(frame);
    else c.remove();
  };
  requestAnimationFrame(frame);
}
