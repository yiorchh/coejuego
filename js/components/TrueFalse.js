import { BaseQuestion } from "./BaseQuestion.js";

export class TrueFalse extends BaseQuestion {
  render() {
    let selected = null;
    const grid = document.createElement("div");
    grid.className = "options-grid";

    [["Verdadero", true], ["Falso", false]].forEach(([label, value]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "tf-button";
      button.textContent = label;
      button.addEventListener("click", () => {
        if (this.locked) return;
        selected = value;
        grid.querySelectorAll(".tf-button").forEach(item => item.classList.remove("selected"));
        button.classList.add("selected");
        submit.disabled = false;
      });
      grid.append(button);
    });

    const { wrapper, button: submit } = this.createSubmitButton();
    submit.disabled = true;
    submit.addEventListener("click", () => this.submit(selected === this.question.correct));

    this.mount.append(grid, wrapper);
  }
}
