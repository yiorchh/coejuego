import { OrderQuestion } from "./OrderQuestion.js";

export class APAComplete extends OrderQuestion {
  render() {
    const hint = document.createElement("p");
    hint.innerHTML = "<strong>Estructura a completar:</strong> arrastra los bloques desde el primer elemento hasta el último.";
    hint.style.marginTop = "0";
    this.mount.append(hint);
    super.render();
  }
}
