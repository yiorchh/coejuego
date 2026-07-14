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
    this.overflowSnapshot = null;
    this.overflowActive = false;
    this.beakerElement = this.liquidElement.closest(".beaker");
    this.spillElement = document.querySelector("#overflow-spill");
  }

  reset() {
    this.count = 0;
    this.currentColor = null;
    this.countElement.textContent = "0";
    this.liquidElement.style.height = "0%";
    this.liquidElement.style.backgroundColor = "rgb(127,159,190)";
    this.resetOverflow({ immediate: true });
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

  beginOverflow() {
    if (this.overflowActive) return;

    this.overflowActive = true;
    this.overflowSnapshot = {
      height: this.liquidElement.style.height || "0%",
      color:
        this.liquidElement.style.backgroundColor ||
        "rgb(127,159,190)"
    };

    if (this.spillElement) {
      this.spillElement.style.setProperty(
        "--spill-color",
        this.overflowSnapshot.color
      );
      this.spillElement.classList.add("active");
    }

    this.beakerElement?.classList.add("overflow-warning");

    // Sube desde el nivel actual hasta sobrepasar la boca en 3 segundos.
    this.liquidElement.style.setProperty(
      "transition",
      "height 3s linear, background-color .4s ease"
    );
    this.liquidElement.style.height = "116%";
  }

  resetOverflow({ immediate = false } = {}) {
    if (!this.overflowSnapshot && !this.overflowActive) {
      this.beakerElement?.classList.remove("overflow-warning");
      this.spillElement?.classList.remove("active", "burst");
      return;
    }

    const snapshot = this.overflowSnapshot ?? {
      height: this.liquidElement.style.height || "0%",
      color:
        this.liquidElement.style.backgroundColor ||
        "rgb(127,159,190)"
    };

    if (immediate) {
      this.liquidElement.style.setProperty("transition", "none");
    } else {
      this.liquidElement.style.setProperty(
        "transition",
        "height .48s ease, background-color .35s ease"
      );
    }

    this.liquidElement.style.height = snapshot.height;
    this.liquidElement.style.backgroundColor = snapshot.color;

    this.beakerElement?.classList.remove("overflow-warning");
    this.spillElement?.classList.remove("active", "burst");

    this.overflowActive = false;
    this.overflowSnapshot = null;

    if (immediate) {
      void this.liquidElement.offsetWidth;
      this.liquidElement.style.removeProperty("transition");
    }
  }

  burstOverflow() {
    this.spillElement?.classList.add("burst");
    this.beakerElement?.classList.add("overflow-burst");
    setTimeout(() => {
      this.beakerElement?.classList.remove("overflow-burst");
    }, 1050);
  }

  async pour() {
    this.resetOverflow();
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
    this.resetOverflow();
    // Una poción incorrecta también se vierte antes de explotar.
    const dangerousColor = [232, 72, 72];
    await this.animatePour({
      color: dangerousColor,
      unstable: true
    });
  }
}
