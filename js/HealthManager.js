export class HealthManager {
  constructor({ maxHealth = 100, damage = 25, reviveHealth = 50, onChange, onDeath }) {
    this.maxHealth = maxHealth;
    this.damage = damage;
    this.reviveHealth = reviveHealth;
    this.health = maxHealth;
    this.onChange = onChange;
    this.onDeath = onDeath;
    this.emit();
  }

  reset() {
    this.health = this.maxHealth;
    this.emit();
  }

  hit() {
    this.health = Math.max(0, this.health - this.damage);
    this.emit();
    if (this.health === 0) this.onDeath?.();
  }

  revive() {
    this.health = this.reviveHealth;
    this.emit();
  }

  emit() {
    this.onChange?.({
      health: this.health,
      maxHealth: this.maxHealth,
      percentage: (this.health / this.maxHealth) * 100
    });
  }
}
