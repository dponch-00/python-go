// Ruta de Algoritmos: 6 mundos de acertijos clásicos (estilo CheckiO / Codewars).
// `needs` = nivel de Fundamentos que hay que vencer para entrar.
import { py } from "./py.js";

export const ALGO_WORLDS = [
  {
    id: 11, track: "algo", short: "A1", art: "abacus", needs: "5-10",
    name: "Cueva del Contador",
    topic: "matemáticas y dígitos",
    hue: 45,
    levels: [
      {
        id: "11-1", t: "choice", title: "Suma de dígitos",
        learn: "Un truco clásico: `n % 10` da el último dígito y `n // 10` lo quita. Repitiendo, recorres todos los dígitos de un número.",
        q: "¿Qué muestra este programa?",
        code: py`
          n = 4071
          suma = 0
          while n > 0:
              suma += n % 10
              n //= 10
          print(suma)
        `,
        opts: ["12", "1740", "4", "13"], a: 0,
        hint: "Suma los dígitos 4, 0, 7 y 1.",
        why: "El bucle toma 1, luego 7, luego 0 y luego 4, y los va sumando: 12.",
      },
      {
        id: "11-2", t: "input", title: "Contar divisores",
        q: "Escribe exactamente lo que se imprime.",
        code: py`
          n = 36
          divisores = 0
          for d in range(1, n + 1):
              if n % d == 0:
                  divisores += 1
          print(divisores)
        `,
        a: "9",
        hint: "Los divisores de 36 van en parejas: 1×36, 2×18, 3×12, 4×9… y 6×6.",
        why: "36 tiene 9 divisores: 1, 2, 3, 4, 6, 9, 12, 18 y 36.",
      },
      {
        id: "11-3", t: "fill", title: "Algoritmo de Euclides",
        learn: "El **máximo común divisor** (MCD) de a y b es el mismo que el de b y `a % b`. Se repite hasta que b vale 0. Es uno de los algoritmos más antiguos: ¡tiene más de 2,000 años!",
        q: "Completa el algoritmo de Euclides para obtener el MCD de 48 y 18.",
        code: py`
          a, b = 48, 18
          while b != 0:
              a, b = b, a % ___
          print(a)
        `,
        goal: "6",
        blanks: [["b"]],
        bank: ["b", "a", "2", "10"],
        hint: "El nuevo b es el residuo de dividir a entre b.",
        why: "(48, 18) → (18, 12) → (12, 6) → (6, 0). Cuando b llega a 0, a es el MCD: 6.",
      },
      {
        id: "11-4", t: "order", title: "Número al revés",
        q: "Ordena las líneas para invertir los dígitos de 1234.",
        head: ["n = 1234"],
        lines: [
          "rev = 0",
          "while n > 0:",
          "    rev = rev * 10 + n % 10",
          "    n = n // 10",
          "print(rev)",
        ],
        goal: "4321",
        hint: "Primero agregas el último dígito a rev y después lo quitas de n.",
        why: "En cada vuelta rev se corre un lugar a la izquierda (×10) y recibe el último dígito de n.",
      },
      {
        id: "11-5", t: "bug", title: "Collatz con decimales",
        learn: "La **conjetura de Collatz**: si n es par, divídelo entre 2; si es impar, calcula 3n + 1. Nadie ha encontrado un número que no llegue a 1.",
        q: "La secuencia sale con decimales. Toca la línea culpable.",
        code: py`
          n = 6
          while n != 1:
              if n % 2 == 0:
                  n = n / 2
              else:
                  n = 3 * n + 1
              print(n, end=" ")
        `,
        line: 4,
        fix: py`
          n = 6
          while n != 1:
              if n % 2 == 0:
                  n = n // 2
              else:
                  n = 3 * n + 1
              print(n, end=" ")
        `,
        goal: "3 10 5 16 8 4 2 1",
        hint: "¿Qué división devuelve siempre un float?",
        why: "`/` siempre da float (3.0). Para enteros usa `//`.",
      },
      {
        id: "11-6", t: "code", title: "Laboratorio: Números perfectos",
        q: "Un número es **perfecto** si es igual a la suma de sus divisores propios (sin contarse a sí mismo): 6 = 1 + 2 + 3. Escribe `es_perfecto(n)`.",
        goal: "es_perfecto(28) → True y es_perfecto(12) → False",
        starter: py`
          def es_perfecto(n):
              suma = 0
              return False
        `,
        tests: [
          { ex: "es_perfecto(6)", eq: "True" },
          { ex: "es_perfecto(28)", eq: "True" },
          { ex: "es_perfecto(496)", eq: "True" },
          { ex: "es_perfecto(12)", eq: "False" },
          { ex: "es_perfecto(1)", eq: "False" },
        ],
        sol: py`
          def es_perfecto(n):
              suma = 0
              for d in range(1, n):
                  if n % d == 0:
                      suma += d
              return n > 1 and suma == n
        `,
        hint: "Recorre d desde 1 hasta n - 1 y suma los que dividen a n. Cuidado con el 1.",
        why: "Solo se conocen 51 números perfectos. Los griegos ya conocían 6, 28, 496 y 8128.",
      },
      {
        id: "11-7", t: "choice", title: "De decimal a binario",
        learn: "Para pasar a binario, divide entre 2 una y otra vez y junta los residuos **de atrás hacia adelante**.",
        q: "¿Qué muestra este programa?",
        code: py`
          n = 13
          bits = ""
          while n > 0:
              bits = str(n % 2) + bits
              n //= 2
          print(bits)
        `,
        opts: ["1101", "1011", "13", "0b1101"], a: 0,
        hint: "Los residuos salen 1, 0, 1, 1 y se van pegando por delante.",
        why: "13 = 8 + 4 + 1 → 1101. Cada residuo nuevo se pone a la izquierda.",
      },
      {
        id: "11-8", t: "code", title: "Laboratorio: Binario a mano",
        q: 'Escribe `a_binario(n)` que devuelva el texto binario de n **sin usar** `bin()`. Para 0 debe devolver `"0"`.',
        goal: 'a_binario(13) → "1101"',
        starter: py`
          def a_binario(n):
              return ""
        `,
        tests: [
          { ex: "a_binario(5)", eq: "'101'" },
          { ex: "a_binario(13)", eq: "'1101'" },
          { ex: "a_binario(1)", eq: "'1'" },
          { ex: "a_binario(0)", eq: "'0'" },
          { ex: "a_binario(255)", eq: "'11111111'" },
          { noCall: "bin", msg: "No usa bin()" },
        ],
        sol: py`
          def a_binario(n):
              if n == 0:
                  return "0"
              bits = ""
              while n > 0:
                  bits = str(n % 2) + bits
                  n //= 2
              return bits
        `,
        hint: "Usa el mismo bucle del nivel anterior y trata el 0 como caso especial.",
        why: "Las computadoras guardan todo en binario. Ahora sabes hacer la conversión que hace `bin()` por dentro.",
      },
      {
        id: "11-9", t: "choice", title: "Criba de Eratóstenes",
        learn: "La **criba** tacha los múltiplos de cada primo. Lo que queda sin tachar son los primos. Es muchísimo más rápida que probar número por número.",
        q: "¿Qué muestra este programa?",
        code: py`
          n = 30
          es_primo = [True] * (n + 1)
          es_primo[0] = es_primo[1] = False
          for i in range(2, n + 1):
              if es_primo[i]:
                  for m in range(i * i, n + 1, i):
                      es_primo[m] = False
          print(sum(es_primo))
        `,
        opts: ["10", "11", "29", "15"], a: 0,
        hint: "sum() de una lista de booleanos cuenta los True. ¿Cuántos primos hay hasta 30?",
        why: "Hasta 30 hay 10 primos: 2, 3, 5, 7, 11, 13, 17, 19, 23 y 29. True vale 1 al sumar.",
      },
      {
        id: "11-10", t: "code", boss: true, title: "Jefe: Números felices",
        q: "Un número es **feliz** si al sumar los cuadrados de sus dígitos una y otra vez llegas a 1 (19 → 1² + 9² = 82 → 68 → 100 → 1). Si cae en un ciclo que nunca llega a 1, no es feliz. Escribe `es_feliz(n)`.",
        goal: "es_feliz(19) → True y es_feliz(2) → False",
        starter: py`
          def es_feliz(n):
              vistos = set()
              return False
        `,
        tests: [
          { ex: "es_feliz(19)", eq: "True" },
          { ex: "es_feliz(7)", eq: "True" },
          { ex: "es_feliz(1)", eq: "True" },
          { ex: "es_feliz(100)", eq: "True" },
          { ex: "es_feliz(2)", eq: "False" },
          { ex: "es_feliz(20)", eq: "False" },
        ],
        sol: py`
          def es_feliz(n):
              vistos = set()
              while n != 1 and n not in vistos:
                  vistos.add(n)
                  n = sum(int(d) ** 2 for d in str(n))
              return n == 1
        `,
        hint: "Guarda en un set los números que ya viste: si uno se repite, hay un ciclo y no es feliz.",
        why: "Detectar ciclos con un conjunto de «ya visitados» es una técnica que usarás en grafos, juegos y simulaciones.",
      },
    ],
  },
  {
    id: 12, track: "algo", short: "A2", art: "search", needs: "6-10",
    name: "Valle de las Listas",
    topic: "recorridos y dos punteros",
    hue: 165,
    levels: [
      {
        id: "12-1", t: "choice", title: "Búsqueda lineal",
        learn: "La **búsqueda lineal** revisa los elementos uno por uno hasta encontrar el que buscas. Si no está, se suele devolver -1.",
        q: "¿Qué muestra este programa?",
        code: py`
          def buscar(lista, x):
              for i in range(len(lista)):
                  if lista[i] == x:
                      return i
              return -1

          print(buscar([4, 8, 15, 16], 15), buscar([4, 8], 23))
        `,
        opts: ["2 -1", "3 -1", "2 None", "15 -1"], a: 0,
        hint: "Devuelve la posición, no el valor. Y las posiciones empiezan en 0.",
        why: "15 está en la posición 2. El 23 no aparece, así que el bucle termina y se devuelve -1.",
      },
      {
        id: "12-2", t: "fill", title: "Contar con condición",
        q: "Completa para contar los números positivos (el 0 no es positivo).",
        code: py`
          nums = [3, -1, 7, -5, 0, 2]
          positivos = 0
          for n in nums:
              if n ___ 0:
                  positivos += 1
          print(positivos)
        `,
        goal: "3",
        blanks: [[">"]],
        bank: [">", ">=", "<", "=="],
        hint: "El 0 no cuenta como positivo.",
        why: "Solo 3, 7 y 2 son mayores que 0. Con `>=` también contarías el 0.",
      },
      {
        id: "12-3", t: "input", title: "Suma acumulada",
        learn: "La **suma acumulada** (o de prefijos) guarda en cada posición la suma de todo lo anterior. Sirve para responder «¿cuánto suma este tramo?» al instante.",
        q: "Escribe exactamente lo que se imprime.",
        code: py`
          nums = [2, 5, 1, 4]
          acumulada = []
          total = 0
          for n in nums:
              total += n
              acumulada.append(total)
          print(acumulada)
        `,
        a: "[2, 7, 8, 12]",
        hint: "2, luego 2 + 5, luego 7 + 1…",
        why: "Cada número se suma al total anterior: 2, 7, 8 y 12.",
      },
      {
        id: "12-4", t: "order", title: "Dos punteros",
        learn: "Con **dos punteros**, uno al inicio y otro al final, puedes invertir una lista intercambiando y avanzando hacia el centro, sin crear otra lista.",
        q: "Ordena las líneas para invertir la lista en su lugar.",
        head: ['letras = ["a", "b", "c", "d", "e"]'],
        lines: [
          "i, j = 0, len(letras) - 1",
          "while i < j:",
          "    letras[i], letras[j] = letras[j], letras[i]",
          "    i, j = i + 1, j - 1",
          "print(letras)",
        ],
        goal: "['e', 'd', 'c', 'b', 'a']",
        hint: "Primero intercambia, luego acerca los punteros.",
        why: "i avanza y j retrocede. Cuando se cruzan en el centro, la lista ya quedó invertida.",
      },
      {
        id: "12-5", t: "bug", title: "El máximo tramposo",
        q: "Con temperaturas bajo cero el resultado sale mal. Toca la línea culpable.",
        code: py`
          temperaturas = [-5, -2, -9, -4]
          mayor = 0
          for t in temperaturas:
              if t > mayor:
                  mayor = t
          print("Máxima:", mayor)
        `,
        line: 2,
        fix: py`
          temperaturas = [-5, -2, -9, -4]
          mayor = temperaturas[0]
          for t in temperaturas:
              if t > mayor:
                  mayor = t
          print("Máxima:", mayor)
        `,
        goal: "Máxima: -2",
        hint: "¿Algún número de la lista es mayor que el valor inicial?",
        why: "Si empiezas en 0 y todos son negativos, nadie lo supera. Empieza con el primer elemento de la lista.",
      },
      {
        id: "12-6", t: "code", title: "Laboratorio: Sin repetidos",
        q: "Escribe `sin_repetidos(lista)` que devuelva una lista **nueva** sin elementos repetidos, conservando el orden de la primera aparición.",
        goal: "sin_repetidos([3, 1, 3, 2, 1]) → [3, 1, 2]",
        starter: py`
          def sin_repetidos(lista):
              return lista
        `,
        tests: [
          { ex: "sin_repetidos([3, 1, 3, 2, 1])", eq: "[3, 1, 2]" },
          { ex: "sin_repetidos(['a', 'b', 'a'])", eq: "['a', 'b']" },
          { ex: "sin_repetidos([5, 5, 5])", eq: "[5]" },
          { ex: "sin_repetidos([])", eq: "[]" },
          { run: "x = [1, 1, 2]\nsin_repetidos(x)\nassert x == [1, 1, 2], 'se modificó la lista original'", msg: "No modifica la lista original" },
        ],
        sol: py`
          def sin_repetidos(lista):
              vistos = set()
              resultado = []
              for x in lista:
                  if x not in vistos:
                      vistos.add(x)
                      resultado.append(x)
              return resultado
        `,
        hint: "Usa un set para recordar lo que ya viste y una lista nueva para el resultado.",
        why: "`list(set(lista))` también quita repetidos, pero pierde el orden. Un set es ideal para preguntar «¿ya lo vi?» rápido.",
      },
      {
        id: "12-7", t: "choice", title: "Ventana deslizante",
        learn: "Una **ventana deslizante** recorre bloques consecutivos: al avanzar, suma el elemento que entra y resta el que sale, sin volver a sumar todo.",
        q: "¿Qué muestra este programa? (mayor suma de 3 elementos seguidos)",
        code: py`
          nums = [1, 3, 2, 6, 4]
          k = 3
          suma = sum(nums[:k])
          mejor = suma
          for i in range(k, len(nums)):
              suma += nums[i] - nums[i - k]
              mejor = max(mejor, suma)
          print(mejor)
        `,
        opts: ["12", "11", "16", "6"], a: 0,
        hint: "Las ventanas son [1, 3, 2], [3, 2, 6] y [2, 6, 4].",
        why: "Las sumas son 6, 11 y 12. La mejor es 12, y se calculó sin volver a sumar cada ventana entera.",
      },
      {
        id: "12-8", t: "code", title: "Laboratorio: Dos que suman",
        q: "Escribe `dos_suma(nums, objetivo)` que devuelva una tupla `(i, j)` con i < j tal que `nums[i] + nums[j] == objetivo`. Hay como máximo una pareja válida; si no hay ninguna, devuelve `None`.",
        goal: "dos_suma([2, 7, 11, 15], 9) → (0, 1)",
        starter: py`
          def dos_suma(nums, objetivo):
              return None
        `,
        tests: [
          { ex: "dos_suma([2, 7, 11, 15], 9)", eq: "(0, 1)" },
          { ex: "dos_suma([3, 2, 4], 6)", eq: "(1, 2)" },
          { ex: "dos_suma([5, 5], 10)", eq: "(0, 1)" },
          { ex: "dos_suma([1, 5, 3], 100)", eq: "None" },
        ],
        sol: py`
          def dos_suma(nums, objetivo):
              for i in range(len(nums)):
                  for j in range(i + 1, len(nums)):
                      if nums[i] + nums[j] == objetivo:
                          return (i, j)
              return None
        `,
        hint: "Con dos bucles anidados pruebas todas las parejas: j empieza en i + 1.",
        why: "Tu solución prueba todas las parejas. Con un diccionario de «lo que me falta» se resuelve en una sola pasada: es un clásico de entrevistas.",
      },
      {
        id: "12-9", t: "choice", title: "¿Está ordenada?",
        q: "¿Qué muestra este programa?",
        code: py`
          def ordenada(lista):
              return all(lista[i] <= lista[i + 1] for i in range(len(lista) - 1))

          print(ordenada([1, 2, 2, 5]), ordenada([3, 1]), ordenada([]))
        `,
        opts: ["True False True", "True False False", "False False True", "(error)"], a: 0,
        hint: "all() de una lista vacía es True: no hay nada que lo contradiga.",
        why: "Se comparan vecinos. [1, 2, 2, 5] no baja nunca; [3, 1] sí; y una lista vacía se considera ordenada.",
      },
      {
        id: "12-10", t: "code", boss: true, title: "Jefe: La mejor racha",
        q: "`cambios` son las ganancias y pérdidas de cada día. Escribe `mejor_racha(cambios)` que devuelva la **mayor suma de días consecutivos** (al menos un día).",
        goal: "mejor_racha([-2, 1, -3, 4, -1, 2, 1, -5, 4]) → 6  (4 - 1 + 2 + 1)",
        starter: py`
          def mejor_racha(cambios):
              mejor = cambios[0]
              return mejor
        `,
        tests: [
          { ex: "mejor_racha([-2, 1, -3, 4, -1, 2, 1, -5, 4])", eq: "6" },
          { ex: "mejor_racha([5])", eq: "5" },
          { ex: "mejor_racha([-3, -1, -2])", eq: "-1" },
          { ex: "mejor_racha([2, 3, -10, 4])", eq: "5" },
          { ex: "mejor_racha([1, 2, 3])", eq: "6" },
        ],
        sol: py`
          def mejor_racha(cambios):
              mejor = actual = cambios[0]
              for x in cambios[1:]:
                  actual = max(x, actual + x)
                  mejor = max(mejor, actual)
              return mejor
        `,
        hint: "Recorre una vez: la racha actual es «el día de hoy solo» o «la racha anterior + hoy», lo que sea mayor.",
        why: "Es el **algoritmo de Kadane**: resuelve el problema en una sola pasada, en vez de probar todos los tramos posibles.",
      },
    ],
  },
  {
    id: 13, track: "algo", short: "A3", art: "key", needs: "7-10",
    name: "Biblioteca Secreta",
    topic: "cadenas, cifrados y pilas",
    hue: 290,
    levels: [
      {
        id: "13-1", t: "choice", title: "¿Palíndromo?",
        learn: "Un **palíndromo** se lee igual al derecho y al revés: «oso», «reconocer», «Anita lava la tina».",
        q: "¿Qué muestra este programa?",
        code: py`
          def es_palindromo(t):
              t = t.lower().replace(" ", "")
              return t == t[::-1]

          print(es_palindromo("Anita lava la tina"), es_palindromo("Python"))
        `,
        opts: ["True False", "False False", "True True", "(error)"], a: 0,
        hint: "Primero se quitan espacios y mayúsculas.",
        why: "«anitalavalatina» al revés es igual. «python» al revés es «nohtyp».",
      },
      {
        id: "13-2", t: "fill", title: "Anagramas",
        learn: "Dos palabras son **anagramas** si tienen las mismas letras en distinto orden: «amor» y «roma».",
        q: "Completa para comprobar si son anagramas.",
        code: py`
          a, b = "amor", "roma"
          print(sorted(a) == ___(b))
        `,
        goal: "True",
        blanks: [["sorted"]],
        bank: ["sorted", "list", "set", "reversed"],
        hint: "Compara las letras de ambas palabras puestas en el mismo orden.",
        why: "Si al ordenar las letras de ambas palabras quedan iguales, son anagramas.",
      },
      {
        id: "13-3", t: "input", title: "Contar vocales",
        q: "Escribe exactamente lo que se imprime.",
        code: py`
          texto = "Programar es divertido"
          print(sum(1 for c in texto.lower() if c in "aeiou"))
        `,
        a: "8",
        hint: "Cuenta las a, e, i, o, u de cada palabra.",
        why: "«programar» tiene 3, «es» 1 y «divertido» 4: en total 8.",
      },
      {
        id: "13-4", t: "order", title: "Comprimir texto",
        learn: "La compresión **RLE** cambia las repeticiones por un conteo: «aaabb» → «a3b2».",
        q: "Ordena las líneas para comprimir el texto.",
        head: ['texto = "aaabccdd"'],
        lines: [
          'resultado, i = "", 0',
          "while i < len(texto):",
          "    j = i",
          "    while j < len(texto) and texto[j] == texto[i]:",
          "        j += 1",
          "    resultado += texto[i] + str(j - i)",
          "    i = j",
          "print(resultado)",
        ],
        goal: "a3b1c2d2",
        hint: "j avanza mientras la letra se repite; luego se anota la letra y cuántas veces salió.",
        why: "i marca el inicio de cada grupo y j su final. j - i es el tamaño del grupo.",
      },
      {
        id: "13-5", t: "bug", title: "César se pasó de la z",
        learn: "El **cifrado César** mueve cada letra k lugares en el alfabeto. Al pasar de la «z» debe volver a la «a».",
        q: "Cifrar «xyz» debería dar «abc». Toca la línea con el error.",
        code: py`
          def cesar(texto, k):
              res = ""
              for c in texto:
                  res += chr((ord(c) - ord("a") + k) + ord("a"))
              return res

          print(cesar("xyz", 3))
        `,
        line: 4,
        fix: py`
          def cesar(texto, k):
              res = ""
              for c in texto:
                  res += chr((ord(c) - ord("a") + k) % 26 + ord("a"))
              return res

          print(cesar("xyz", 3))
        `,
        goal: "abc",
        hint: "Hay 26 letras. ¿Qué operación hace que después de la 25 vuelva a la 0?",
        why: "Sin `% 26` la posición se sale del alfabeto y aparecen símbolos como «{». El residuo hace que dé la vuelta.",
      },
      {
        id: "13-6", t: "code", title: "Laboratorio: Cifrado César",
        q: "Escribe `cifrar(texto, k)`: mueve cada letra minúscula k lugares (dando la vuelta después de la z). Los espacios y otros caracteres no cambian.",
        goal: 'cifrar("hola", 1) → "ipmb"',
        starter: py`
          def cifrar(texto, k):
              res = ""
              return res
        `,
        tests: [
          { ex: "cifrar('hola', 1)", eq: "'ipmb'" },
          { ex: "cifrar('xyz', 2)", eq: "'zab'" },
          { ex: "cifrar('hola mundo', 13)", eq: "'ubyn zhaqb'" },
          { ex: "cifrar('abc', 26)", eq: "'abc'" },
          { ex: "cifrar('a-b', 1)", eq: "'b-c'" },
        ],
        sol: py`
          def cifrar(texto, k):
              res = ""
              for c in texto:
                  if "a" <= c <= "z":
                      res += chr((ord(c) - ord("a") + k) % 26 + ord("a"))
                  else:
                      res += c
              return res
        `,
        hint: "Solo transforma los caracteres entre «a» y «z»; los demás agrégalos tal cual.",
        why: "Julio César usaba k = 3 para sus mensajes. Con k = 13 (ROT13) cifrar dos veces devuelve el texto original.",
      },
      {
        id: "13-7", t: "choice", title: "La pila",
        learn: "Una **pila** funciona como una torre de platos: el último que pones es el primero que sacas. En Python: `append` pone y `pop` saca.",
        q: "¿Qué muestra este programa?",
        code: py`
          pila = []
          for x in [1, 2, 3]:
              pila.append(x)
          pila.pop()
          pila.append(4)
          print(pila.pop(), pila)
        `,
        opts: ["4 [1, 2]", "1 [2, 4]", "4 [1, 2, 3]", "3 [1, 2, 4]"], a: 0,
        hint: "pop() siempre saca el último elemento.",
        why: "[1, 2, 3] → pop saca 3 → [1, 2] → append 4 → [1, 2, 4] → pop saca 4 y quedan [1, 2].",
      },
      {
        id: "13-8", t: "code", title: "Laboratorio: Paréntesis balanceados",
        q: "Escribe `balanceado(s)` que devuelva `True` si cada `(`, `[` y `{` se cierra con su pareja y en el orden correcto. Ignora los demás caracteres.",
        goal: 'balanceado("([]{})") → True y balanceado("([)]") → False',
        starter: py`
          def balanceado(s):
              pila = []
              return True
        `,
        tests: [
          { ex: "balanceado('([]{})')", eq: "True" },
          { ex: "balanceado('([)]')", eq: "False" },
          { ex: "balanceado('((')", eq: "False" },
          { ex: "balanceado('}')", eq: "False" },
          { ex: "balanceado('')", eq: "True" },
          { ex: "balanceado('a(b[c]d)e')", eq: "True" },
        ],
        sol: py`
          def balanceado(s):
              pares = {")": "(", "]": "[", "}": "{"}
              pila = []
              for c in s:
                  if c in "([{":
                      pila.append(c)
                  elif c in pares:
                      if not pila or pila.pop() != pares[c]:
                          return False
              return not pila
        `,
        hint: "Al abrir, apila. Al cerrar, el último abierto debe ser su pareja. Al final la pila debe quedar vacía.",
        why: "Así revisan los editores de código y los compiladores que tus paréntesis cuadren.",
      },
      {
        id: "13-9", t: "input", title: "Números romanos",
        q: "Escribe exactamente lo que se imprime.",
        code: py`
          valores = {"I": 1, "V": 5, "X": 10}
          total = 0
          for c in "XVI":
              total += valores[c]
          print(total)
        `,
        a: "16",
        hint: "X + V + I.",
        why: "10 + 5 + 1 = 16. Pero ojo: en «IV» la I resta… eso lo resuelves en el jefe.",
      },
      {
        id: "13-10", t: "code", boss: true, title: "Jefe: Romanos de verdad",
        q: "Escribe `romano_a_entero(s)`. Si un símbolo vale menos que el siguiente, se **resta** (IV = 4, XC = 90, CM = 900).",
        goal: 'romano_a_entero("MCMXCIV") → 1994',
        starter: py`
          def romano_a_entero(s):
              v = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
              total = 0
              return total
        `,
        tests: [
          { ex: "romano_a_entero('III')", eq: "3" },
          { ex: "romano_a_entero('IV')", eq: "4" },
          { ex: "romano_a_entero('IX')", eq: "9" },
          { ex: "romano_a_entero('LVIII')", eq: "58" },
          { ex: "romano_a_entero('MCMXCIV')", eq: "1994" },
          { ex: "romano_a_entero('MMXXVI')", eq: "2026" },
        ],
        sol: py`
          def romano_a_entero(s):
              v = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
              total = 0
              for i, c in enumerate(s):
                  if i + 1 < len(s) and v[c] < v[s[i + 1]]:
                      total -= v[c]
                  else:
                      total += v[c]
              return total
        `,
        hint: "Recorre con enumerate y mira el siguiente símbolo: si es mayor, resta el actual; si no, súmalo.",
        why: "Mirar «un paso adelante» (lookahead) es una técnica común al leer textos con reglas.",
      },
    ],
  },
  {
    id: 14, track: "algo", short: "A4", art: "chart", needs: "8-10",
    name: "Torre del Orden",
    topic: "búsqueda y ordenamiento",
    hue: 230,
    levels: [
      {
        id: "14-1", t: "choice", title: "Búsqueda binaria",
        learn: "En una lista **ordenada**, la búsqueda binaria mira el centro y descarta la mitad donde no puede estar. ¡Muy rápida!",
        q: "¿Qué muestra este programa?",
        code: py`
          lista = [3, 8, 12, 17, 21, 30, 44]
          x = 30
          izq, der = 0, len(lista) - 1
          pasos = 0
          while izq <= der:
              pasos += 1
              medio = (izq + der) // 2
              if lista[medio] == x:
                  break
              elif lista[medio] < x:
                  izq = medio + 1
              else:
                  der = medio - 1
          print(medio, pasos)
        `,
        opts: ["5 2", "5 6", "6 2", "4 3"], a: 0,
        hint: "Primero mira la posición 3 (el 17). Como 17 < 30, busca en la mitad derecha.",
        why: "Paso 1: centro 3 (17 < 30). Paso 2: centro 5 (¡30!). Una búsqueda uno por uno habría necesitado 6 pasos.",
      },
      {
        id: "14-2", t: "order", title: "Arma la búsqueda binaria",
        q: "Ordena el cuerpo del bucle de la búsqueda binaria.",
        head: [
          "def buscar(lista, x):",
          "    izq, der = 0, len(lista) - 1",
          "    while izq <= der:",
        ],
        lines: [
          "        medio = (izq + der) // 2",
          "        if lista[medio] == x:",
          "            return medio",
          "        elif lista[medio] < x:",
          "            izq = medio + 1",
          "        else:",
          "            der = medio - 1",
        ],
        tail: [
          "    return -1",
          "nums = [2, 5, 9, 14, 20, 31, 47]",
          "print(buscar(nums, 14), buscar(nums, 2), buscar(nums, 47), buscar(nums, 10))",
        ],
        goal: "3 0 6 -1",
        hint: "Calcula el centro, revisa si lo encontraste y luego decide qué mitad descartar.",
        why: "Si el centro es menor que x, x solo puede estar a la derecha (izq sube); si no, a la izquierda (der baja).",
      },
      {
        id: "14-3", t: "bug", title: "Búsqueda sin fin",
        q: "Este programa se queda atorado para siempre. Toca la línea culpable.",
        code: py`
          lista = [1, 4, 7, 10, 13]
          x = 13
          izq, der = 0, len(lista) - 1
          while izq <= der:
              medio = (izq + der) // 2
              if lista[medio] == x:
                  print("Posición", medio)
                  break
              elif lista[medio] < x:
                  izq = medio
              else:
                  der = medio - 1
        `,
        line: 10,
        fix: py`
          lista = [1, 4, 7, 10, 13]
          x = 13
          izq, der = 0, len(lista) - 1
          while izq <= der:
              medio = (izq + der) // 2
              if lista[medio] == x:
                  print("Posición", medio)
                  break
              elif lista[medio] < x:
                  izq = medio + 1
              else:
                  der = medio - 1
        `,
        goal: "Posición 4",
        hint: "Si ya revisaste el centro, ¿debería volver a entrar en el rango?",
        why: "Con `izq = medio` el rango deja de achicarse (medio se queda en 3). Siempre hay que excluir el centro ya revisado: `medio + 1`.",
      },
      {
        id: "14-4", t: "choice", title: "Una pasada de burbuja",
        learn: "El ordenamiento de **burbuja** compara vecinos y los intercambia si están al revés. En cada pasada, el mayor «flota» hasta el final.",
        q: "¿Cómo queda la lista después de UNA pasada?",
        code: py`
          nums = [5, 1, 4, 2]
          for i in range(len(nums) - 1):
              if nums[i] > nums[i + 1]:
                  nums[i], nums[i + 1] = nums[i + 1], nums[i]
          print(nums)
        `,
        opts: ["[1, 4, 2, 5]", "[1, 2, 4, 5]", "[1, 5, 4, 2]", "[5, 4, 2, 1]"], a: 0,
        hint: "El 5 va avanzando: cambia con el 1, luego con el 4, luego con el 2.",
        why: "Una sola pasada garantiza que el mayor (5) llegue al final, pero el resto aún no está ordenado.",
      },
      {
        id: "14-5", t: "fill", title: "Ordenamiento por selección",
        learn: "**Selección**: en cada paso busca el menor de lo que falta y ponlo en su lugar.",
        q: "Completa el intercambio.",
        code: py`
          nums = [29, 10, 14, 37, 13]
          for i in range(len(nums)):
              m = i
              for j in range(i + 1, len(nums)):
                  if nums[j] < nums[m]:
                      m = j
              nums[i], nums[m] = nums[m], nums[___]
          print(nums)
        `,
        goal: "[10, 13, 14, 29, 37]",
        blanks: [["i"]],
        bank: ["i", "j", "m", "0"],
        hint: "Es un intercambio entre la posición i y la del menor (m).",
        why: "`a, b = b, a` intercambia. Aquí se intercambian nums[i] y nums[m].",
      },
      {
        id: "14-6", t: "code", title: "Laboratorio: Burbuja",
        q: "Escribe `burbuja(lista)` que ordene la lista de menor a mayor **sin usar** `sorted()` ni `.sort()`, y la devuelva.",
        goal: "burbuja([5, 1, 4, 2, 8]) → [1, 2, 4, 5, 8]",
        starter: py`
          def burbuja(lista):
              n = len(lista)
              return lista
        `,
        tests: [
          { ex: "burbuja([5, 1, 4, 2, 8])", eq: "[1, 2, 4, 5, 8]" },
          { ex: "burbuja([3, 3, 1])", eq: "[1, 3, 3]" },
          { ex: "burbuja([-1, -5])", eq: "[-5, -1]" },
          { ex: "burbuja([])", eq: "[]" },
          { noCall: "sorted", msg: "No usa sorted()" },
          { noAttr: "sort", msg: "No usa .sort()" },
        ],
        sol: py`
          def burbuja(lista):
              n = len(lista)
              for pasada in range(n - 1):
                  for i in range(n - 1 - pasada):
                      if lista[i] > lista[i + 1]:
                          lista[i], lista[i + 1] = lista[i + 1], lista[i]
              return lista
        `,
        hint: "Repite la pasada del nivel 4 varias veces (n - 1 pasadas bastan).",
        why: "Burbuja es fácil de entender pero lenta: con n elementos hace unas n² comparaciones.",
      },
      {
        id: "14-7", t: "choice", title: "¿Cuántos pasos?",
        learn: "La búsqueda binaria parte el problema a la mitad en cada paso: con n elementos necesita unos log₂(n) pasos.",
        q: "¿Qué muestra este programa?",
        code: py`
          import math
          for n in [8, 1024, 1_000_000]:
              print(n, math.ceil(math.log2(n)))
        `,
        opts: [
          "8 3\n1024 10\n1000000 20",
          "8 8\n1024 1024\n1000000 1000000",
          "8 4\n1024 11\n1000000 21",
          "8 3\n1024 10\n1000000 500000",
        ], a: 0,
        hint: "¿Cuántas veces partes 8 a la mitad hasta llegar a 1?",
        why: "¡Un millón de elementos en solo 20 pasos! Una búsqueda uno por uno podría necesitar un millón.",
      },
      {
        id: "14-8", t: "code", title: "Laboratorio: Búsqueda binaria",
        q: "Escribe `buscar(lista, x)` que devuelva la posición de x en la lista **ordenada**, o -1 si no está. Usa búsqueda binaria (sin `.index()`).",
        goal: "buscar([1, 3, 5, 7, 9], 7) → 3",
        starter: py`
          def buscar(lista, x):
              izq, der = 0, len(lista) - 1
              return -1
        `,
        tests: [
          { ex: "buscar([1, 3, 5, 7, 9], 7)", eq: "3" },
          { ex: "buscar([1, 3, 5, 7, 9], 1)", eq: "0" },
          { ex: "buscar([1, 3, 5, 7, 9], 9)", eq: "4" },
          { ex: "buscar([1, 3, 5, 7, 9], 4)", eq: "-1" },
          { ex: "buscar([], 5)", eq: "-1" },
          { ex: "buscar(list(range(0, 100000, 2)), 77776)", eq: "38888" },
          { noAttr: "index", msg: "No usa .index()" },
        ],
        sol: py`
          def buscar(lista, x):
              izq, der = 0, len(lista) - 1
              while izq <= der:
                  medio = (izq + der) // 2
                  if lista[medio] == x:
                      return medio
                  if lista[medio] < x:
                      izq = medio + 1
                  else:
                      der = medio - 1
              return -1
        `,
        hint: "Mientras izq <= der: calcula el medio, compara y mueve izq o der.",
        why: "Tu búsqueda encontró un elemento entre 50,000 en unos 16 pasos.",
      },
      {
        id: "14-9", t: "code", title: "Laboratorio: Mezclar ordenadas",
        q: "Escribe `mezclar(a, b)` que reciba dos listas **ya ordenadas** y devuelva una sola lista ordenada, sin `sorted()` ni `.sort()`. Es el corazón del *merge sort*.",
        goal: "mezclar([1, 4, 9], [2, 3, 10]) → [1, 2, 3, 4, 9, 10]",
        starter: py`
          def mezclar(a, b):
              i = j = 0
              res = []
              return res
        `,
        tests: [
          { ex: "mezclar([1, 4, 9], [2, 3, 10])", eq: "[1, 2, 3, 4, 9, 10]" },
          { ex: "mezclar([], [1, 2])", eq: "[1, 2]" },
          { ex: "mezclar([5], [])", eq: "[5]" },
          { ex: "mezclar([1, 1], [1])", eq: "[1, 1, 1]" },
          { noCall: "sorted", msg: "No usa sorted()" },
          { noAttr: "sort", msg: "No usa .sort()" },
        ],
        sol: py`
          def mezclar(a, b):
              i = j = 0
              res = []
              while i < len(a) and j < len(b):
                  if a[i] <= b[j]:
                      res.append(a[i])
                      i += 1
                  else:
                      res.append(b[j])
                      j += 1
              return res + a[i:] + b[j:]
        `,
        hint: "Dos punteros: toma siempre el menor de a[i] y b[j]. Al final, agrega lo que sobre.",
        why: "Mezclar dos listas ordenadas cuesta solo una pasada. Por eso merge sort es tan eficiente.",
      },
      {
        id: "14-10", t: "code", boss: true, title: "Jefe: Merge sort",
        q: "Escribe `ordenar(lista)` con **merge sort**: si tiene 0 o 1 elementos ya está ordenada; si no, divide a la mitad, ordena cada mitad llamando a `ordenar` y mézclalas.",
        goal: "ordenar([38, 27, 43, 3, 9, 82, 10]) → [3, 9, 10, 27, 38, 43, 82]",
        starter: py`
          def ordenar(lista):
              if len(lista) <= 1:
                  return lista
              medio = len(lista) // 2
              return lista
        `,
        tests: [
          { ex: "ordenar([38, 27, 43, 3, 9, 82, 10])", eq: "[3, 9, 10, 27, 38, 43, 82]" },
          { ex: "ordenar([5, -2, 5, 0])", eq: "[-2, 0, 5, 5]" },
          { ex: "ordenar([])", eq: "[]" },
          { check: "ordenar(list(range(2000, 0, -1))) == list(range(1, 2001))", msg: "Ordena 2,000 números" },
          { recursive: "ordenar", msg: "ordenar se llama a sí misma" },
          { noCall: "sorted", msg: "No usa sorted()" },
          { noAttr: "sort", msg: "No usa .sort()" },
        ],
        sol: py`
          def ordenar(lista):
              if len(lista) <= 1:
                  return lista
              medio = len(lista) // 2
              a = ordenar(lista[:medio])
              b = ordenar(lista[medio:])
              res, i, j = [], 0, 0
              while i < len(a) and j < len(b):
                  if a[i] <= b[j]:
                      res.append(a[i])
                      i += 1
                  else:
                      res.append(b[j])
                      j += 1
              return res + a[i:] + b[j:]
        `,
        hint: "Reutiliza tu `mezclar` del nivel anterior: ordena lista[:medio] y lista[medio:] y mézclalas.",
        why: "Merge sort ordena n elementos en unos n·log₂(n) pasos: con un millón, ~20 millones en vez de un billón.",
      },
    ],
  },
  {
    id: 15, track: "algo", short: "A5", art: "dolls", needs: "8-10",
    name: "Laberinto de Espejos",
    topic: "recursión y backtracking",
    hue: 10,
    levels: [
      {
        id: "15-1", t: "choice", title: "Recursión paso a paso",
        learn: "Una función **recursiva** se llama a sí misma con un problema más pequeño, hasta llegar al **caso base**, que se resuelve directo.",
        q: "¿Qué muestra este programa?",
        code: py`
          def cuenta(n):
              if n == 0:
                  print("¡Despegue!")
                  return
              print(n)
              cuenta(n - 1)

          cuenta(3)
        `,
        opts: ["3\n2\n1\n¡Despegue!", "¡Despegue!\n1\n2\n3", "3\n2\n1\n0", "(error)"], a: 0,
        hint: "Cada llamada imprime su n antes de llamar a la siguiente.",
        why: "cuenta(3) imprime 3 y llama a cuenta(2)… hasta cuenta(0), el caso base.",
      },
      {
        id: "15-2", t: "input", title: "Suma recursiva",
        q: "Escribe exactamente lo que se imprime.",
        code: py`
          def suma(n):
              if n == 1:
                  return 1
              return n + suma(n - 1)

          print(suma(10))
        `,
        a: "55",
        hint: "Es 10 + 9 + 8 + … + 1.",
        why: "suma(10) = 10 + suma(9) = 10 + 9 + suma(8)… = 55.",
      },
      {
        id: "15-3", t: "bug", title: "Se salta el caso base",
        q: "Con números impares esto nunca termina. Toca la línea culpable.",
        code: py`
          def pares(n):
              if n == 0:
                  return
              print(n)
              pares(n - 2)

          pares(5)
        `,
        line: 2,
        fix: py`
          def pares(n):
              if n <= 0:
                  return
              print(n)
              pares(n - 2)

          pares(5)
        `,
        goal: "5\n3\n1",
        hint: "Desde 5, restando 2: 5, 3, 1, -1… ¿llega alguna vez exactamente a 0?",
        why: "El caso base nunca se cumplía (se salta el 0) y Python lanza RecursionError. Usa `<=` para atrapar todos los casos.",
      },
      {
        id: "15-4", t: "order", title: "Torres de Hanói",
        learn: "**Hanói**: para mover n discos de A a C, mueve n-1 a B, mueve el disco grande a C y luego trae los n-1 de B a C.",
        q: "Ordena para mostrar los movimientos de 2 discos.",
        lines: [
          "def hanoi(n, a, c, b):",
          "    if n > 0:",
          "        hanoi(n - 1, a, b, c)",
          '        print(a, "→", c)',
          "        hanoi(n - 1, b, c, a)",
          'hanoi(2, "A", "C", "B")',
        ],
        goal: "A → B\nA → C\nB → C",
        hint: "Primero quitas los discos de encima, luego mueves el grande, luego los regresas encima.",
        why: "Con n discos se necesitan 2ⁿ - 1 movimientos. ¡Con 64 discos tardarías 585 mil millones de años a un movimiento por segundo!",
      },
      {
        id: "15-5", t: "code", title: "Laboratorio: Potencia recursiva",
        q: "Escribe `potencia(base, exp)` **recursiva**, sin `**` ni `pow`: base⁰ = 1 y baseⁿ = base × baseⁿ⁻¹.",
        goal: "potencia(2, 10) → 1024",
        starter: py`
          def potencia(base, exp):
              if exp == 0:
                  return 1
              return base
        `,
        tests: [
          { ex: "potencia(2, 10)", eq: "1024" },
          { ex: "potencia(5, 0)", eq: "1" },
          { ex: "potencia(3, 4)", eq: "81" },
          { ex: "potencia(7, 1)", eq: "7" },
          { recursive: "potencia", msg: "potencia se llama a sí misma" },
          { noCall: "pow", msg: "No usa pow()" },
          { bans: ["Pow"], msg: "No usa **" },
        ],
        sol: py`
          def potencia(base, exp):
              if exp == 0:
                  return 1
              return base * potencia(base, exp - 1)
        `,
        hint: "Devuelve base multiplicado por la potencia con un exponente menos.",
        why: "Todo problema recursivo tiene dos partes: el caso base (exp == 0) y el paso que achica el problema.",
      },
      {
        id: "15-6", t: "choice", title: "Aplanar listas",
        q: "¿Qué muestra este programa?",
        code: py`
          def aplanar(x):
              if not isinstance(x, list):
                  return [x]
              res = []
              for e in x:
                  res += aplanar(e)
              return res

          print(aplanar([1, [2, [3, 4]], 5]))
        `,
        opts: ["[1, 2, 3, 4, 5]", "[1, [2, [3, 4]], 5]", "[1, 2, [3, 4], 5]", "(error)"], a: 0,
        hint: "Cada sublista se aplana recursivamente, sin importar lo profunda que esté.",
        why: "La recursión maneja cualquier nivel de anidación: por eso es ideal para árboles, carpetas y JSON.",
      },
      {
        id: "15-7", t: "fill", title: "Todos los subconjuntos",
        learn: "**Backtracking**: para cada elemento decides *tomarlo* o *no tomarlo*, y exploras ambos caminos.",
        q: "Completa para generar todos los subconjuntos.",
        code: py`
          def subconjuntos(nums):
              if not nums:
                  return [[]]
              resto = subconjuntos(nums[1:])
              return resto + [[nums[0]] + s for s in ___]

          print(len(subconjuntos([1, 2, 3])), subconjuntos([1, 2]))
        `,
        goal: "8 [[], [2], [1], [1, 2]]",
        blanks: [["resto"]],
        bank: ["resto", "nums", "s", "subconjuntos"],
        hint: "A cada subconjunto que no tiene el primer elemento, le agregas el primer elemento.",
        why: "Cada elemento duplica las opciones: con 3 elementos hay 2³ = 8 subconjuntos.",
      },
      {
        id: "15-8", t: "code", title: "Laboratorio: Permutaciones",
        q: "Escribe `permutaciones(texto)` que devuelva una lista con todas las formas de ordenar sus letras, sin `itertools`. El orden de la lista no importa.",
        goal: "permutaciones('abc') → las 6: abc, acb, bac, bca, cab, cba",
        starter: py`
          def permutaciones(texto):
              if len(texto) <= 1:
                  return [texto]
              res = []
              return res
        `,
        tests: [
          { check: "sorted(permutaciones('abc')) == ['abc', 'acb', 'bac', 'bca', 'cab', 'cba']", msg: "'abc' → 6 permutaciones" },
          { check: "sorted(permutaciones('ab')) == ['ab', 'ba']", msg: "'ab' → ab y ba" },
          { check: "permutaciones('x') == ['x']", msg: "'x' → ['x']" },
          { check: "len(permutaciones('abcd')) == 24", msg: "'abcd' → 24 permutaciones" },
          { noImport: "itertools", msg: "No usa itertools" },
        ],
        sol: py`
          def permutaciones(texto):
              if len(texto) <= 1:
                  return [texto]
              res = []
              for i, c in enumerate(texto):
                  for p in permutaciones(texto[:i] + texto[i + 1:]):
                      res.append(c + p)
              return res
        `,
        hint: "Para cada letra: ponla primero y agrégale cada permutación de las letras restantes.",
        why: "Con n letras hay n! permutaciones: 10 letras ya son 3,628,800. Por eso importa podar en backtracking.",
      },
      {
        id: "15-9", t: "choice", title: "Relleno por inundación",
        learn: "***Flood fill***: desde una casilla, pinta y visita recursivamente sus vecinas del mismo color. Así funciona el bote de pintura.",
        q: "¿Cuántas casillas se pintan desde (0, 0)?",
        code: py`
          mapa = [list("..#"), list(".##"), list("#..")]

          def pintar(f, c):
              if not (0 <= f < 3 and 0 <= c < 3) or mapa[f][c] != ".":
                  return 0
              mapa[f][c] = "*"
              return 1 + pintar(f + 1, c) + pintar(f - 1, c) + pintar(f, c + 1) + pintar(f, c - 1)

          print(pintar(0, 0))
        `,
        opts: ["3", "5", "4", "9"], a: 0,
        hint: "Dibuja el mapa: los puntos de abajo a la derecha están separados por muros.",
        why: "Se pintan (0,0), (0,1) y (1,0). Los puntos de la última fila no están conectados con ellos.",
      },
      {
        id: "15-10", t: "code", boss: true, title: "Jefe: Salida del laberinto",
        q: "`hay_camino(mapa, f, c)` debe decir si desde la casilla (f, c) se llega a `'S'` moviéndose arriba, abajo, izquierda o derecha, sin pasar por `'#'`. Usa recursión y recuerda las casillas visitadas.",
        goal: 'hay_camino(["..#S", ".#..", "...#"], 0, 0) → True',
        starter: py`
          def hay_camino(mapa, f, c, vistos=None):
              if vistos is None:
                  vistos = set()
              return False
        `,
        tests: [
          { check: "hay_camino(['..#S', '.#..', '...#'], 0, 0) == True", msg: "Laberinto con salida → True" },
          { check: "hay_camino(['.#S', '##.', '...'], 0, 0) == False", msg: "Encerrado → False" },
          { check: "hay_camino(['S'], 0, 0) == True", msg: "Ya estás en la salida → True" },
          { check: "hay_camino(['....', '.##.', '.#S#', '....'], 0, 0) == True", msg: "Camino largo → True" },
          { check: "hay_camino(['..#', '###', '#S.'], 0, 0) == False", msg: "Salida aislada → False" },
          { recursive: "hay_camino", msg: "hay_camino se llama a sí misma" },
        ],
        sol: py`
          def hay_camino(mapa, f, c, vistos=None):
              if vistos is None:
                  vistos = set()
              if not (0 <= f < len(mapa) and 0 <= c < len(mapa[0])):
                  return False
              if mapa[f][c] == "#" or (f, c) in vistos:
                  return False
              if mapa[f][c] == "S":
                  return True
              vistos.add((f, c))
              return (hay_camino(mapa, f + 1, c, vistos) or hay_camino(mapa, f - 1, c, vistos)
                      or hay_camino(mapa, f, c + 1, vistos) or hay_camino(mapa, f, c - 1, vistos))
        `,
        hint: "Casos base: fuera del mapa, muro o ya visitada → False; si es 'S' → True. Si no, marca y prueba los 4 vecinos.",
        why: "Esto es búsqueda en profundidad (DFS), el corazón de los solucionadores de laberintos y de muchos juegos.",
      },
    ],
  },
  {
    id: 16, track: "algo", short: "A6", art: "compass", needs: "9-10",
    name: "Cumbre Dinámica",
    topic: "memoria, programación dinámica y grafos",
    hue: 195,
    levels: [
      {
        id: "16-1", t: "choice", title: "Fibonacci lento",
        learn: "Sin memoria, `fib` recursivo **recalcula** lo mismo muchísimas veces: fib(8) se calcula 2 veces, fib(7) 3 veces…",
        q: "¿Qué muestra este programa?",
        code: py`
          llamadas = 0
          def fib(n):
              global llamadas
              llamadas += 1
              if n < 2:
                  return n
              return fib(n - 1) + fib(n - 2)

          print(fib(10), llamadas)
        `,
        opts: ["55 177", "55 10", "55 11", "89 177"], a: 0,
        hint: "El resultado es 55, pero cada llamada genera otras dos…",
        why: "¡177 llamadas para fib(10)! Para fib(40) serían más de 300 millones. La memoria lo arregla.",
      },
      {
        id: "16-2", t: "fill", title: "Con memoria",
        learn: "**Memoización**: guarda cada resultado en un diccionario y reutilízalo en vez de recalcularlo.",
        q: "Completa para reutilizar los resultados guardados.",
        code: py`
          memo = {}
          def fib(n):
              if n in memo:
                  return memo[___]
              if n < 2:
                  return n
              memo[n] = fib(n - 1) + fib(n - 2)
              return memo[n]

          print(fib(80))
        `,
        goal: "23416728348467685",
        blanks: [["n"]],
        bank: ["n", "n - 1", "0", "memo"],
        hint: "Buscas el resultado guardado para este mismo n.",
        why: "Con memoria, fib(80) se calcula en 80 pasos. Sin ella tardaría años.",
      },
      {
        id: "16-3", t: "code", title: "Laboratorio: Subir escaleras",
        q: "Puedes subir 1 o 2 escalones a la vez. Escribe `formas(n)` que diga de cuántas maneras distintas llegas al escalón n. (formas(3) = 3: 1+1+1, 1+2 y 2+1.) Debe ser rápida incluso para n = 40.",
        goal: "formas(5) → 8",
        starter: py`
          def formas(n):
              if n <= 2:
                  return n
              return formas(n - 1) + formas(n - 2)
        `,
        tests: [
          { ex: "formas(1)", eq: "1" },
          { ex: "formas(2)", eq: "2" },
          { ex: "formas(3)", eq: "3" },
          { ex: "formas(5)", eq: "8" },
          { ex: "formas(40)", eq: "165580141" },
        ],
        sol: py`
          def formas(n):
              a, b = 1, 1
              for _ in range(n - 1):
                  a, b = b, a + b
              return b
        `,
        hint: "El código inicial es correcto pero lentísimo para n = 40. Usa un bucle que guarde solo los dos últimos valores (o un diccionario de memoria).",
        why: "Al escalón n llegas desde n-1 o n-2: ¡es Fibonacci! La programación dinámica convierte algo exponencial en un simple bucle.",
      },
      {
        id: "16-4", t: "choice", title: "El voraz no siempre gana",
        learn: "Un algoritmo **voraz** toma siempre la opción que parece mejor ahora. Es rápido, pero a veces no da la mejor respuesta final.",
        q: "Con monedas de 4, 3 y 1, ¿qué monedas usa el voraz para pagar 6?",
        code: py`
          monedas = [4, 3, 1]
          total = 6
          usadas = []
          for m in monedas:
              while total >= m:
                  total -= m
                  usadas.append(m)
          print(usadas)
        `,
        opts: ["[4, 1, 1]", "[3, 3]", "[4, 3]", "[1, 1, 1, 1, 1, 1]"], a: 0,
        hint: "Primero toma todas las monedas de 4 que quepan.",
        why: "El voraz usó 3 monedas, pero la mejor respuesta es 2 (3 + 3). Para garantizar el mínimo se necesita programación dinámica.",
      },
      {
        id: "16-5", t: "code", title: "Laboratorio: Cambio mínimo",
        q: "Escribe `cambio(monedas, total)` que devuelva el **mínimo** número de monedas para formar `total`, o -1 si no se puede. Hay monedas ilimitadas de cada valor.",
        goal: "cambio([1, 3, 4], 6) → 2",
        starter: py`
          def cambio(monedas, total):
              return -1
        `,
        tests: [
          { ex: "cambio([1, 3, 4], 6)", eq: "2" },
          { ex: "cambio([1, 2, 5], 11)", eq: "3" },
          { ex: "cambio([2], 3)", eq: "-1" },
          { ex: "cambio([1], 0)", eq: "0" },
          { ex: "cambio([1, 5, 10, 25], 63)", eq: "6" },
        ],
        sol: py`
          def cambio(monedas, total):
              INF = float("inf")
              mejor = [0] + [INF] * total
              for t in range(1, total + 1):
                  for m in monedas:
                      if m <= t and mejor[t - m] + 1 < mejor[t]:
                          mejor[t] = mejor[t - m] + 1
              return mejor[total] if mejor[total] != INF else -1
        `,
        hint: "Crea una tabla `mejor` donde mejor[t] es el mínimo para pagar t. mejor[t] = 1 + el menor de mejor[t - m] para cada moneda m.",
        why: "Resolviste cada monto chico una sola vez y lo reutilizaste para los grandes: eso es programación dinámica.",
      },
      {
        id: "16-6", t: "order", title: "Tabla de Fibonacci",
        learn: "**Tabulación**: en vez de recursión con memoria, llenas una tabla de abajo hacia arriba.",
        q: "Ordena las líneas para calcular fib(10) con una tabla.",
        head: ["n = 10"],
        lines: [
          "tabla = [0] * (n + 1)",
          "tabla[1] = 1",
          "for i in range(2, n + 1):",
          "    tabla[i] = tabla[i - 1] + tabla[i - 2]",
          "print(tabla[n])",
        ],
        goal: "55",
        hint: "Los casos base (0 y 1) deben estar listos antes del bucle.",
        why: "Cada casilla se calcula con las dos anteriores, que ya están listas. Nada se calcula dos veces.",
      },
      {
        id: "16-7", t: "bug", title: "BFS que repite",
        learn: "**BFS** (búsqueda en anchura) visita un grafo por capas usando una **cola**, y marca los nodos para no visitarlos dos veces.",
        q: "El nodo 4 aparece dos veces. Toca la línea culpable.",
        code: py`
          from collections import deque
          grafo = {1: [2, 3], 2: [1, 4], 3: [1, 4], 4: [2, 3]}
          cola = deque([1])
          visto = {1}
          orden = []
          while cola:
              n = cola.popleft()
              orden.append(n)
              for v in grafo[n]:
                  if v not in orden:
                      visto.add(v)
                      cola.append(v)
          print(orden)
        `,
        line: 10,
        fix: py`
          from collections import deque
          grafo = {1: [2, 3], 2: [1, 4], 3: [1, 4], 4: [2, 3]}
          cola = deque([1])
          visto = {1}
          orden = []
          while cola:
              n = cola.popleft()
              orden.append(n)
              for v in grafo[n]:
                  if v not in visto:
                      visto.add(v)
                      cola.append(v)
          print(orden)
        `,
        goal: "[1, 2, 3, 4]",
        hint: "Se anotan los nodos en `visto`, pero ¿dónde se consulta?",
        why: "Hay que revisar `visto` (lo ya encolado), no `orden` (lo ya procesado). Si no, un nodo entra dos veces a la cola.",
      },
      {
        id: "16-8", t: "choice", title: "Distancia más corta",
        q: "¿Qué muestra este programa?",
        code: py`
          from collections import deque
          grafo = {"casa": ["parque", "tienda"], "parque": ["escuela"],
                   "tienda": ["escuela", "cine"], "escuela": ["cine"], "cine": []}
          dist = {"casa": 0}
          cola = deque(["casa"])
          while cola:
              n = cola.popleft()
              for v in grafo[n]:
                  if v not in dist:
                      dist[v] = dist[n] + 1
                      cola.append(v)
          print(dist["cine"], dist["escuela"])
        `,
        opts: ["2 2", "3 2", "2 3", "4 3"], a: 0,
        hint: "casa → tienda → cine. Y casa → parque → escuela.",
        why: "BFS encuentra la menor cantidad de pasos: al cine y a la escuela se llega en 2.",
      },
      {
        id: "16-9", t: "code", title: "Laboratorio: Contar islas",
        q: "`mapa` es una lista de textos donde `'#'` es tierra y `'.'` es agua. Escribe `contar_islas(mapa)`: cuántos grupos de tierra conectados (arriba, abajo, izquierda o derecha) hay.",
        goal: 'contar_islas(["##..", "#...", "..##", "...#"]) → 2',
        starter: py`
          def contar_islas(mapa):
              vistos = set()
              islas = 0
              return islas
        `,
        tests: [
          { check: "contar_islas(['##..', '#...', '..##', '...#']) == 2", msg: "Dos islas → 2" },
          { check: "contar_islas(['#.#', '.#.', '#.#']) == 5", msg: "Diagonales no conectan → 5" },
          { check: "contar_islas(['....']) == 0", msg: "Solo agua → 0" },
          { check: "contar_islas(['####', '####']) == 1", msg: "Todo tierra → 1" },
        ],
        sol: py`
          def contar_islas(mapa):
              vistos = set()
              islas = 0
              filas, cols = len(mapa), len(mapa[0])

              def hundir(f, c):
                  if not (0 <= f < filas and 0 <= c < cols):
                      return
                  if mapa[f][c] != "#" or (f, c) in vistos:
                      return
                  vistos.add((f, c))
                  hundir(f + 1, c)
                  hundir(f - 1, c)
                  hundir(f, c + 1)
                  hundir(f, c - 1)

              for f in range(filas):
                  for c in range(cols):
                      if mapa[f][c] == "#" and (f, c) not in vistos:
                          islas += 1
                          hundir(f, c)
              return islas
        `,
        hint: "Recorre todas las casillas. Cuando encuentres tierra no visitada, suma una isla y marca toda su región (con DFS o BFS).",
        why: "Contar componentes conectados es un clásico: sirve para mapas, redes sociales y procesamiento de imágenes.",
      },
      {
        id: "16-10", t: "code", boss: true, title: "Jefe final: El camino más corto",
        q: "En el laberinto `mapa`, `'E'` es la entrada, `'S'` la salida, `'#'` son muros y `'.'` pasillos. Escribe `camino_minimo(mapa)`: el menor número de pasos de E a S moviéndote en 4 direcciones, o -1 si no hay camino.",
        goal: 'camino_minimo(["E..#", ".#..", "...S"]) → 5',
        starter: py`
          from collections import deque

          def camino_minimo(mapa):
              return -1
        `,
        tests: [
          { check: "camino_minimo(['E..#', '.#..', '...S']) == 5", msg: "Laberinto chico → 5" },
          { check: "camino_minimo(['E#S']) == -1", msg: "Bloqueado → -1" },
          { check: "camino_minimo(['ES']) == 1", msg: "Salida al lado → 1" },
          { check: "camino_minimo(['E.#.....', '.##.###.', '....#..S']) == 13", msg: "Laberinto largo → 13" },
          { check: "camino_minimo(['S', '.', 'E']) == 2", msg: "Vertical → 2" },
        ],
        sol: py`
          from collections import deque

          def camino_minimo(mapa):
              for f, fila in enumerate(mapa):
                  if "E" in fila:
                      inicio = (f, fila.index("E"))
              dist = {inicio: 0}
              cola = deque([inicio])
              while cola:
                  f, c = cola.popleft()
                  if mapa[f][c] == "S":
                      return dist[(f, c)]
                  for df, dc in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
                      nf, nc = f + df, c + dc
                      if 0 <= nf < len(mapa) and 0 <= nc < len(mapa[0]):
                          if mapa[nf][nc] != "#" and (nf, nc) not in dist:
                              dist[(nf, nc)] = dist[(f, c)] + 1
                              cola.append((nf, nc))
              return -1
        `,
        hint: "BFS desde la E: guarda en un diccionario la distancia de cada casilla. La primera vez que sacas la S de la cola, esa es la distancia mínima.",
        why: "BFS garantiza el camino más corto en mapas sin pesos. Es lo que usan los GPS y los enemigos de los videojuegos para perseguirte.",
      },
    ],
  },
];
