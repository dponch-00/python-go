// Punto de entrada para empaquetar CodeMirror 6 en js/vendor/codemirror.js (ver tools/build-editor.mjs).
export { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection, Decoration, placeholder } from "@codemirror/view";
export { EditorState, StateField, StateEffect, Compartment } from "@codemirror/state";
export { defaultKeymap, history, historyKeymap, indentWithTab, indentLess, insertNewlineAndIndent } from "@codemirror/commands";
export { python } from "@codemirror/lang-python";
export { indentUnit, bracketMatching, syntaxHighlighting, HighlightStyle, indentOnInput, foldGutter } from "@codemirror/language";
export { closeBrackets, closeBracketsKeymap, autocompletion, completionKeymap, acceptCompletion } from "@codemirror/autocomplete";
export { tags } from "@lezer/highlight";
