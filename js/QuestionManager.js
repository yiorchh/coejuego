import { MultipleChoice } from "./components/MultipleChoice.js";
import { TrueFalse } from "./components/TrueFalse.js";
import { OrderQuestion } from "./components/OrderQuestion.js";
import { MatchingQuestion } from "./components/MatchingQuestion.js";
import { APAComplete } from "./components/APAComplete.js";

const COMPONENTS = {
  multiple_choice: MultipleChoice,
  true_false: TrueFalse,
  order: OrderQuestion,
  matching: MatchingQuestion,
  apa_complete: APAComplete
};

const LABELS = {
  multiple_choice: "Alternativa correcta",
  true_false: "Verdadero o falso",
  order: "Ordenar elementos",
  matching: "Relacionar casillas",
  apa_complete: "Completar estructura APA"
};

export class QuestionManager {
  constructor({ container, onAnswer }) {
    this.container = container;
    this.onAnswer = onAnswer;
    this.currentComponent = null;
  }

  render(question) {
    const Component = COMPONENTS[question.type];
    if (!Component) throw new Error(`Tipo no compatible: ${question.type}`);

    document.querySelector("#question-text").textContent = question.prompt;
    document.querySelector("#question-type-badge").textContent = LABELS[question.type] ?? question.type;
    document.querySelector("#question-level").textContent = `Nivel ${question.level ?? 1}`;
    document.querySelector("#question-category").textContent = question.category ?? "General";
    document.querySelector("#feedback").textContent = "";
    document.querySelector("#feedback").className = "feedback";

    this.container.innerHTML = "";
    this.currentComponent = new Component({
      question,
      mount: this.container,
      onSubmit: result => this.onAnswer(result)
    });
    this.currentComponent.render();
  }

  lock() {
    this.currentComponent?.lock?.();
  }
}
