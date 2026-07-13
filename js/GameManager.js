import { HealthManager } from "./HealthManager.js";
import { PotionManager } from "./PotionManager.js";
import { QuestionManager } from "./QuestionManager.js";
import { ReviveManager } from "./ReviveManager.js";
import { AnimationManager } from "./AnimationManager.js";
import { AudioManager } from "./AudioManager.js";

export class GameManager {
  constructor({ config, laboratories, userName, onFinish }) {
    this.config = config;
    this.laboratories = laboratories;
    this.userName = userName;
    this.onFinish = onFinish;

    this.laboratoryIndex = 0;
    this.questionIndex = 0;
    this.correct = 0;
    this.score = 0;
    this.startedAt = null;
    this.busy = false;
    this.destroyed = false;

    this.totalQuestions = laboratories.reduce(
      (sum, laboratory) => sum + laboratory.questions.length,
      0
    );

    this.audio = new AudioManager();

    this.health = new HealthManager({
      maxHealth: config.health,
      damage: config.damagePerError,
      reviveHealth: config.reviveHealth,
      onChange: state => this.updateHealth(state),
      onDeath: () => this.handleDeath()
    });

    this.potions = new PotionManager({
      liquidElement: document.querySelector("#beaker-liquid"),
      bottleElement: document.querySelector("#pouring-potion"),
      countElement: document.querySelector("#potion-count"),
      maxPotions: this.totalQuestions
    });

    this.animations = new AnimationManager({
      explosionElement: document.querySelector("#explosion"),
      laboratoryElement: document.querySelector(".lab-wall")
    });

    this.revives = new ReviveManager({
      totalRevives: config.revives,
      durationMs: config.reviveDurationMs,
      clicksRequired: config.reviveClicksRequired,
      blinkIntervals: config.reviveBlinkIntervalsMs,
      onUpdate: remaining => {
        document.querySelector("#revive-count").textContent = String(remaining);
      }
    });

    this.questionManager = new QuestionManager({
      container: document.querySelector("#question-component"),
      onAnswer: result => this.handleAnswer(result)
    });

    this.questionPanel = document.querySelector("#question-panel");
    this.campaignText = document.querySelector("#campaign-text");
  }

  get currentLaboratory() {
    return this.laboratories[this.laboratoryIndex];
  }

  get currentQuestion() {
    return this.currentLaboratory.questions[this.questionIndex];
  }

  start() {
    this.destroyed = false;
    this.laboratoryIndex = 0;
    this.questionIndex = 0;
    this.correct = 0;
    this.score = 0;
    this.busy = false;
    this.startedAt = performance.now();

    document.querySelector("#hud-user").textContent = this.userName;

    // La vida se restaura solamente al iniciar toda la campaña.
    this.health.reset();
    this.potions.reset();
    this.revives.resetCampaign();
    this.enterLaboratory();
  }

  enterLaboratory() {
    if (this.destroyed) return;

    if (this.laboratoryIndex >= this.laboratories.length) {
      this.finish(true);
      return;
    }

    this.questionIndex = 0;

    // La dificultad puede aumentar, pero los intentos restantes
    // se conservan durante toda la campaña.
    this.revives.configureForLaboratory({
      laboratoryIndex: this.laboratoryIndex,
      difficulty: this.config.laboratoryDifficulty
    });

    document.querySelector("#lab-name").textContent = this.currentLaboratory.name;
    this.campaignText.textContent =
      `Experimento ${this.laboratoryIndex + 1}/${this.laboratories.length}`;

    this.updateProgress();
    this.showLaboratoryTransition();
  }

  async showLaboratoryTransition() {
    this.busy = true;
    this.questionPanel.classList.add("laboratory-transition");
    this.questionPanel.innerHTML = `
      <div class="transition-content">
        <span class="badge">Experimento ${this.laboratoryIndex + 1}</span>
        <h2>${this.currentLaboratory.name}</h2>
        <p>${this.currentLaboratory.description}</p>
        <p class="health-warning">
          Vida actual: <strong>${this.health.health} HP</strong>.
          No se restaurará al pasar al siguiente laboratorio.
        </p>
        <p>Intentos de reanimación restantes:
          <strong>${this.revives.remaining}</strong>.
        </p>
      </div>
    `;

    await new Promise(resolve => setTimeout(resolve, 2200));
    this.questionPanel.classList.remove("laboratory-transition");
    this.restoreQuestionPanelStructure();
    this.busy = false;
    this.showQuestion();
  }

  restoreQuestionPanelStructure() {
    this.questionPanel.innerHTML = `
      <div class="question-heading">
        <span id="question-type-badge" class="badge">Sección</span>
        <span id="question-level" class="level">Nivel 1</span>
      </div>
      <h2 id="question-text">Pregunta</h2>
      <div id="question-component"></div>
      <div id="feedback" class="feedback" aria-live="polite"></div>
    `;

    this.questionManager.container = document.querySelector("#question-component");
  }

  showQuestion() {
    if (this.destroyed) return;

    if (this.questionIndex >= this.currentLaboratory.questions.length) {
      this.laboratoryIndex += 1;
      this.enterLaboratory();
      return;
    }

    this.questionPanel.classList.remove("reaction-active");
    this.questionManager.render(this.currentQuestion);
  }

  async handleAnswer(result) {
    if (this.busy || this.destroyed) return;

    this.busy = true;
    this.questionManager.lock();
    this.questionPanel.classList.add("reaction-active");

    const feedback = document.querySelector("#feedback");
    const question = this.currentQuestion;

    if (result.correct) {
      this.correct += 1;
      this.score += this.config.pointsPerCorrect;
      feedback.textContent = question.explanation || "Reacción estable.";
      feedback.className = "feedback correct";
      this.audio.correct();
      await this.potions.pour();
    } else {
      feedback.textContent = question.explanation || "La mezcla fue inestable.";
      feedback.className = "feedback wrong";
      this.audio.wrong();

      // La poción incorrecta se vierte antes de provocar la explosión.
      await this.potions.pourUnstable();

      this.animations.explode();
      this.health.hit();
      await new Promise(resolve => setTimeout(resolve, 1250));

      if (this.health.health === 0) {
        this.questionPanel.classList.remove("reaction-active");
        this.busy = false;
        return;
      }
    }

    this.questionIndex += 1;
    this.updateProgress();
    await new Promise(resolve => setTimeout(resolve, 450));
    this.questionPanel.classList.remove("reaction-active");
    this.busy = false;
    this.showQuestion();
  }

  async handleDeath() {
    if (this.destroyed) return;

    while (this.revives.remaining > 0) {
      const revived = await this.revives.attempt();

      if (revived) {
        this.audio.revive();
        this.health.revive();
        this.questionIndex += 1;
        this.updateProgress();
        this.busy = false;
        await new Promise(resolve => setTimeout(resolve, 350));
        this.showQuestion();
        return;
      }
    }

    this.finish(false);
  }

  getCompletedQuestionCount() {
    let completed = 0;

    for (let index = 0; index < this.laboratoryIndex; index += 1) {
      completed += this.laboratories[index].questions.length;
    }

    return completed + this.questionIndex;
  }

  updateHealth({ health, maxHealth, percentage }) {
    document.querySelector("#health-text").textContent = `${health} HP`;
    document.querySelector("#health-bar").style.width = `${percentage}%`;
    document.querySelector("#health-bar").setAttribute("aria-valuenow", String(health));
    document.querySelector("#health-bar").setAttribute("aria-valuemax", String(maxHealth));
  }

  updateProgress() {
    const completed = Math.min(this.getCompletedQuestionCount(), this.totalQuestions);
    document.querySelector("#progress-text").textContent =
      `${completed}/${this.totalQuestions}`;
    document.querySelector("#progress-bar").style.width =
      `${this.totalQuestions ? completed / this.totalQuestions * 100 : 0}%`;
  }

  formatTime(ms) {
    const totalSeconds = Math.max(0, Math.round(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  finish(victory) {
    if (this.destroyed) return;

    const elapsed = performance.now() - this.startedAt;
    const bonus = victory
      ? Math.max(0, Math.round(this.config.timeBonusMax - elapsed / 1000 * 5))
      : 0;

    this.score += bonus;
    if (victory) this.audio.success();

    this.onFinish?.({
      victory,
      user: this.userName,
      score: this.score,
      correct: this.correct,
      total: this.totalQuestions,
      time: this.formatTime(elapsed),
      laboratoriesCompleted: victory
        ? this.laboratories.length
        : this.laboratoryIndex,
      currentLaboratory: this.currentLaboratory?.name ?? "la campaña"
    });
  }

  destroy() {
    this.destroyed = true;
  }
}
