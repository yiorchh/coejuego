export class AudioManager {
  constructor() {
    this.context = null;
  }

  ensureContext() {
    if (!this.context) {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.context;
  }

  tone({ frequency = 440, duration = 0.15, type = "sine", volume = 0.06 } = {}) {
    const context = this.ensureContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  }

  correct() {
    this.tone({ frequency: 520, duration: .13 });
    setTimeout(() => this.tone({ frequency: 720, duration: .18 }), 110);
  }

  wrong() {
    this.tone({ frequency: 130, duration: .36, type: "sawtooth", volume: .08 });
  }

  revive() {
    this.tone({ frequency: 340, duration: .12, type: "square" });
  }

  success() {
    [440, 554, 659, 880].forEach((frequency, index) => {
      setTimeout(() => this.tone({ frequency, duration: .28 }), index * 120);
    });
  }
}
