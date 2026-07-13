import { BaseQuestion } from "./BaseQuestion.js";

export class MultipleChoice extends BaseQuestion {
  render() {
    let selected = null;
    const grid = document.createElement("div");
    grid.className = "options-grid";

    this.question.options.forEach((option, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "option-button";
      button.textContent = option;
      button.addEventListener("click", () => {
        if (this.locked) return;
        selected = index;
        grid.querySelectorAll(".option-button").forEach(item => item.classList.remove("selected"));
        button.classList.add("selected");
        submit.disabled = false;
      });
      grid.append(button);
    });

    const { wrapper, button: submit } = this.createSubmitButton();
    submit.disabled = true;
    submit.addEventListener("click", () => this.submit(selected === this.question.correctIndex));

    this.mount.append(grid, wrapper);
  }
}
