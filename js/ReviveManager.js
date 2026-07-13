export class ReviveManager {
  constructor({ totalRevives, durationMs, clicksRequired, blinkIntervals, onUpdate }) {
    this.totalRevives = totalRevives;
    this.remaining = totalRevives;
    this.baseDurationMs = durationMs;
    this.baseClicksRequired = clicksRequired;
    this.baseBlinkIntervals = blinkIntervals;
    this.onUpdate = onUpdate;

    this.durationMs = durationMs;
    this.clicksRequired = clicksRequired;
    this.blinkIntervals = [...blinkIntervals];

    this.modal = document.querySelector("#revive-modal");
    this.button = document.querySelector("#revive-button");
    this.progress = document.querySelector("#revive-progress");
    this.timerText = document.querySelector("#revive-timer");
    this.attemptText = document.querySelector("#revive-attempt");
    this.instruction = document.querySelector("#revive-instruction");
    this.hint = document.querySelector("#revive-hint");
    this.zone = document.querySelector(".revive-zone");
  }

  resetCampaign() {
    this.remaining = this.totalRevives;
    this.onUpdate?.(this.remaining);
  }

  configureForLaboratory({ laboratoryIndex = 0, difficulty = {} } = {}) {
    const extraClicks =
      (difficulty.extraClicksPerLaboratory ?? 1) * laboratoryIndex;
    const durationReduction =
      (difficulty.durationReductionMsPerLaboratory ?? 250) * laboratoryIndex;
    const speedIncrease =
      (difficulty.blinkSpeedIncreasePerLaboratory ?? 0.06) * laboratoryIndex;

    this.clicksRequired = this.baseClicksRequired + extraClicks;
    this.durationMs = Math.max(
      difficulty.minimumDurationMs ?? 5500,
      this.baseDurationMs - durationReduction
    );

    this.blinkIntervals = this.baseBlinkIntervals.map(interval =>
      Math.max(
        difficulty.minimumBlinkIntervalMs ?? 650,
        Math.round(interval * (1 - speedIncrease))
      )
    );

    this.onUpdate?.(this.remaining);
  }

  async attempt() {
    if (this.remaining <= 0) return false;

    const attemptNumber = this.totalRevives - this.remaining + 1;
    const moveInterval =
      this.blinkIntervals[
        Math.min(attemptNumber - 1, this.blinkIntervals.length - 1)
      ];

    this.remaining -= 1;
    this.onUpdate?.(this.remaining);

    this.modal.classList.add("active");
    this.modal.setAttribute("aria-hidden", "false");
    this.attemptText.textContent =
      `Intento ${attemptNumber} de ${this.totalRevives}`;
    this.instruction.textContent =
      "¡PRESIONA EL BOTÓN ⚡ ANTES DE QUE CAMBIE DE POSICIÓN!";
    this.hint.textContent =
      `Necesitas ${this.clicksRequired} pulsaciones. El botón siempre permanece visible.`;
    this.progress.style.width = "0%";

    let clicks = 0;
    let finished = false;
    const startTime = performance.now();
    let rafId = null;
    let moveTimer = null;

    const moveButton = () => {
      if (finished) return;

      const padding = 8;
      const maxX = Math.max(
        padding,
        this.zone.clientWidth - this.button.offsetWidth - padding
      );
      const maxY = Math.max(
        padding,
        this.zone.clientHeight - this.button.offsetHeight - padding
      );

      this.button.classList.add("moving");

      requestAnimationFrame(() => {
        this.button.style.left =
          `${padding + Math.random() * Math.max(0, maxX - padding)}px`;
        this.button.style.top =
          `${padding + Math.random() * Math.max(0, maxY - padding)}px`;

        setTimeout(() => this.button.classList.remove("moving"), 140);
      });
    };

    const scheduleMove = () => {
      clearTimeout(moveTimer);
      moveTimer = setTimeout(() => {
        moveButton();
        scheduleMove();
      }, moveInterval);
    };

    const clickHandler = () => {
      if (finished) return;

      clicks += 1;
      this.progress.style.width =
        `${Math.min(100, (clicks / this.clicksRequired) * 100)}%`;

      this.instruction.textContent =
        clicks >= this.clicksRequired
          ? "¡REACTIVACIÓN COMPLETA!"
          : `¡BIEN! ${clicks}/${this.clicksRequired}`;

      moveButton();
      scheduleMove();
    };

    this.button.style.left = "calc(50% - 44px)";
    this.button.style.top = "calc(50% - 44px)";
    this.button.classList.remove("hidden", "moving");
    this.button.addEventListener("click", clickHandler);
    scheduleMove();

    const result = await new Promise(resolve => {
      const frame = now => {
        const remainingTime = Math.max(
          0,
          this.durationMs - (now - startTime)
        );

        this.timerText.textContent =
          `${(remainingTime / 1000).toFixed(1)} s`;

        if (clicks >= this.clicksRequired) {
          finished = true;
          resolve(true);
          return;
        }

        if (remainingTime <= 0) {
          finished = true;
          resolve(false);
          return;
        }

        rafId = requestAnimationFrame(frame);
      };

      rafId = requestAnimationFrame(frame);
    });

    if (rafId) cancelAnimationFrame(rafId);
    clearTimeout(moveTimer);
    this.button.removeEventListener("click", clickHandler);
    this.button.classList.remove("moving", "hidden");
    this.modal.classList.remove("active");
    this.modal.setAttribute("aria-hidden", "true");

    return result;
  }
}
