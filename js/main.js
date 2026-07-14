import { QuestionLoader } from "./QuestionLoader.js";
import { GameManager } from "./GameManager.js";

const DISCORD_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1526038157135577260/VgoeWLGXMo4vS3o2kh-cEcHSfTRN9rKDcxblAeZE7RDjocRO-qUy416H2zYjB3d05TcK";

const GOOGLE_SHEETS_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbwOlIdjQMwcQ_7acGUADx6H6ERXbKNVi06IxDvAvKqx3GgQLfiZJtrAq4IspYx5WMta/exec";

document.addEventListener("DOMContentLoaded", initializeApp, { once: true });

let gameStartedForUnloadGuard = false;
let gameFinishedForUnloadGuard = false;

window.addEventListener("beforeunload", event => {
  if (!gameStartedForUnloadGuard || gameFinishedForUnloadGuard) return;
  event.preventDefault();
  event.returnValue = "";
});

async function initializeApp() {
  const elements = {
    status: document.querySelector("#load-status"),
    route: document.querySelector("#lab-selector"),
    startButton: document.querySelector("#start-button"),
    userInput: document.querySelector("#user-name"),
    restartButton: document.querySelector("#restart-button")
  };

  const missing = Object.entries(elements)
    .filter(([, element]) => !element)
    .map(([name]) => name);

  if (missing.length > 0) {
    console.error("APA-9000: faltan elementos del HTML:", missing);
    const fallback = document.querySelector("#load-status");
    if (fallback) {
      fallback.textContent =
        "No se pudo inicializar el laboratorio. Recarga la página después de actualizar todos los archivos.";
    }
    return;
  }

  const { status, route, startButton, userInput, restartButton } = elements;
  const loader = new QuestionLoader("./data/questions.json");

  let data = null;
  let campaignLaboratories = [];
  let game = null;
  let gameFinished = false;
  let discordResultSent = false;
  let sheetsResultSent = false;

  function showScreen(id) {
    document.querySelectorAll(".screen").forEach(screen => {
      screen.classList.toggle("active", screen.id === id);
    });
  }

  function renderCampaign(laboratories) {
    route.innerHTML = "";

    laboratories.forEach((laboratory, index) => {
      const card = document.createElement("div");
      card.className = "lab-card campaign-card";
      card.innerHTML = `
        <span class="campaign-number">${index + 1}</span>
        <div>
          <strong>${laboratory.name}</strong>
          <small>${laboratory.description}</small>
        </div>
      `;
      route.append(card);

      if (index < laboratories.length - 1) {
        const connector = document.createElement("span");
        connector.className = "campaign-connector";
        connector.textContent = "→";
        route.append(connector);
      }
    });
  }

  function updateStartState() {
    const validName = userInput.value.trim().length >= 3;
    startButton.disabled = Boolean(
      gameFinished ||
      !data ||
      !campaignLaboratories.length ||
      !validName
    );
  }

  async function sendResultToDiscord(result) {
    if (discordResultSent) return;
    discordResultSent = true;

    const safeName = String(result.user || "Usuario sin nombre")
      .trim()
      .slice(0, 100);

    const payload = {
      username: "APA-9000",
      allowed_mentions: { parse: [] },
      embeds: [
        {
          title: result.victory
            ? "🧪 Experimento completado"
            : "💥 Experimento fallido",
          fields: [
            {
              name: "Nombre completo",
              value: safeName || "No informado",
              inline: false
            },
            {
              name: "Resultado",
              value: result.victory ? "Victoria" : "Derrota",
              inline: true
            },
            {
              name: "Puntaje",
              value: `${result.score} puntos`,
              inline: true
            },
            {
              name: "Aciertos",
              value: `${result.correct}/${result.total}`,
              inline: true
            },
            {
              name: "Tiempo",
              value: result.time,
              inline: true
            },
            {
              name: "Laboratorios completados",
              value: String(result.laboratoriesCompleted),
              inline: true
            },
            {
              name: "Último laboratorio",
              value: result.currentLaboratory,
              inline: true
            }
          ],
          timestamp: new Date().toISOString()
        }
      ]
    };

    const form = new FormData();
    form.append("payload_json", JSON.stringify(payload));

    try {
      await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        body: form
      });
    } catch (error) {
      console.error("No se pudo enviar el resultado a Discord:", error);
    }
  }

  async function sendResultToGoogleSheets(result) {
    if (sheetsResultSent) return;
    sheetsResultSent = true;

    const params = new URLSearchParams({
      nombre: String(result.user || "Usuario sin nombre")
        .trim()
        .slice(0, 100),
      puntaje: String(Math.max(0, Math.round(result.score))),
      aciertos: String(Math.max(0, Math.round(result.correct))),
      total: String(Math.max(1, Math.round(result.total))),
      tiempoSegundos: String(
        Math.max(1, Math.round(result.elapsedSeconds))
      ),
      tiempoTexto: String(result.time || "0:00"),
      victoria: String(Boolean(result.victory)),
      laboratorios: String(
        Math.max(0, Math.round(result.laboratoriesCompleted))
      ),
      vida: String(
        Math.max(0, Math.round(result.remainingHealth ?? 0))
      ),
      reviviresRestantes: String(
        Math.max(0, Math.round(result.remainingRevives ?? 0))
      ),
      ultimoLaboratorio: String(
        result.currentLaboratory || "Campaña"
      ).slice(0, 100)
    });

    try {
      /*
       * no-cors permite enviar desde GitHub Pages a Apps Script.
       * La respuesta es opaca, por lo que el navegador no puede
       * confirmar su contenido, pero el POST sí se ejecuta.
       */
      await fetch(GOOGLE_SHEETS_WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString(),
        keepalive: true
      });

      console.info("Resultado enviado a Google Sheets.");
    } catch (error) {
      console.error(
        "No se pudo enviar el resultado a Google Sheets:",
        error
      );
    }
  }

  userInput.addEventListener("input", updateStartState);

  startButton.addEventListener("click", () => {
    if (gameFinished || !campaignLaboratories.length) return;

    const userName = userInput.value.trim();
    if (userName.length < 3) {
      status.textContent = "Escribe tu nombre completo para comenzar.";
      userInput.focus();
      return;
    }

    startButton.disabled = true;
    userInput.disabled = true;
    gameStartedForUnloadGuard = true;
    gameFinishedForUnloadGuard = false;

    game = new GameManager({
      config: data.config,
      laboratories: campaignLaboratories,
      userName,
      onFinish: async result => {
        gameFinished = true;
        gameFinishedForUnloadGuard = true;
        restartButton.hidden = true;
        startButton.disabled = true;
        userInput.disabled = true;

        showScreen("result-screen");
        document.querySelector("#result-title").textContent = result.victory
          ? "APA-9000 restaurado"
          : "Experimento fallido";
        document.querySelector("#result-user").textContent = result.user;
        document.querySelector("#result-score").textContent = `${result.score} pts`;
        document.querySelector("#result-correct").textContent =
          `${result.correct}/${result.total}`;
        document.querySelector("#result-time").textContent = result.time;
        document.querySelector("#result-message").textContent = result.victory
          ? `Completaste los ${result.laboratoriesCompleted} laboratorios sin restaurar la vida entre experimentos.`
          : `La reacción se perdió en ${result.currentLaboratory}. Para volver a jugar, recarga la página.`;

        await Promise.allSettled([
          sendResultToGoogleSheets(result),
          sendResultToDiscord(result)
        ]);
      }
    });

    showScreen("game-screen");
    game.start();
  });

  // Se conserva el elemento por compatibilidad, pero nunca permite reiniciar.
  restartButton.hidden = true;
  restartButton.addEventListener("click", event => {
    event.preventDefault();
  });

  try {
    data = await loader.load();

    const excluded = new Set(
      data.config.campaignExcludedLaboratoryIds ?? []
    );

    campaignLaboratories = data.laboratories.filter(
      laboratory => !excluded.has(laboratory.id)
    );

    renderCampaign(campaignLaboratories);
    status.textContent =
      `Laboratorio listo: ${campaignLaboratories.length} experimentos obligatorios. Escribe tu nombre completo para comenzar.`;
    updateStartState();
  } catch (error) {
    console.error("APA-9000 no pudo cargar:", error);
    status.textContent =
      "No se pudo inicializar el laboratorio. Verifica que data/questions.json esté en la carpeta correcta.";
    startButton.disabled = true;
  }
}
