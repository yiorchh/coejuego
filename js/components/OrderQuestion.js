import { BaseQuestion } from "./BaseQuestion.js";

export class OrderQuestion extends BaseQuestion {
  render() {
    const list = document.createElement("div");
    list.className = "order-list";

    const refreshButtons = () => {
      const items = [...list.children];
      items.forEach((item, index) => {
        const up = item.querySelector("[data-action='up']");
        const down = item.querySelector("[data-action='down']");
        if (up) up.disabled = this.locked || index === 0;
        if (down) down.disabled = this.locked || index === items.length - 1;
      });
    };

    const moveItem = (item, direction) => {
      if (this.locked) return;

      if (direction === "up" && item.previousElementSibling) {
        list.insertBefore(item, item.previousElementSibling);
      }

      if (direction === "down" && item.nextElementSibling) {
        list.insertBefore(item.nextElementSibling, item);
      }

      refreshButtons();
    };

    this.question.items.forEach(text => {
      const item = document.createElement("div");
      item.className = "order-item";
      item.draggable = true;
      item.dataset.value = text;

      const label = document.createElement("span");
      label.className = "order-label";
      label.textContent = text;

      const controls = document.createElement("div");
      controls.className = "order-controls";

      const up = document.createElement("button");
      up.type = "button";
      up.className = "order-control-button";
      up.dataset.action = "up";
      up.setAttribute("aria-label", `Subir ${text}`);
      up.textContent = "↑";

      const down = document.createElement("button");
      down.type = "button";
      down.className = "order-control-button";
      down.dataset.action = "down";
      down.setAttribute("aria-label", `Bajar ${text}`);
      down.textContent = "↓";

      up.addEventListener("click", () => moveItem(item, "up"));
      down.addEventListener("click", () => moveItem(item, "down"));

      controls.append(up, down);
      item.append(label, controls);
      list.append(item);
    });

    let dragged = null;

    list.addEventListener("dragstart", event => {
      dragged = event.target.closest(".order-item");
      dragged?.classList.add("dragging");
    });

    list.addEventListener("dragend", () => {
      dragged?.classList.remove("dragging");
      dragged = null;
      refreshButtons();
    });

    list.addEventListener("dragover", event => {
      event.preventDefault();
      const target = event.target.closest(".order-item");
      if (!dragged || !target || target === dragged) return;

      const rect = target.getBoundingClientRect();
      const after = event.clientY > rect.top + rect.height / 2;
      list.insertBefore(dragged, after ? target.nextSibling : target);
    });

    const { wrapper, button } = this.createSubmitButton("Verificar orden");
    button.addEventListener("click", () => {
      const answer = [...list.children].map(item => item.dataset.value);
      this.submit(JSON.stringify(answer) === JSON.stringify(this.question.correctOrder));
    });

    this.mount.append(list, wrapper);
    refreshButtons();
  }

  lock() {
    super.lock();
    this.mount.querySelectorAll(".order-item").forEach(item => {
      item.draggable = false;
    });
  }
}
