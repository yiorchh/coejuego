const POTION_COLORS = [
  [116, 181, 232],
  [198, 112, 214],
  [89, 196, 154],
  [238, 174, 77],
  [232, 106, 124],
  [86, 209, 217],
  [151, 125, 229]
];

export class PotionManager {
  constructor({ liquidElement, bottleElement, countElement, maxPotions }) {
    this.liquidElement = liquidElement;
    this.bottleElement = bottleElement;
    this.countElement = countElement;
    this.maxPotions = Math.max(1, maxPotions);
    this.count = 0;
    this.currentColor = null;
  }

  reset() {
    this.count = 0;
    this.currentColor = null;
    this.countElement.textContent = "0";
    this.liquidElement.style.height = "0%";
    this.liquidElement.style.backgroundColor = "rgb(127,159,190)";
  }

  randomColor() {
    return POTION_COLORS[
      Math.floor(Math.random() * POTION_COLORS.length)
    ];
  }

  mixColors(current, incoming) {
    if (!current) return incoming;

    const previousWeight = this.count;
    return current.map((value, index) =>
      Math.round(
        (value * previousWeight + incoming[index]) /
        (previousWeight + 1)
      )
    );
  }

  async animatePour({ color, unstable = false }) {
    const rgb = `rgb(${color.join(",")})`;

    this.bottleElement
      .querySelector(".potion-liquid")
      .style.backgroundColor = rgb;

    this.bottleElement
      .querySelector(".potion-stream")
      .style.backgroundColor = rgb;

    this.bottleElement.classList.remove("active", "unstable");
    void this.bottleElement.offsetWidth;

    if (unstable) {
      this.bottleElement.classList.add("unstable");
    }

    this.bottleElement.classList.add("active");

    await new Promise(resolve => setTimeout(resolve, 1250));

    this.bottleElement.classList.remove("active", "unstable");
  }

  async pour() {
    const incoming = this.randomColor();
    const mixed = this.mixColors(this.currentColor, incoming);

    await this.animatePour({ color: incoming });

    this.count += 1;
    this.currentColor = mixed;
    this.countElement.textContent = String(this.count);

    this.liquidElement.style.backgroundColor =
      `rgb(${mixed.join(",")})`;

    // El matraz se llena más por cada respuesta correcta.
    const fillPercentage = Math.min(
      92,
      20 + (this.count / this.maxPotions) * 72
    );

    this.liquidElement.style.height = `${fillPercentage}%`;

    await new Promise(resolve => setTimeout(resolve, 250));
  }

  async pourUnstable() {
    // Una poción incorrecta también se vierte antes de explotar.
    const dangerousColor = [232, 72, 72];
    await this.animatePour({
      color: dangerousColor,
      unstable: true
    });
  }
}
