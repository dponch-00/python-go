// Empaqueta CodeMirror 6 en un solo módulo local (sin CDN, funciona sin conexión).
// Uso: node tools/build-editor.mjs   (requiere `npm install`)
import { build } from "esbuild";

await build({
  entryPoints: ["tools/editor-entry.js"],
  bundle: true,
  format: "esm",
  minify: true,
  target: ["es2020"],
  outfile: "js/vendor/codemirror.js",
  legalComments: "eof",
  logLevel: "info",
});
