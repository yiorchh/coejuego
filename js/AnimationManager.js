export class AnimationManager {
  constructor({ explosionElement, laboratoryElement }) {
    this.explosionElement = explosionElement;
    this.laboratoryElement = laboratoryElement;
  }

  explode() {
    this.explosionElement.classList.remove("active");
    this.laboratoryElement.classList.remove("shake");
    void this.explosionElement.offsetWidth;
    this.explosionElement.classList.add("active");
    this.laboratoryElement.classList.add("shake");
    setTimeout(() => {
      this.explosionElement.classList.remove("active");
      this.laboratoryElement.classList.remove("shake");
    }, 1100);
  }
}
