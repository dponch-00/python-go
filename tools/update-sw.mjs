// Regenera en sw.js la lista de archivos para uso sin conexión y el nombre de la caché.
// El nombre incluye la versión y un hash del contenido: cualquier cambio publica una actualización.
// Uso: node tools/update-sw.mjs
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const INCLUDE = [/^index\.html$/, /^manifest\.webmanifest$/, /^css\/.+\.css$/, /^js\/.+\.(js|py)$/, /^icons\/.+\.(png|svg)$/];

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const files = walk(ROOT)
  .map((f) => relative(ROOT, f).replace(/\\/g, "/"))
  .filter((f) => INCLUDE.some((re) => re.test(f)) && !f.includes("__pycache__"))
  .sort();

const hash = createHash("sha1");
for (const f of files) hash.update(f).update(readFileSync(join(ROOT, f)));
const version = readFileSync(join(ROOT, "js/version.js"), "utf8").match(/VERSION = "([^"]+)"/)[1];
const cache = `pygo-${version}-${hash.digest("hex").slice(0, 8)}`;

const block = `// ASSETS:start\nconst CACHE = "${cache}";\nconst ASSETS = [\n  "./",\n${files.map((f) => `  "${f}",`).join("\n")}\n];\n// ASSETS:end`;
const swPath = join(ROOT, "sw.js");
const sw = readFileSync(swPath, "utf8").replace(/\/\/ ASSETS:start[\s\S]*?\/\/ ASSETS:end/, block);
writeFileSync(swPath, sw);
console.log(`sw.js: ${files.length} archivos · caché ${cache}`);
