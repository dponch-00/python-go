// Mundos 1 a 5. Formato de cada nivel: ver README.md → "Cómo agregar niveles".
import { py, tabla, fizzbuzz } from "./py.js";

export const WORLDS_1 = [
  {
    id: 1,
    name: "Isla Print",
    topic: "print, textos y variables",
    hue: 200,
    levels: [
      {
        id: "1-1", t: "choice", title: "Hola, mundo",
        learn: "`print()` muestra en pantalla lo que pongas entre paréntesis. El texto (un *string*) va entre comillas.",
        q: "¿Qué muestra este programa?",
        code: py`print("Hola, mundo")`,
        opts: ["Hola, mundo", '"Hola, mundo"', "Hola mundo", "print(Hola, mundo)"], a: 0,
        hint: "Las comillas solo le dicen a Python dónde empieza y dónde termina el texto.",
        why: "`print` muestra el contenido del texto, sin las comillas.",
      },
      {
        id: "1-2", t: "choice", title: "Calculadora",
        learn: "Sin comillas, Python calcula la expresión. Con comillas, es solo texto.",
        q: "¿Qué muestra este programa?",
        code: py`
          print(3 + 4)
          print("3 + 4")
        `,
        opts: ["7\n3 + 4", "7\n7", "3 + 4\n3 + 4", '7\n"3 + 4"'], a: 0,
        hint: "Fíjate en cuál de las dos líneas tiene comillas.",
        why: "La primera línea calcula 3 + 4 = 7. La segunda imprime el texto tal cual, sin calcular nada.",
      },
      {
        id: "1-3", t: "input", title: "Pegamento",
        learn: "`+` entre dos textos los une. A eso se le llama *concatenar*.",
        q: "Escribe exactamente lo que se imprime.",
        code: py`print("3" + "4")`,
        a: "34",
        hint: "Los dos valores están entre comillas: son textos, no números.",
        why: '"3" y "4" son textos, así que `+` los pega uno detrás del otro: 34.',
      },
      {
        id: "1-4", t: "choice", title: "Notas secretas",
        learn: "Lo que va después de `#` es un *comentario*: Python lo ignora. Sirve para dejar notas en tu código.",
        q: "¿Qué muestra este programa?",
        code: py`
          print("A")
          # print("B")
          print("C")  # esto también se ignora
        `,
        opts: ["A\nC", "A\nB\nC", "A\nC  # esto también se ignora", "C"], a: 0,
        hint: "Una línea que empieza con # no se ejecuta.",
        why: "La segunda línea es un comentario completo y el texto después de # en la tercera también. Solo se imprimen A y C.",
      },
      {
        id: "1-5", t: "fill", title: "Tu primera variable",
        learn: 'Una variable guarda un valor con un nombre: `nombre = "Ada"`. Luego la usas escribiendo su nombre **sin comillas**.',
        q: "Completa el hueco para que se imprima el saludo.",
        code: py`
          nombre = "Ada"
          print("Hola, " + ___)
        `,
        goal: "Hola, Ada",
        blanks: [["nombre"]],
        bank: ["nombre", '"nombre"', "Ada", "Nombre"],
        hint: "Quieres el valor guardado en la variable, no la palabra escrita.",
        why: '`nombre` sin comillas es la variable (vale "Ada"). Con comillas sería el texto literal "nombre".',
      },
      {
        id: "1-6", t: "choice", title: "Cambio de valor",
        learn: "`=` no significa «igual»: significa **guarda**. Python calcula primero lo de la derecha y lo guarda en la variable de la izquierda.",
        q: "¿Qué muestra este programa?",
        code: py`
          x = 5
          x = x + 2
          print(x)
        `,
        opts: ["7", "5", "52", "x + 2"], a: 0,
        hint: "Primero se calcula x + 2 usando el valor actual de x.",
        why: "x vale 5; luego x + 2 = 7 y ese 7 se guarda de nuevo en x.",
      },
      {
        id: "1-7", t: "order", title: "Arma el programa",
        learn: "`print(a, b)` muestra varios valores separados por un espacio.",
        q: "Toca las líneas en el orden correcto para que el programa funcione.",
        lines: [
          "precio = 20",
          "total = precio * 3",
          "total = total - 5",
          'print("Total:", total)',
        ],
        goal: "Total: 55",
        hint: "Una variable debe existir antes de usarse.",
        why: "Primero se crea precio, luego total (60), después se le restan 5 y al final se imprime.",
      },
      {
        id: "1-8", t: "bug", title: "Mayúsculas traicioneras",
        learn: "Python distingue mayúsculas de minúsculas: `texto` y `Texto` son nombres distintos.",
        q: "Este programa falla. Toca la línea con el error.",
        code: py`
          saludo = "Hola"
          nombre = "Leo"
          texto = saludo + ", " + nombre
          print(Texto)
        `,
        line: 4,
        fix: py`
          saludo = "Hola"
          nombre = "Leo"
          texto = saludo + ", " + nombre
          print(texto)
        `,
        goal: "Hola, Leo",
        hint: "Compara letra por letra los nombres de las variables.",
        why: "`Texto` con T mayúscula no existe (NameError). La variable se llama `texto`.",
      },
      {
        id: "1-9", t: "choice", title: "Sin salto de línea",
        learn: "Normalmente `print` termina con un salto de línea. Con `end=` eliges qué poner al final.",
        q: "¿Qué muestra este programa?",
        code: py`
          print("Py", end="")
          print("thon")
          print("GO")
        `,
        opts: ["Python\nGO", "Py\nthon\nGO", "Py thon\nGO", "PythonGO"], a: 0,
        hint: 'end="" significa: no pongas nada al final (ni siquiera un salto).',
        why: 'El primer print no salta de línea, así que "thon" se escribe pegado. El segundo sí salta, por eso GO va abajo.',
      },
      {
        id: "1-10", t: "code", boss: true, title: "Jefe: La puerta de la isla",
        q: "Crea una variable `heroe` con el nombre que quieras y muestra el mensaje `¡Adelante, <heroe>!`",
        goal: 'Por ejemplo, si heroe = "Ada", debe mostrar: ¡Adelante, Ada!',
        starter: py`
          # 1. Crea la variable heroe
          # 2. Muestra: ¡Adelante, <heroe>!
        `,
        tests: [
          { check: "isinstance(heroe, str) and heroe.strip() != ''", msg: "Existe la variable `heroe` con un texto" },
          { check: "salida.strip() == '¡Adelante, ' + heroe + '!'", msg: "Se muestra ¡Adelante, <heroe>!" },
        ],
        sol: py`
          heroe = "Ada"
          print("¡Adelante, " + heroe + "!")
        `,
        hint: 'Usa `+` para unir "¡Adelante, " con la variable y con "!".',
        why: "Guardaste un texto en una variable y lo combinaste con otros textos. ¡Ya escribes programas!",
      },
    ],
  },
  {
    id: 2,
    name: "Bosque de Números",
    topic: "operadores y tipos",
    hue: 150,
    levels: [
      {
        id: "2-1", t: "choice", title: "División",
        learn: "`/` divide y siempre da un número decimal (`float`), aunque la división sea exacta.",
        q: "¿Qué muestra este programa?",
        code: py`
          print(7 / 2)
          print(8 / 2)
        `,
        opts: ["3.5\n4.0", "3.5\n4", "3\n4", "3\n4.0"], a: 0,
        hint: "Con / el resultado siempre lleva punto decimal.",
        why: "7 / 2 = 3.5, y 8 / 2 da 4.0 (no 4) porque `/` siempre devuelve un float.",
      },
      {
        id: "2-2", t: "choice", title: "Cociente y residuo",
        learn: "`//` es la división entera (redondea hacia abajo). `%` da el residuo: lo que sobra.",
        q: "¿Qué muestra este programa?",
        code: py`
          print(17 // 5)
          print(17 % 5)
        `,
        opts: ["3\n2", "3.4\n2", "3\n0.4", "2\n3"], a: 0,
        hint: "¿Cuántas veces cabe el 5 en el 17, y cuánto sobra?",
        why: "El 5 cabe 3 veces en el 17 (15) y sobran 2.",
      },
      {
        id: "2-3", t: "input", title: "Jerarquía",
        learn: "Python respeta la jerarquía: primero `**`, luego `*` `/` `//` `%`, y al final `+` `-`. Los paréntesis mandan sobre todo.",
        q: "Escribe exactamente lo que se imprime.",
        code: py`print(10 - 2 * 3)`,
        a: "4",
        hint: "La multiplicación va antes que la resta.",
        why: "Primero 2 * 3 = 6 y luego 10 - 6 = 4.",
      },
      {
        id: "2-4", t: "choice", title: "¿De qué tipo es?",
        learn: "Tipos básicos: `int` (entero), `float` (decimal), `str` (texto) y `bool` (True/False). `type()` te dice el tipo de un valor.",
        q: "¿Qué muestra este programa?",
        code: py`
          print(type(3.0))
          print(type("3"))
        `,
        opts: [
          "<class 'float'>\n<class 'str'>",
          "<class 'int'>\n<class 'int'>",
          "<class 'float'>\n<class 'int'>",
          "<class 'int'>\n<class 'str'>",
        ], a: 0,
        hint: "El punto decimal y las comillas cambian el tipo.",
        why: '3.0 lleva punto, así que es float. "3" está entre comillas, así que es str.',
      },
      {
        id: "2-5", t: "fill", title: "Conversión",
        learn: "`int()` convierte a entero, `float()` a decimal y `str()` a texto.",
        q: "Completa para que se imprima 16.",
        code: py`
          edad = "15"
          print(___(edad) + 1)
        `,
        goal: "16",
        blanks: [["int"]],
        bank: ["int", "str", "float", "len"],
        hint: 'edad es el texto "15". Hay que convertirlo en un número entero.',
        why: '`int("15")` da el número 15, y 15 + 1 = 16. Con float saldría 16.0.',
      },
      {
        id: "2-6", t: "bug", title: "Texto + número",
        learn: "No puedes sumar un texto con un número: Python lanza `TypeError`. Convierte el número con `str()` o separa con comas en `print`.",
        q: "Toca la línea que provoca el error.",
        code: py`
          nivel = 7
          vidas = 3
          print("Nivel " + nivel)
          print("Vidas:", vidas)
        `,
        line: 3,
        fix: py`
          nivel = 7
          vidas = 3
          print("Nivel " + str(nivel))
          print("Vidas:", vidas)
        `,
        goal: "Nivel 7\nVidas: 3",
        hint: "Una de las líneas intenta usar + entre un texto y un número.",
        why: '"Nivel " + 7 mezcla texto y número (TypeError). La línea 4 funciona porque usa coma.',
      },
      {
        id: "2-7", t: "choice", title: "Decimales traviesos",
        learn: "Los `float` se guardan de forma aproximada, así que a veces aparecen errores diminutos.",
        q: "¿Qué muestra este programa?",
        code: py`print(0.1 + 0.2 == 0.3)`,
        opts: ["False", "True", "0.3", "(error)"], a: 0,
        hint: "Prueba mentalmente: ¿0.1 + 0.2 da exactamente 0.3 en una computadora?",
        why: "0.1 + 0.2 da 0.30000000000000004, que no es exactamente 0.3. Para comparar decimales usa `round()`.",
      },
      {
        id: "2-8", t: "input", title: "Potencias",
        learn: "`**` es la potencia: `2 ** 3` = 8. Es lo primero que se calcula.",
        q: "Escribe exactamente lo que se imprime.",
        code: py`print(2 + 3 * 2 ** 2)`,
        a: "14",
        hint: "Orden: potencia, luego multiplicación, luego suma.",
        why: "2 ** 2 = 4, luego 3 * 4 = 12 y al final 2 + 12 = 14.",
      },
      {
        id: "2-9", t: "order", title: "Rastrea la variable",
        q: "Ordena las líneas para que se imprima 3, luego 2 y luego 8.",
        lines: [
          "n = 17",
          "print(n // 5)",
          "n = n % 5",
          "print(n)",
          "n = n ** 3",
          "print(n)",
        ],
        goal: "3\n2\n8",
        hint: "17 // 5 = 3. ¿Qué operación convierte 17 en 2? ¿Y 2 en 8?",
        why: "17 // 5 = 3; luego n pasa a 17 % 5 = 2; y después 2 ** 3 = 8.",
      },
      {
        id: "2-10", t: "code", boss: true, title: "Jefe: El reloj del bosque",
        pre: "segundos = 200",
        q: "La variable `segundos` ya tiene un valor. Calcula cuántos minutos y segundos son y muéstralo con el formato `3 min 20 s`.",
        goal: "Con segundos = 200 debe mostrar: 3 min 20 s",
        starter: py`
          minutos = 0
          resto = 0
          print(minutos, "min", resto, "s")
        `,
        tests: [
          { out: "3 min 20 s", msg: "Con 200 segundos → 3 min 20 s" },
          { pre: "segundos = 125", out: "2 min 5 s", msg: "Con 125 segundos → 2 min 5 s" },
          { pre: "segundos = 59", out: "0 min 59 s", msg: "Con 59 segundos → 0 min 59 s" },
        ],
        sol: py`
          minutos = segundos // 60
          resto = segundos % 60
          print(minutos, "min", resto, "s")
        `,
        hint: "Usa `//` para los minutos completos y `%` para los segundos que sobran.",
        why: "`//` y `%` juntos parten una cantidad en unidades grandes y lo que sobra. Sirve para horas, monedas, páginas…",
      },
    ],
  },
  {
    id: 3,
    name: "Cueva de Textos",
    topic: "strings y sus métodos",
    hue: 35,
    levels: [
      {
        id: "3-1", t: "choice", title: "Índices",
        learn: "Cada letra de un texto tiene una posición (índice). Se empieza a contar en 0, y `-1` es la última.",
        q: "¿Qué muestra este programa?",
        code: py`
          palabra = "python"
          print(palabra[0], palabra[-1])
        `,
        opts: ["p n", "y o", "p o", "y n"], a: 0,
        hint: "El índice 0 es la primera letra.",
        why: "palabra[0] es la primera letra (p) y palabra[-1] la última (n).",
      },
      {
        id: "3-2", t: "input", title: "Contando letras",
        learn: "`len()` cuenta los caracteres de un texto, incluidos los espacios.",
        q: "Escribe exactamente lo que se imprime.",
        code: py`print(len("hola mundo"))`,
        a: "10",
        hint: "El espacio también cuenta.",
        why: '"hola" (4) + espacio (1) + "mundo" (5) = 10 caracteres.',
      },
      {
        id: "3-3", t: "choice", title: "Rebanadas",
        learn: "`texto[a:b]` toma desde la posición `a` hasta la `b` **sin incluirla**. Si omites un extremo, llega hasta el borde.",
        q: "¿Qué muestra este programa?",
        code: py`
          s = "programar"
          print(s[0:4])
          print(s[3:])
        `,
        opts: ["prog\ngramar", "progr\ngramar", "prog\nrogramar", "progr\nramar"], a: 0,
        hint: "s[0:4] toma las posiciones 0, 1, 2 y 3.",
        why: "s[0:4] son 4 letras: prog. s[3:] empieza en la posición 3 (g) y llega al final: gramar.",
      },
      {
        id: "3-4", t: "fill", title: "¡A gritar!",
        learn: "Los textos tienen *métodos*: funciones que se llaman con un punto, como `texto.upper()` o `texto.lower()`.",
        q: "Completa para que se imprima HOLA!",
        code: py`
          grito = "hola"
          print(grito.___() + "!")
        `,
        goal: "HOLA!",
        blanks: [["upper"]],
        bank: ["upper", "lower", "title", "strip"],
        hint: "Buscas el método que pasa todo a MAYÚSCULAS.",
        why: "`upper()` devuelve el texto en mayúsculas. `title()` solo pondría la primera: Hola.",
      },
      {
        id: "3-5", t: "choice", title: "f-strings",
        learn: 'Con `f"..."` puedes meter variables y cálculos dentro del texto usando llaves `{}`.',
        q: "¿Qué muestra este programa?",
        code: py`
          nombre = "Ana"
          puntos = 90
          print(f"{nombre} tiene {puntos + 10} puntos")
        `,
        opts: ["Ana tiene 100 puntos", "{nombre} tiene {puntos + 10} puntos", "Ana tiene 9010 puntos", "nombre tiene 100 puntos"], a: 0,
        hint: "Lo que va entre llaves se calcula.",
        why: "La f delante activa las llaves: {nombre} se reemplaza por Ana y {puntos + 10} por 100.",
      },
      {
        id: "3-6", t: "input", title: "Reemplazo",
        learn: "`texto.replace(a, b)` crea un texto nuevo cambiando **cada** `a` por `b`.",
        q: "Escribe exactamente lo que se imprime.",
        code: py`print("gato gris".replace("g", "p"))`,
        a: "pato pris",
        hint: "Se reemplazan todas las g, no solo la primera.",
        why: 'Las dos g cambian a p: "gato gris" → "pato pris".',
      },
      {
        id: "3-7", t: "bug", title: "Letra inmutable",
        learn: "Los textos son **inmutables**: no puedes cambiar una letra suelta, pero sí crear un texto nuevo.",
        q: "Queremos convertir «gato» en «pato». Toca la línea que falla.",
        code: py`
          palabra = "gato"
          palabra[0] = "p"
          print(palabra)
        `,
        line: 2,
        fix: py`
          palabra = "gato"
          palabra = "p" + palabra[1:]
          print(palabra)
        `,
        goal: "pato",
        hint: "¿Se puede asignar a una posición de un texto?",
        why: 'Asignar a palabra[0] da TypeError. La solución es crear un texto nuevo: "p" + palabra[1:].',
      },
      {
        id: "3-8", t: "choice", title: "Cortar y pegar",
        learn: '`split()` corta un texto en una lista de palabras. `"-".join(lista)` las une con `-` entre cada una.',
        q: "¿Qué muestra este programa?",
        code: py`
          frase = "uno dos tres"
          partes = frase.split()
          print("-".join(partes))
        `,
        opts: ["uno-dos-tres", "-uno-dos-tres-", "uno dos tres", "['uno', 'dos', 'tres']"], a: 0,
        hint: "join pone el separador solo ENTRE los elementos.",
        why: 'split() crea ["uno", "dos", "tres"] y join los une con guiones entre ellos.',
      },
      {
        id: "3-9", t: "input", title: "Al revés",
        learn: "`texto[::-1]` recorre el texto de atrás hacia adelante.",
        q: "Escribe exactamente lo que se imprime.",
        code: py`print("roma"[::-1])`,
        a: "amor",
        hint: "Lee la palabra de derecha a izquierda.",
        why: 'El paso -1 invierte el texto: "roma" → "amor".',
      },
      {
        id: "3-10", t: "code", boss: true, title: "Jefe: Las iniciales",
        pre: 'nombre = "ada lovelace"',
        q: "`nombre` tiene un nombre y un apellido en minúsculas. Muestra sus iniciales en mayúsculas, cada una seguida de un punto.",
        goal: 'Con "ada lovelace" debe mostrar: A.L.',
        starter: py`
          partes = nombre.split()
          print(partes)
        `,
        tests: [
          { out: "A.L.", msg: '"ada lovelace" → A.L.' },
          { pre: 'nombre = "grace hopper"', out: "G.H.", msg: '"grace hopper" → G.H.' },
          { pre: 'nombre = "alan turing"', out: "A.T.", msg: '"alan turing" → A.T.' },
        ],
        sol: py`
          partes = nombre.split()
          print(partes[0][0].upper() + "." + partes[1][0].upper() + ".")
        `,
        hint: "`partes[0][0]` es la primera letra de la primera palabra.",
        why: "Combinaste split, índices y upper. Así se procesan nombres, correos y datos reales.",
      },
    ],
  },
  {
    id: 4,
    name: "Río de Decisiones",
    topic: "if, elif, else y lógica",
    hue: 215,
    levels: [
      {
        id: "4-1", t: "choice", title: "Si… si no",
        learn: "`if` ejecuta su bloque solo si la condición es verdadera; si no, se ejecuta el `else`. El bloque se marca con sangría (4 espacios).",
        q: "¿Qué muestra este programa?",
        code: py`
          edad = 16
          if edad >= 18:
              print("Adulto")
          else:
              print("Menor")
          print("Fin")
        `,
        opts: ["Menor\nFin", "Adulto\nFin", "Adulto\nMenor\nFin", "Fin"], a: 0,
        hint: "¿16 es mayor o igual que 18?",
        why: "16 >= 18 es falso, así que se ejecuta el else. «Fin» no tiene sangría, así que siempre se imprime.",
      },
      {
        id: "4-2", t: "choice", title: "Lógica",
        learn: "`and` es verdadero si ambas partes lo son; `or` si al menos una; `not` invierte el valor.",
        q: "¿Qué muestra este programa?",
        code: py`
          print(5 > 3 and 2 > 4)
          print(5 > 3 or 2 > 4)
          print(not 5 > 3)
        `,
        opts: ["False\nTrue\nFalse", "True\nTrue\nFalse", "False\nFalse\nTrue", "False\nTrue\nTrue"], a: 0,
        hint: "5 > 3 es True y 2 > 4 es False.",
        why: "True and False → False. True or False → True. not True → False.",
      },
      {
        id: "4-3", t: "fill", title: "Una sola rama",
        learn: "`elif` («si no, si…») revisa otra condición solo si las anteriores fueron falsas. De toda la cadena se ejecuta **una sola** rama.",
        q: "Completa para que solo se imprima A.",
        code: py`
          nota = 95
          if nota >= 90:
              print("A")
          ___ nota >= 80:
              print("B")
          else:
              print("C")
        `,
        goal: "A",
        blanks: [["elif"]],
        bank: ["elif", "if", "else", "while"],
        hint: "Con un segundo if, 95 también cumpliría nota >= 80.",
        why: "Con elif, como la primera condición fue verdadera, las demás se saltan. Con if se imprimiría A y también B.",
      },
      {
        id: "4-4", t: "choice", title: "Verdades ocultas",
        learn: 'En un `if`, el texto vacío `""`, el `0`, la lista vacía `[]` y `None` cuentan como falso. Todo lo demás, verdadero.',
        q: "¿Qué muestra este programa?",
        code: py`
          nombre = ""
          if nombre:
              print("Hola,", nombre)
          else:
              print("Sin nombre")
        `,
        opts: ["Sin nombre", "Hola,", "Hola, Sin nombre", "(error)"], a: 0,
        hint: "¿Un texto vacío cuenta como verdadero o falso?",
        why: 'Un texto vacío es «falso», así que se ejecuta el else.',
      },
      {
        id: "4-5", t: "bug", title: "Asignar no es comparar",
        learn: "`=` guarda un valor. `==` pregunta si dos valores son iguales.",
        q: "Toca la línea con el error.",
        code: py`
          clave = "abc123"
          intento = "abc123"
          if intento = clave:
              print("Acceso concedido")
        `,
        line: 3,
        fix: py`
          clave = "abc123"
          intento = "abc123"
          if intento == clave:
              print("Acceso concedido")
        `,
        goal: "Acceso concedido",
        hint: "Dentro de un if quieres comparar, no guardar.",
        why: "En un if se compara con `==`. Un solo `=` ahí es un SyntaxError.",
      },
      {
        id: "4-6", t: "input", title: "If en una línea",
        learn: "Puedes escribir un if corto en una sola línea: `A if condición else B`.",
        q: "Escribe exactamente lo que se imprime.",
        code: py`
          x = 7
          print("par" if x % 2 == 0 else "impar")
        `,
        a: "impar",
        hint: "7 % 2 es el residuo de dividir 7 entre 2.",
        why: "7 % 2 = 1, que no es 0, así que se elige la parte del else: impar.",
      },
      {
        id: "4-7", t: "order", title: "Canjea el premio",
        q: "Ordena el programa para que muestre el mensaje del premio.",
        lines: [
          "puntos = 120",
          "if puntos >= 100:",
          "    puntos = puntos - 100",
          '    print("¡Premio! Quedan", puntos)',
          "else:",
          '    print("Faltan", 100 - puntos)',
        ],
        goal: "¡Premio! Quedan 20",
        hint: "Primero se descuentan los puntos y después se muestra cuántos quedan.",
        why: "120 >= 100, así que se restan 100 y se imprime lo que queda: 20.",
      },
      {
        id: "4-8", t: "choice", title: "Comparaciones encadenadas",
        learn: 'Python permite encadenar: `1 < x < 10` significa `1 < x and x < 10`. Además, `5 == 5.0` es verdadero, pero `"5" == 5` no.',
        q: "¿Qué muestra este programa?",
        code: py`
          x = 5
          print(1 < x < 10)
          print(x == 5.0)
          print("5" == 5)
        `,
        opts: ["True\nTrue\nFalse", "True\nFalse\nFalse", "True\nTrue\nTrue", "(error)"], a: 0,
        hint: "Un texto nunca es igual a un número.",
        why: '5 está entre 1 y 10; 5 y 5.0 valen lo mismo; pero "5" es texto y 5 es número.',
      },
      {
        id: "4-9", t: "code", title: "Laboratorio: ¿Par o impar?",
        pre: "n = 7",
        q: "La variable `n` ya existe. Muestra `par` si es par o `impar` si no lo es.",
        goal: "Con n = 7 debe mostrar: impar",
        starter: py`
          if n:
              print("par")
        `,
        tests: [
          { out: "impar", msg: "n = 7 → impar" },
          { pre: "n = 10", out: "par", msg: "n = 10 → par" },
          { pre: "n = 0", out: "par", msg: "n = 0 → par" },
          { pre: "n = -3", out: "impar", msg: "n = -3 → impar" },
        ],
        sol: py`
          if n % 2 == 0:
              print("par")
          else:
              print("impar")
        `,
        hint: "Un número es par si `n % 2 == 0`.",
        why: "El residuo entre 2 decide si un número es par. Es uno de los trucos más usados en programación.",
      },
      {
        id: "4-10", t: "code", boss: true, title: "Jefe: La taquilla del río",
        pre: "edad = 70",
        q: "Calcula el precio del boleto según `edad`: menores de 13 → 50; de 13 a 17 → 70; de 18 a 64 → 100; de 65 en adelante → 60. Muestra solo el número.",
        goal: "Con edad = 70 debe mostrar: 60",
        starter: py`
          precio = 0
          print(precio)
        `,
        tests: [
          { out: "60", msg: "70 años → 60" },
          { pre: "edad = 5", out: "50", msg: "5 años → 50" },
          { pre: "edad = 12", out: "50", msg: "12 años → 50" },
          { pre: "edad = 13", out: "70", msg: "13 años → 70" },
          { pre: "edad = 17", out: "70", msg: "17 años → 70" },
          { pre: "edad = 18", out: "100", msg: "18 años → 100" },
          { pre: "edad = 64", out: "100", msg: "64 años → 100" },
          { pre: "edad = 65", out: "60", msg: "65 años → 60" },
        ],
        sol: py`
          if edad < 13:
              precio = 50
          elif edad < 18:
              precio = 70
          elif edad < 65:
              precio = 100
          else:
              precio = 60
          print(precio)
        `,
        hint: "Usa una cadena if / elif / elif / else, de la edad menor a la mayor.",
        why: "Las cadenas elif revisan en orden y se detienen en la primera condición verdadera. Por eso basta con `edad < 18` en la segunda.",
      },
    ],
  },
  {
    id: 5,
    name: "Montaña de Bucles",
    topic: "for, while y range",
    hue: 265,
    levels: [
      {
        id: "5-1", t: "choice", title: "Repetir con for",
        learn: "`for i in range(n):` repite el bloque n veces; `i` toma los valores 0, 1, …, n-1.",
        q: "¿Qué muestra este programa?",
        code: py`
          for i in range(3):
              print(i)
        `,
        opts: ["0\n1\n2", "1\n2\n3", "0\n1\n2\n3", "3"], a: 0,
        hint: "range(3) empieza en 0 y no incluye el 3.",
        why: "range(3) produce 0, 1 y 2: tres vueltas.",
      },
      {
        id: "5-2", t: "input", title: "Acumulador",
        learn: "`total += n` es lo mismo que `total = total + n`. `range(1, 5)` va del 1 al 4.",
        q: "Escribe exactamente lo que se imprime.",
        code: py`
          total = 0
          for n in range(1, 5):
              total += n
          print(total)
        `,
        a: "10",
        hint: "Suma 1 + 2 + 3 + 4.",
        why: "El bucle suma 1, 2, 3 y 4 (el 5 no se incluye): 10.",
      },
      {
        id: "5-3", t: "fill", title: "De dos en dos",
        learn: "`range(inicio, fin, paso)` empieza en `inicio`, avanza de `paso` en `paso` y se detiene antes de `fin`.",
        q: "Completa para imprimir los pares del 2 al 10.",
        code: py`
          for i in range(___, 11, ___):
              print(i, end=" ")
        `,
        goal: "2 4 6 8 10",
        blanks: [["2"], ["2"]],
        bank: ["2", "2", "0", "1"],
        hint: "Empieza en 2 y avanza de 2 en 2.",
        why: "range(2, 11, 2) produce 2, 4, 6, 8 y 10. El 11 no se incluye.",
      },
      {
        id: "5-4", t: "choice", title: "Mientras tanto",
        learn: "`while condición:` repite mientras la condición sea verdadera. ¡Cuidado con los bucles infinitos!",
        q: "¿Qué muestra este programa?",
        code: py`
          n = 1
          while n < 20:
              n = n * 3
          print(n)
        `,
        opts: ["27", "9", "18", "81"], a: 0,
        hint: "Sigue los valores: 1, 3, 9, … ¿cuándo deja de ser menor que 20?",
        why: "n vale 1 → 3 → 9 → 27. Al llegar a 27 la condición n < 20 es falsa y el bucle termina.",
      },
      {
        id: "5-5", t: "bug", title: "Cuenta regresiva",
        q: "Este programa nunca termina. Toca la línea culpable.",
        code: py`
          i = 5
          while i > 0:
              print(i)
              i = i + 1
          print("¡Despegue!")
        `,
        line: 4,
        fix: py`
          i = 5
          while i > 0:
              print(i)
              i = i - 1
          print("¡Despegue!")
        `,
        goal: "5\n4\n3\n2\n1\n¡Despegue!",
        hint: "¿La variable se acerca o se aleja de cumplir la condición de salida?",
        why: "i crece sin parar y siempre es mayor que 0: bucle infinito. Hay que restar: i = i - 1.",
      },
      {
        id: "5-6", t: "choice", title: "break y continue",
        learn: "`break` sale del bucle de inmediato. `continue` salta directo a la siguiente vuelta.",
        q: "¿Qué muestra este programa?",
        code: py`
          for n in range(1, 8):
              if n == 5:
                  break
              if n % 2 == 0:
                  continue
              print(n)
        `,
        opts: ["1\n3", "1\n3\n5\n7", "2\n4", "1\n3\n5"], a: 0,
        hint: "Los pares se saltan, y al llegar a 5 el bucle se rompe.",
        why: "1 se imprime, 2 se salta, 3 se imprime, 4 se salta y en 5 el break termina todo.",
      },
      {
        id: "5-7", t: "order", title: "Triángulo de estrellas",
        q: "Ordena las líneas para dibujar el triángulo.",
        lines: [
          "for fila in range(1, 4):",
          '    linea = ""',
          "    for col in range(fila):",
          '        linea += "*"',
          "    print(linea)",
        ],
        goal: "*\n**\n***",
        hint: "Cada fila empieza con una línea vacía, se llena y luego se imprime.",
        why: "El bucle de afuera recorre las filas; el de adentro agrega tantas estrellas como el número de fila.",
      },
      {
        id: "5-8", t: "input", title: "Bucles anidados",
        q: "Escribe exactamente lo que se imprime.",
        code: py`
          c = 0
          for i in range(3):
              for j in range(4):
                  c += 1
          print(c)
        `,
        a: "12",
        hint: "El bucle de adentro da 4 vueltas por cada vuelta del de afuera.",
        why: "3 vueltas × 4 vueltas = 12 veces que se suma 1.",
      },
      {
        id: "5-9", t: "code", title: "Laboratorio: Tabla de multiplicar",
        pre: "n = 7",
        q: "Muestra la tabla de multiplicar de `n` del 1 al 10, una línea por resultado, con el formato `7 x 1 = 7`.",
        goal: "Con n = 7 la primera línea es 7 x 1 = 7 y la última 7 x 10 = 70",
        starter: py`
          for i in range(1, 11):
              pass
        `,
        tests: [
          { out: tabla(7), msg: "Tabla del 7 completa" },
          { pre: "n = 3", out: tabla(3), msg: "Tabla del 3 completa" },
          { uses: ["For", "While"], msg: "Usa un bucle" },
        ],
        sol: py`
          for i in range(1, 11):
              print(n, "x", i, "=", n * i)
        `,
        hint: 'Dentro del bucle: `print(n, "x", i, "=", n * i)`.',
        why: "Un bucle de 10 vueltas reemplaza 10 líneas escritas a mano. Eso es automatizar.",
      },
      {
        id: "5-10", t: "code", boss: true, title: "Jefe: FizzBuzz",
        pre: "n = 15",
        q: "Muestra los números del 1 a `n`, uno por línea. Pero si es múltiplo de 3 escribe `Fizz`, si es múltiplo de 5 `Buzz`, y si es de ambos `FizzBuzz`.",
        goal: "Con n = 15: 1, 2, Fizz, 4, Buzz, Fizz, … FizzBuzz",
        starter: py`
          for i in range(1, n + 1):
              print(i)
        `,
        tests: [
          { out: fizzbuzz(15), msg: "Del 1 al 15" },
          { pre: "n = 5", out: fizzbuzz(5), msg: "Del 1 al 5" },
          { pre: "n = 30", out: fizzbuzz(30), msg: "Del 1 al 30" },
        ],
        sol: py`
          for i in range(1, n + 1):
              if i % 15 == 0:
                  print("FizzBuzz")
              elif i % 3 == 0:
                  print("Fizz")
              elif i % 5 == 0:
                  print("Buzz")
              else:
                  print(i)
        `,
        hint: "Revisa primero el caso de «ambos» (múltiplo de 15); si no, se quedaría en Fizz.",
        why: "FizzBuzz es una pregunta clásica de entrevistas. El orden de las condiciones importa.",
      },
    ],
  },
];
