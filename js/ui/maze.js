// Tablero de los Laberintos de la serpiente: dibuja el mapa en un canvas y anima la traza
// que devuelve el simulador de Python (js/engine/maze.py).
import { reducedMotion } from "./dom.js";

const ANG = { E: 0, S: Math.PI / 2, W: Math.PI, N: -Math.PI / 2 };
const images = {};
function image(key) {
  if (!images[key]) {
    const im = new Image();
    im.decoding = "async";
    im.src = `img/e/${key}.webp`;
    images[key] = im;
  }
  return images[key];
}

const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
function lerpAngle(a, b, t) {
  let d = b - a;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return a + d * t;
}

export class MazeView {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.token = 0; // para cancelar animaciones en curso
    this.speed = 1;
    image("apple");
    image("flag");
    for (const k of ["apple", "flag"]) images[k].addEventListener("load", () => this.draw(), { once: true });
  }

  setMap(map) {
    this.token++;
    this.map = map;
    this.rows = map.filas;
    this.cols = Math.max(...this.rows.map((r) => r.length));
    this.apples = new Set();
    this.goal = null;
    this.rows.forEach((r, y) =>
      [...r].forEach((c, x) => {
        if (c === "S") this.start = [x, y];
        else if (c === "A") this.apples.add(`${x},${y}`);
        else if (c === "G") this.goal = [x, y];
      })
    );
    this.resetState();
    this.resize();
  }

  resetState() {
    const [x, y] = this.start;
    this.eaten = new Set();
    this.state = { x, y, a: ANG[this.map.dir || "E"], body: [[x, y], [x, y], [x, y]], flash: 0, shake: 0, pop: null };
  }

  resize() {
    const box = this.canvas.parentElement;
    const maxW = Math.max(200, box.clientWidth);
    this.cell = Math.floor(Math.min(58, maxW / this.cols));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = this.cell * this.cols, h = this.cell * this.rows.length;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.canvas.style.width = w + "px";
    this.canvas.style.height = h + "px";
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.draw();
  }

  colors() {
    const cs = getComputedStyle(this.canvas);
    const v = (n) => cs.getPropertyValue(n).trim();
    return {
      g1: v("--mz-grass1"), g2: v("--mz-grass2"), wall: v("--mz-wall"), top: v("--mz-wall-top"),
      body: v("--mz-snake"), dark: v("--mz-snake-dark"), goal: v("--mz-goal"),
    };
  }

  draw() {
    if (!this.map) return;
    const { ctx, cell } = this;
    const c = this.colors();
    const s = this.state;
    const W = cell * this.cols, H = cell * this.rows.length;
    ctx.save();
    ctx.clearRect(0, 0, W, H);
    if (s.shake) ctx.translate(Math.sin(s.shake * 40) * 3 * s.shake, 0);

    // Pasto y muros
    this.rows.forEach((r, y) =>
      [...r].forEach((ch, x) => {
        const px = x * cell, py = y * cell;
        if (ch === "#") {
          ctx.fillStyle = c.wall;
          roundRect(ctx, px + 1, py + 1, cell - 2, cell - 2, cell * 0.22);
          ctx.fill();
          ctx.fillStyle = c.top;
          roundRect(ctx, px + 1, py + 1, cell - 2, (cell - 2) * 0.55, cell * 0.22);
          ctx.fill();
        } else {
          ctx.fillStyle = (x + y) % 2 ? c.g1 : c.g2;
          ctx.fillRect(px, py, cell, cell);
        }
      })
    );

    // Meta
    if (this.goal) {
      const [gx, gy] = this.goal;
      ctx.fillStyle = c.goal;
      ctx.beginPath();
      ctx.arc((gx + 0.5) * cell, (gy + 0.5) * cell, cell * 0.42, 0, Math.PI * 2);
      ctx.fill();
      drawImg(ctx, image("flag"), gx, gy, cell, 0.72);
    }

    // Manzanas
    for (const k of this.apples) {
      if (this.eaten.has(k)) continue;
      const [x, y] = k.split(",").map(Number);
      drawImg(ctx, image("apple"), x, y, cell, 0.7);
    }
    if (s.pop) {
      const [x, y, t] = s.pop;
      ctx.globalAlpha = 1 - t;
      drawImg(ctx, image("apple"), x, y, cell, 0.7 + t * 0.6);
      ctx.globalAlpha = 1;
    }

    // Cuerpo: un tubo por los centros de los segmentos
    const pts = s.body.map(([x, y]) => [(x + 0.5) * cell, (y + 0.5) * cell]);
    pts[0] = [(s.x + 0.5) * cell, (s.y + 0.5) * cell];
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = c.dark;
    ctx.lineWidth = cell * 0.58;
    tube(ctx, pts);
    ctx.strokeStyle = c.body;
    ctx.lineWidth = cell * 0.46;
    tube(ctx, pts);

    // Cabeza
    const [hx, hy] = pts[0];
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(s.a);
    ctx.fillStyle = c.dark;
    ctx.beginPath();
    ctx.ellipse(0, 0, cell * 0.4, cell * 0.36, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c.body;
    ctx.beginPath();
    ctx.ellipse(0, 0, cell * 0.35, cell * 0.31, 0, 0, Math.PI * 2);
    ctx.fill();
    for (const side of [-1, 1]) {
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(cell * 0.12, side * cell * 0.14, cell * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#0E1A2B";
      ctx.beginPath();
      ctx.arc(cell * 0.15, side * cell * 0.14, cell * 0.05, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = "#E5484D";
    ctx.lineWidth = Math.max(1.5, cell * 0.04);
    ctx.beginPath();
    ctx.moveTo(cell * 0.34, 0);
    ctx.lineTo(cell * 0.48, 0);
    ctx.moveTo(cell * 0.48, 0);
    ctx.lineTo(cell * 0.55, -cell * 0.05);
    ctx.moveTo(cell * 0.48, 0);
    ctx.lineTo(cell * 0.55, cell * 0.05);
    ctx.stroke();
    ctx.restore();

    if (s.flash) {
      ctx.fillStyle = `rgba(229, 72, 77, ${0.35 * s.flash})`;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();
  }

  // Anima la traza. Devuelve una promesa que se resuelve al terminar (o si se cancela).
  async play(traza) {
    const my = ++this.token;
    this.resetState();
    const fast = window.__pygoTurbo || reducedMotion();
    const step = () => (fast ? 0 : 230 / this.speed);
    const s = this.state;
    for (let i = 1; i < traza.length; i++) {
      if (my !== this.token) return false;
      const [x, y, d, ev] = traza[i];
      const from = { x: s.x, y: s.y, a: s.a, body: s.body.map((p) => [...p]) };
      const toA = ANG[d];
      if (ev === "avanzar") {
        const next = [[x, y], ...from.body.slice(0, from.body.length - 1)];
        next[0] = [x, y];
        await this.tween(step(), my, (t) => {
          s.x = lerp(from.x, x, t);
          s.y = lerp(from.y, y, t);
          s.body = from.body.map((p, k) => (k === 0 ? [s.x, s.y] : [lerp(p[0], next[k][0], t), lerp(p[1], next[k][1], t)]));
        });
        s.body = next;
        s.x = x;
        s.y = y;
      } else if (ev === "girar") {
        await this.tween(step() * 0.7, my, (t) => (s.a = lerpAngle(from.a, toA, t)));
        s.a = toA;
      } else if (ev === "comer") {
        const k = `${x},${y}`;
        this.eaten.add(k);
        s.body.push([...s.body[s.body.length - 1]]);
        await this.tween(step() * 0.9, my, (t) => (s.pop = [x, y, t]));
        s.pop = null;
      } else if (ev === "choque" || ev === "sin_manzana") {
        await this.tween(fast ? 0 : 420, my, (t) => {
          s.flash = 1 - t;
          s.shake = ev === "choque" ? 1 - t : 0;
        });
        s.flash = s.shake = 0;
      }
      s.a = toA;
      this.draw();
    }
    return my === this.token;
  }

  tween(ms, my, fn) {
    if (!ms) {
      fn(1);
      this.draw();
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const t0 = performance.now();
      const frame = (now) => {
        if (my !== this.token) return resolve();
        const k = Math.min(1, (now - t0) / ms);
        fn(ease(k));
        this.draw();
        if (k < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  stop() {
    this.token++;
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h);
}

function tube(ctx, pts) {
  ctx.beginPath();
  ctx.moveTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
  for (let i = pts.length - 2; i >= 0; i--) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.stroke();
}

function drawImg(ctx, im, x, y, cell, scale) {
  if (!im.complete || !im.naturalWidth) return;
  const s = cell * scale;
  ctx.drawImage(im, (x + 0.5) * cell - s / 2, (y + 0.5) * cell - s / 2, s, s);
}
