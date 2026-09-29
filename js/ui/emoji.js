// Íconos 3D de Fluent Emoji (Microsoft, licencia MIT) servidos desde img/e/.
// Se ven igual en todos los dispositivos, a diferencia de los emoji del sistema.
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

export function em(key, cls = "", alt = "") {
  return `<img class="em ${cls}" src="img/e/${key}.webp" alt="${esc(alt)}"${alt ? "" : ' aria-hidden="true"'} decoding="async" draggable="false">`;
}

// Avatares: el perfil guarda el emoji; aquí se traduce a su ícono 3D.
export const AVATAR_KEYS = {
  "🐍": "a-snake", "🦊": "a-fox", "🐼": "a-panda", "🐸": "a-frog", "🦉": "a-owl", "🐙": "a-octopus",
  "🦄": "a-unicorn", "🐯": "a-tiger", "🐧": "a-penguin", "🐢": "a-turtle", "🦖": "a-trex", "🐝": "a-bee",
  "🐱": "a-cat", "🐶": "a-dog", "🐰": "a-rabbit", "🦁": "a-lion", "🐨": "a-koala", "🐵": "a-monkey",
  "🤖": "a-robot", "👽": "a-alien", "👻": "a-ghost", "🐉": "a-dragon", "🐣": "a-chick", "🦜": "a-parrot",
};

export function avatar(ch, cls = "") {
  const key = AVATAR_KEYS[ch];
  return key ? em(key, `av-img ${cls}`) : `<span class="av-txt ${cls}">${esc(ch)}</span>`;
}

// Ícono 3D de cada logro.
export const ACH_EM = {
  first: "flag", perfect: "glow", lab1: "laptop", boss1: "crown", worlds3: "map", bossAll: "trophy",
  stars50: "star", stars150: "sparkles", starsAll: "hundred", combo5: "zap", speed: "rocket",
  nohint: "brain", comeback: "muscle", streak3: "fire", streak7: "fire", streak30: "fire",
  goal7: "target", arcade10: "stopwatch", arcade25: "hourglass", daily7: "calendar", review10: "books",
  night: "moon", early: "sunrise", console: "keyboard", lvl10: "grad", rich: "gem",
};
