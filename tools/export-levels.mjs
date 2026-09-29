// Exporta todos los niveles como JSON (lo usa tools/verify_levels.py).
import { WORLDS } from "../js/data/worlds.js";

process.stdout.write(JSON.stringify(WORLDS));
