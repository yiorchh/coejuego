export class BaseQuestion {
  constructor({ question, mount, onSubmit }) {
    this.question = question;
    this.mount = mount;
    this.onSubmit = onSubmit;
    this.locked = false;
  }

  submit(correct) {
    if (this.locked) return;
    this.locked = true;
    this.onSubmit({ correct });
  }

  lock() {
    this.locked = true;
    this.mount.querySelectorAll("button, input, select").forEach(element => {
      element.disabled = true;
    });
  }

  createSubmitButton(label = "Confirmar mezcla") {
    const wrapper = document.createElement("div");
    wrapper.className = "component-actions";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "submit-answer";
    button.textContent = label;
    wrapper.append(button);
    return { wrapper, button };
  }
}
