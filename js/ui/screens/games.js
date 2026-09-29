// Pestaña Juegos: Reto diario, Contrarreloj y Repaso.
import { canDoDaily, dueReviews } from "../../engine/game.js";
import { DAILY_COUNT } from "../../engine/arcade.js";
import { TYPE_LABEL } from "../../data/worlds.js";
import { esc, fmt } from "../dom.js";
import { icon } from "../icons.js";
import { em } from "../emoji.js";

export function gamesScreen(main, _params, app) {
  const s = app.save;
  const daily = canDoDaily(s);
  const due = dueReviews(s);
  const pending = Object.keys(s.review).length;

  main.innerHTML = `
    <div class="page games">
      <h1 class="page-title">${em("joystick", "title-em")} Juegos</h1>

      <article class="game-card daily ${daily ? "" : "done"}">
        <div class="gc-icon">${em("calendar")}</div>
        <div class="gc-main">
          <h2>Reto diario</h2>
          <p>${DAILY_COUNT} preguntas, las mismas para todos hoy. Mientras más rápido, más puntos.</p>
          <p class="gc-meta">${daily ? `Recompensa: hasta ${20 + DAILY_COUNT * 5} XP y ${em("gem")} 25` : `${icon("check")} Completado hoy · vuelve mañana`}</p>
        </div>
        <button class="btn ${daily ? "primary" : "ghost"}" data-act="go" data-to="daily">${daily ? "Jugar" : "Practicar"}</button>
      </article>

      <article class="game-card arcade">
        <div class="gc-icon">${em("stopwatch")}</div>
        <div class="gc-main">
          <h2>Contrarreloj</h2>
          <p>60 segundos, 3 vidas y preguntas sin fin que se ponen más difíciles. Cada acierto suma 2 segundos.</p>
          <p class="gc-meta">${s.arcade.games ? `Tu récord: <b>${fmt(s.arcade.best)}</b> pts · ${s.arcade.bestCorrect} ${s.arcade.bestCorrect === 1 ? "acierto" : "aciertos"}` : "Aún no tienes récord"}</p>
        </div>
        <button class="btn primary" data-act="go" data-to="arcade">Jugar</button>
      </article>

      <article class="game-card review">
        <div class="gc-icon">${em("repeat")}</div>
        <div class="gc-main">
          <h2>Repaso</h2>
          <p>Los niveles que fallas o terminas con 1 estrella vuelven a los 1, 3 y 7 días para que no se te olviden.</p>
          <p class="gc-meta">${due.length ? `<b>${due.length}</b> ${due.length === 1 ? "listo" : "listos"} para hoy` : pending ? `${pending} en espera · nada pendiente hoy` : "Nada pendiente. ¡Vas muy bien!"}</p>
        </div>
        <button class="btn ${due.length ? "primary" : "ghost"}" data-x="review" ${due.length ? "" : "disabled"}>Repasar</button>
      </article>

      ${due.length ? `
        <h2 class="section-title">Para repasar hoy</h2>
        <ul class="review-list">
          ${due.map((lv) => `<li><span class="rv-id">${lv.world}·${lv.num}</span><span class="rv-t">${esc(lv.title)}</span><span class="rv-type">${esc(TYPE_LABEL[lv.t])}</span></li>`).join("")}
        </ul>` : ""}
    </div>`;

  main.addEventListener("click", (e) => {
    if (e.target.closest('[data-x="review"]') && due.length) {
      const [first, ...rest] = due.map((lv) => lv.id);
      app.go("level", { id: first, mode: "review", queue: rest });
    }
  });
}
