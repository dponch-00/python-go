// Utilidades de DOM: escape, mini-markdown, avisos y ventanas modales.
import { icon } from "./icons.js";

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ESC[c]);

// `código`, **negrita** y *cursiva*. Dentro del código no se interpreta nada.
export function md(s) {
  return String(s ?? "")
    .split(/(`[^`]+`)/g)
    .map((part) =>
      part.startsWith("`") && part.endsWith("`") && part.length > 1
        ? `<code class="ic">${esc(part.slice(1, -1))}</code>`
        : esc(part)
            .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
            .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    )
    .join("");
}

export const fmt = (n) => Number(n).toLocaleString("es-MX");

export function reducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

// ---------- Avisos breves ----------
let toastBox;
export function toast(msg, { icon: ic = null, kind = "" } = {}) {
  if (!toastBox) {
    toastBox = document.createElement("div");
    toastBox.className = "toasts";
    toastBox.setAttribute("role", "status");
    toastBox.setAttribute("aria-live", "polite");
    document.body.append(toastBox);
  }
  const t = document.createElement("div");
  t.className = `toast ${kind}`;
  t.innerHTML = `${ic ? icon(ic) : ""}<span>${msg}</span>`;
  toastBox.append(t);
  setTimeout(() => t.classList.add("out"), 2600);
  setTimeout(() => t.remove(), 3000);
}

// ---------- Ventana modal ----------
// actions: [{ label, kind: "primary" | "ghost" | "danger", onClick, keep }]
export function modal({ title = "", body = "", actions = [], cls = "", dismissable = true }) {
  const wrap = document.createElement("div");
  wrap.className = `modal-wrap ${cls}`;
  wrap.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      ${title ? `<h2 class="modal-title">${esc(title)}</h2>` : ""}
      <div class="modal-body">${body}</div>
      <div class="modal-actions">
        ${actions.map((a, i) => `<button class="btn ${a.kind || "ghost"}" data-i="${i}" type="button">${a.label}</button>`).join("")}
      </div>
    </div>`;
  const prevFocus = document.activeElement;
  const close = () => {
    wrap.classList.add("out");
    document.removeEventListener("keydown", onKey);
    setTimeout(() => wrap.remove(), 180);
    prevFocus?.focus?.();
  };
  const onKey = (e) => {
    if (e.key === "Escape" && dismissable) close();
  };
  wrap.addEventListener("click", (e) => {
    const b = e.target.closest("[data-i]");
    if (b) {
      const a = actions[+b.dataset.i];
      const r = a.onClick?.(wrap);
      if (!a.keep && r !== false) close();
    } else if (e.target === wrap && dismissable) close();
  });
  document.addEventListener("keydown", onKey);
  document.body.append(wrap);
  requestAnimationFrame(() => {
    wrap.classList.add("in");
    wrap.querySelector(".modal-actions .btn")?.focus();
  });
  return { el: wrap, close };
}

export function confirmBox({ title, body, yes = "Sí", no = "Cancelar", danger = false }) {
  return new Promise((resolve) => {
    modal({
      title,
      body: `<p>${body}</p>`,
      actions: [
        { label: no, kind: "ghost", onClick: () => resolve(false) },
        { label: yes, kind: danger ? "danger" : "primary", onClick: () => resolve(true) },
      ],
      dismissable: false,
    });
  });
}

// Cuenta animada de 0 a `to`.
export function countUp(el, to, ms = 900) {
  if (reducedMotion() || to === 0) {
    el.textContent = fmt(to);
    return;
  }
  const t0 = performance.now();
  const step = (t) => {
    const k = Math.min(1, (t - t0) / ms);
    el.textContent = fmt(Math.round(to * (1 - Math.pow(1 - k, 3))));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
