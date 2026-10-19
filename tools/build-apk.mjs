// Construye el APK de Android con todo adentro (juego + Python), sin depender de internet.
// Uso: node tools/build-apk.mjs        → dist/PythonGO-<versión>.apk
// Requiere: Android SDK (ANDROID_HOME), Java 21 (JAVA21_HOME o ~/.jdks/jdk-21*) y `npm install` en apk/.
import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, copyFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const APK = join(ROOT, "apk");
const WWW = join(APK, "www");
const AND = join(APK, "android");
const MAIN = join(AND, "app", "src", "main");
const PYODIDE_VER = "314.0.7";
const PYODIDE_FILES = ["pyodide.mjs", "pyodide.asm.mjs", "pyodide.asm.wasm", "python_stdlib.zip", "pyodide-lock.json"];
const NAVY = "#0F1B2D";

const VERSION = readFileSync(join(ROOT, "js", "version.js"), "utf8").match(/VERSION = "([^"]+)"/)[1];
const [maj, min, pat] = VERSION.split(".").map(Number);
const VERSION_CODE = maj * 10000 + min * 100 + pat; // 1.1.2 → 10102

const step = (msg) => console.log(`\n▸ ${msg}`);
const sh = (cmd, opts = {}) => execSync(cmd, { stdio: "inherit", ...opts });

function findJava21() {
  if (process.env.JAVA21_HOME) return process.env.JAVA21_HOME;
  const base = join(homedir(), ".jdks");
  const jdk = existsSync(base) && readdirSync(base).find((d) => d.startsWith("jdk-21"));
  if (!jdk) throw new Error("No encontré Java 21. Descárgalo en ~/.jdks o define JAVA21_HOME.");
  return join(base, jdk);
}

// Reemplaza `a` por `b` solo si `b` todavía no está (los parches son repetibles).
function patch(file, edits) {
  let s = readFileSync(file, "utf8");
  for (const [a, b] of edits) {
    if (s.includes(b)) continue;
    if (a instanceof RegExp ? !a.test(s) : !s.includes(a)) throw new Error(`No pude aplicar el parche en ${file}: ${a}`);
    s = s.replace(a, b);
  }
  writeFileSync(file, s);
}

// 1. Copia del juego
step(`Copiando el juego (versión ${VERSION})`);
rmSync(WWW, { recursive: true, force: true });
mkdirSync(WWW, { recursive: true });
for (const f of ["index.html", "manifest.webmanifest"]) copyFileSync(join(ROOT, f), join(WWW, f));
for (const d of ["css", "fonts", "img", "icons", "js"]) cpSync(join(ROOT, d), join(WWW, d), { recursive: true });
writeFileSync(
  join(WWW, "js", "config.js"),
  "// Generado por tools/build-apk.mjs: versión para Android.\nexport const APK = true;\nexport const PYODIDE_LOCAL = true;\n"
);

// 2. Python (Pyodide) incluido
step(`Incluyendo Python (Pyodide ${PYODIDE_VER})`);
const cache = join(APK, ".cache", `pyodide-${PYODIDE_VER}`);
mkdirSync(cache, { recursive: true });
for (const f of PYODIDE_FILES) {
  const dest = join(cache, f);
  if (existsSync(dest)) continue;
  console.log(`  descargando ${f}…`);
  const res = await fetch(`https://cdn.jsdelivr.net/npm/pyodide@${PYODIDE_VER}/${f}`);
  if (!res.ok) throw new Error(`No se pudo descargar ${f}: ${res.status}`);
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}
cpSync(cache, join(WWW, "js", "vendor", "pyodide"), { recursive: true });

// 3. Ajustes del proyecto de Android
step("Ajustando el proyecto de Android");
sh(`python "${join(ROOT, "tools", "make-icons.py")}" --android "${join(MAIN, "res")}"`, { env: { ...process.env, PYTHONIOENCODING: "utf-8" } });
writeFileSync(
  join(MAIN, "res", "values", "ic_launcher_background.xml"),
  `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${NAVY}</color>\n</resources>\n`
);
patch(join(MAIN, "AndroidManifest.xml"), [
  ['<uses-permission android:name="android.permission.INTERNET" />',
   '<uses-permission android:name="android.permission.INTERNET" />\n    <uses-permission android:name="android.permission.VIBRATE" />'],
]);
patch(join(MAIN, "res", "values", "styles.xml"), [
  ['<item name="android:background">@null</item>',
   '<item name="android:background">@null</item>\n        <item name="android:windowBackground">@color/ic_launcher_background</item>'],
  ['<item name="android:background">@drawable/splash</item>',
   '<item name="android:background">@drawable/splash</item>\n        <item name="windowSplashScreenBackground">@color/ic_launcher_background</item>\n        <item name="windowSplashScreenAnimatedIcon">@mipmap/ic_launcher_foreground</item>\n        <item name="postSplashScreenTheme">@style/AppTheme.NoActionBar</item>'],
]);

// Llave de firma: se crea una sola vez. ¡Respáldala! Sin ella no se puede actualizar el APK instalado.
const JAVA = findJava21();
const keys = join(APK, "keys");
const props = join(keys, "keystore.properties");
if (!existsSync(props)) {
  step("Creando la llave de firma (una sola vez)");
  mkdirSync(keys, { recursive: true });
  const pass = randomBytes(18).toString("hex");
  sh(`"${join(JAVA, "bin", "keytool")}" -genkeypair -v -keystore "${join(keys, "python-go.jks")}" -alias pythongo -keyalg RSA -keysize 2048 -validity 10000 -storepass ${pass} -keypass ${pass} -dname "CN=Python GO, O=dponch-00, C=MX"`, { stdio: "ignore" });
  writeFileSync(props, `storeFile=python-go.jks\nstorePassword=${pass}\nkeyAlias=pythongo\nkeyPassword=${pass}\n`);
}

const gradleFile = join(AND, "app", "build.gradle");
let gradle = readFileSync(gradleFile, "utf8")
  .replace(/versionCode \d+/, `versionCode ${VERSION_CODE}`)
  .replace(/versionName "[^"]*"/, `versionName "${VERSION}"`);
writeFileSync(gradleFile, gradle);
patch(gradleFile, [
  ["android {\n",
   `def keyProps = new Properties()
def keyFile = rootProject.file("../keys/keystore.properties")
if (keyFile.exists()) keyProps.load(new FileInputStream(keyFile))

android {
    signingConfigs {
        release {
            if (keyFile.exists()) {
                storeFile rootProject.file("../keys/" + keyProps["storeFile"])
                storePassword keyProps["storePassword"]
                keyAlias keyProps["keyAlias"]
                keyPassword keyProps["keyPassword"]
            }
        }
    }
`],
  ["        release {\n            minifyEnabled false",
   "        release {\n            signingConfig signingConfigs.release\n            minifyEnabled false"],
]);

// 4. Sincronizar y compilar
step("Sincronizando con Capacitor");
sh("npx cap sync android", { cwd: APK });

step("Compilando el APK (la primera vez descarga Gradle y tarda unos minutos)");
const env = { ...process.env, JAVA_HOME: JAVA, ANDROID_HOME: process.env.ANDROID_HOME || "C:\\Android\\Sdk" };
// Ruta completa: algunos entornos no buscan ejecutables en la carpeta actual.
const gradlew = join(AND, process.platform === "win32" ? "gradlew.bat" : "gradlew");
sh(`"${gradlew}" assembleRelease`, { cwd: AND, env });

const out = join(AND, "app", "build", "outputs", "apk", "release", "app-release.apk");
mkdirSync(join(ROOT, "dist"), { recursive: true });
const final = join(ROOT, "dist", `PythonGO-${VERSION}.apk`);
copyFileSync(out, final);
step(`Listo: ${final}`);
