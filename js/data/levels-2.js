// Mundos 6 a 10.
import { py } from "./py.js";

export const WORLDS_2 = [
  {
    id: 6,
    name: "Mercado de Listas",
    topic: "listas y tuplas",
    hue: 20,
    levels: [
      {
        id: "6-1", t: "choice", title: "Tu primera lista",
        learn: "Una lista guarda varios valores en orden: `[1, 2, 3]`. `append()` agrega un elemento al final.",
        q: "¿Qué muestra este programa?",
        code: py`
          frutas = ["manzana", "pera", "uva"]
          frutas.append("kiwi")
          print(len(frutas), frutas[-1])
        `,
        opts: ["4 kiwi", "3 uva", "4 uva", "3 kiwi"], a: 0,
        hint: "append agrega al final, así que cambia el último elemento.",
        why: "Tras el append la lista tiene 4 elementos y el último es kiwi.",
      },
      {
        id: "6-2", t: "input", title: "Rebanada de lista",
        learn: "Las listas se rebanan igual que los textos: `lista[a:b]` toma de `a` hasta antes de `b`.",
        q: "Escribe exactamente lo que se imprime.",
        code: py`
          nums = [4, 8, 15, 16, 23, 42]
          print(nums[1:4])
        `,
        a: "[8, 15, 16]",
        hint: "Posiciones 1, 2 y 3. No olvides los corchetes.",
        why: "nums[1:4] toma los elementos en las posiciones 1, 2 y 3: [8, 15, 16].",
      },
      {
        id: "6-3", t: "choice", title: "Dos nombres, una lista",
        learn: "`b = a` **no copia** una lista: los dos nombres apuntan a la misma. Para copiarla usa `a.copy()`.",
        q: "¿Qué muestra este programa?",
        code: py`
          a = [1, 2, 3]
          b = a
          b.append(4)
          print(a)
        `,
        opts: ["[1, 2, 3, 4]", "[1, 2, 3]", "[4]", "(error)"], a: 0,
        hint: "¿b es una lista nueva o otro nombre para la misma lista?",
        why: "a y b son la misma lista con dos nombres. Modificar b también modifica a.",
      },
      {
        id: "6-4", t: "fill", title: "Ordenar sin romper",
        learn: "`sorted(lista)` devuelve una lista **nueva** ordenada. `lista.sort()` ordena la original y devuelve `None`.",
        q: "Completa para obtener una copia ordenada sin tocar la original.",
        code: py`
          nums = [5, 2, 9, 1]
          ordenados = ___(nums)
          print(ordenados, nums)
        `,
        goal: "[1, 2, 5, 9] [5, 2, 9, 1]",
        blanks: [["sorted"]],
        bank: ["sorted", "list", "reversed", "max"],
        hint: "Buscas la función que devuelve una lista nueva, ya ordenada.",
        why: "sorted(nums) crea una lista ordenada y nums queda igual que antes.",
      },
      {
        id: "6-5", t: "bug", title: "Fuera de rango",
        learn: "En una lista de 3 elementos los índices válidos son 0, 1 y 2. Pedir el 3 da `IndexError`.",
        q: "Toca la línea que falla.",
        code: py`
          colores = ["rojo", "verde", "azul"]
          ultimo = colores[3]
          print("El último es", ultimo)
        `,
        line: 2,
        fix: py`
          colores = ["rojo", "verde", "azul"]
          ultimo = colores[-1]
          print("El último es", ultimo)
        `,
        goal: "El último es azul",
        hint: "Cuenta las posiciones desde 0.",
        why: "El último índice es 2 (o -1). colores[3] no existe y lanza IndexError.",
      },
      {
        id: "6-6", t: "choice", title: "Intercambio mágico",
        learn: "Puedes asignar varias variables a la vez: `a, b = 1, 2`. ¡Y hasta intercambiarlas en una línea!",
        q: "¿Qué muestra este programa?",
        code: py`
          a, b = 1, 2
          a, b = b, a
          print(a, b)
        `,
        opts: ["2 1", "1 2", "2 2", "(error)"], a: 0,
        hint: "La parte derecha se calcula completa antes de asignar.",
        why: "Python arma primero la pareja (2, 1) y luego la reparte: a = 2, b = 1.",
      },
      {
        id: "6-7", t: "code", title: "Laboratorio: Promedio",
        learn: "`sum(lista)` suma todos los elementos y `len(lista)` los cuenta.",
        pre: "notas = [8, 9, 10, 7]",
        q: "Calcula el promedio de la lista `notas`, guárdalo en la variable `promedio` y muéstralo.",
        goal: "Con [8, 9, 10, 7] el promedio es 8.5",
        starter: py`
          promedio = 0
          print(promedio)
        `,
        tests: [
          { check: "promedio == 8.5", msg: "[8, 9, 10, 7] → 8.5" },
          { pre: "notas = [10, 5]", check: "promedio == 7.5", msg: "[10, 5] → 7.5" },
          { pre: "notas = [6]", check: "promedio == 6", msg: "[6] → 6" },
        ],
        sol: py`
          promedio = sum(notas) / len(notas)
          print(promedio)
        `,
        hint: "Promedio = suma de todo ÷ cantidad de elementos.",
        why: "sum y len juntas resuelven en una línea lo que a mano sería un bucle.",
      },
      {
        id: "6-8", t: "order", title: "El mayor de todos",
        q: "Ordena el programa para encontrar el número mayor.",
        lines: [
          "nums = [7, 3, 9, 2]",
          "mayor = nums[0]",
          "for n in nums:",
          "    if n > mayor:",
          "        mayor = n",
          'print("Mayor:", mayor)',
        ],
        goal: "Mayor: 9",
        hint: "Empieza suponiendo que el primero es el mayor y luego revisa los demás.",
        why: "Se toma el primero como candidato y cada número más grande lo reemplaza.",
      },
      {
        id: "6-9", t: "choice", title: "Cremallera",
        learn: "`zip(a, b)` recorre dos listas a la vez, en parejas. Se detiene cuando la más corta se acaba.",
        q: "¿Qué muestra este programa?",
        code: py`
          nombres = ["Ana", "Luis", "Eva"]
          edades = [30, 25]
          for n, e in zip(nombres, edades):
              print(n, e)
        `,
        opts: ["Ana 30\nLuis 25", "Ana 30\nLuis 25\nEva None", "(error)", "Ana Luis Eva\n30 25"], a: 0,
        hint: "¿Qué pasa con Eva si ya no hay más edades?",
        why: "zip se detiene en la lista más corta: solo hay 2 edades, así que Eva no aparece.",
      },
      {
        id: "6-10", t: "code", boss: true, title: "Jefe: Los aprobados",
        pre: "notas = [55, 90, 72, 40, 100]",
        q: "Crea la lista `aprobados` con las notas mayores o iguales a 60 (en el mismo orden) y muestra cuántas son.",
        goal: "Con [55, 90, 72, 40, 100] → aprobados = [90, 72, 100] y muestra 3",
        starter: py`
          aprobados = []
          print(len(aprobados))
        `,
        tests: [
          { check: "aprobados == [90, 72, 100]", msg: "aprobados = [90, 72, 100]" },
          { out: "3", msg: "Muestra 3" },
          { pre: "notas = [60, 59, 61]", check: "aprobados == [60, 61]", msg: "[60, 59, 61] → [60, 61]" },
          { pre: "notas = [60, 59, 61]", out: "2", msg: "…y muestra 2" },
          { pre: "notas = []", check: "aprobados == []", msg: "Lista vacía → []" },
        ],
        sol: py`
          aprobados = []
          for n in notas:
              if n >= 60:
                  aprobados.append(n)
          print(len(aprobados))
        `,
        hint: "Recorre las notas con for y usa append cuando la nota sea >= 60.",
        why: "Recorrer, filtrar y acumular: el patrón más común al trabajar con datos.",
      },
    ],
  },
  {
    id: 7,
    name: "Templo de Diccionarios",
    topic: "dict y set",
    hue: 330,
    levels: [
      {
        id: "7-1", t: "choice", title: "Clave y valor",
        learn: 'Un diccionario guarda pares `clave: valor`. Buscas un valor por su clave: `d["clave"]`.',
        q: "¿Qué muestra este programa?",
        code: py`
          edades = {"Ana": 30, "Luis": 25}
          print(edades["Luis"])
        `,
        opts: ["25", "Luis", "30", "{'Luis': 25}"], a: 0,
        hint: "Se busca por la clave y se obtiene su valor.",
        why: 'La clave "Luis" tiene el valor 25.',
      },
      {
        id: "7-2", t: "fill", title: "Nuevo objeto",
        learn: "Para agregar o cambiar un valor: `d[clave] = valor`.",
        q: "Completa para agregar 3 escudos al inventario.",
        code: py`
          inventario = {"espada": 1}
          inventario[___] = 3
          print(inventario)
        `,
        goal: "{'espada': 1, 'escudo': 3}",
        blanks: [['"escudo"', "'escudo'"]],
        bank: ['"escudo"', "escudo", '"espada"', "3"],
        hint: "La clave es un texto, así que va entre comillas.",
        why: 'inventario["escudo"] = 3 crea la clave nueva. Sin comillas, escudo sería una variable que no existe.',
      },
      {
        id: "7-3", t: "choice", title: "Buscar sin romper",
        learn: '`d["x"]` lanza `KeyError` si la clave no existe. `d.get("x", defecto)` devuelve el valor por defecto en su lugar.',
        q: "¿Qué muestra este programa?",
        code: py`
          stock = {"pan": 4}
          print(stock.get("leche", 0))
          print(stock.get("pan", 0))
        `,
        opts: ["0\n4", "None\n4", "(error)", "leche\npan"], a: 0,
        hint: "El segundo argumento de get es lo que devuelve si no encuentra la clave.",
        why: '"leche" no existe, así que get devuelve 0. "pan" sí existe y vale 4.',
      },
      {
        id: "7-4", t: "bug", title: "Clave equivocada",
        q: "El programa lanza KeyError. Toca la línea responsable.",
        code: py`
          precios = {"cafe": 30, "te": 25}
          pedido = "cafe"
          total = precios["Cafe"] + precios["te"]
          print("Total:", total)
        `,
        line: 3,
        fix: py`
          precios = {"cafe": 30, "te": 25}
          pedido = "cafe"
          total = precios["cafe"] + precios["te"]
          print("Total:", total)
        `,
        goal: "Total: 55",
        hint: "Las claves distinguen mayúsculas de minúsculas.",
        why: '"Cafe" y "cafe" son claves distintas. La que existe es "cafe".',
      },
      {
        id: "7-5", t: "input", title: "Sin repetidos",
        learn: "Un `set` (conjunto) guarda valores **sin repetir** y sin un orden fijo.",
        q: "Escribe exactamente lo que se imprime.",
        code: py`print(len({1, 2, 2, 3, 3, 3}))`,
        a: "3",
        hint: "Los repetidos se eliminan.",
        why: "El conjunto queda como {1, 2, 3}: tres elementos distintos.",
      },
      {
        id: "7-6", t: "choice", title: "Recorrer un diccionario",
        learn: "`d.items()` entrega cada par (clave, valor) para recorrerlo con `for`.",
        q: "¿Qué muestra este programa?",
        code: py`
          puntos = {"rojo": 3, "azul": 5}
          for equipo, p in puntos.items():
              print(equipo, p * 2)
        `,
        opts: ["rojo 6\nazul 10", "rojo 3\nazul 5", "rojo azul\n6 10", "('rojo', 3)\n('azul', 5)"], a: 0,
        hint: "En cada vuelta, equipo es la clave y p el valor.",
        why: "El bucle recorre los pares en orden de inserción y duplica cada valor.",
      },
      {
        id: "7-7", t: "order", title: "Contador de palabras",
        q: "La primera línea ya está puesta. Ordena el resto para contar las palabras.",
        head: ['texto = "a b a c a b"'],
        lines: [
          "conteo = {}",
          "for palabra in texto.split():",
          "    conteo[palabra] = conteo.get(palabra, 0) + 1",
          "print(conteo)",
        ],
        goal: "{'a': 3, 'b': 2, 'c': 1}",
        hint: "El diccionario vacío debe existir antes del bucle.",
        why: "get(palabra, 0) + 1 suma uno al conteo actual, o empieza en 1 si la palabra es nueva.",
      },
      {
        id: "7-8", t: "choice", title: "Operaciones de conjuntos",
        learn: "`a & b` es la intersección (lo que tienen en común) y `a | b` es la unión (todo junto, sin repetir).",
        q: "¿Qué muestra este programa?",
        code: py`
          a = {1, 2, 3}
          b = {2, 3, 4}
          print(a & b)
          print(a | b)
        `,
        opts: ["{2, 3}\n{1, 2, 3, 4}", "{1, 2, 3, 4}\n{2, 3}", "{1, 4}\n{1, 2, 3, 4}", "{2, 3}\n{1, 2, 2, 3, 3, 4}"], a: 0,
        hint: "& = en ambos. | = en cualquiera.",
        why: "2 y 3 están en los dos conjuntos. La unión junta todo sin repetir: 1, 2, 3, 4.",
      },
      {
        id: "7-9", t: "code", title: "Laboratorio: Agenda",
        pre: 'agenda = {"Ana": "555-1234", "Luis": "555-9876"}\nnombre = "Ana"',
        q: "Muestra el teléfono de `nombre` que está en `agenda`. Si no existe, muestra `No encontrado`.",
        goal: 'Con nombre = "Ana" debe mostrar 555-1234',
        starter: py`
          print(agenda[nombre])
        `,
        tests: [
          { out: "555-1234", msg: "Ana → 555-1234" },
          { pre: 'agenda = {"Ana": "555-1234"}\nnombre = "Eva"', out: "No encontrado", msg: "Eva no está → No encontrado" },
          { pre: 'agenda = {}\nnombre = "Luis"', out: "No encontrado", msg: "Agenda vacía → No encontrado" },
        ],
        sol: py`
          print(agenda.get(nombre, "No encontrado"))
        `,
        hint: "Recuerda el método que no falla cuando la clave no existe.",
        why: "`get` con valor por defecto evita el KeyError sin necesidad de un if.",
      },
      {
        id: "7-10", t: "code", boss: true, title: "Jefe: Contador de letras",
        pre: 'palabra = "banana"',
        q: "Crea un diccionario `conteo` que diga cuántas veces aparece cada letra de `palabra`.",
        goal: "Con \"banana\" → {'b': 1, 'a': 3, 'n': 2}",
        starter: py`
          conteo = {}
          print(conteo)
        `,
        tests: [
          { check: "conteo == {'b': 1, 'a': 3, 'n': 2}", msg: '"banana" → b:1, a:3, n:2' },
          { pre: 'palabra = "oso"', check: "conteo == {'o': 2, 's': 1}", msg: '"oso" → o:2, s:1' },
          { pre: 'palabra = ""', check: "conteo == {}", msg: "Texto vacío → {}" },
        ],
        sol: py`
          conteo = {}
          for letra in palabra:
              conteo[letra] = conteo.get(letra, 0) + 1
          print(conteo)
        `,
        hint: "Recorre las letras con for y usa `conteo.get(letra, 0) + 1`.",
        why: "Contar con un diccionario es la base de estadísticas, histogramas y análisis de texto.",
      },
    ],
  },
  {
    id: 8,
    name: "Fábrica de Funciones",
    topic: "def, return y recursión",
    hue: 185,
    levels: [
      {
        id: "8-1", t: "choice", title: "Define y llama",
        learn: "`def nombre(parámetros):` crea una función. `return` devuelve un resultado a quien la llamó.",
        q: "¿Qué muestra este programa?",
        code: py`
          def saludar(nombre):
              return "Hola, " + nombre

          print(saludar("Mia"))
          print(saludar("Teo"))
        `,
        opts: ["Hola, Mia\nHola, Teo", "Hola, nombre\nHola, nombre", "Hola, Mia", "(error)"], a: 0,
        hint: "En cada llamada, nombre toma el valor que le pasas.",
        why: 'La función se reutiliza: la primera vez nombre vale "Mia" y la segunda "Teo".',
      },
      {
        id: "8-2", t: "choice", title: "print no es return",
        learn: "Una función sin `return` devuelve `None` (nada).",
        q: "¿Qué muestra este programa?",
        code: py`
          def doble(x):
              print(x * 2)

          r = doble(5)
          print(r)
        `,
        opts: ["10\nNone", "10\n10", "10", "None"], a: 0,
        hint: "La función imprime, pero ¿devuelve algo?",
        why: "doble imprime 10, pero como no tiene return, r vale None.",
      },
      {
        id: "8-3", t: "fill", title: "Valor por defecto",
        learn: "Un parámetro puede tener un valor por defecto: `def f(x, y=2):`. Si no lo pasas, usa ese valor.",
        q: "Completa para que se imprima 9 8.",
        code: py`
          def potencia(base, exp=___):
              return base ** exp

          print(potencia(3), potencia(2, 3))
        `,
        goal: "9 8",
        blanks: [["2"]],
        bank: ["2", "3", "0", "1"],
        hint: "potencia(3) debe dar 9. ¿3 elevado a qué es 9?",
        why: "Con exp=2, potencia(3) = 3² = 9. En potencia(2, 3) se pasa exp explícito: 2³ = 8.",
      },
      {
        id: "8-4", t: "input", title: "Variables locales",
        learn: "Una variable creada dentro de una función es **local**: no cambia la de afuera aunque se llame igual.",
        q: "Escribe exactamente lo que se imprime.",
        code: py`
          x = 10
          def cambiar():
              x = 99
              return x
          cambiar()
          print(x)
        `,
        a: "10",
        hint: "¿El x de adentro es el mismo que el de afuera?",
        why: "El x = 99 vive solo dentro de cambiar(). El x de afuera sigue valiendo 10.",
      },
      {
        id: "8-5", t: "bug", title: "El return perdido",
        q: "Queremos imprimir 13.0, pero falla. Toca la línea a corregir.",
        code: py`
          def area(base, altura):
              resultado = base * altura / 2
              print(resultado)

          total = area(6, 4) + 1
          print(total)
        `,
        line: 3,
        fix: py`
          def area(base, altura):
              resultado = base * altura / 2
              return resultado

          total = area(6, 4) + 1
          print(total)
        `,
        goal: "13.0",
        hint: "Para sumarle 1 al resultado, la función tiene que devolverlo.",
        why: "Sin return, area() devuelve None y None + 1 es un TypeError.",
      },
      {
        id: "8-6", t: "choice", title: "Argumentos variables",
        learn: "`*args` recoge cualquier cantidad de argumentos en una tupla.",
        q: "¿Qué muestra este programa?",
        code: py`
          def total(*nums):
              return sum(nums)

          print(total(1, 2, 3), total(), total(5))
        `,
        opts: ["6 0 5", "6 None 5", "(error)", "123 0 5"], a: 0,
        hint: "Sin argumentos, nums es una tupla vacía.",
        why: "nums recibe (1, 2, 3), () y (5,). La suma de una tupla vacía es 0.",
      },
      {
        id: "8-7", t: "order", title: "Recursión",
        learn: "Una función **recursiva** se llama a sí misma. Siempre necesita un caso base para detenerse.",
        q: "Ordena para calcular 5! (factorial de 5).",
        lines: [
          "def factorial(n):",
          "    if n <= 1:",
          "        return 1",
          "    return n * factorial(n - 1)",
          "print(factorial(5))",
        ],
        goal: "120",
        hint: "El caso base (n <= 1) va primero dentro de la función.",
        why: "5! = 5 × 4 × 3 × 2 × 1 = 120. Cada llamada reduce n hasta llegar al caso base.",
      },
      {
        id: "8-8", t: "choice", title: "La trampa del valor por defecto",
        learn: "Los valores por defecto se crean **una sola vez**, al definir la función. Si es una lista, ¡se comparte entre llamadas!",
        q: "¿Qué muestra este programa?",
        code: py`
          def agregar(x, lista=[]):
              lista.append(x)
              return lista

          print(agregar(1))
          print(agregar(2))
        `,
        opts: ["[1]\n[1, 2]", "[1]\n[2]", "[1, 2]\n[1, 2]", "(error)"], a: 0,
        hint: "La lista por defecto es la misma en ambas llamadas.",
        why: "La lista [] se creó una vez y se reutiliza. Lo correcto es usar `lista=None` y crearla dentro.",
      },
      {
        id: "8-9", t: "code", title: "Laboratorio: El mayor de tres",
        q: "Escribe la función `mayor(a, b, c)` que devuelva el mayor de los tres números, **sin usar** `max()`.",
        goal: "mayor(4, 8, 1) debe devolver 8",
        starter: py`
          def mayor(a, b, c):
              return a
        `,
        tests: [
          { ex: "mayor(1, 2, 3)", eq: "3" },
          { ex: "mayor(9, 2, 3)", eq: "9" },
          { ex: "mayor(4, 8, 1)", eq: "8" },
          { ex: "mayor(-1, -5, -3)", eq: "-1" },
          { ex: "mayor(5, 5, 2)", eq: "5" },
          { noCall: "max", msg: "No usa max()" },
        ],
        sol: py`
          def mayor(a, b, c):
              m = a
              if b > m:
                  m = b
              if c > m:
                  m = c
              return m
        `,
        hint: "Guarda a como candidato y compáralo con b y con c.",
        why: "Implementar a mano funciones que ya existen es la mejor forma de entender cómo funcionan.",
      },
      {
        id: "8-10", t: "code", boss: true, title: "Jefe: El detector de primos",
        q: "Escribe `es_primo(n)` que devuelva `True` si n es primo y `False` si no. Un primo solo se divide entre 1 y sí mismo; 0 y 1 no son primos.",
        goal: "es_primo(13) → True, es_primo(9) → False",
        starter: py`
          def es_primo(n):
              return False
        `,
        tests: [
          { ex: "es_primo(2)", eq: "True" },
          { ex: "es_primo(13)", eq: "True" },
          { ex: "es_primo(97)", eq: "True" },
          { ex: "es_primo(1)", eq: "False" },
          { ex: "es_primo(0)", eq: "False" },
          { ex: "es_primo(9)", eq: "False" },
          { ex: "es_primo(100)", eq: "False" },
          { ex: "es_primo(7919)", eq: "True" },
        ],
        sol: py`
          def es_primo(n):
              if n < 2:
                  return False
              for d in range(2, int(n ** 0.5) + 1):
                  if n % d == 0:
                      return False
              return True
        `,
        hint: "Prueba dividir n entre 2, 3, 4, … Si alguno da residuo 0, no es primo. Basta llegar hasta la raíz de n.",
        why: "Revisar solo hasta √n hace el algoritmo mucho más rápido. Pensar en eficiencia es de pythonistas.",
      },
    ],
  },
  {
    id: 9,
    name: "Laboratorio Pythónico",
    topic: "comprensiones y errores",
    hue: 95,
    levels: [
      {
        id: "9-1", t: "choice", title: "Listas por comprensión",
        learn: "`[expresión for x in iterable]` crea una lista en una sola línea.",
        q: "¿Qué muestra este programa?",
        code: py`
          cuadrados = [n ** 2 for n in range(1, 5)]
          print(cuadrados)
        `,
        opts: ["[1, 4, 9, 16]", "[0, 1, 4, 9, 16]", "[1, 4, 9, 16, 25]", "[2, 4, 6, 8]"], a: 0,
        hint: "range(1, 5) es 1, 2, 3, 4.",
        why: "Se eleva al cuadrado cada número del 1 al 4.",
      },
      {
        id: "9-2", t: "fill", title: "Filtrar al vuelo",
        learn: "También puedes filtrar: `[x for x in lista if condición]`.",
        q: "Completa para quedarte solo con los pares.",
        code: py`
          nums = [1, 2, 3, 4, 5, 6]
          pares = [n for n in nums ___ n % 2 == 0]
          print(pares)
        `,
        goal: "[2, 4, 6]",
        blanks: [["if"]],
        bank: ["if", "and", "while", "else"],
        hint: "Es la misma palabra que usas para tomar decisiones.",
        why: "El if al final de la comprensión decide qué elementos entran en la lista.",
      },
      {
        id: "9-3", t: "choice", title: "Atrapar errores",
        learn: "`try:` intenta algo; si ocurre un error, salta al `except`. `finally` se ejecuta siempre.",
        q: "¿Qué muestra este programa?",
        code: py`
          try:
              print(10 / 0)
              print("¿llego aquí?")
          except ZeroDivisionError:
              print("No se puede dividir entre 0")
          finally:
              print("fin")
        `,
        opts: ["No se puede dividir entre 0\nfin", "¿llego aquí?\nfin", "No se puede dividir entre 0", "(error)"], a: 0,
        hint: "Cuando ocurre el error, el resto del bloque try se salta.",
        why: "10 / 0 falla, así que se salta al except. Y finally se ejecuta pase lo que pase.",
      },
      {
        id: "9-4", t: "input", title: "Diccionario por comprensión",
        learn: "Los diccionarios también se crean por comprensión: `{clave: valor for x in iterable}`.",
        q: "Escribe exactamente lo que se imprime.",
        code: py`
          d = {x: x * 10 for x in range(3)}
          print(d[2])
        `,
        a: "20",
        hint: "d queda como {0: 0, 1: 10, 2: 20}.",
        why: "Para la clave 2 el valor es 2 * 10 = 20.",
      },
      {
        id: "9-5", t: "bug", title: "El error equivocado",
        learn: "Cada error tiene su tipo. Convertir un texto inválido con `int()` lanza `ValueError`.",
        q: "El programa se cae en vez de imprimir 0. Toca la línea a corregir.",
        code: py`
          texto = "doce"
          try:
              n = int(texto)
          except TypeError:
              n = 0
          print(n)
        `,
        line: 4,
        fix: py`
          texto = "doce"
          try:
              n = int(texto)
          except ValueError:
              n = 0
          print(n)
        `,
        goal: "0",
        hint: '¿Qué error lanza int("doce")?',
        why: 'int("doce") lanza ValueError, que no es TypeError, así que el except no lo atrapa.',
      },
      {
        id: "9-6", t: "choice", title: "¿Todos? ¿Alguno?",
        learn: "`all()` es verdadero si todos cumplen; `any()` si al menos uno.",
        q: "¿Qué muestra este programa?",
        code: py`
          edades = [21, 34, 17]
          print(all(e >= 18 for e in edades))
          print(any(e >= 30 for e in edades))
        `,
        opts: ["False\nTrue", "True\nTrue", "False\nFalse", "True\nFalse"], a: 0,
        hint: "¿Todas las edades son de 18 o más? ¿Alguna es de 30 o más?",
        why: "17 no cumple, así que all da False. 34 sí es >= 30, así que any da True.",
      },
      {
        id: "9-7", t: "order", title: "Generador",
        learn: "Una función con `yield` es un **generador**: produce valores de uno en uno, pausándose entre cada uno.",
        q: "Ordena para obtener [3, 2, 1].",
        lines: [
          "def cuenta_atras(n):",
          "    while n > 0:",
          "        yield n",
          "        n -= 1",
          "print(list(cuenta_atras(3)))",
        ],
        goal: "[3, 2, 1]",
        hint: "Primero se entrega el valor y después se reduce.",
        why: "El generador entrega 3, luego baja a 2, entrega 2, y así hasta que n llega a 0.",
      },
      {
        id: "9-8", t: "choice", title: "Ordenar con criterio",
        learn: "`sorted(lista, key=función)` ordena según lo que devuelva la función. `lambda` crea funciones cortas en una línea.",
        q: "¿Qué muestra este programa?",
        code: py`
          palabras = ["kiwi", "uva", "banana"]
          print(sorted(palabras, key=len))
          print(sorted(palabras, key=lambda p: p[-1]))
        `,
        opts: [
          "['uva', 'kiwi', 'banana']\n['uva', 'banana', 'kiwi']",
          "['banana', 'kiwi', 'uva']\n['banana', 'kiwi', 'uva']",
          "['uva', 'kiwi', 'banana']\n['kiwi', 'uva', 'banana']",
          "['banana', 'uva', 'kiwi']\n['uva', 'banana', 'kiwi']",
        ], a: 0,
        hint: "La primera ordena por largo; la segunda por la última letra.",
        why: "Por largo: uva (3), kiwi (4), banana (6). Por última letra: a, a, i. Si empatan, se respeta el orden original.",
      },
      {
        id: "9-9", t: "code", title: "Laboratorio: Comprensión",
        pre: 'palabras = ["sol", "planeta", "luna", "cometa"]',
        q: "Usa una lista por comprensión para crear `largas`: las palabras de `palabras` con más de 4 letras, en mayúsculas.",
        goal: "Con el ejemplo → ['PLANETA', 'COMETA']",
        starter: py`
          largas = []
          print(largas)
        `,
        tests: [
          { check: "largas == ['PLANETA', 'COMETA']", msg: "Ejemplo → ['PLANETA', 'COMETA']" },
          { pre: 'palabras = ["python", "go", "rust", "kotlin"]', check: "largas == ['PYTHON', 'KOTLIN']", msg: "Otra lista → ['PYTHON', 'KOTLIN']" },
          { uses: ["ListComp"], msg: "Usa una lista por comprensión" },
        ],
        sol: py`
          largas = [p.upper() for p in palabras if len(p) > 4]
          print(largas)
        `,
        hint: "`[p.upper() for p in palabras if ...]`",
        why: "Transformar y filtrar en una sola línea legible: eso es escribir código «pythónico».",
      },
      {
        id: "9-10", t: "code", boss: true, title: "Jefe: Limpieza de datos",
        pre: 'datos = ["12", "x", "7", "", "30"]',
        q: "`datos` trae textos; algunos no son números. Crea la lista `numeros` con los que sí se pueden convertir a `int` (en orden) y muestra su suma.",
        goal: "Con el ejemplo → numeros = [12, 7, 30] y muestra 49",
        starter: py`
          numeros = []
          print(sum(numeros))
        `,
        tests: [
          { check: "numeros == [12, 7, 30]", msg: "numeros = [12, 7, 30]" },
          { out: "49", msg: "Muestra 49" },
          { pre: 'datos = ["-3", "5", "abc", "2.5"]', check: "numeros == [-3, 5]", msg: '["-3", "5", "abc", "2.5"] → [-3, 5]' },
          { pre: "datos = []", out: "0", msg: "Sin datos → 0" },
        ],
        sol: py`
          numeros = []
          for d in datos:
              try:
                  numeros.append(int(d))
              except ValueError:
                  pass
          print(sum(numeros))
        `,
        hint: "Intenta `int(d)` dentro de un try y, si da ValueError, ignóralo con pass.",
        why: "Los datos reales siempre vienen sucios. Con try/except tu programa no se cae por una línea mala.",
      },
    ],
  },
  {
    id: 10,
    name: "Castillo de Objetos",
    topic: "clases y objetos",
    hue: 350,
    levels: [
      {
        id: "10-1", t: "choice", title: "Tu primera clase",
        learn: "Una `class` es un molde para crear objetos. `__init__` se ejecuta al crear cada objeto y `self` es el objeto mismo.",
        q: "¿Qué muestra este programa?",
        code: py`
          class Perro:
              def __init__(self, nombre):
                  self.nombre = nombre

              def ladrar(self):
                  return self.nombre + " dice guau"

          p = Perro("Toby")
          print(p.ladrar())
        `,
        opts: ["Toby dice guau", "nombre dice guau", "self dice guau", "(error)"], a: 0,
        hint: "self.nombre guarda el nombre que se pasó al crear el perro.",
        why: 'Al crear Perro("Toby"), __init__ guarda "Toby" en self.nombre, y ladrar() lo usa.',
      },
      {
        id: "10-2", t: "fill", title: "¿Quién soy?",
        q: "Completa para que el contador funcione.",
        code: py`
          class Contador:
              def __init__(self):
                  ___.valor = 0

              def sumar(self):
                  self.valor += 1

          c = Contador()
          c.sumar()
          c.sumar()
          print(c.valor)
        `,
        goal: "2",
        blanks: [["self"]],
        bank: ["self", "this", "c", "valor"],
        hint: "Dentro de los métodos, el objeto se llama siempre igual.",
        why: "self es el objeto que se está creando. En Python no existe this.",
      },
      {
        id: "10-3", t: "choice", title: "Atributo de clase",
        learn: "Un atributo definido en la clase (fuera de los métodos) es **compartido** por todos los objetos.",
        q: "¿Qué muestra este programa?",
        code: py`
          class Jugador:
              total = 0
              def __init__(self, nombre):
                  self.nombre = nombre
                  Jugador.total += 1

          a = Jugador("Ana")
          b = Jugador("Luis")
          print(Jugador.total, a.total)
        `,
        opts: ["2 2", "2 1", "1 1", "0 2"], a: 0,
        hint: "total pertenece a la clase, no a cada jugador.",
        why: "Cada jugador creado suma 1 al total compartido. a.total lee el mismo valor: 2.",
      },
      {
        id: "10-4", t: "input", title: "Métodos mágicos",
        learn: "`__str__` define cómo se ve tu objeto cuando lo imprimes.",
        q: "Escribe exactamente lo que se imprime.",
        code: py`
          class Punto:
              def __init__(self, x, y):
                  self.x = x
                  self.y = y

              def __str__(self):
                  return f"({self.x}, {self.y})"

          print(Punto(3, 4))
        `,
        a: "(3, 4)",
        hint: "print usa lo que devuelve __str__.",
        why: "print llama automáticamente a __str__, que arma el texto (3, 4).",
      },
      {
        id: "10-5", t: "choice", title: "Herencia",
        learn: "Una clase puede **heredar** de otra: `class Gato(Animal):`. Si redefine un método, se usa su versión.",
        q: "¿Qué muestra este programa?",
        code: py`
          class Animal:
              def hablar(self):
                  return "..."

          class Gato(Animal):
              def hablar(self):
                  return "Miau"

          class Leon(Gato):
              pass

          print(Animal().hablar(), Leon().hablar())
        `,
        opts: ["... Miau", "... ...", "Miau Miau", "(error)"], a: 0,
        hint: "Leon no define hablar, así que lo busca en su clase padre.",
        why: "Leon hereda de Gato, que redefine hablar. Python busca el método subiendo por la familia.",
      },
      {
        id: "10-6", t: "bug", title: "Olvidaste a self",
        q: "Toca la línea con el error.",
        code: py`
          class Caja:
              def __init__(self, cosa):
                  self.cosa = cosa

              def abrir():
                  return "Dentro hay: " + self.cosa

          print(Caja("oro").abrir())
        `,
        line: 5,
        fix: py`
          class Caja:
              def __init__(self, cosa):
                  self.cosa = cosa

              def abrir(self):
                  return "Dentro hay: " + self.cosa

          print(Caja("oro").abrir())
        `,
        goal: "Dentro hay: oro",
        hint: "Todos los métodos reciben al objeto como primer parámetro.",
        why: "Los métodos necesitan self como primer parámetro. Sin él, Python lanza TypeError al llamar abrir().",
      },
      {
        id: "10-7", t: "order", title: "super()",
        learn: "`super().__init__(...)` llama al `__init__` de la clase padre.",
        q: "Ordena para crear una moto con 2 ruedas.",
        lines: [
          "class Vehiculo:",
          "    def __init__(self, ruedas):",
          "        self.ruedas = ruedas",
          "class Moto(Vehiculo):",
          "    def __init__(self):",
          "        super().__init__(2)",
          "print(Moto().ruedas)",
        ],
        goal: "2",
        hint: "La clase padre debe existir antes que la hija.",
        why: "Moto hereda de Vehiculo y usa super() para reutilizar su __init__ con 2 ruedas.",
      },
      {
        id: "10-8", t: "choice", title: "Decoradores",
        learn: "Un **decorador** (`@algo`) envuelve una función para agregarle comportamiento sin modificarla.",
        q: "¿Qué muestra este programa?",
        code: py`
          def gritar(f):
              def envoltura():
                  return f().upper() + "!"
              return envoltura

          @gritar
          def saludo():
              return "hola"

          print(saludo())
        `,
        opts: ["HOLA!", "hola", "hola!", "HOLA"], a: 0,
        hint: "@gritar reemplaza saludo por envoltura.",
        why: "saludo ahora es envoltura: llama a la original, la pasa a mayúsculas y agrega «!».",
      },
      {
        id: "10-9", t: "code", title: "Laboratorio: Rectángulo",
        q: "Crea la clase `Rectangulo` con `__init__(self, ancho, alto)` y los métodos `area()` y `perimetro()`.",
        goal: "Rectangulo(3, 4).area() → 12 y .perimetro() → 14",
        starter: py`
          class Rectangulo:
              def __init__(self, ancho, alto):
                  pass
        `,
        tests: [
          { ex: "Rectangulo(3, 4).area()", eq: "12" },
          { ex: "Rectangulo(3, 4).perimetro()", eq: "14" },
          { ex: "Rectangulo(5, 5).area()", eq: "25" },
          { ex: "Rectangulo(2.5, 2).area()", eq: "5.0" },
        ],
        sol: py`
          class Rectangulo:
              def __init__(self, ancho, alto):
                  self.ancho = ancho
                  self.alto = alto

              def area(self):
                  return self.ancho * self.alto

              def perimetro(self):
                  return 2 * (self.ancho + self.alto)
        `,
        hint: "Guarda ancho y alto en self dentro de __init__ para usarlos en los otros métodos.",
        why: "Un objeto junta datos (ancho, alto) con el comportamiento que los usa (area, perimetro).",
      },
      {
        id: "10-10", t: "code", boss: true, title: "Jefe final: El banco de Python",
        q: "Completa la clase `CuentaBancaria`: `depositar(monto)` suma al saldo y `retirar(monto)` lo resta, pero si no hay saldo suficiente lanza `ValueError` sin cambiar nada.",
        goal: "Una cuenta con 10 que intenta retirar 50 lanza ValueError y sigue con 10",
        starter: py`
          class CuentaBancaria:
              def __init__(self, titular, saldo=0):
                  self.titular = titular
                  self.saldo = saldo
        `,
        tests: [
          { check: "CuentaBancaria('Ana').saldo == 0", msg: "Una cuenta nueva empieza en 0" },
          { run: "c = CuentaBancaria('Ana', 50)\nc.depositar(25)\nassert c.saldo == 75", msg: "Depositar 25 a 50 deja 75" },
          { run: "c = CuentaBancaria('Luis', 100)\nc.retirar(30)\nassert c.saldo == 70", msg: "Retirar 30 de 100 deja 70" },
          { run: "c = CuentaBancaria('Eva', 10)\ntry:\n    c.retirar(50)\n    raise AssertionError('no lanzó ValueError')\nexcept ValueError:\n    pass\nassert c.saldo == 10", msg: "Retirar de más lanza ValueError y no toca el saldo" },
        ],
        sol: py`
          class CuentaBancaria:
              def __init__(self, titular, saldo=0):
                  self.titular = titular
                  self.saldo = saldo

              def depositar(self, monto):
                  self.saldo += monto

              def retirar(self, monto):
                  if monto > self.saldo:
                      raise ValueError("Saldo insuficiente")
                  self.saldo -= monto
        `,
        hint: "En retirar, revisa primero `if monto > self.saldo:` y usa `raise ValueError(...)`.",
        why: "Clases, métodos, validación y excepciones juntas: así se construye software real. ¡Conquistaste el castillo!",
      },
    ],
  },
];
