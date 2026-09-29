// Laberintos de la serpiente: se programa a la serpiente para llegar a la meta y comer manzanas.
// Mapas: '#' muro, '.' pasto, 'S' salida de la serpiente, 'A' manzana, 'G' meta.
// Cada nivel puede traer varios mapas: el código debe funcionar en todos (así no se puede memorizar).
import { py } from "./py.js";

const BASICO = ["avanzar", "girar_izquierda", "girar_derecha"];
const SENSORES = ["libre_adelante", "libre_izquierda", "libre_derecha", "hay_manzana", "en_meta"];

export const MAZE_WORLDS = [
  {
    id: 21, track: "maze", short: "L1", art: "apple", needs: "1-10", tier: 3,
    name: "Jardín de la Serpiente",
    topic: "secuencias, bucles y condiciones",
    hue: 110,
    levels: [
      {
        id: "21-1", t: "maze", title: "Primeros pasos",
        learn: "¡Programa a la serpiente! `avanzar()` la mueve una casilla hacia donde mira. Llévala a la bandera.",
        q: "Escribe las órdenes para llegar a la meta.",
        api: ["avanzar"],
        maps: [{ filas: ["#######", "#S...G#", "#######"], dir: "E" }],
        starter: "avanzar()",
        sol: py`
          avanzar()
          avanzar()
          avanzar()
          avanzar()
        `,
        hint: "Cuenta las casillas entre la serpiente y la bandera.",
        why: "Un programa es una lista de órdenes que se ejecutan de arriba hacia abajo.",
      },
      {
        id: "21-2", t: "maze", title: "A la vuelta",
        learn: "`girar_derecha()` y `girar_izquierda()` la hacen girar en su lugar, sin moverse de casilla.",
        q: "Llega a la meta doblando la esquina.",
        api: BASICO,
        maps: [{ filas: ["######", "#S..##", "###.##", "###G##", "######"], dir: "E" }],
        starter: "avanzar()",
        sol: py`
          avanzar()
          avanzar()
          girar_derecha()
          avanzar()
          avanzar()
        `,
        hint: "Avanza hasta la esquina, gira a la derecha (hacia abajo) y sigue.",
        why: "Girar no mueve a la serpiente: solo cambia hacia dónde mira. El siguiente `avanzar()` va en la nueva dirección.",
      },
      {
        id: "21-3", t: "maze", title: "¡Ñam!",
        learn: "`comer()` se come la manzana de la casilla donde estás. Para ganar hay que comerlas **todas** y llegar a la meta.",
        q: "Come las dos manzanas y llega a la meta.",
        api: [...BASICO, "comer"],
        maps: [{ filas: ["#######", "#SA.AG#", "#######"], dir: "E" }],
        starter: "avanzar()\ncomer()",
        sol: py`
          avanzar()
          comer()
          avanzar()
          avanzar()
          comer()
          avanzar()
        `,
        hint: "Detente sobre cada manzana y llama a comer().",
        why: "Si llamas a comer() donde no hay manzana, la serpiente se confunde y el programa se detiene.",
      },
      {
        id: "21-4", t: "maze", title: "Pasillo largo",
        learn: "Para repetir usa `for`: `for i in range(11):` y debajo, con sangría, lo que se repite.",
        q: "Cruza el pasillo usando como máximo **2 líneas** de código.",
        api: ["avanzar"],
        maxLines: 2,
        maps: [{ filas: ["##############", "#S..........G#", "##############"], dir: "E" }],
        starter: "for i in range(1):\n    avanzar()",
        sol: py`
          for i in range(11):
              avanzar()
        `,
        hint: "Cuenta los pasos y ponlos dentro de range().",
        why: "Un bucle reemplaza 11 líneas iguales por 2. Menos código, menos errores.",
      },
      {
        id: "21-5", t: "maze", title: "Manzanas en fila",
        q: "Come las 6 manzanas y llega a la meta en **4 líneas** o menos.",
        api: [...BASICO, "comer"],
        maxLines: 4,
        maps: [{ filas: ["##########", "#SAAAAAAG#", "##########"], dir: "E" }],
        starter: "for i in range(6):\n    avanzar()",
        sol: py`
          for i in range(6):
              avanzar()
              comer()
          avanzar()
        `,
        hint: "Dentro del bucle van dos órdenes: avanzar y comer. Al final, un paso más.",
        why: "Todo lo que tiene sangría bajo el `for` se repite; lo que no, se ejecuta una sola vez al final.",
      },
      {
        id: "21-6", t: "maze", title: "La escalera",
        q: "Baja la escalera hasta la meta en **6 líneas** o menos.",
        api: BASICO,
        maxLines: 6,
        maps: [{ filas: ["########", "#S.#####", "##..####", "###..###", "####..##", "#####.G#", "########"], dir: "E" }],
        starter: "for i in range(4):\n    avanzar()",
        sol: py`
          for i in range(4):
              avanzar()
              girar_derecha()
              avanzar()
              girar_izquierda()
          avanzar()
        `,
        hint: "Cada escalón es: avanzar, girar a la derecha, avanzar, girar a la izquierda.",
        why: "Encontrar el patrón que se repite es la mitad del trabajo de programar.",
      },
      {
        id: "21-7", t: "maze", title: "Tu propia orden",
        learn: "Con `def` creas tus propias órdenes. Por ejemplo, `def media_vuelta():` con dos `girar_derecha()` dentro. Después la usas como cualquier otra: `media_vuelta()`.",
        q: "Ve por la manzana, da media vuelta y regresa a la meta. Crea tu función `media_vuelta()`.",
        api: [...BASICO, "comer"],
        need: ["FunctionDef"],
        maps: [{ filas: ["########", "#G.S..A#", "########"], dir: "E" }],
        starter: "def media_vuelta():\n    girar_derecha()\n\nfor i in range(3):\n    avanzar()\ncomer()",
        sol: py`
          def media_vuelta():
              girar_derecha()
              girar_derecha()

          for i in range(3):
              avanzar()
          comer()
          media_vuelta()
          for i in range(5):
              avanzar()
        `,
        hint: "Media vuelta = girar dos veces hacia el mismo lado.",
        why: "Las funciones le ponen nombre a un grupo de órdenes. Tu código se lee como un plan: «avanza, come, media vuelta, regresa».",
      },
      {
        id: "21-8", t: "maze", title: "¿Hasta dónde?",
        learn: "`while not en_meta():` repite **mientras** la serpiente no esté en la meta. Sirve cuando no sabes cuántos pasos son.",
        q: "Los pasillos cambian de largo en cada prueba. Llega a la meta en todos.",
        api: ["avanzar", "en_meta"],
        maps: [
          { filas: ["#######", "#S...G#", "#######"], dir: "E" },
          { filas: ["############", "#S........G#", "############"], dir: "E" },
          { filas: ["#########", "#S.....G#", "#########"], dir: "E" },
        ],
        starter: "avanzar()\navanzar()\navanzar()\navanzar()",
        sol: py`
          while not en_meta():
              avanzar()
        `,
        hint: "No cuentes pasos: repite avanzar() mientras no estés en la meta.",
        why: "Un programa que funciona con cualquier tamaño es un **algoritmo**: resuelve el problema, no solo un caso.",
      },
      {
        id: "21-9", t: "maze", title: "Manzanas sorpresa",
        learn: "`if hay_manzana():` pregunta si hay manzana en tu casilla. Así comes solo donde hay.",
        q: "Las manzanas cambian de lugar en cada prueba. Cómelas todas y llega a la meta.",
        api: ["avanzar", "comer", "hay_manzana", "en_meta"],
        maps: [
          { filas: ["##########", "#SA..A.AG#", "##########"], dir: "E" },
          { filas: ["###########", "#S.AA....G#", "###########"], dir: "E" },
          { filas: ["########", "#S....G#", "########"], dir: "E" },
        ],
        starter: "while not en_meta():\n    avanzar()",
        sol: py`
          while not en_meta():
              avanzar()
              if hay_manzana():
                  comer()
        `,
        hint: "En cada paso: avanza y, si hay manzana, cómela.",
        why: "Combinar un bucle con una condición es la receta de casi todos los algoritmos.",
      },
      {
        id: "21-10", t: "maze", boss: true, title: "Jefe: El jardín en espiral",
        learn: "`libre_adelante()` dice si la casilla de enfrente está libre. Si no lo está, ¡hay que girar!",
        q: "Recorre el camino (sin saber su forma), come todas las manzanas y llega a la meta. Funciona en todas las pruebas.",
        api: [...BASICO, "comer", ...SENSORES],
        maps: [
          { filas: ["#########", "#S....A.#", "#######.#", "#..A..#.#", "#.###.#.#", "#.#G..#A#", "#.#####.#", "#.......#", "#########"], dir: "E" },
          { filas: ["#######", "#S...A#", "#####.#", "#G....#", "#######"], dir: "E" },
          { filas: ["#####", "#SAG#", "#####"], dir: "E" },
        ],
        starter: "while not en_meta():\n    avanzar()",
        sol: py`
          while not en_meta():
              if hay_manzana():
                  comer()
              if libre_adelante():
                  avanzar()
              else:
                  girar_derecha()
        `,
        hint: "Mientras no llegues: si hay manzana, cómela; si enfrente está libre, avanza; si no, gira a la derecha.",
        why: "Con 7 líneas resolviste caminos que no conocías. Los robots aspiradora empiezan con reglas así de simples.",
      },
    ],
  },
  {
    id: 22, track: "maze", short: "L2", art: "brick", needs: "5-10", tier: 7,
    name: "Laberinto del Minotauro",
    topic: "algoritmos para laberintos",
    hue: 25,
    levels: [
      {
        id: "22-1", t: "maze", title: "¿Izquierda o derecha?",
        learn: "`libre_izquierda()` y `libre_derecha()` dicen si hay paso a cada lado. Con `if / elif / else` decides hacia dónde girar.",
        q: "El camino dobla hacia ambos lados. Llega a la meta en todas las pruebas.",
        api: [...BASICO, "libre_adelante", "libre_izquierda", "libre_derecha", "en_meta"],
        maps: [
          { filas: ["#######", "#S..###", "###.###", "###..G#", "#######"], dir: "E" },
          { filas: ["#######", "###..G#", "###.###", "#S..###", "#######"], dir: "E" },
        ],
        starter: "while not en_meta():\n    if libre_adelante():\n        avanzar()\n    else:\n        girar_derecha()",
        sol: py`
          while not en_meta():
              if libre_adelante():
                  avanzar()
              elif libre_izquierda():
                  girar_izquierda()
              else:
                  girar_derecha()
        `,
        hint: "Si no puedes avanzar, revisa si hay paso a la izquierda; si no, gira a la derecha.",
        why: "`elif` permite elegir entre más de dos caminos. Tu serpiente ya toma decisiones.",
      },
      {
        id: "22-2", t: "maze", title: "Tres pasillos",
        learn: "Un bucle puede ir **dentro** de otro: el de afuera repite «recorre un pasillo y gira»; el de adentro avanza mientras haya paso.",
        q: "Recorre los tres pasillos hasta la meta en **4 líneas** o menos. Los largos cambian en cada prueba.",
        api: [...BASICO, "libre_adelante"],
        maxLines: 4,
        maps: [
          { filas: ["#######", "#G....#", "#####.#", "#S....#", "#######"], dir: "E" },
          { filas: ["##########", "#G.......#", "########.#", "########.#", "#S.......#", "##########"], dir: "E" },
        ],
        starter: "while libre_adelante():\n    avanzar()",
        sol: py`
          for i in range(3):
              while libre_adelante():
                  avanzar()
              girar_izquierda()
        `,
        hint: "Tres veces: avanza hasta el muro y gira a la izquierda.",
        why: "Bucles anidados: el `for` cuenta pasillos y el `while` recorre cada uno sin importar su largo.",
      },
      {
        id: "22-3", t: "maze", title: "Contador de pasos",
        learn: "Tu programa también puede usar variables y `print()`: la salida aparece debajo del laberinto.",
        q: "Llega a la meta y muestra con `print()` cuántas veces avanzaste.",
        api: [...BASICO, "libre_adelante", "libre_izquierda", "libre_derecha", "en_meta"],
        maps: [
          { filas: ["#######", "#S...G#", "#######"], dir: "E", out: "4" },
          { filas: ["#######", "#S..###", "###.###", "###..G#", "#######"], dir: "E", out: "6" },
          { filas: ["######", "#S..##", "###.##", "###G##", "######"], dir: "E", out: "4" },
        ],
        starter: "pasos = 0\nwhile not en_meta():\n    avanzar()\nprint(pasos)",
        sol: py`
          pasos = 0
          while not en_meta():
              if libre_adelante():
                  avanzar()
                  pasos += 1
              elif libre_izquierda():
                  girar_izquierda()
              else:
                  girar_derecha()
          print(pasos)
        `,
        hint: "Suma 1 a `pasos` justo después de cada avanzar(). Los giros no cuentan.",
        why: "Medir cuánto trabaja un algoritmo (pasos, comparaciones) es el primer paso para mejorarlo.",
      },
      {
        id: "22-4", t: "maze", title: "Cosecha total",
        learn: "Para recorrer todo un campo, ve de un lado al otro y regresa por la fila de abajo, como al cortar el pasto. `manzanas_restantes()` dice cuántas faltan.",
        q: "Come **todas** las manzanas del campo. El tamaño cambia en cada prueba.",
        api: [...BASICO, "comer", "libre_adelante", "hay_manzana", "manzanas_restantes"],
        maps: [
          { filas: ["######", "#SAAA#", "#AAAA#", "#AAAA#", "######"], dir: "E" },
          { filas: ["#######", "#SAAAA#", "#AAAAA#", "#######"], dir: "E" },
          { filas: ["####", "#SA#", "#AA#", "#AA#", "#AA#", "####"], dir: "E" },
        ],
        starter: "while libre_adelante():\n    avanzar()\n    comer()",
        sol: py`
          hacia_derecha = True
          while manzanas_restantes() > 0:
              while libre_adelante():
                  avanzar()
                  if hay_manzana():
                      comer()
              if manzanas_restantes() == 0:
                  break
              if hacia_derecha:
                  girar_derecha()
                  avanzar()
                  comer()
                  girar_derecha()
              else:
                  girar_izquierda()
                  avanzar()
                  comer()
                  girar_izquierda()
              hacia_derecha = not hacia_derecha
        `,
        hint: "Recorre la fila completa; al llegar al muro baja una fila y date vuelta. Alterna el giro (derecha, izquierda…) con una variable True/False.",
        why: "Este recorrido en zigzag se llama *boustrophedon*: así trabajan las impresoras, los tractores y los robots de limpieza.",
      },
      {
        id: "22-5", t: "maze", title: "La mano derecha",
        learn: "**Regla de la mano derecha**: si hay paso a tu derecha, gira a la derecha y avanza; si no, sigue derecho; si tampoco puedes, gira a la izquierda. Resuelve cualquier laberinto cuyos muros estén conectados.",
        q: "Sal de laberintos con callejones sin salida. Son distintos en cada prueba.",
        api: [...BASICO, "libre_adelante", "libre_izquierda", "libre_derecha", "en_meta"],
        maps: [
          { filas: ["#########", "#S..#...#", "#.#.#.#.#", "#.#...#.#", "#.#####.#", "#......G#", "#########"], dir: "E" },
          { filas: ["#######", "#S#...#", "#.#.#.#", "#...#G#", "#######"], dir: "S" },
          { filas: ["##########", "#S.....#.#", "#.####.#.#", "#.#..#...#", "#.#.##.###", "#...#..G.#", "##########"], dir: "E" },
        ],
        starter: "while not en_meta():\n    if libre_adelante():\n        avanzar()\n    else:\n        girar_derecha()",
        sol: py`
          while not en_meta():
              if libre_derecha():
                  girar_derecha()
                  avanzar()
              elif libre_adelante():
                  avanzar()
              else:
                  girar_izquierda()
        `,
        hint: "Primero pregunta por la derecha (y avanza después de girar), luego por el frente y, si no, gira a la izquierda.",
        why: "Pegada a un muro, la serpiente termina recorriendo todo el borde conectado… y encuentra la salida.",
      },
      {
        id: "22-6", t: "maze", title: "Callejones con premio",
        q: "Sigue la regla de la mano derecha y come todas las manzanas del camino.",
        api: [...BASICO, "comer", ...SENSORES],
        maps: [
          { filas: ["##########", "#S......G#", "###.##.###", "###A##.###", "######A###", "##########"], dir: "E" },
          { filas: ["#######", "#S#.AA#", "#A#.#.#", "#...#G#", "#######"], dir: "S" },
        ],
        starter: "while not en_meta():\n    if libre_derecha():\n        girar_derecha()\n        avanzar()\n    elif libre_adelante():\n        avanzar()\n    else:\n        girar_izquierda()",
        sol: py`
          while not en_meta():
              if hay_manzana():
                  comer()
              if libre_derecha():
                  girar_derecha()
                  avanzar()
              elif libre_adelante():
                  avanzar()
              else:
                  girar_izquierda()
        `,
        hint: "Agrega al inicio del bucle: si hay manzana, cómela.",
        why: "Sumar una regla nueva a un algoritmo que ya funciona es como se construye software real: paso a paso.",
      },
      {
        id: "22-7", t: "maze", boss: true, title: "Jefe: El laberinto del Minotauro",
        q: "El último desafío: laberintos grandes y desconocidos, con manzanas. Cómelas todas y escapa. Organiza tu solución con al menos una función propia.",
        api: [...BASICO, "comer", ...SENSORES, "manzanas_restantes"],
        need: ["FunctionDef"],
        maps: [
          { filas: ["###########", "#S....#..A#", "#.###.#.#.#", "#.#A..#.#.#", "#.#.###.#.#", "#...#...#.#", "###.#.###.#", "#A....#..G#", "###########"], dir: "E" },
          { filas: ["#########", "#S.#....#", "#.##.##.#", "#..A.#..#", "##.#.#.##", "#..#A#..#", "#.##.##.#", "#A...#.G#", "#########"], dir: "E" },
          { filas: ["#######", "#S.A..#", "#.###.#", "#.#G###", "#.#.#.#", "#A..A.#", "#######"], dir: "E" },
        ],
        starter: "def paso():\n    avanzar()\n\nwhile not en_meta():\n    paso()",
        sol: py`
          def paso():
              if libre_derecha():
                  girar_derecha()
                  avanzar()
              elif libre_adelante():
                  avanzar()
              else:
                  girar_izquierda()

          while not en_meta() or manzanas_restantes() > 0:
              if hay_manzana():
                  comer()
              paso()
        `,
        hint: "Pon la regla de la mano derecha en una función `paso()`. Sigue caminando mientras no estés en la meta **o** falten manzanas.",
        why: "¡Escapaste del laberinto! Descompusiste el problema en una función, un bucle y condiciones: así piensa quien programa.",
      },
    ],
  },
];
