import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { datasetProfile } from "./simulation";
import {
  ExperimentResult,
  MODEL_META,
  ModelResult,
  SimulationConfig,
} from "./types";

const COLORS = {
  navy: [3, 36, 55] as [number, number, number],
  navy2: [5, 52, 75] as [number, number, number],
  cyan: [0, 198, 231] as [number, number, number],
  cyanLight: [220, 248, 252] as [number, number, number],
  ink: [16, 38, 52] as [number, number, number],
  muted: [85, 107, 120] as [number, number, number],
  line: [185, 210, 220] as [number, number, number],
  paper: [247, 250, 251] as [number, number, number],
  green: [28, 151, 113] as [number, number, number],
  amber: [219, 145, 35] as [number, number, number],
  red: [201, 67, 73] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

const pct = (value: number, digits = 1) => `${(value * 100).toFixed(digits)}%`;
const number = (value: number, digits = 1) =>
  value.toLocaleString("es-PE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

function setText(doc: jsPDF, color = COLORS.ink, size = 10, style = "normal") {
  doc.setTextColor(...color);
  doc.setFont("helvetica", style);
  doc.setFontSize(size);
}

function pageBase(doc: jsPDF, pageNumber: number, section: string) {
  doc.setFillColor(...COLORS.paper);
  doc.rect(0, 0, 210, 297, "F");
  doc.setFillColor(...COLORS.navy);
  doc.rect(0, 0, 210, 17, "F");
  doc.setFillColor(...COLORS.cyan);
  doc.rect(0, 16.4, 210, 0.8, "F");
  setText(doc, COLORS.white, 8.5, "bold");
  doc.text("ISC PULSO STUDIO", 14, 10.7);
  setText(doc, [180, 225, 235], 8);
  doc.text(section.toUpperCase(), 196, 10.7, { align: "right" });
  doc.setDrawColor(...COLORS.line);
  doc.line(14, 281, 196, 281);
  setText(doc, COLORS.muted, 7.5);
  doc.text(
    "Resultados de simulación. No equivalen al desempeño histórico real de ISC.",
    14,
    287,
  );
  doc.text(String(pageNumber).padStart(2, "0"), 196, 287, { align: "right" });
}

function title(
  doc: jsPDF,
  kicker: string,
  heading: string,
  description?: string,
) {
  setText(doc, COLORS.cyan, 9, "bold");
  doc.text(kicker.toUpperCase(), 14, 31);
  setText(doc, COLORS.ink, 23, "bold");
  const lines = doc.splitTextToSize(heading, 176);
  doc.text(lines, 14, 42);
  let y = 42 + lines.length * 9;
  if (description) {
    setText(doc, COLORS.muted, 10.5);
    const descriptionLines = doc.splitTextToSize(description, 176);
    doc.text(descriptionLines, 14, y + 3);
    y += descriptionLines.length * 5 + 7;
  }
  return y;
}

function paragraph(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  width: number,
  size = 10,
  color = COLORS.ink,
) {
  setText(doc, color, size);
  const lines = doc.splitTextToSize(text, width);
  doc.text(lines, x, y);
  return y + lines.length * (size * 0.42 + 1.2);
}

function callout(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  value: string,
  note?: string,
  accent = COLORS.cyan,
) {
  doc.setFillColor(...COLORS.white);
  doc.setDrawColor(...COLORS.line);
  doc.roundedRect(x, y, width, height, 2, 2, "FD");
  doc.setFillColor(...accent);
  doc.rect(x, y, 2, height, "F");
  setText(doc, COLORS.muted, 7.8, "bold");
  doc.text(label.toUpperCase(), x + 6, y + 8);
  setText(doc, COLORS.ink, 18, "bold");
  doc.text(value, x + 6, y + 18);
  if (note) {
    setText(doc, COLORS.muted, 7.5);
    doc.text(doc.splitTextToSize(note, width - 12), x + 6, y + 25);
  }
}

function table(
  doc: jsPDF,
  startY: number,
  head: string[],
  body: Array<Array<string | number>>,
  widths?: Record<number, number>,
) {
  autoTable(doc, {
    startY,
    head: [head],
    body,
    theme: "grid",
    margin: { left: 14, right: 14 },
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 2.4,
      textColor: COLORS.ink,
      lineColor: COLORS.line,
      lineWidth: 0.15,
      overflow: "linebreak",
      valign: "middle",
    },
    headStyles: {
      fillColor: COLORS.navy2,
      textColor: COLORS.white,
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [239, 247, 249] },
    columnStyles: widths
      ? Object.fromEntries(
          Object.entries(widths).map(([key, cellWidth]) => [
            key,
            { cellWidth },
          ]),
        )
      : undefined,
  });
}

function bestResult(experiment: ExperimentResult) {
  return (
    experiment.results.find((result) => result.key === experiment.winner) ??
    experiment.results[0]
  );
}

function configRows(config: SimulationConfig) {
  return [
    ["Universo", "Cantidad de proyectos", config.projectCount.toString(), "Obligatoria"],
    [
      "Universo",
      "Duración",
      `${config.durationMin} a ${config.durationMax} semanas`,
      "Obligatoria",
    ],
    [
      "Universo",
      "Holgura inicial",
      `${number(config.bufferMin)} a ${number(config.bufferMax)} días`,
      "Obligatoria",
    ],
    [
      "Compras",
      "Atraso semanal de compra crítica",
      pct(config.purchaseDelayProbability, 0),
      "Obligatoria",
    ],
    [
      "Compras",
      "Demora promedio",
      `${number(config.purchaseDelayMean)} días`,
      "Obligatoria",
    ],
    [
      "Ingeniería",
      "Plano pendiente por semana",
      pct(config.drawingPendingProbability, 0),
      "Obligatoria",
    ],
    [
      "Ingeniería",
      "Aprobación promedio",
      `${number(config.approvalDaysMean)} días`,
      "Obligatoria",
    ],
    [
      "Campo",
      "Disponibilidad de personal",
      pct(config.staffAvailability, 0),
      "Obligatoria",
    ],
    [
      "Campo",
      "Restricción semanal",
      pct(config.fieldRestrictionProbability, 0),
      "Obligatoria",
    ],
    [
      "Recuperación",
      "Días recuperables por semana",
      number(config.recoveryDaysMean),
      "Obligatoria",
    ],
    [
      "Opcional",
      "Material importado",
      pct(config.importedMaterialShare, 0),
      "Opcional",
    ],
    [
      "Opcional",
      "Calidad base del dato",
      pct(config.baseDataQuality, 0),
      "Opcional",
    ],
    [
      "Opcional",
      "Alta complejidad",
      pct(config.highComplexityShare, 0),
      "Opcional",
    ],
    [
      "Evaluación",
      "Corte de alerta",
      pct(config.alertProgress, 0),
      "Obligatoria",
    ],
  ];
}

function addCover(doc: jsPDF, experiment: ExperimentResult, winner: ModelResult) {
  doc.setFillColor(...COLORS.navy);
  doc.rect(0, 0, 210, 297, "F");
  doc.setDrawColor(16, 91, 116);
  doc.setLineWidth(0.15);
  for (let x = 0; x <= 210; x += 8) doc.line(x, 0, x, 297);
  for (let y = 0; y <= 297; y += 8) doc.line(0, y, 210, y);
  doc.setFillColor(...COLORS.cyan);
  doc.roundedRect(14, 18, 65, 9, 1.5, 1.5, "F");
  setText(doc, COLORS.navy, 7.8, "bold");
  doc.text("REPORTE ACADÉMICO - OPERATIVO", 46.5, 24, { align: "center" });
  setText(doc, COLORS.white, 31, "bold");
  doc.text("ISC PULSO", 14, 63);
  setText(doc, COLORS.cyan, 31, "bold");
  doc.text("STUDIO", 14, 76);
  setText(doc, [190, 225, 234], 13);
  doc.text(
    doc.splitTextToSize(
      "Predicción de riesgo de retraso en proyectos industriales con datos sintéticos y pruebas de información incompleta.",
      152,
    ),
    14,
    94,
  );
  doc.setFillColor(5, 52, 75);
  doc.setDrawColor(28, 111, 138);
  doc.roundedRect(14, 127, 182, 68, 3, 3, "FD");
  setText(doc, [159, 207, 220], 8, "bold");
  doc.text("RESULTADO CENTRAL DE ESTA CORRIDA", 24, 142);
  setText(doc, COLORS.white, 19, "bold");
  doc.text(winner.name, 24, 157);
  setText(doc, COLORS.cyan, 32, "bold");
  doc.text(pct(winner.metrics.balancedAccuracy), 24, 176);
  setText(doc, [183, 222, 231], 9);
  doc.text("exactitud equilibrada en la prueba final", 79, 174);
  doc.text(
    `AUC ${pct(winner.metrics.auc)}   ·   Brier ${winner.metrics.brier.toFixed(3)}   ·   ${experiment.testProjects} proyectos reservados`,
    24,
    186,
  );
  doc.setFillColor(12, 73, 94);
  doc.roundedRect(14, 213, 182, 30, 2, 2, "F");
  setText(doc, COLORS.cyan, 9, "bold");
  doc.text("IMPORTANTE", 23, 225);
  setText(doc, COLORS.white, 9);
  doc.text(
    doc.splitTextToSize(
      "Los resultados describen un laboratorio sintético. Validan el método y la arquitectura, no el desempeño histórico real de ISC.",
      152,
    ),
    52,
    225,
  );
  setText(doc, [155, 202, 214], 8);
  doc.text(`Ejecución ${experiment.runId}`, 14, 272);
  doc.text(new Date(experiment.generatedAt).toLocaleString("es-PE"), 196, 272, {
    align: "right",
  });
}

function addOrganizationPage(doc: jsPDF, page: number) {
  pageBase(doc, page, "Contexto empresarial");
  let y = title(
    doc,
    "01 · La organización y el dolor",
    "El retraso no aparece al final: se va acumulando en cada corte",
    "ISC desarrolla soluciones de energía e infraestructura industrial. En este tipo de proyecto, Ingeniería, Compras y Campo están conectados: un plano pendiente puede retrasar una compra; una compra tardía puede detener fabricación; y una restricción de campo puede consumir la holgura.",
  );
  callout(
    doc,
    14,
    y + 4,
    55,
    42,
    "Señal de origen",
    "Ingeniería",
    "Planos, cambios, aprobaciones y retrabajo.",
  );
  callout(
    doc,
    77,
    y + 4,
    55,
    42,
    "Señal de flujo",
    "Compras",
    "Materiales críticos, demoras y exposición importada.",
    COLORS.amber,
  );
  callout(
    doc,
    140,
    y + 4,
    56,
    42,
    "Señal de efecto",
    "Planificación",
    "Avance, holgura, productividad y restricciones.",
    COLORS.red,
  );
  y += 60;
  setText(doc, COLORS.ink, 14, "bold");
  doc.text("El problema que resuelve ISC PULSO", 14, y);
  y = paragraph(
    doc,
    "Un comité de proyectos no necesita otra tabla extensa: necesita saber qué proyectos requieren atención primero, qué información sustenta la alerta y cuánto cambia la conclusión si el corte semanal llega incompleto.",
    14,
    y + 8,
    182,
    10.5,
  );
  doc.setFillColor(...COLORS.cyanLight);
  doc.setDrawColor(...COLORS.cyan);
  doc.roundedRect(14, y + 5, 182, 45, 3, 3, "FD");
  setText(doc, COLORS.navy, 15, "bold");
  doc.text("Pregunta de Machine Learning", 23, y + 18);
  setText(doc, COLORS.ink, 11);
  doc.text(
    doc.splitTextToSize(
      "Con la información disponible hasta un corte intermedio, ¿qué probabilidad existe de que el proyecto termine fuera de plazo?",
      158,
    ),
    23,
    y + 29,
  );
  setText(doc, COLORS.muted, 8);
  doc.text(
    "Fuente empresarial: https://www.isc.pe/ · Consulta pública utilizada solo para el contexto general.",
    14,
    272,
  );
}

function addConfigurationPage(
  doc: jsPDF,
  page: number,
  experiment: ExperimentResult,
) {
  pageBase(doc, page, "Configuración");
  const y = title(
    doc,
    "02 · Supuestos del universo",
    "Antes de entrenar, definimos el mundo que el modelo observará",
    "Estos valores no predicen por sí solos. Se usan para generar historias de proyectos coherentes y repetibles. La semilla permite reconstruir exactamente la misma corrida.",
  );
  table(
    doc,
    y + 4,
    ["Bloque", "Parámetro", "Valor usado", "Condición"],
    configRows(experiment.dataset.config),
    { 0: 28, 1: 76, 2: 42, 3: 30 },
  );
}

function addDatasetPage(
  doc: jsPDF,
  page: number,
  experiment: ExperimentResult,
) {
  const profile = datasetProfile(experiment.dataset);
  pageBase(doc, page, "Bases sintéticas");
  let y = title(
    doc,
    "03 · Datos de entrada",
    "Dos niveles de información: proyecto y corte semanal",
    "Una fila semanal conserva el estado observable en ese momento. El resultado final se agrega después para enseñar al modelo qué patrones terminaron en retraso.",
  );
  callout(doc, 14, y + 4, 40, 35, "Proyectos", profile.projects.toString());
  callout(
    doc,
    60,
    y + 4,
    40,
    35,
    "Cortes",
    profile.weeklyCuts.toLocaleString("es-PE"),
  );
  callout(
    doc,
    106,
    y + 4,
    40,
    35,
    "Retrasados",
    pct(profile.delayedShare, 0),
    undefined,
    profile.delayedShare > 0.65 ? COLORS.red : COLORS.amber,
  );
  callout(
    doc,
    152,
    y + 4,
    44,
    35,
    "Calidad",
    pct(profile.averageQuality, 0),
  );
  y += 52;
  setText(doc, COLORS.ink, 13, "bold");
  doc.text("Familias de variables usadas por el modelo", 14, y);
  table(
    doc,
    y + 6,
    ["Familia", "Qué observa", "Variables representativas"],
    [
      [
        "Estructura",
        "El tipo de proyecto antes de comenzar.",
        "Sector, tipo, complejidad, duración y holgura inicial.",
      ],
      [
        "Compras",
        "Riesgo de abastecimiento.",
        "Compras críticas pendientes, demora y material importado.",
      ],
      [
        "Ingeniería",
        "Bloqueos técnicos y cambios.",
        "Planos pendientes, días de aprobación, cambios y retrabajo.",
      ],
      [
        "Planificación",
        "Consecuencia acumulada.",
        "Avance previsto, avance real, brecha, holgura y semanas empeorando.",
      ],
      [
        "Campo",
        "Capacidad real de ejecución.",
        "Personal, productividad, restricciones y recuperación.",
      ],
      [
        "Calidad del dato",
        "Confianza del corte.",
        "Porcentaje de integridad y escenarios de información faltante.",
      ],
    ],
    { 0: 28, 1: 57, 2: 91 },
  );
  setText(doc, COLORS.muted, 8.5);
  doc.text(
    "Variable objetivo: Proyecto terminó con retraso (Sí = 1 / No = 0).",
    14,
    270,
  );
}

function addMethodPage(doc: jsPDF, page: number, experiment: ExperimentResult) {
  pageBase(doc, page, "Metodología");
  let y = title(
    doc,
    "04 · Diseño experimental",
    "El modelo aprende, se ajusta y recién después rinde su examen",
    "La división se realiza por proyecto completo. Ninguna semana de un proyecto reservado puede filtrarse hacia el entrenamiento.",
  );
  callout(
    doc,
    14,
    y + 4,
    55,
    42,
    "70% · Aprender",
    `${experiment.trainProjects}`,
    "Proyectos usados para ajustar los patrones internos.",
  );
  callout(
    doc,
    77,
    y + 4,
    55,
    42,
    "15% · Elegir",
    `${experiment.validationProjects}`,
    "Proyectos usados para calibrar y elegir el modelo.",
    COLORS.amber,
  );
  callout(
    doc,
    140,
    y + 4,
    56,
    42,
    "15% · Examinar",
    `${experiment.testProjects}`,
    "Proyectos que permanecen intactos hasta la prueba final.",
    COLORS.green,
  );
  y += 60;
  table(
    doc,
    y,
    ["Etapa", "Qué ocurre", "Qué evita"],
    [
      [
        "1. Simulación",
        "Se generan proyectos y cortes semanales con una semilla reproducible.",
        "Resultados imposibles de reconstruir.",
      ],
      [
        "2. Preparación",
        "Se normalizan números y se codifican sector, tipo y complejidad.",
        "Que una escala grande domine solo por sus unidades.",
      ],
      [
        "3. Entrenamiento",
        "El algoritmo aprende con todos los cortes de los proyectos de entrenamiento.",
        "Usar el resultado final como regla manual.",
      ],
      [
        "4. Calibración",
        "La validación ajusta la probabilidad para acercarla a la frecuencia observada.",
        "Probabilidades exageradamente seguras.",
      ],
      [
        "5. Estrés",
        "Se ocultan campos al azar o bloques completos de áreas.",
        "Confiar en un modelo que solo funciona con bases perfectas.",
      ],
      [
        "6. Prueba final",
        `Se evalúa el corte cercano al ${pct(experiment.dataset.config.alertProgress, 0)} del plazo.`,
        "Medir solo cuando el proyecto ya terminó.",
      ],
    ],
    { 0: 29, 1: 88, 2: 59 },
  );
}

function addModelPage(
  doc: jsPDF,
  page: number,
  experiment: ExperimentResult,
  winner: ModelResult,
) {
  pageBase(doc, page, "Modelo");
  let y = title(
    doc,
    "05 · Algoritmo seleccionado",
    winner.name,
    MODEL_META[winner.key].shortDescription,
  );
  const explanations: Record<ModelResult["key"], Array<[string, string]>> = {
    logistica: [
      ["Entrada", "Cada proyecto se transforma en un conjunto de variables numéricas."],
      ["Combinación", "Cada variable recibe un peso positivo o negativo."],
      ["Transformación", "La función logística convierte la suma en un valor entre 0 y 1."],
      ["Salida", "El valor se interpreta como probabilidad estimada de retraso."],
    ],
    arbol: [
      ["Entrada", "El árbol recibe las mismas variables del corte semanal."],
      ["División", "Busca una pregunta que separe mejor retrasados y cumplidos."],
      ["Ramas", "Repite preguntas hasta formar grupos suficientemente estables."],
      ["Salida", "La proporción de retrasados en la hoja se usa como probabilidad."],
    ],
    bosque: [
      ["Entrada", "Se crean varias muestras de los proyectos de entrenamiento."],
      ["Árboles", "Cada árbol observa una combinación distinta de filas y variables."],
      ["Votación", "Todos producen una probabilidad independiente."],
      ["Salida", "El bosque promedia las probabilidades para reducir inestabilidad."],
    ],
  };
  table(
    doc,
    y + 4,
    ["Paso", "Explicación sencilla"],
    explanations[winner.key],
    { 0: 35, 1: 141 },
  );
  y += 80;
  doc.setFillColor(...COLORS.cyanLight);
  doc.setDrawColor(...COLORS.cyan);
  doc.roundedRect(14, y, 182, 43, 3, 3, "FD");
  setText(doc, COLORS.navy, 13, "bold");
  doc.text("Cómo debe leerse la probabilidad", 23, y + 13);
  paragraph(
    doc,
    "Una probabilidad de 78% no significa que el proyecto esté condenado. Significa que, bajo los patrones aprendidos y con la información disponible, se parece más a las historias que terminaron retrasadas. La acción correcta es priorizar la revisión, no declarar culpabilidad.",
    23,
    y + 23,
    160,
    9.5,
  );
  y += 58;
  setText(doc, COLORS.ink, 12, "bold");
  doc.text("Por qué ganó en esta corrida", 14, y);
  paragraph(
    doc,
    `Obtuvo el mayor puntaje de robustez en validación (${pct(
      winner.validationScore,
    )}). Ese puntaje combina exactitud equilibrada, F1, AUC y calidad probabilística. La prueba final se mantuvo fuera de esta elección.`,
    14,
    y + 8,
    182,
    10,
  );
}

function addComparisonPage(
  doc: jsPDF,
  page: number,
  experiment: ExperimentResult,
) {
  pageBase(doc, page, "Comparación");
  let y = title(
    doc,
    "06 · Arena de modelos",
    experiment.results.length > 1
      ? "Tres algoritmos observaron exactamente el mismo universo"
      : "El modelo seleccionado rindió la misma prueba metodológica",
    "La comparación prioriza probabilidades útiles, capacidad de detectar retrasos y estabilidad ante información incompleta.",
  );
  table(
    doc,
    y + 4,
    [
      "Modelo",
      "Exact. equilibrada",
      "Recall",
      "AUC",
      "Brier ↓",
      "Robustez validación",
    ],
    experiment.results.map((result) => [
      `${result.key === experiment.winner ? "★ " : ""}${result.name}`,
      pct(result.metrics.balancedAccuracy),
      pct(result.metrics.recall),
      pct(result.metrics.auc),
      result.metrics.brier.toFixed(3),
      pct(result.validationScore),
    ]),
    { 0: 53, 1: 29, 2: 22, 3: 22, 4: 22, 5: 28 },
  );
  y += 60;
  setText(doc, COLORS.ink, 13, "bold");
  doc.text("Lectura de las métricas", 14, y);
  table(
    doc,
    y + 6,
    ["Métrica", "Pregunta que responde", "Lectura deseable"],
    [
      ["Recall", "¿Cuántos retrasos reales logró detectar?", "Más alto es mejor."],
      [
        "Especificidad",
        "¿Cuántos proyectos a tiempo reconoció correctamente?",
        "Más alto es mejor.",
      ],
      [
        "Exactitud equilibrada",
        "¿Funciona bien con ambas clases, sin favorecer a la mayoría?",
        "Más alto es mejor.",
      ],
      ["AUC", "¿Ordena un retrasado por encima de un cumplido?", "Más alto es mejor."],
      [
        "Brier",
        "¿Qué tan alejadas están las probabilidades del resultado real?",
        "Más bajo es mejor.",
      ],
    ],
    { 0: 34, 1: 97, 2: 45 },
  );
}

function addMetricsPage(
  doc: jsPDF,
  page: number,
  experiment: ExperimentResult,
  winner: ModelResult,
) {
  pageBase(doc, page, "Prueba final");
  let y = title(
    doc,
    "07 · Resultados fuera de muestra",
    "El examen final se realizó con proyectos nunca vistos",
    `La lectura corresponde al corte cercano al ${pct(
      experiment.dataset.config.alertProgress,
      0,
    )} del plazo. El umbral estadístico para clasificar es 50%; los niveles operativo medio y alto se muestran aparte.`,
  );
  callout(doc, 14, y + 4, 40, 35, "Balanced", pct(winner.metrics.balancedAccuracy));
  callout(doc, 60, y + 4, 40, 35, "Recall", pct(winner.metrics.recall), undefined, COLORS.green);
  callout(doc, 106, y + 4, 40, 35, "AUC", pct(winner.metrics.auc));
  callout(
    doc,
    152,
    y + 4,
    44,
    35,
    "Brier",
    winner.metrics.brier.toFixed(3),
    "Más bajo es mejor.",
    COLORS.amber,
  );
  y += 52;
  setText(doc, COLORS.ink, 13, "bold");
  doc.text("Matriz de confusión", 14, y);
  const m = winner.metrics;
  table(
    doc,
    y + 6,
    ["Resultado real \\ Predicción", "A tiempo", "Con retraso"],
    [
      ["A tiempo", `${m.trueNegative} · Correctos`, `${m.falsePositive} · Falsa alerta`],
      ["Con retraso", `${m.falseNegative} · No detectados`, `${m.truePositive} · Detectados`],
    ],
    { 0: 62, 1: 57, 2: 57 },
  );
  y += 58;
  doc.setFillColor(...COLORS.white);
  doc.setDrawColor(...COLORS.line);
  doc.roundedRect(14, y, 182, 56, 3, 3, "FD");
  setText(doc, COLORS.ink, 12, "bold");
  doc.text("Interpretación operativa", 23, y + 14);
  paragraph(
    doc,
    `El modelo detectó ${m.truePositive} de ${
      m.truePositive + m.falseNegative
    } proyectos retrasados y reconoció ${m.trueNegative} de ${
      m.trueNegative + m.falsePositive
    } proyectos que culminaron a tiempo. Las ${m.falsePositive} falsas alertas representan revisiones adicionales; los ${m.falseNegative} no detectados representan el riesgo más serio porque podrían avanzar sin atención prioritaria.`,
    23,
    y + 25,
    160,
    9.5,
  );
}

function addStressPage(
  doc: jsPDF,
  page: number,
  winner: ModelResult,
) {
  pageBase(doc, page, "Robustez");
  let y = title(
    doc,
    "08 · Prueba con información incompleta",
    "La probabilidad y la confianza del dato son dos cosas distintas",
    "Ocultar campos no convierte automáticamente al proyecto en retrasado. La prueba mide cuánto se deteriora el desempeño cuando ciertas áreas dejan de actualizar.",
  );
  table(
    doc,
    y + 4,
    ["Escenario", "Datos disponibles", "Balanced", "AUC", "Brier", "Pérdida"],
    winner.stress.map((item) => [
      item.scenario,
      pct(item.dataAvailable, 0),
      pct(item.metrics.balancedAccuracy),
      pct(item.metrics.auc),
      item.metrics.brier.toFixed(3),
      item.balancedLoss <= 0
        ? "Sin pérdida"
        : `-${(item.balancedLoss * 100).toFixed(1)} pp`,
    ]),
    { 0: 56, 1: 29, 2: 25, 3: 21, 4: 21, 5: 24 },
  );
  y += 97;
  const worst = [...winner.stress].sort(
    (a, b) => b.balancedLoss - a.balancedLoss,
  )[0];
  doc.setFillColor(...COLORS.cyanLight);
  doc.setDrawColor(...COLORS.cyan);
  doc.roundedRect(14, y, 182, 48, 3, 3, "FD");
  setText(doc, COLORS.navy, 13, "bold");
  doc.text("Hallazgo de robustez", 23, y + 14);
  paragraph(
    doc,
    `El escenario más exigente fue “${worst.scenario}”. La exactitud equilibrada cambió en ${(worst.balancedLoss * 100).toFixed(
      1,
    )} puntos porcentuales frente a la base completa. Cuando la pérdida es grande, el sistema debe reducir la confianza y pedir completar el corte antes de una decisión contractual.`,
    23,
    y + 25,
    160,
    9.5,
  );
}

function addCalibrationPage(
  doc: jsPDF,
  page: number,
  winner: ModelResult,
) {
  pageBase(doc, page, "Calibración");
  let y = title(
    doc,
    "09 · Calidad de las probabilidades",
    "No basta con acertar: un 70% debería comportarse como un 70%",
    "La calibración agrupa predicciones similares y compara el riesgo promedio anunciado con la frecuencia de retraso realmente observada.",
  );
  table(
    doc,
    y + 4,
    ["Grupo", "Probabilidad anunciada", "Retraso observado", "Proyectos"],
    winner.calibration.map((bin, index) => [
      `Grupo ${index + 1}`,
      pct(bin.expected),
      pct(bin.observed),
      bin.count,
    ]),
    { 0: 40, 1: 48, 2: 48, 3: 40 },
  );
  y += 82;
  doc.setDrawColor(...COLORS.line);
  doc.setFillColor(...COLORS.white);
  doc.roundedRect(14, y, 182, 82, 3, 3, "FD");
  const x0 = 34;
  const y0 = y + 65;
  const chartWidth = 140;
  const chartHeight = 50;
  doc.setDrawColor(160, 185, 195);
  doc.line(x0, y0, x0 + chartWidth, y0);
  doc.line(x0, y0, x0, y0 - chartHeight);
  doc.setDrawColor(...COLORS.line);
  doc.line(x0, y0, x0 + chartWidth, y0 - chartHeight);
  winner.calibration.forEach((bin) => {
    const x = x0 + bin.expected * chartWidth;
    const dotY = y0 - bin.observed * chartHeight;
    doc.setFillColor(...COLORS.cyan);
    doc.circle(x, dotY, 2.2, "F");
  });
  setText(doc, COLORS.muted, 7.5);
  doc.text("Probabilidad anunciada", x0 + chartWidth / 2, y0 + 10, {
    align: "center",
  });
  doc.text("Retraso observado", x0 - 4, y0 - chartHeight / 2, {
    angle: 90,
    align: "center",
  });
  doc.text(
    "La diagonal representa una calibración perfecta. Con pocos proyectos de prueba, los puntos pueden oscilar.",
    14,
    270,
  );
}

function addImportancePage(
  doc: jsPDF,
  page: number,
  winner: ModelResult,
) {
  pageBase(doc, page, "Interpretabilidad");
  const y = title(
    doc,
    "10 · Variables que más influyeron",
    "La importancia muestra qué señales usó el modelo, no qué área tiene la culpa",
    "Una variable importante ayuda a separar historias de riesgo. No demuestra causalidad y no reemplaza la revisión del contexto del proyecto.",
  );
  table(
    doc,
    y + 4,
    ["Variable", "Importancia relativa", "Explicación fácil"],
    winner.importance.map((item) => [
      item.feature,
      pct(item.importance),
      item.plainMeaning,
    ]),
    { 0: 48, 1: 34, 2: 94 },
  );
}

function addPrioritiesPage(
  doc: jsPDF,
  page: number,
  winner: ModelResult,
) {
  pageBase(doc, page, "Aplicación");
  let y = title(
    doc,
    "11 · Priorización de proyectos",
    "La salida operativa es una cola de revisión, no una sentencia",
    "Los proyectos se ordenan por probabilidad estimada. La confianza indica si el corte contiene información suficiente para usar la alerta.",
  );
  table(
    doc,
    y + 4,
    ["Proyecto", "Riesgo", "Nivel", "Confianza", "Señal principal"],
    winner.predictions.slice(0, 12).map((item) => [
      item.projectId,
      pct(item.probability),
      item.risk,
      item.confidence,
      item.mainSignal,
    ]),
    { 0: 35, 1: 25, 2: 24, 3: 26, 4: 66 },
  );
  y += 152;
  setText(doc, COLORS.ink, 12, "bold");
  doc.text("Regla de uso sugerida", 14, y);
  table(
    doc,
    y + 6,
    ["Combinación", "Acción recomendada"],
    [
      [
        "Riesgo alto + confianza alta",
        "Revisar en el siguiente comité y asignar responsable de recuperación.",
      ],
      [
        "Riesgo alto + confianza baja",
        "Completar primero el corte; no tomar una decisión contractual solo con la alerta.",
      ],
      [
        "Riesgo medio",
        "Mantener seguimiento y verificar si la brecha empeora en el próximo corte.",
      ],
      [
        "Riesgo bajo",
        "Continuar monitoreo normal; no significa riesgo cero.",
      ],
    ],
    { 0: 61, 1: 115 },
  );
}

function addRecommendationsPage(
  doc: jsPDF,
  page: number,
  experiment: ExperimentResult,
  winner: ModelResult,
) {
  pageBase(doc, page, "Recomendaciones");
  let y = title(
    doc,
    "12 · Cómo convertir la predicción en una decisión",
    "El valor aparece cuando la alerta activa una regla de intervención",
    "Un modelo sin responsables, plazos de respuesta ni seguimiento se queda en experimento académico.",
  );
  table(
    doc,
    y + 4,
    ["Prioridad", "Recomendación", "Impacto esperado"],
    [
      [
        "1",
        "Definir un dueño del dato por Ingeniería, Compras y Planificación.",
        "Menos cortes incompletos y mayor confianza.",
      ],
      [
        "2",
        `Usar el corte del ${pct(experiment.dataset.config.alertProgress, 0)} como alerta intermedia, no como diagnóstico final.`,
        "Tiempo para intervenir antes de consumir toda la holgura.",
      ],
      [
        "3",
        "Registrar qué acción se tomó después de cada alerta.",
        "Distinguir proyectos recuperados de falsas alertas.",
      ],
      [
        "4",
        "Reentrenar solo cuando exista un bloque suficiente de proyectos cerrados reales.",
        "Evitar que una semana atípica cambie el modelo.",
      ],
      [
        "5",
        "Comparar trimestralmente la calibración y el Brier.",
        "Detectar probabilidades que se vuelven demasiado seguras.",
      ],
    ],
    { 0: 20, 1: 97, 2: 59 },
  );
  y += 108;
  doc.setFillColor(...COLORS.cyanLight);
  doc.setDrawColor(...COLORS.cyan);
  doc.roundedRect(14, y, 182, 53, 3, 3, "FD");
  setText(doc, COLORS.navy, 13, "bold");
  doc.text("Recomendación de esta corrida", 23, y + 14);
  paragraph(
    doc,
    `${winner.name} puede utilizarse como referencia del laboratorio porque obtuvo la mejor robustez de validación. Antes de uso empresarial, debe repetirse la evaluación con fechas contractuales vigentes, ampliaciones aprobadas y cierres reales de ISC.`,
    23,
    y + 25,
    160,
    9.5,
  );
}

function addLimitsPage(
  doc: jsPDF,
  page: number,
  experiment: ExperimentResult,
) {
  pageBase(doc, page, "Límites");
  let y = title(
    doc,
    "13 · Qué se demostró y qué todavía no",
    "La máquina funciona; el mundo sobre el que aprendió sigue siendo sintético",
  );
  table(
    doc,
    y + 4,
    ["Demostrado en el laboratorio", "Pendiente con datos reales de ISC"],
    [
      [
        "La arquitectura puede generar proyectos y cortes reproducibles.",
        "Distribución real de duraciones, sectores y complejidad.",
      ],
      [
        "Los tres modelos pueden entrenarse bajo la misma separación.",
        "Etiquetas basadas en fecha contractual vigente y fecha real.",
      ],
      [
        "La probabilidad puede calibrarse y medirse con Brier.",
        "Ampliaciones de plazo, suspensiones y causas contractuales.",
      ],
      [
        "El deterioro por datos faltantes puede cuantificarse.",
        "Patrón real de faltantes por área y etapa.",
      ],
      [
        "La salida puede transformarse en una cola de revisión.",
        "Validación de utilidad por jefes y responsables de proyectos.",
      ],
    ],
    { 0: 88, 1: 88 },
  );
  y += 111;
  setText(doc, COLORS.ink, 13, "bold");
  doc.text("Riesgos metodológicos que deben vigilarse", 14, y);
  table(
    doc,
    y + 6,
    ["Riesgo", "Control"],
    [
      ["Fuga de información", "Separar siempre por proyecto, nunca por filas aleatorias."],
      [
        "Sobreajuste",
        "Conservar una prueba final intacta y limitar la complejidad de árboles.",
      ],
      [
        "Sesgo sintético",
        "No presentar sectores o causas simuladas como hallazgos reales.",
      ],
      [
        "Cambio operacional",
        "Monitorear si las distribuciones se alejan de las usadas para entrenar.",
      ],
    ],
    { 0: 46, 1: 130 },
  );
  setText(doc, COLORS.muted, 8);
  doc.text(
    `Semilla de simulación: ${experiment.dataset.config.seed} · La misma configuración reproduce el universo.`,
    14,
    270,
  );
}

function addManifestPage(
  doc: jsPDF,
  page: number,
  experiment: ExperimentResult,
  winner: ModelResult,
) {
  pageBase(doc, page, "Trazabilidad");
  let y = title(
    doc,
    "14 · Manifiesto de ejecución",
    "Todo resultado debe poder reconstruirse y auditarse",
  );
  table(
    doc,
    y + 4,
    ["Elemento", "Valor"],
    [
      ["ID de corrida", experiment.runId],
      ["Fecha de generación", new Date(experiment.generatedAt).toLocaleString("es-PE")],
      ["Semilla", experiment.dataset.config.seed],
      ["Proyectos", experiment.dataset.projects.length],
      ["Cortes semanales", experiment.dataset.rows.length.toLocaleString("es-PE")],
      ["Variables modeladas", experiment.featureCount],
      [
        "División",
        `${experiment.trainProjects} entrenamiento / ${experiment.validationProjects} validación / ${experiment.testProjects} prueba`,
      ],
      ["Modelo ganador", winner.name],
      ["Puntaje de validación", pct(winner.validationScore)],
      ["Exactitud equilibrada final", pct(winner.metrics.balancedAccuracy)],
      ["AUC final", pct(winner.metrics.auc)],
      ["Brier final", winner.metrics.brier.toFixed(4)],
      ["Corte de alerta", pct(experiment.dataset.config.alertProgress, 0)],
      [
        "Umbrales operativos",
        `Medio ${pct(experiment.dataset.config.mediumRiskThreshold, 0)} / Alto ${pct(
          experiment.dataset.config.highRiskThreshold,
          0,
        )}`,
      ],
    ],
    { 0: 58, 1: 118 },
  );
  y += 164;
  setText(doc, COLORS.ink, 12, "bold");
  doc.text("Fuentes y alcance", 14, y);
  y = paragraph(
    doc,
    "Contexto empresarial general: https://www.isc.pe/. Metodología y resultados: cálculo interno de ISC PULSO Studio a partir de datos sintéticos. Este documento no utiliza ni representa una base histórica confidencial de la empresa.",
    14,
    y + 8,
    182,
    9.5,
  );
  setText(doc, COLORS.cyan, 10, "bold");
  doc.text("Fin del reporte", 14, y + 10);
}

export function buildAcademicPdf(experiment: ExperimentResult) {
  const winner = bestResult(experiment);
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });
  doc.setProperties({
    title: `ISC PULSO - ${experiment.runId}`,
    subject: "Reporte académico y operativo de Machine Learning",
    author: "ISC PULSO Studio",
    creator: "ISC PULSO Studio",
  });

  addCover(doc, experiment, winner);
  const pages: Array<(page: number) => void> = [
    (page) => addOrganizationPage(doc, page),
    (page) => addConfigurationPage(doc, page, experiment),
    (page) => addDatasetPage(doc, page, experiment),
    (page) => addMethodPage(doc, page, experiment),
    (page) => addModelPage(doc, page, experiment, winner),
    (page) => addComparisonPage(doc, page, experiment),
    (page) => addMetricsPage(doc, page, experiment, winner),
    (page) => addStressPage(doc, page, winner),
    (page) => addCalibrationPage(doc, page, winner),
    (page) => addImportancePage(doc, page, winner),
    (page) => addPrioritiesPage(doc, page, winner),
    (page) => addRecommendationsPage(doc, page, experiment, winner),
    (page) => addLimitsPage(doc, page, experiment),
    (page) => addManifestPage(doc, page, experiment, winner),
  ];
  pages.forEach((render, index) => {
    doc.addPage();
    render(index + 2);
  });
  return new Uint8Array(doc.output("arraybuffer"));
}

export function generateAcademicPdf(experiment: ExperimentResult) {
  const bytes = buildAcademicPdf(experiment);
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `ISC_PULSO_REPORTE_${experiment.runId}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}
