// Etiqueta de plantilla para escribir código Python indentado dentro del JS.
// Quita la sangría común y las líneas vacías del principio y del final.
// Usa String.raw para que "\n" dentro del código Python llegue tal cual a Python.
export function py(strings, ...vals) {
  const raw = String.raw({ raw: strings.raw }, ...vals);
  const lines = raw.split("\n");
  while (lines.length && !lines[0].trim()) lines.shift();
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
  const indent = Math.min(
    ...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length)
  );
  return lines.map((l) => l.slice(indent)).join("\n");
}

// Salidas esperadas generadas (para no escribirlas a mano).
export function tabla(n) {
  return Array.from({ length: 10 }, (_, k) => `${n} x ${k + 1} = ${n * (k + 1)}`).join("\n");
}

export function fizzbuzz(n) {
  const out = [];
  for (let i = 1; i <= n; i++) {
    out.push(i % 15 === 0 ? "FizzBuzz" : i % 3 === 0 ? "Fizz" : i % 5 === 0 ? "Buzz" : String(i));
  }
  return out.join("\n");
}
