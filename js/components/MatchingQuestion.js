import { BaseQuestion } from "./BaseQuestion.js";

export class MatchingQuestion extends BaseQuestion {
  render() {
    const grid = document.createElement("div");
    grid.className = "matching-grid";
    const leftColumn = document.createElement("div");
    const rightColumn = document.createElement("div");
    leftColumn.className = "match-column";
    rightColumn.className = "match-column";
    leftColumn.innerHTML = "<h3>Concepto</h3>";
    rightColumn.innerHTML = "<h3>Correspondencia</h3>";

    const rightItems = [...this.question.pairs]
      .map(pair => pair.right)
      .sort(() => Math.random() - .5);

    let selectedLeft = null;
    let selectedRight = null;
    const matches = new Map();

    const lines = document.createElement("div");
    lines.className = "match-lines";

    const refreshLines = () => {
      lines.innerHTML = "";
      for (const [left, right] of matches.entries()) {
        const line = document.createElement("div");
        line.className = "match-line";
        line.textContent = `${left} → ${right}`;
        lines.append(line);
      }
      submit.disabled = matches.size !== this.question.pairs.length;
    };

    const tryPair = () => {
      if (!selectedLeft || !selectedRight) return;
      matches.set(selectedLeft.dataset.value, selectedRight.dataset.value);
      selectedLeft.classList.add("matched");
      selectedRight.classList.add("matched");
      selectedLeft.classList.remove("selected");
      selectedRight.classList.remove("selected");
      selectedLeft.disabled = true;
      selectedRight.disabled = true;
      selectedLeft = null;
      selectedRight = null;
      refreshLines();
    };

    this.question.pairs.forEach(pair => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "match-item";
      button.dataset.value = pair.left;
      button.textContent = pair.left;
      button.addEventListener("click", () => {
        leftColumn.querySelectorAll(".match-item").forEach(item => item.classList.remove("selected"));
        selectedLeft = button;
        button.classList.add("selected");
        tryPair();
      });
      leftColumn.append(button);
    });

    rightItems.forEach(value => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "match-item";
      button.dataset.value = value;
      button.textContent = value;
      button.addEventListener("click", () => {
        rightColumn.querySelectorAll(".match-item").forEach(item => item.classList.remove("selected"));
        selectedRight = button;
        button.classList.add("selected");
        tryPair();
      });
      rightColumn.append(button);
    });

    const { wrapper, button: submit } = this.createSubmitButton("Comprobar relaciones");
    submit.disabled = true;
    submit.addEventListener("click", () => {
      const correct = this.question.pairs.every(pair => matches.get(pair.left) === pair.right);
      this.submit(correct);
    });

    this.mount.append(grid, lines, wrapper);
    grid.append(leftColumn, rightColumn);
  }
}
