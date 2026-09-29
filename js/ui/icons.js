// Iconos SVG en línea (24×24). Los rellenos usan currentColor.
const S = (d, fill = false) =>
  fill
    ? `<path d="${d}" fill="currentColor"/>`
    : `<path d="${d}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;

const P = {
  star: S("M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z", true),
  heart: S("M12 20.6s-7.6-4.6-9.4-9.3C1.4 7.9 3.4 4.4 7 4.4c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.6 0 5.6 3.5 4.4 6.9-1.8 4.7-9.4 9.3-9.4 9.3z", true),
  flame: S("M12 22c-4.1 0-7-2.9-7-6.8 0-3.2 2-5.3 3.6-7.1.4 1.9 1.4 3 2.6 3.4-.6-3.6 1.1-6.6 3.8-9.5.3 3.4 2 5.2 3.5 7.2 1.3 1.7 2.5 3.5 2.5 6 0 3.9-3 6.8-7 6.8z", true),
  gem: S("M6.6 3.5h10.8L21.5 9 12 20.8 2.5 9z", true) + `<path d="M2.5 9h19M8.8 3.5 12 20.8l3.2-17.3M8.8 3.5 7.4 9M15.2 3.5 16.6 9" fill="none" stroke="rgba(0,0,0,.28)" stroke-width="1.2" stroke-linejoin="round"/>`,
  lock: S("M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3"),
  crown: S("M3.5 18.5h17L19 8l-4.3 3.6L12 5.5l-2.7 6.1L5 8z", true),
  bolt: S("M13.5 2 4.5 13.5h6.5L10 22l9.5-12H13z", true),
  clock: S("M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3.5 2"),
  calendar: S("M4 6h16v14H4zM4 10h16M8.5 3.5v4M15.5 3.5v4"),
  repeat: S("M17 3l3 3-3 3M4 11V9a3 3 0 0 1 3-3h13M7 21l-3-3 3-3M20 13v2a3 3 0 0 1-3 3H4"),
  terminal: S("M3.5 5h17v14h-17zM7 9.5l3 2.5-3 2.5M12.5 15h4.5"),
  trophy: S("M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1.5A3.5 3.5 0 0 0 7.5 11M17 6h3v1.5a3.5 3.5 0 0 1-3.5 3.5M12 14v4M8 20.5h8"),
  user: S("M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20.5c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5"),
  gear: S("M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 13.5l1.6 1.2-1.9 3.3-1.9-.7a7 7 0 0 1-2 1.2l-.3 2h-3.8l-.3-2a7 7 0 0 1-2-1.2l-1.9.7L5 14.7l1.6-1.2a7 7 0 0 1 0-3L5 9.3 6.9 6l1.9.7a7 7 0 0 1 2-1.2l.3-2h3.8l.3 2a7 7 0 0 1 2 1.2l1.9-.7L21 9.3l-1.6 1.2a7 7 0 0 1 0 3z"),
  close: S("M6 6l12 12M18 6 6 18"),
  check: S("M4.5 12.5l5 5 10-11"),
  x: S("M6.5 6.5l11 11M17.5 6.5l-11 11"),
  back: S("M15 5l-7 7 7 7"),
  next: S("M9 5l7 7-7 7"),
  bulb: S("M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"),
  map: S("M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6zM9 4v14M15 6v14"),
  play: S("M7 4.5v15l12.5-7.5z", true),
  flag: S("M5 21V4M5 4h11l-2 4 2 4H5"),
  brain: S("M9.5 4.5A2.5 2.5 0 0 0 7 7a3 3 0 0 0-2 5 3 3 0 0 0 2 5 2.5 2.5 0 0 0 5 .5V6a2 2 0 0 0-2.5-1.5zM14.5 4.5A2.5 2.5 0 0 1 17 7a3 3 0 0 1 2 5 3 3 0 0 1-2 5 2.5 2.5 0 0 1-5 .5"),
  moon: S("M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"),
  sun: S("M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"),
  target: S("M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM12 12.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"),
  shield: S("M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6z"),
  gamepad: S("M7 8h10a4.5 4.5 0 0 1 4.3 5.8l-1 3.3a2.3 2.3 0 0 1-3.9.8L14 15.5h-4l-2.4 2.4a2.3 2.3 0 0 1-3.9-.8l-1-3.3A4.5 4.5 0 0 1 7 8zM8 10.5v3M6.5 12h3M15.5 11h.01M17.5 13h.01"),
  chart: S("M4 20h16M7 16v-5M12 16V7M17 16v-8"),
  bag: S("M5 8h14l-1 12.5H6zM9 8V6.5a3 3 0 0 1 6 0V8"),
  copy: S("M9 9h11v11H9zM5 15H4V4h11v1"),
  download: S("M12 4v11M7.5 10.5 12 15l4.5-4.5M4.5 19.5h15"),
  upload: S("M12 15V4M7.5 8.5 12 4l4.5 4.5M4.5 19.5h15"),
  volume: S("M4 9.5h3.5L12 5.5v13l-4.5-4H4zM15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"),
  trash: S("M4.5 6.5h15M9.5 6.5V4h5v2.5M6.5 6.5l1 13.5h9l1-13.5"),
  refresh: S("M19.5 6v4.5H15M4.5 18v-4.5H9M18.6 10.5A7 7 0 0 0 6 7.5M5.4 13.5A7 7 0 0 0 18 16.5"),
  swap: S("M7 4 3.5 7.5 7 11M3.5 7.5h13M17 13l3.5 3.5L17 20M20.5 16.5h-13"),
  eye: S("M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"),
  plus: S("M12 5v14M5 12h14"),
};

export function icon(name, cls = "") {
  return `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${P[name] || ""}</svg>`;
}

// Cabeza de serpiente: marca el nivel actual en el mapa.
export function snakeHead(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M24 5c10 0 17 7.5 17 17.5 0 9-6.5 16.5-17 16.5S7 31.5 7 22.5C7 12.5 14 5 24 5z" fill="var(--gold)"/>
    <path d="M24 30c3.4 0 6-1.6 6-3.2" fill="none" stroke="var(--gold-ink)" stroke-width="2.4" stroke-linecap="round"/>
    <ellipse cx="17" cy="19" rx="4.2" ry="5" fill="#fff"/><ellipse cx="31" cy="19" rx="4.2" ry="5" fill="#fff"/>
    <ellipse cx="18" cy="20" rx="2.2" ry="3" fill="#0E1A2B"/><ellipse cx="30" cy="20" rx="2.2" ry="3" fill="#0E1A2B"/>
    <path d="M24 39v4.5M24 43.5l-3 2.5M24 43.5l3 2.5" stroke="#E5484D" stroke-width="2" stroke-linecap="round" fill="none"/>
  </svg>`;
}

export function logoHtml() {
  return `<span class="logo"><span class="logo-py">Python</span><span class="logo-go">GO</span></span>`;
}
