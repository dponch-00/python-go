// Editor profesional (CodeMirror 6, empaquetado en js/vendor) con la misma interfaz que ui/editor.js.
// Si CodeMirror no carga, se usa el editor ligero como respaldo.
import { createEditor } from "./editor.js";

const KEYS = ["⇥", ":", "(", ")", "[", "]", "{", "}", '"', "'", "=", "+", "-", "*", "/", "%", "<", ">", "_", ".", ",", "#"];

let cmPromise = null;
const loadCM = () => (cmPromise ||= import("../vendor/codemirror.js"));

// Precarga en segundo plano (p. ej., al abrir un laboratorio).
export function preloadEditor() {
  loadCM().catch(() => {});
}

function buildTheme(cm) {
  const { EditorView, HighlightStyle, syntaxHighlighting, tags: t } = cm;
  const theme = EditorView.theme({
    "&": { color: "var(--c-ink)", backgroundColor: "var(--c-bg)", fontSize: "var(--code-size)" },
    ".cm-scroller": { fontFamily: "var(--f-code)", lineHeight: "1.6", maxHeight: "58vh", overflow: "auto" },
    ".cm-content": { caretColor: "var(--gold)", padding: "12px 0", fontVariantLigatures: "none" },
    ".cm-line": { padding: "0 14px 0 6px" },
    ".cm-gutters": { backgroundColor: "var(--c-bg)", color: "var(--c-ln)", border: "none", paddingLeft: "6px" },
    ".cm-activeLine": { backgroundColor: "color-mix(in srgb, var(--c-ink) 5%, transparent)" },
    ".cm-activeLineGutter": { backgroundColor: "transparent", color: "var(--c-ink)" },
    "&.cm-focused": { outline: "none" },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--gold)", borderLeftWidth: "2px" },
    "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      { backgroundColor: "color-mix(in srgb, var(--gold) 30%, transparent) !important" },
    ".cm-matchingBracket, &.cm-focused .cm-matchingBracket": { backgroundColor: "color-mix(in srgb, var(--gold) 28%, transparent)", color: "inherit" },
    ".cm-errline": { backgroundColor: "color-mix(in srgb, var(--bad) 22%, transparent)" },
    ".cm-placeholder": { color: "var(--c-ln)" },
    ".cm-tooltip": { border: "1px solid var(--line)", backgroundColor: "var(--surface)", color: "var(--ink)", borderRadius: "10px", overflow: "hidden" },
    ".cm-tooltip-autocomplete > ul": { fontFamily: "var(--f-code)", maxHeight: "12em" },
    ".cm-tooltip-autocomplete > ul > li": { padding: "4px 10px !important" },
    ".cm-tooltip-autocomplete > ul > li[aria-selected]": { backgroundColor: "var(--accent)", color: "var(--accent-ink)" },
    ".cm-completionDetail": { opacity: "0.7", fontStyle: "normal", marginLeft: "0.6em" },
  });
  const hl = HighlightStyle.define([
    { tag: [t.keyword, t.controlKeyword, t.operatorKeyword, t.definitionKeyword, t.moduleKeyword], color: "var(--c-k)", fontWeight: "600" },
    { tag: [t.string, t.special(t.string)], color: "var(--c-s)" },
    { tag: [t.number, t.bool, t.null], color: "var(--c-n)" },
    { tag: t.comment, color: "var(--c-c)", fontStyle: "italic" },
    { tag: [t.function(t.definition(t.variableName)), t.definition(t.className)], color: "var(--c-f)", fontWeight: "600" },
    { tag: [t.standard(t.variableName), t.function(t.variableName)], color: "var(--c-b)" },
    { tag: [t.operator, t.punctuation, t.bracket], color: "var(--c-o)" },
    { tag: t.self, color: "var(--c-self)", fontStyle: "italic" },
    { tag: t.meta, color: "var(--c-d)" },
  ]);
  return [theme, syntaxHighlighting(hl)];
}

export async function createCodeEditor(host, { value = "", onChange = () => {}, onRun = null, label = "Editor de código" } = {}) {
  let cm;
  try {
    cm = await loadCM();
  } catch {
    return createEditor(host, { value, onChange, onRun, label });
  }
  const {
    EditorView, EditorState, StateField, StateEffect, Decoration, keymap, lineNumbers, highlightActiveLine,
    highlightActiveLineGutter, drawSelection, history, historyKeymap, defaultKeymap, indentWithTab,
    python, indentUnit, bracketMatching, indentOnInput, closeBrackets, closeBracketsKeymap,
    autocompletion, completionKeymap,
  } = cm;

  host.innerHTML = `
    <div class="editor cm-host">
      <div class="cm-mount"></div>
      <div class="keybar" role="toolbar" aria-label="Símbolos">
        ${KEYS.map((k) => `<button type="button" tabindex="-1" data-k="${k === '"' ? "&quot;" : k}">${k === "⇥" ? "Tab" : k}</button>`).join("")}
      </div>
    </div>`;

  // Resaltado de la línea con error.
  const setErr = StateEffect.define();
  const errField = StateField.define({
    create: () => Decoration.none,
    update(deco, tr) {
      for (const e of tr.effects) {
        if (e.is(setErr)) {
          if (!e.value || e.value > tr.state.doc.lines) return Decoration.none;
          const line = tr.state.doc.line(e.value);
          return Decoration.set([Decoration.line({ class: "cm-errline" }).range(line.from)]);
        }
      }
      return tr.docChanged ? Decoration.none : deco;
    },
    provide: (f) => EditorView.decorations.from(f),
  });

  const runKeys = onRun ? [{ key: "Mod-Enter", run: () => (onRun(), true) }] : [];
  const view = new EditorView({
    parent: host.querySelector(".cm-mount"),
    state: EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        drawSelection(),
        history(),
        indentUnit.of("    "),
        EditorState.tabSize.of(4),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        autocompletion({ icons: false, maxRenderedOptions: 40 }),
        python(),
        keymap.of([...runKeys, ...closeBracketsKeymap, ...completionKeymap, ...historyKeymap, indentWithTab, ...defaultKeymap]),
        errField,
        EditorView.contentAttributes.of({ "aria-label": label, autocapitalize: "off", autocorrect: "off", spellcheck: "false" }),
        EditorView.updateListener.of((u) => {
          if (u.docChanged) onChange(u.state.doc.toString());
        }),
        ...buildTheme(cm),
      ],
    }),
  });

  // La barra de símbolos no debe quitar el foco (cerraría el teclado del celular).
  const bar = host.querySelector(".keybar");
  bar.addEventListener("pointerdown", (e) => e.preventDefault());
  bar.addEventListener("click", (e) => {
    const b = e.target.closest("[data-k]");
    if (!b) return;
    const k = b.dataset.k;
    view.dispatch(view.state.replaceSelection(k === "⇥" ? "    " : k));
    view.focus();
  });

  return {
    get value() {
      return view.state.doc.toString();
    },
    set value(v) {
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: v } });
      onChange(v);
    },
    focus: () => view.focus(),
    // Inserta texto en el cursor; con `newline` agrega un salto con la sangría correcta.
    insert(text, newline = false) {
      view.dispatch(view.state.replaceSelection(text));
      if (newline) cm.insertNewlineAndIndent(view);
      view.focus();
    },
    markLine(n) {
      view.dispatch({ effects: setErr.of(n || 0) });
    },
    destroy: () => view.destroy(),
  };
}
