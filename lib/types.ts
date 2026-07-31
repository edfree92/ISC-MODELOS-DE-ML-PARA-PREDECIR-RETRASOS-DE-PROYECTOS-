export type ModelKey = "logistica" | "arbol" | "bosque";

export type ModelChoice = ModelKey | "todos";

export type RiskLevel = "Bajo" | "Medio" | "Alto";

export interface SimulationConfig {
  projectCount: number;
  seed: number;
  durationMin: number;
  durationMax: number;
  bufferMin: number;
  bufferMax: number;
  purchaseDelayProbability: number;
  purchaseDelayMean: number;
  drawingPendingProbability: number;
  approvalDaysMean: number;
  engineeringChangeProbability: number;
  reworkHoursMean: number;
  staffAvailability: number;
  fieldRestrictionProbability: number;
  recoveryDaysMean: number;
  importedMaterialShare: number;
  baseDataQuality: number;
  highComplexityShare: number;
  alertProgress: number;
  mediumRiskThreshold: number;
  highRiskThreshold: number;
}

export interface WeeklyRow {
  projectId: string;
  week: number;
  sector: string;
  projectType: string;
  complexity: string;
  durationWeeks: number;
  initialBufferDays: number;
  plannedProgress: number;
  actualProgress: number;
  progressGap: number;
  bufferAvailableDays: number;
  criticalPurchasesPlanned: number;
  criticalPurchasesPending: number;
  purchaseDelayDays: number;
  importedMaterialShare: number;
  drawingsPending: number;
  engineeringWaitDays: number;
  engineeringChanges: number;
  reworkHours: number;
  plannedStaff: number;
  availableStaff: number;
  productivity: number;
  fieldRestrictions: number;
  recoveredDays: number;
  worseningWeeks: number;
  dataQuality: number;
  delayed: 0 | 1;
  finalDelayDays: number;
}

export interface ProjectSummary {
  projectId: string;
  sector: string;
  projectType: string;
  complexity: string;
  durationWeeks: number;
  initialBufferDays: number;
  delayed: 0 | 1;
  finalDelayDays: number;
  recoveredDays: number;
}

export interface SyntheticDataset {
  rows: WeeklyRow[];
  projects: ProjectSummary[];
  generatedAt: string;
  config: SimulationConfig;
}

export interface Metrics {
  accuracy: number;
  precision: number;
  recall: number;
  specificity: number;
  balancedAccuracy: number;
  f1: number;
  auc: number;
  brier: number;
  truePositive: number;
  trueNegative: number;
  falsePositive: number;
  falseNegative: number;
}

export interface StressResult {
  scenario: string;
  dataAvailable: number;
  metrics: Metrics;
  balancedLoss: number;
}

export interface ImportanceItem {
  feature: string;
  importance: number;
  plainMeaning: string;
}

export interface CalibrationBin {
  expected: number;
  observed: number;
  count: number;
}

export interface ProjectPrediction {
  projectId: string;
  probability: number;
  risk: RiskLevel;
  confidence: "Alta" | "Media" | "Baja";
  actualDelayed: 0 | 1;
  bufferDays: number;
  progressGap: number;
  mainSignal: string;
}

export interface ModelResult {
  key: ModelKey;
  name: string;
  shortDescription: string;
  validationScore: number;
  metrics: Metrics;
  stress: StressResult[];
  importance: ImportanceItem[];
  calibration: CalibrationBin[];
  predictions: ProjectPrediction[];
  trainingMilliseconds: number;
}

export interface ExperimentResult {
  runId: string;
  generatedAt: string;
  choice: ModelChoice;
  winner: ModelKey;
  trainProjects: number;
  validationProjects: number;
  testProjects: number;
  featureCount: number;
  results: ModelResult[];
  dataset: SyntheticDataset;
}

export const MODEL_META: Record<
  ModelKey,
  { name: string; shortDescription: string; academicUse: string }
> = {
  logistica: {
    name: "Regresión logística",
    shortDescription:
      "Convierte las señales del proyecto en una probabilidad explicable de retraso.",
    academicUse:
      "Ideal para comprender el efecto y la dirección de cada variable.",
  },
  arbol: {
    name: "Árbol de decisión",
    shortDescription:
      "Aprende reglas tipo si-entonces y divide los proyectos en ramas de riesgo.",
    academicUse:
      "Muy didáctico, aunque puede cambiar bastante ante pequeñas variaciones.",
  },
  bosque: {
    name: "Bosque aleatorio",
    shortDescription:
      "Combina varios árboles y promedia sus decisiones para ganar estabilidad.",
    academicUse:
      "Captura relaciones no lineales, pero es menos transparente que una sola ecuación.",
  },
};

export const DEFAULT_CONFIG: SimulationConfig = {
  projectCount: 250,
  seed: 42,
  durationMin: 12,
  durationMax: 36,
  bufferMin: 6,
  bufferMax: 18,
  purchaseDelayProbability: 0.14,
  purchaseDelayMean: 7,
  drawingPendingProbability: 0.16,
  approvalDaysMean: 6,
  engineeringChangeProbability: 0.1,
  reworkHoursMean: 8,
  staffAvailability: 0.92,
  fieldRestrictionProbability: 0.09,
  recoveryDaysMean: 0.9,
  importedMaterialShare: 0.32,
  baseDataQuality: 0.93,
  highComplexityShare: 0.25,
  alertProgress: 0.6,
  mediumRiskThreshold: 0.35,
  highRiskThreshold: 0.65,
};
