import {
  CalibrationBin,
  ExperimentResult,
  ImportanceItem,
  Metrics,
  MODEL_META,
  ModelChoice,
  ModelKey,
  ModelResult,
  ProjectPrediction,
  SyntheticDataset,
  WeeklyRow,
} from "./types";

type ProgressCallback = (value: number, label: string) => void;
type ScenarioKey =
  | "complete"
  | "random20"
  | "random40"
  | "noPurchases"
  | "noEngineering"
  | "noPlanning";

interface ContinuousFeature {
  key: keyof WeeklyRow;
  label: string;
  meaning: string;
  group: "planning" | "purchases" | "engineering" | "field";
}

interface FeatureStats {
  means: number[];
  deviations: number[];
}

interface Predictor {
  predict(vector: number[]): number;
  importance: number[];
}

interface TreeNode {
  probability: number;
  feature?: number;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
}

const continuousFeatures: ContinuousFeature[] = [
  {
    key: "durationWeeks",
    label: "Duración prevista",
    meaning: "Cuánto tiempo contractual tiene el proyecto.",
    group: "planning",
  },
  {
    key: "initialBufferDays",
    label: "Holgura inicial",
    meaning: "Margen disponible al iniciar el proyecto.",
    group: "planning",
  },
  {
    key: "week",
    label: "Semana de seguimiento",
    meaning: "Momento del proyecto en el que se realiza el corte.",
    group: "planning",
  },
  {
    key: "plannedProgress",
    label: "Avance previsto",
    meaning: "Porcentaje que debería haberse completado.",
    group: "planning",
  },
  {
    key: "actualProgress",
    label: "Avance real",
    meaning: "Porcentaje realmente completado.",
    group: "planning",
  },
  {
    key: "progressGap",
    label: "Brecha de avance",
    meaning: "Distancia entre el avance previsto y el real.",
    group: "planning",
  },
  {
    key: "bufferAvailableDays",
    label: "Holgura disponible",
    meaning: "Margen que todavía queda antes de comprometer la fecha.",
    group: "planning",
  },
  {
    key: "criticalPurchasesPending",
    label: "Compras críticas pendientes",
    meaning: "Materiales o equipos relevantes que todavía no llegaron.",
    group: "purchases",
  },
  {
    key: "purchaseDelayDays",
    label: "Demora de compras",
    meaning: "Días promedio de demora de las compras críticas.",
    group: "purchases",
  },
  {
    key: "importedMaterialShare",
    label: "Material importado",
    meaning: "Proporción del proyecto expuesta a abastecimiento internacional.",
    group: "purchases",
  },
  {
    key: "drawingsPending",
    label: "Planos pendientes",
    meaning: "Planos que todavía esperan aprobación.",
    group: "engineering",
  },
  {
    key: "engineeringWaitDays",
    label: "Espera de ingeniería",
    meaning: "Tiempo promedio que toman las aprobaciones.",
    group: "engineering",
  },
  {
    key: "engineeringChanges",
    label: "Cambios de ingeniería",
    meaning: "Cambios abiertos que pueden generar nuevas tareas.",
    group: "engineering",
  },
  {
    key: "reworkHours",
    label: "Horas de retrabajo",
    meaning: "Trabajo repetido por correcciones o cambios.",
    group: "engineering",
  },
  {
    key: "plannedStaff",
    label: "Personal previsto",
    meaning: "Dotación necesaria para ejecutar el plan semanal.",
    group: "field",
  },
  {
    key: "availableStaff",
    label: "Personal disponible",
    meaning: "Dotación que realmente estuvo disponible.",
    group: "field",
  },
  {
    key: "productivity",
    label: "Productividad real",
    meaning: "Rendimiento observado frente al estándar esperado.",
    group: "field",
  },
  {
    key: "fieldRestrictions",
    label: "Restricciones de campo",
    meaning: "Bloqueos de acceso, permisos o interferencias abiertas.",
    group: "field",
  },
  {
    key: "recoveredDays",
    label: "Días recuperados",
    meaning: "Tiempo ganado mediante acciones de recuperación.",
    group: "field",
  },
  {
    key: "worseningWeeks",
    label: "Semanas empeorando",
    meaning: "Cantidad de cortes consecutivos con deterioro.",
    group: "planning",
  },
  {
    key: "dataQuality",
    label: "Calidad del dato",
    meaning: "Qué tan completo y consistente es el corte semanal.",
    group: "planning",
  },
];

const categories = {
  sector: ["Minería", "Industria", "Energía", "Cemento"],
  projectType: [
    "Fabricación",
    "Montaje",
    "Ingeniería y fabricación",
    "Proyecto integral",
  ],
  complexity: ["Baja", "Media", "Alta"],
};

const categoryLabels = [
  ...categories.sector.map((item) => `Sector: ${item}`),
  ...categories.projectType.map((item) => `Tipo: ${item}`),
  ...categories.complexity.map((item) => `Complejidad: ${item}`),
];

const featureLabels = [
  ...continuousFeatures.map((feature) => feature.label),
  ...categoryLabels,
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function randomFactory(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], seed: number) {
  const output = [...items];
  const random = randomFactory(seed);
  for (let index = output.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [output[index], output[target]] = [output[target], output[index]];
  }
  return output;
}

function sigmoid(value: number) {
  if (value >= 0) return 1 / (1 + Math.exp(-Math.min(value, 35)));
  const exp = Math.exp(Math.max(value, -35));
  return exp / (1 + exp);
}

function computeStats(rows: WeeklyRow[]): FeatureStats {
  const means = continuousFeatures.map((feature) => {
    return (
      rows.reduce((sum, row) => sum + Number(row[feature.key]), 0) / rows.length
    );
  });
  const deviations = continuousFeatures.map((feature, featureIndex) => {
    const variance =
      rows.reduce((sum, row) => {
        const difference = Number(row[feature.key]) - means[featureIndex];
        return sum + difference * difference;
      }, 0) / Math.max(1, rows.length - 1);
    return Math.max(Math.sqrt(variance), 1e-6);
  });
  return { means, deviations };
}

function vectorize(row: WeeklyRow, stats: FeatureStats) {
  const numeric = continuousFeatures.map(
    (feature, index) =>
      (Number(row[feature.key]) - stats.means[index]) / stats.deviations[index],
  );
  const encoded = [
    ...categories.sector.map((item) => (row.sector === item ? 1 : 0)),
    ...categories.projectType.map((item) => (row.projectType === item ? 1 : 0)),
    ...categories.complexity.map((item) => (row.complexity === item ? 1 : 0)),
  ];
  return [...numeric, ...encoded];
}

function scenarioMask(
  vectors: number[][],
  scenario: ScenarioKey,
  seed: number,
) {
  const output = vectors.map((vector) => [...vector]);
  if (scenario === "complete") return output;
  const random = randomFactory(seed);
  const groupIndexes = (group: ContinuousFeature["group"]) =>
    continuousFeatures
      .map((feature, index) => ({ feature, index }))
      .filter((item) => item.feature.group === group)
      .map((item) => item.index);
  let fixedIndexes: number[] = [];
  if (scenario === "noPurchases") fixedIndexes = groupIndexes("purchases");
  if (scenario === "noEngineering") fixedIndexes = groupIndexes("engineering");
  if (scenario === "noPlanning") fixedIndexes = groupIndexes("planning");
  const rate =
    scenario === "random20" ? 0.2 : scenario === "random40" ? 0.4 : null;
  output.forEach((vector) => {
    if (rate !== null) {
      for (let index = 0; index < continuousFeatures.length; index += 1) {
        if (random() < rate) vector[index] = 0;
      }
    } else {
      fixedIndexes.forEach((index) => {
        vector[index] = 0;
      });
    }
  });
  return output;
}

function dot(weights: number[], vector: number[]) {
  let total = 0;
  for (let index = 0; index < weights.length; index += 1) {
    total += weights[index] * vector[index];
  }
  return total;
}

function trainLogistic(vectors: number[][], labels: number[]): Predictor {
  const weights = Array(vectors[0].length).fill(0);
  let bias = 0;
  const positives = labels.reduce((sum, label) => sum + label, 0);
  const negativeWeight = labels.length / Math.max(2, 2 * (labels.length - positives));
  const positiveWeight = labels.length / Math.max(2, 2 * positives);
  const learningRate = 0.055;
  const regularization = 0.0015;

  for (let iteration = 0; iteration < 280; iteration += 1) {
    const gradient = Array(weights.length).fill(0);
    let biasGradient = 0;
    for (let rowIndex = 0; rowIndex < vectors.length; rowIndex += 1) {
      const probability = sigmoid(dot(weights, vectors[rowIndex]) + bias);
      const sampleWeight = labels[rowIndex] ? positiveWeight : negativeWeight;
      const error = (probability - labels[rowIndex]) * sampleWeight;
      biasGradient += error;
      for (let featureIndex = 0; featureIndex < weights.length; featureIndex += 1) {
        gradient[featureIndex] += error * vectors[rowIndex][featureIndex];
      }
    }
    const scale = 1 / vectors.length;
    const scheduledRate = learningRate / (1 + iteration * 0.003);
    for (let featureIndex = 0; featureIndex < weights.length; featureIndex += 1) {
      weights[featureIndex] -=
        scheduledRate *
        (gradient[featureIndex] * scale + regularization * weights[featureIndex]);
    }
    bias -= scheduledRate * biasGradient * scale;
  }

  return {
    predict: (vector) => clamp(sigmoid(dot(weights, vector) + bias), 0.005, 0.995),
    importance: weights.map((weight) => Math.abs(weight)),
  };
}

function gini(labels: number[], indexes: number[]) {
  if (!indexes.length) return 0;
  const positives = indexes.reduce((sum, index) => sum + labels[index], 0);
  const ratio = positives / indexes.length;
  return 1 - ratio * ratio - (1 - ratio) * (1 - ratio);
}

function trainTree(
  vectors: number[][],
  labels: number[],
  options: {
    maxDepth: number;
    minLeaf: number;
    random?: () => number;
    featureSubset?: number;
  },
) {
  const importance = Array(vectors[0].length).fill(0);
  const allFeatures = vectors[0].map((_, index) => index);

  const build = (indexes: number[], depth: number): TreeNode => {
    const positives = indexes.reduce((sum, index) => sum + labels[index], 0);
    const probability = (positives + 1) / (indexes.length + 2);
    if (
      depth >= options.maxDepth ||
      indexes.length < options.minLeaf * 2 ||
      positives === 0 ||
      positives === indexes.length
    ) {
      return { probability };
    }

    let features = allFeatures;
    if (options.featureSubset && options.random) {
      features = shuffle(allFeatures, Math.floor(options.random() * 1_000_000)).slice(
        0,
        options.featureSubset,
      );
    }
    const parentGini = gini(labels, indexes);
    let best:
      | {
          feature: number;
          threshold: number;
          gain: number;
          left: number[];
          right: number[];
        }
      | undefined;

    features.forEach((feature) => {
      const sorted = indexes
        .map((index) => vectors[index][feature])
        .sort((a, b) => a - b);
      const candidates = [0.12, 0.25, 0.4, 0.55, 0.7, 0.85]
        .map((quantile) => sorted[Math.floor((sorted.length - 1) * quantile)])
        .filter((value, index, array) => index === 0 || value !== array[index - 1]);
      candidates.forEach((threshold) => {
        const left: number[] = [];
        const right: number[] = [];
        indexes.forEach((index) => {
          (vectors[index][feature] <= threshold ? left : right).push(index);
        });
        if (left.length < options.minLeaf || right.length < options.minLeaf) return;
        const weighted =
          (left.length / indexes.length) * gini(labels, left) +
          (right.length / indexes.length) * gini(labels, right);
        const gain = parentGini - weighted;
        if (!best || gain > best.gain) {
          best = { feature, threshold, gain, left, right };
        }
      });
    });

    if (!best || best.gain < 1e-5) return { probability };
    const split = best;
    importance[split.feature] += split.gain * indexes.length;
    return {
      probability,
      feature: split.feature,
      threshold: split.threshold,
      left: build(split.left, depth + 1),
      right: build(split.right, depth + 1),
    };
  };

  const root = build(vectors.map((_, index) => index), 0);
  const predictNode = (node: TreeNode, vector: number[]): number => {
    if (
      node.feature === undefined ||
      node.threshold === undefined ||
      !node.left ||
      !node.right
    )
      return node.probability;
    return predictNode(
      vector[node.feature] <= node.threshold ? node.left : node.right,
      vector,
    );
  };
  return {
    root,
    importance,
    predict: (vector: number[]) => clamp(predictNode(root, vector), 0.005, 0.995),
  };
}

function trainDecisionTree(vectors: number[][], labels: number[]): Predictor {
  const trained = trainTree(vectors, labels, { maxDepth: 6, minLeaf: 28 });
  return { predict: trained.predict, importance: trained.importance };
}

function trainRandomForest(
  vectors: number[][],
  labels: number[],
  seed: number,
): Predictor {
  const random = randomFactory(seed + 991);
  const trees: ReturnType<typeof trainTree>[] = [];
  const importance = Array(vectors[0].length).fill(0);
  const treeCount = 23;
  const sampleSize = Math.min(vectors.length, 1800);
  const featureSubset = Math.max(4, Math.round(Math.sqrt(vectors[0].length)));

  for (let treeIndex = 0; treeIndex < treeCount; treeIndex += 1) {
    const sampledVectors: number[][] = [];
    const sampledLabels: number[] = [];
    for (let rowIndex = 0; rowIndex < sampleSize; rowIndex += 1) {
      const source = Math.floor(random() * vectors.length);
      sampledVectors.push(vectors[source]);
      sampledLabels.push(labels[source]);
    }
    const tree = trainTree(sampledVectors, sampledLabels, {
      maxDepth: 7,
      minLeaf: 16,
      random,
      featureSubset,
    });
    tree.importance.forEach((value, index) => {
      importance[index] += value;
    });
    trees.push(tree);
  }
  return {
    predict: (vector) =>
      clamp(
        trees.reduce((sum, tree) => sum + tree.predict(vector), 0) / trees.length,
        0.005,
        0.995,
      ),
    importance,
  };
}

function fitCalibrator(probabilities: number[], labels: number[]) {
  let slope = 1;
  let intercept = 0;
  for (let iteration = 0; iteration < 320; iteration += 1) {
    let slopeGradient = 0;
    let interceptGradient = 0;
    probabilities.forEach((raw, index) => {
      const logit = Math.log(clamp(raw, 1e-5, 1 - 1e-5) / (1 - clamp(raw, 1e-5, 1 - 1e-5)));
      const prediction = sigmoid(slope * logit + intercept);
      const error = prediction - labels[index];
      slopeGradient += error * logit;
      interceptGradient += error;
    });
    const rate = 0.04 / (1 + iteration * 0.004);
    slope -= rate * (slopeGradient / probabilities.length + 0.002 * slope);
    intercept -= rate * (interceptGradient / probabilities.length);
  }
  return (raw: number) => {
    const clipped = clamp(raw, 1e-5, 1 - 1e-5);
    const logit = Math.log(clipped / (1 - clipped));
    return clamp(sigmoid(slope * logit + intercept), 0.005, 0.995);
  };
}

function auc(labels: number[], probabilities: number[]) {
  const ranked = probabilities
    .map((probability, index) => ({ probability, label: labels[index] }))
    .sort((a, b) => a.probability - b.probability);
  const positives = labels.filter(Boolean).length;
  const negatives = labels.length - positives;
  if (!positives || !negatives) return 0.5;
  let rankSum = 0;
  ranked.forEach((item, index) => {
    if (item.label) rankSum += index + 1;
  });
  return (rankSum - (positives * (positives + 1)) / 2) / (positives * negatives);
}

function metrics(labels: number[], probabilities: number[]): Metrics {
  let truePositive = 0;
  let trueNegative = 0;
  let falsePositive = 0;
  let falseNegative = 0;
  let brier = 0;
  labels.forEach((label, index) => {
    const predicted = probabilities[index] >= 0.5 ? 1 : 0;
    if (label === 1 && predicted === 1) truePositive += 1;
    if (label === 0 && predicted === 0) trueNegative += 1;
    if (label === 0 && predicted === 1) falsePositive += 1;
    if (label === 1 && predicted === 0) falseNegative += 1;
    brier += (probabilities[index] - label) ** 2;
  });
  const safe = (numerator: number, denominator: number) =>
    denominator ? numerator / denominator : 0;
  const precision = safe(truePositive, truePositive + falsePositive);
  const recall = safe(truePositive, truePositive + falseNegative);
  const specificity = safe(trueNegative, trueNegative + falsePositive);
  return {
    accuracy: safe(truePositive + trueNegative, labels.length),
    precision,
    recall,
    specificity,
    balancedAccuracy: (recall + specificity) / 2,
    f1: safe(2 * precision * recall, precision + recall),
    auc: auc(labels, probabilities),
    brier: brier / labels.length,
    truePositive,
    trueNegative,
    falsePositive,
    falseNegative,
  };
}

function robustnessScore(value: Metrics) {
  return (
    0.4 * value.balancedAccuracy +
    0.25 * value.f1 +
    0.2 * value.auc +
    0.15 * (1 - value.brier)
  );
}

function selectSnapshot(rows: WeeklyRow[], projectIds: Set<string>, progress: number) {
  const grouped = new Map<string, WeeklyRow[]>();
  rows.forEach((row) => {
    if (!projectIds.has(row.projectId)) return;
    const current = grouped.get(row.projectId) ?? [];
    current.push(row);
    grouped.set(row.projectId, current);
  });
  return [...grouped.values()].map((projectRows) => {
    const sorted = projectRows.sort((a, b) => a.week - b.week);
    const targetWeek = Math.ceil(sorted[0].durationWeeks * progress);
    return (
      [...sorted].reverse().find((row) => row.week <= targetWeek) ?? sorted[0]
    );
  });
}

const scenarioDefinitions: Array<{
  key: ScenarioKey;
  label: string;
  available: number;
}> = [
  { key: "complete", label: "Datos completos", available: 1 },
  { key: "random20", label: "20% de campos faltantes", available: 0.8 },
  { key: "random40", label: "40% de campos faltantes", available: 0.6 },
  { key: "noPurchases", label: "Sin actualización de Compras", available: 0.86 },
  { key: "noEngineering", label: "Sin actualización de Ingeniería", available: 0.81 },
  { key: "noPlanning", label: "Sin actualización de Planificación", available: 0.62 },
];

function calibration(labels: number[], probabilities: number[]): CalibrationBin[] {
  const bins = Array.from({ length: 5 }, () => ({
    expected: 0,
    observed: 0,
    count: 0,
  }));
  probabilities.forEach((probability, index) => {
    const bin = Math.min(4, Math.floor(probability * 5));
    bins[bin].expected += probability;
    bins[bin].observed += labels[index];
    bins[bin].count += 1;
  });
  return bins
    .filter((bin) => bin.count > 0)
    .map((bin) => ({
      expected: bin.expected / bin.count,
      observed: bin.observed / bin.count,
      count: bin.count,
    }));
}

function importanceItems(raw: number[]): ImportanceItem[] {
  const total = raw.reduce((sum, item) => sum + item, 0) || 1;
  return raw
    .map((value, index) => {
      const continuous = continuousFeatures[index];
      return {
        feature: featureLabels[index],
        importance: value / total,
        plainMeaning:
          continuous?.meaning ??
          "Característica estructural utilizada para diferenciar los proyectos.",
      };
    })
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 10);
}

function risk(probability: number, medium: number, high: number) {
  if (probability >= high) return "Alto" as const;
  if (probability >= medium) return "Medio" as const;
  return "Bajo" as const;
}

function mainSignal(row: WeeklyRow) {
  const signals = [
    {
      score: Math.max(0, -row.bufferAvailableDays) / 10,
      text: `Holgura disponible: ${row.bufferAvailableDays.toFixed(1)} días`,
    },
    {
      score: row.progressGap * 5,
      text: `Brecha de avance: ${(row.progressGap * 100).toFixed(1)}%`,
    },
    {
      score: row.criticalPurchasesPending / 3,
      text: `${row.criticalPurchasesPending} compras críticas pendientes`,
    },
    {
      score: row.drawingsPending / 3,
      text: `${row.drawingsPending} planos pendientes`,
    },
    {
      score: Math.max(0, 1 - row.productivity),
      text: `Productividad: ${(row.productivity * 100).toFixed(1)}%`,
    },
  ];
  return signals.sort((a, b) => b.score - a.score)[0].text;
}

function modelTrainer(key: ModelKey, vectors: number[][], labels: number[], seed: number) {
  if (key === "logistica") return trainLogistic(vectors, labels);
  if (key === "arbol") return trainDecisionTree(vectors, labels);
  return trainRandomForest(vectors, labels, seed);
}

function waitForPaint() {
  return new Promise<void>((resolve) => setTimeout(resolve, 35));
}

export async function runExperiment(
  dataset: SyntheticDataset,
  choice: ModelChoice,
  progress: ProgressCallback,
): Promise<ExperimentResult> {
  progress(4, "Separando proyectos sin mezclar sus semanas");
  await waitForPaint();
  const orderedProjects = shuffle(
    dataset.projects.map((project) => project.projectId),
    dataset.config.seed + 71,
  );
  const trainCount = Math.floor(orderedProjects.length * 0.7);
  const validationCount = Math.floor(orderedProjects.length * 0.15);
  const trainIds = new Set(orderedProjects.slice(0, trainCount));
  const validationIds = new Set(
    orderedProjects.slice(trainCount, trainCount + validationCount),
  );
  const testIds = new Set(orderedProjects.slice(trainCount + validationCount));
  const trainRows = dataset.rows.filter((row) => trainIds.has(row.projectId));
  const validationRows = selectSnapshot(
    dataset.rows,
    validationIds,
    dataset.config.alertProgress,
  );
  const testRows = selectSnapshot(
    dataset.rows,
    testIds,
    dataset.config.alertProgress,
  );
  const stats = computeStats(trainRows);
  const trainVectors = trainRows.map((row) => vectorize(row, stats));
  const trainLabels = trainRows.map((row) => row.delayed);
  const validationVectors = validationRows.map((row) => vectorize(row, stats));
  const validationLabels = validationRows.map((row) => row.delayed);
  const testVectors = testRows.map((row) => vectorize(row, stats));
  const testLabels = testRows.map((row) => row.delayed);
  const keys: ModelKey[] =
    choice === "todos" ? ["logistica", "arbol", "bosque"] : [choice];
  const results: ModelResult[] = [];

  for (let modelIndex = 0; modelIndex < keys.length; modelIndex += 1) {
    const key = keys[modelIndex];
    const start = performance.now();
    const baseProgress = 12 + Math.round((modelIndex / keys.length) * 52);
    progress(baseProgress, `Entrenando ${MODEL_META[key].name}`);
    await waitForPaint();
    const predictor = modelTrainer(key, trainVectors, trainLabels, dataset.config.seed);

    progress(baseProgress + Math.round(18 / keys.length), "Calibrando probabilidades");
    await waitForPaint();
    const rawValidation = validationVectors.map(predictor.predict);
    const calibrator = fitCalibrator(rawValidation, validationLabels);
    const validationScenarioMetrics = scenarioDefinitions.map((scenario, index) => {
      const vectors = scenarioMask(
        validationVectors,
        scenario.key,
        dataset.config.seed + 2000 + index,
      );
      return metrics(
        validationLabels,
        vectors.map((vector) => calibrator(predictor.predict(vector))),
      );
    });
    const validationScore =
      validationScenarioMetrics.reduce(
        (sum, item) => sum + robustnessScore(item),
        0,
      ) / validationScenarioMetrics.length;

    progress(baseProgress + Math.round(30 / keys.length), "Probando datos incompletos");
    await waitForPaint();
    const stress = scenarioDefinitions.map((scenario, index) => {
      const vectors = scenarioMask(
        testVectors,
        scenario.key,
        dataset.config.seed + 5000 + index,
      );
      const scenarioMetrics = metrics(
        testLabels,
        vectors.map((vector) => calibrator(predictor.predict(vector))),
      );
      return {
        scenario: scenario.label,
        dataAvailable: scenario.available,
        metrics: scenarioMetrics,
        balancedLoss: 0,
      };
    });
    const baseline = stress[0].metrics.balancedAccuracy;
    stress.forEach((item) => {
      item.balancedLoss = baseline - item.metrics.balancedAccuracy;
    });
    const completeProbabilities = testVectors.map((vector) =>
      calibrator(predictor.predict(vector)),
    );
    const finalMetrics = metrics(testLabels, completeProbabilities);
    const predictions: ProjectPrediction[] = testRows
      .map((row, index) => ({
        projectId: row.projectId,
        probability: completeProbabilities[index],
        risk: risk(
          completeProbabilities[index],
          dataset.config.mediumRiskThreshold,
          dataset.config.highRiskThreshold,
        ),
        confidence:
          row.dataQuality >= 0.9
            ? ("Alta" as const)
            : row.dataQuality >= 0.75
              ? ("Media" as const)
              : ("Baja" as const),
        actualDelayed: row.delayed,
        bufferDays: row.bufferAvailableDays,
        progressGap: row.progressGap,
        mainSignal: mainSignal(row),
      }))
      .sort((a, b) => b.probability - a.probability);

    results.push({
      key,
      name: MODEL_META[key].name,
      shortDescription: MODEL_META[key].shortDescription,
      validationScore,
      metrics: finalMetrics,
      stress,
      importance: importanceItems(predictor.importance),
      calibration: calibration(testLabels, completeProbabilities),
      predictions,
      trainingMilliseconds: performance.now() - start,
    });
  }

  progress(84, "Comparando resultados sin tocar la prueba final");
  await waitForPaint();
  const winner = [...results].sort(
    (a, b) => b.validationScore - a.validationScore,
  )[0].key;
  progress(94, "Preparando el expediente académico y operativo");
  await waitForPaint();
  progress(100, "Experimento terminado");

  return {
    runId: `ISC-${dataset.config.seed}-${Date.now().toString(36).toUpperCase()}`,
    generatedAt: new Date().toISOString(),
    choice,
    winner,
    trainProjects: trainIds.size,
    validationProjects: validationIds.size,
    testProjects: testIds.size,
    featureCount: featureLabels.length,
    results,
    dataset,
  };
}
