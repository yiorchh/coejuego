export class QuestionLoader {
  constructor(url) {
    this.url = url;
  }

  async load() {
    const response = await fetch(this.url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`No se pudo cargar ${this.url}: ${response.status}`);
    }

    const data = await response.json();
    this.validate(data);
    return data;
  }

  validate(data) {
    if (!data?.config || !Array.isArray(data?.laboratories)) {
      throw new Error("El JSON debe contener config y laboratories.");
    }

    for (const laboratory of data.laboratories) {
      if (!laboratory.id || !laboratory.name || !Array.isArray(laboratory.questions)) {
        throw new Error("Cada laboratorio necesita id, name y questions.");
      }

      for (const question of laboratory.questions) {
        if (!question.id || !question.type || !question.prompt) {
          throw new Error(`Pregunta inválida en ${laboratory.id}.`);
        }
      }
    }
  }
}
