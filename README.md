# APA-9000: Laboratorio académico

Juego educativo web creado con HTML5, CSS3 y JavaScript Vanilla. Funciona como sitio estático y es compatible con GitHub Pages.

## 1. Cómo ejecutarlo

El juego carga `data/questions.json` mediante `fetch()`. Por seguridad, los navegadores no permiten esa carga al abrir `index.html` directamente con `file://`.

### Opción rápida con VS Code

1. Abre la carpeta del proyecto en Visual Studio Code.
2. Instala la extensión **Live Server**.
3. Haz clic derecho en `index.html`.
4. Selecciona **Open with Live Server**.

### Opción con Python

Desde la carpeta del proyecto:

```bash
python -m http.server 8000
```

Después abre:

```text
http://localhost:8000
```

---

## 2. Estructura del proyecto

```text
apa9000-laboratorio/
├── index.html
├── README.md
├── css/
│   └── styles.css
├── data/
│   └── questions.json
└── js/
    ├── main.js
    ├── GameManager.js
    ├── QuestionLoader.js
    ├── QuestionManager.js
    ├── HealthManager.js
    ├── PotionManager.js
    ├── ReviveManager.js
    ├── AnimationManager.js
    ├── AudioManager.js
    └── components/
        ├── BaseQuestion.js
        ├── MultipleChoice.js
        ├── TrueFalse.js
        ├── OrderQuestion.js
        ├── APAComplete.js
        └── MatchingQuestion.js
```

Las preguntas y respuestas están únicamente en `data/questions.json`. Los archivos JavaScript contienen el motor, no el contenido académico.

---

## 3. Configuración general del JSON

La primera sección del archivo es `config`:

```json
{
  "config": {
    "health": 100,
    "damagePerError": 25,
    "revives": 3,
    "reviveHealth": 50,
    "reviveDurationMs": 5000,
    "reviveClicksRequired": 12,
    "reviveBlinkIntervalsMs": [700, 450, 250],
    "pointsPerCorrect": 100,
    "timeBonusMax": 500
  }
}
```

### Campos

| Campo | Función |
|---|---|
| `health` | Vida inicial y vida máxima. |
| `damagePerError` | Daño recibido por una respuesta incorrecta. |
| `revives` | Número máximo de intentos para revivir. |
| `reviveHealth` | Vida recuperada al revivir. |
| `reviveDurationMs` | Tiempo del minijuego de reanimación en milisegundos. |
| `reviveClicksRequired` | Cantidad de pulsaciones necesarias. |
| `reviveBlinkIntervalsMs` | Rapidez de desaparición/movimiento del botón en cada intento. |
| `pointsPerCorrect` | Puntos por respuesta correcta. |
| `timeBonusMax` | Bonificación máxima por terminar rápido. |

---

## 4. Cómo agregar un laboratorio

Dentro de `laboratories`, añade un objeto:

```json
{
  "id": "nuevo-laboratorio",
  "name": "Laboratorio de prueba",
  "description": "Descripción que aparece en el menú",
  "questions": []
}
```

Reglas:

- `id` debe ser único.
- Usa letras minúsculas y guiones.
- `questions` debe ser una lista.
- El laboratorio aparecerá automáticamente en la pantalla inicial.

---

## 5. Tipos de preguntas disponibles

Cada pregunta requiere al menos:

```json
{
  "id": "identificador-unico",
  "type": "tipo_de_pregunta",
  "category": "Categoría",
  "level": 1,
  "prompt": "Texto de la pregunta",
  "explanation": "Explicación mostrada después de responder."
}
```

### 5.1 Alternativa múltiple

Tipo: `multiple_choice`

```json
{
  "id": "apa-mc-01",
  "type": "multiple_choice",
  "category": "APA",
  "level": 1,
  "prompt": "¿Qué elemento va primero?",
  "options": ["Autor", "Editorial", "Título", "Fecha"],
  "correctIndex": 0,
  "explanation": "El autor aparece primero."
}
```

`correctIndex` comienza en cero:

- `0`: primera alternativa.
- `1`: segunda.
- `2`: tercera.
- `3`: cuarta.

### 5.2 Verdadero o falso

Tipo: `true_false`

```json
{
  "id": "vf-01",
  "type": "true_false",
  "category": "Fundamentos",
  "level": 1,
  "prompt": "La evidencia empírica puede provenir de experimentos.",
  "correct": true,
  "explanation": "Los experimentos producen evidencia observable."
}
```

Usa `true` o `false` sin comillas.

### 5.3 Ordenar elementos

Tipo: `order`

```json
{
  "id": "orden-01",
  "type": "order",
  "category": "Proceso",
  "level": 2,
  "prompt": "Ordena los pasos.",
  "items": ["Paso C", "Paso A", "Paso B"],
  "correctOrder": ["Paso A", "Paso B", "Paso C"],
  "explanation": "Ese es el orden correcto."
}
```

- `items` es el orden inicial.
- `correctOrder` es el orden correcto.
- Ambos arreglos deben contener exactamente los mismos textos.

### 5.4 Completar estructura APA

Tipo: `apa_complete`

```json
{
  "id": "apa-order-01",
  "type": "apa_complete",
  "category": "Referencias",
  "level": 2,
  "prompt": "Completa la estructura APA.",
  "items": ["Título", "Autor", "Fuente", "Fecha"],
  "correctOrder": ["Autor", "Fecha", "Título", "Fuente"],
  "explanation": "La estructura general es Autor, Fecha, Título y Fuente."
}
```

Funciona como un ejercicio de ordenar, pero muestra una instrucción específica para APA.

### 5.5 Relacionar casillas

Tipo: `matching`

```json
{
  "id": "match-01",
  "type": "matching",
  "category": "Conceptos",
  "level": 2,
  "prompt": "Relaciona cada concepto.",
  "pairs": [
    {
      "left": "Autor",
      "right": "Responsable de la obra"
    },
    {
      "left": "Fecha",
      "right": "Momento de publicación"
    }
  ],
  "explanation": "Cada elemento cumple una función."
}
```

El juego desordena automáticamente la columna derecha.

---

## 6. Cómo agregar una pregunta

1. Abre `data/questions.json`.
2. Busca el laboratorio correspondiente.
3. Dentro de `questions`, añade una coma después de la pregunta anterior.
4. Copia un ejemplo del tipo que necesites.
5. Cambia su `id`, contenido y respuesta.
6. Guarda el archivo.
7. Comprueba que el JSON sea válido.

Ejemplo:

```json
"questions": [
  {
    "id": "pregunta-1",
    "type": "true_false",
    "category": "APA",
    "level": 1,
    "prompt": "Texto de prueba.",
    "correct": true
  },
  {
    "id": "pregunta-2",
    "type": "multiple_choice",
    "category": "APA",
    "level": 1,
    "prompt": "Otra pregunta.",
    "options": ["A", "B", "C"],
    "correctIndex": 1
  }
]
```

No dejes una coma después del último elemento de un arreglo u objeto.

---

## 7. Cómo crear un tipo de pregunta nuevo

Ejemplo: una pregunta de texto corto.

### Paso 1: crear el componente

Crea:

```text
js/components/ShortAnswer.js
```

Debe extender `BaseQuestion`:

```js
import { BaseQuestion } from "./BaseQuestion.js";

export class ShortAnswer extends BaseQuestion {
  render() {
    const input = document.createElement("input");
    const { wrapper, button } = this.createSubmitButton();

    button.addEventListener("click", () => {
      const answer = input.value.trim().toLowerCase();
      const expected = this.question.correctAnswer.trim().toLowerCase();
      this.submit(answer === expected);
    });

    this.mount.append(input, wrapper);
  }
}
```

### Paso 2: registrarlo

Abre `js/QuestionManager.js`.

Importa la clase:

```js
import { ShortAnswer } from "./components/ShortAnswer.js";
```

Añádela a `COMPONENTS`:

```js
short_answer: ShortAnswer
```

Añade su etiqueta a `LABELS`:

```js
short_answer: "Respuesta corta"
```

### Paso 3: usarlo en JSON

```json
{
  "id": "short-01",
  "type": "short_answer",
  "category": "Conceptos",
  "level": 2,
  "prompt": "Escribe el nombre del sistema de citación.",
  "correctAnswer": "APA"
}
```

---

## 8. Mezcla de colores de las pociones

`PotionManager.js` contiene una lista de colores RGB:

```js
const POTION_COLORS = [
  [116, 181, 232],
  [198, 112, 214],
  [89, 196, 154]
];
```

Cuando el vaso está vacío, adopta exactamente el color de la primera poción.

Cuando ya existe líquido, el juego calcula un promedio ponderado:

```text
colorNuevo =
(colorActual × cantidadAnterior + colorEntrante)
÷ (cantidadAnterior + 1)
```

Esto hace que cada poción influya en la mezcla sin borrar completamente los colores anteriores.

Para agregar un color, añade otro arreglo RGB:

```js
[255, 80, 120]
```

---

## 9. Dificultad del sistema de reanimación

En `questions.json`:

```json
"reviveDurationMs": 5000,
"reviveClicksRequired": 12,
"reviveBlinkIntervalsMs": [700, 450, 250]
```

Para hacerlo más difícil:

- Reduce `reviveDurationMs`.
- Aumenta `reviveClicksRequired`.
- Reduce los valores de `reviveBlinkIntervalsMs`.

Ejemplo difícil:

```json
"reviveDurationMs": 4000,
"reviveClicksRequired": 18,
"reviveBlinkIntervalsMs": [500, 300, 180]
```

---

## 10. Cambiar colores y estética

Abre `css/styles.css`.

Los colores principales están al comienzo:

```css
:root {
  --ink: #3e5872;
  --ink-dark: #2d4258;
  --paper: #fbf4e9;
  --blue: #7f9fbe;
  --blue-light: #b9d1e5;
}
```

Cambia esas variables para modificar gran parte de la interfaz.

---

## 11. Cambiar sonidos

El juego usa la Web Audio API y no requiere archivos externos.

Abre:

```text
js/AudioManager.js
```

Cada método genera tonos:

- `correct()`
- `wrong()`
- `revive()`
- `success()`

Puedes cambiar `frequency`, `duration`, `type` y `volume`.

Ejemplo:

```js
this.tone({
  frequency: 700,
  duration: 0.2,
  type: "sine",
  volume: 0.05
});
```

---

## 12. Cambiar imágenes

Esta versión dibuja el laboratorio y el material científico principalmente con CSS, por lo que no necesita imágenes.

Para usar una imagen de fondo:

1. Crea `assets/images`.
2. Guarda allí, por ejemplo, `laboratorio.webp`.
3. En `css/styles.css`, busca `.lab-wall`.
4. Añade:

```css
.lab-wall {
  background-image:
    linear-gradient(rgba(251,244,233,.45), rgba(251,244,233,.45)),
    url("../assets/images/laboratorio.webp");
  background-size: cover;
  background-position: center;
}
```

Las rutas de CSS se calculan desde la carpeta `css`, por eso se utiliza `../assets`.

---

## 13. Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub.
2. Sube todos los archivos manteniendo la estructura de carpetas.
3. En el repositorio abre **Settings**.
4. Entra en **Pages**.
5. En **Build and deployment**, selecciona:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
6. Guarda.
7. Espera a que GitHub publique el sitio.
8. Abre la URL indicada en la sección Pages.

No cambies las rutas `./css`, `./js` y `./data` por rutas que comiencen con `/`, porque las rutas relativas funcionan mejor en repositorios de proyecto.

---

## 14. Validar el JSON

Un error de coma o comillas puede impedir que el juego cargue.

Puedes validarlo con:

- La extensión de JSON de VS Code.
- El formateador integrado de VS Code.
- Cualquier validador JSON confiable.

El mensaje “No se pudo cargar questions.json” normalmente indica:

- El archivo tiene un error de sintaxis.
- Se abrió con `file://`.
- La ruta fue modificada.
- No se mantuvo la carpeta `data`.

---

## 15. Webhook de Discord opcional

El juego no incluye una URL de webhook por seguridad. Si desean enviar los resultados, añadan la llamada al webhook dentro de `finish()` en `GameManager.js` o dentro del callback `onFinish` de `main.js`.

Recuerda eliminar el webhook al terminar la actividad, ya que cualquier URL incluida en un sitio público puede ser visible.


---

## 16. Modo campaña obligatorio

La versión actual ya no permite escoger un laboratorio aislado.

Al presionar **Iniciar todos los experimentos**, el jugador debe completar todos los laboratorios definidos en `laboratories`, excepto los identificadores incluidos en:

```json
"campaignExcludedLaboratoryIds": ["integrado"]
```

El laboratorio `integrado` se excluye porque repite contenidos de los laboratorios específicos. Para incluirlo también, deja el arreglo vacío:

```json
"campaignExcludedLaboratoryIds": []
```

### Vida e intentos

- La vida comienza en 100 HP una sola vez.
- La vida **no se restaura** al cambiar de laboratorio.
- Los tres intentos de reanimación sí se restauran al comenzar cada laboratorio.
- Revivir devuelve la vida indicada por `reviveHealth`.

### Dificultad progresiva de reanimación

```json
"laboratoryDifficulty": {
  "extraClicksPerLaboratory": 1,
  "durationReductionMsPerLaboratory": 250,
  "blinkSpeedIncreasePerLaboratory": 0.08,
  "minimumDurationMs": 5250,
  "minimumBlinkIntervalMs": 520
}
```

Cada laboratorio posterior:

- exige una pulsación adicional;
- reduce ligeramente el tiempo;
- mueve el botón un poco más rápido;
- respeta mínimos para que siga siendo posible.

Los valores base se hicieron más accesibles:

```json
"reviveDurationMs": 6500,
"reviveClicksRequired": 8,
"reviveBlinkIntervalsMs": [1100, 900, 700]
```

### Transparencia durante las reacciones

Al confirmar una respuesta, `GameManager.js` añade la clase:

```css
reaction-active
```

a `#question-panel`. Esto baja temporalmente su opacidad para dejar visible el vertido de la poción o la explosión. La transparencia se controla en `css/styles.css`.


---

## 17. Cambios de esta versión

### Ordenamiento en celulares

Las preguntas `order` y `apa_complete` ahora muestran botones `↑` y `↓` en cada bloque. Esto permite reorganizar elementos en pantallas táctiles sin depender de arrastrar y soltar.

En computador se mantiene también el sistema de arrastre.

### Usuario y nombre completo

El campo inicial ahora solicita el nombre completo del usuario. El resultado y el HUD utilizan “Usuario” en lugar de “Equipo”.

### Partida de un solo intento

Después de ganar o perder:

- el botón para volver al menú queda oculto;
- no puede iniciarse otra partida desde la interfaz;
- para volver a jugar es necesario recargar la página.

### Envío a Discord

Al terminar, se envían al webhook configurado:

- nombre completo;
- victoria o derrota;
- puntaje;
- aciertos;
- tiempo;
- laboratorios completados;
- último laboratorio.

La URL del webhook está escrita en `js/main.js`. Al estar publicada en GitHub Pages, cualquier persona puede verla. Elimina el webhook después de la actividad.


## Corrección: Laboratorio integrado

El laboratorio `integrado` ahora forma parte de la campaña. En `data/questions.json`, `campaignExcludedLaboratoryIds` está vacío, por lo que se muestran y ejecutan todos los laboratorios definidos.


---

## Banco definitivo de preguntas

La versión actual contiene 20 preguntas distribuidas en cuatro laboratorios:

1. Bibliografía comentada.
2. Fundamentos teóricos y empíricos.
3. Géneros de circulación académica.
4. Normas de referencias y mecanismos de cita.

## Cantidad total de intentos de reanimación

Los intentos ya no se restauran al cambiar de laboratorio. Se comparten durante toda la partida.

Para cambiar la cantidad, abre:

```text
data/questions.json
```

y modifica:

```json
"revives": 3
```

Por ejemplo, para permitir cinco intentos:

```json
"revives": 5
```

## Botón de confirmación

El botón para confirmar una respuesta ahora permanece fijo en la parte inferior del panel. El contenido de la pregunta puede desplazarse sin que el botón quede fuera de la pantalla.


---

## Mejoras visuales y de reanimación

- El botón de reanimación ya no desaparece. Cambia de posición con una transición visible.
- Los intervalos mantienen un mínimo para evitar movimientos imposibles de reconocer.
- El vaso central fue reemplazado visualmente por un matraz.
- El chorro de la poción cae verticalmente hacia el matraz.
- Cada respuesta correcta añade una mayor cantidad de líquido.
- Una respuesta incorrecta también vierte una poción roja inestable antes de la explosión.
- La explosión utiliza un destello, anillo expansivo, partículas y una vibración más intensa.


---

## Preguntas prácticas

Se reemplazó una pregunta de cada laboratorio por un caso de aplicación:

- Evaluar qué información falta en un comentario de bibliografía comentada.
- Reconocer evidencia empírica dentro de una investigación concreta.
- Elegir el género académico adecuado para comunicar un experimento.
- Corregir una paráfrasis que no reconoce al autor original.

## Matraz principal

El matraz fue ampliado y ahora utiliza:

- bordes oscuros semitransparentes;
- reflejos de vidrio;
- sombras internas y externas;
- cuello claramente definido;
- líquido adaptado a la forma del recipiente.

El chorro se posiciona exactamente sobre el centro de la boca del matraz.


---

## Corrección definitiva del matraz

El matraz ahora mide 470 × 450 píxeles en escritorio y hasta 390 × 390 píxeles en teléfonos.

El chorro dejó de calcularse respecto de la botella. Ahora utiliza el centro absoluto del laboratorio:

```css
left: calc(50% - 6px);
```

Como el matraz también está centrado con `left: 50%`, ambos comparten exactamente el mismo eje vertical. La botella puede permanecer inclinada a un costado sin desplazar el chorro.
