import {
  ProjectSummary,
  SimulationConfig,
  SyntheticDataset,
  WeeklyRow,
} from "./types";

type RandomFn = () => number;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function mulberry32(seed: number): RandomFn {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normal(random: RandomFn, mean = 0, deviation = 1) {
  const u = Math.max(random(), 1e-10);
  const v = Math.max(random(), 1e-10);
  return (
    mean +
    deviation * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  );
}

function poisson(random: RandomFn, lambda: number) {
  const limit = Math.exp(-lambda);
  let product = 1;
  let count = 0;
  do {
    count += 1;
    product *= random();
  } while (product > limit && count < 60);
  return count - 1;
}

function binomial(random: RandomFn, trials: number, probability: number) {
  let hits = 0;
  for (let index = 0; index < trials; index += 1) {
    if (random() < probability) hits += 1;
  }
  return hits;
}

function choice<T>(random: RandomFn, values: T[], weights: number[]): T {
  const total = weights.reduce((sum, item) => sum + item, 0);
  let cursor = random() * total;
  for (let index = 0; index < values.length; index += 1) {
    cursor -= weights[index];
    if (cursor <= 0) return values[index];
  }
  return values[values.length - 1];
}

function uniform(random: RandomFn, min: number, max: number) {
  return min + random() * (max - min);
}

function randomInteger(random: RandomFn, min: number, max: number) {
  return Math.floor(uniform(random, min, max + 1));
}

function positiveSkew(random: RandomFn, mean: number) {
  const scale = Math.max(0.1, mean / 2);
  return (-Math.log(Math.max(random(), 1e-8)) -
    Math.log(Math.max(random(), 1e-8))) *
    scale;
}

export function validateConfig(config: SimulationConfig): string[] {
  const errors: string[] = [];
  if (config.projectCount < 30 || config.projectCount > 1000)
    errors.push("La cantidad de proyectos debe estar entre 30 y 1,000.");
  if (config.durationMin < 4 || config.durationMax > 100)
    errors.push("La duración debe permanecer entre 4 y 100 semanas.");
  if (config.durationMax < config.durationMin)
    errors.push("La duración máxima no puede ser menor que la mínima.");
  if (config.bufferMin < 0 || config.bufferMax > 150)
    errors.push("La holgura debe permanecer entre 0 y 150 días.");
  if (config.bufferMax < config.bufferMin)
    errors.push("La holgura máxima no puede ser menor que la mínima.");
  if (config.highRiskThreshold <= config.mediumRiskThreshold)
    errors.push("El umbral alto debe ser mayor que el umbral medio.");
  const probabilities: Array<[string, number]> = [
    ["probabilidad de atraso en compras", config.purchaseDelayProbability],
    ["probabilidad de plano pendiente", config.drawingPendingProbability],
    ["probabilidad de cambio de ingeniería", config.engineeringChangeProbability],
    ["disponibilidad de personal", config.staffAvailability],
    ["probabilidad de restricción de campo", config.fieldRestrictionProbability],
    ["material importado", config.importedMaterialShare],
    ["calidad del dato", config.baseDataQuality],
    ["proyectos de alta complejidad", config.highComplexityShare],
    ["avance para emitir alerta", config.alertProgress],
    ["umbral medio", config.mediumRiskThreshold],
    ["umbral alto", config.highRiskThreshold],
  ];
  probabilities.forEach(([label, value]) => {
    if (value < 0 || value > 1)
      errors.push(`El valor de ${label} debe estar entre 0% y 100%.`);
  });
  return errors;
}

export function generateSyntheticDataset(
  config: SimulationConfig,
): SyntheticDataset {
  const errors = validateConfig(config);
  if (errors.length) throw new Error(errors.join(" "));

  const random = mulberry32(config.seed);
  const rows: WeeklyRow[] = [];
  const projects: ProjectSummary[] = [];
  const complexityFactor: Record<string, number> = {
    Baja: 0.8,
    Media: 1,
    Alta: 1.3,
  };
  const typeFactor: Record<string, number> = {
    Fabricación: 0.92,
    Montaje: 1.05,
    "Ingeniería y fabricación": 1.12,
    "Proyecto integral": 1.25,
  };

  const lowShare = Math.min(0.3, Math.max(0.15, 0.42 - config.highComplexityShare));
  const mediumShare = Math.max(0.05, 1 - lowShare - config.highComplexityShare);

  for (let projectNumber = 1; projectNumber <= config.projectCount; projectNumber += 1) {
    const projectId = `ISC-SIM-${String(projectNumber).padStart(3, "0")}`;
    const projectType = choice(
      random,
      ["Fabricación", "Montaje", "Ingeniería y fabricación", "Proyecto integral"],
      [0.28, 0.22, 0.3, 0.2],
    );
    const complexity = choice(
      random,
      ["Baja", "Media", "Alta"],
      [lowShare, mediumShare, config.highComplexityShare],
    );
    const sector = choice(
      random,
      ["Minería", "Industria", "Energía", "Cemento"],
      [0.42, 0.25, 0.18, 0.15],
    );
    const factor = complexityFactor[complexity] * typeFactor[projectType];
    const durationWeeks = randomInteger(
      random,
      config.durationMin,
      config.durationMax,
    );
    const initialBufferDays = uniform(random, config.bufferMin, config.bufferMax);
    const theoreticalStaff = Math.max(4, Math.round(randomInteger(random, 8, 34) * factor));
    const importedBase = clamp(
      config.importedMaterialShare +
        (projectType.includes("Ingeniería") || projectType === "Proyecto integral"
          ? 0.08
          : -0.02) +
        normal(random, 0, 0.05),
      0.02,
      0.9,
    );

    let cumulativeLoss = 0;
    let cumulativeRecovery = 0;
    let previousRealProgress = 0;
    let previousGap = 0;
    let worseningWeeks = 0;
    const projectRows: WeeklyRow[] = [];

    for (let week = 1; week <= durationWeeks; week += 1) {
      const phaseIntensity = 0.65 + 0.6 * Math.sin((Math.PI * week) / durationWeeks);
      const weeklyFactor = factor * phaseIntensity;
      const criticalPurchasesPlanned = poisson(random, 1.1 * weeklyFactor);
      const pendingProbability = clamp(
        config.purchaseDelayProbability * weeklyFactor,
        0,
        0.85,
      );
      const criticalPurchasesPending = binomial(
        random,
        criticalPurchasesPlanned,
        pendingProbability,
      );
      const purchaseDelayDays =
        criticalPurchasesPending > 0
          ? clamp(positiveSkew(random, config.purchaseDelayMean) * factor, 1, 60)
          : 0;
      const importedMaterialShare = clamp(importedBase + normal(random, 0, 0.035), 0, 1);

      const drawingsPending = poisson(
        random,
        Math.max(0.05, config.drawingPendingProbability * 2.8 * weeklyFactor),
      );
      const engineeringWaitDays =
        drawingsPending > 0
          ? clamp(positiveSkew(random, config.approvalDaysMean) * factor, 1, 45)
          : 0;
      const engineeringChanges = binomial(
        random,
        2,
        clamp(config.engineeringChangeProbability * weeklyFactor, 0, 0.8),
      );
      const reworkHours = clamp(
        positiveSkew(random, config.reworkHoursMean) *
          factor *
          (1 + 0.25 * engineeringChanges),
        0,
        120,
      );

      const plannedStaff = Math.max(4, Math.round(theoreticalStaff * phaseIntensity));
      const availability = clamp(
        normal(random, config.staffAvailability - 0.025 * (factor - 1), 0.065),
        0.5,
        1.05,
      );
      const availableStaff = Math.max(
        1,
        Math.round(plannedStaff * Math.min(1, availability)),
      );
      const staffGap = Math.max(0, plannedStaff - availableStaff) / plannedStaff;
      const fieldRestrictions = binomial(
        random,
        2,
        clamp(config.fieldRestrictionProbability * weeklyFactor, 0, 0.75),
      );
      const productivity = clamp(
        1 -
          0.15 * staffGap -
          0.035 * criticalPurchasesPending -
          0.025 * drawingsPending -
          0.045 * fieldRestrictions -
          reworkHours / 900 +
          normal(random, 0, 0.04),
        0.45,
        1.15,
      );

      const recoverableSignals =
        criticalPurchasesPending +
        drawingsPending +
        engineeringChanges +
        fieldRestrictions +
        (staffGap > 0.1 ? 1 : 0);
      const recoveredDays =
        recoverableSignals > 0 && random() < 0.65
          ? clamp(
              normal(
                random,
                config.recoveryDaysMean,
                Math.max(0.1, config.recoveryDaysMean * 0.35),
              ),
              0,
              5,
            )
          : 0;

      const weeklyLoss =
        criticalPurchasesPending * purchaseDelayDays * 0.22 +
        drawingsPending * engineeringWaitDays * 0.1 +
        engineeringChanges * 0.9 +
        reworkHours / 28 +
        staffGap * 4.5 +
        fieldRestrictions * 1.25 +
        Math.max(0, 0.88 - productivity) * 6;
      const effectiveLoss = weeklyLoss * 0.52;
      cumulativeLoss += Math.max(0, effectiveLoss - recoveredDays);
      cumulativeRecovery += recoveredDays;

      const plannedProgress = Math.min(1, week / durationWeeks);
      const progressGap = clamp(
        cumulativeLoss / Math.max(1, durationWeeks * 7),
        0,
        0.65,
      );
      const actualProgress = clamp(
        Math.max(
          previousRealProgress,
          plannedProgress - progressGap + normal(random, 0, 0.0045),
        ),
        0,
        1,
      );
      const actualGap = Math.max(0, plannedProgress - actualProgress);
      if (actualGap > previousGap + 0.0025) worseningWeeks += 1;
      else if (actualGap < previousGap - 0.002) worseningWeeks = 0;
      else worseningWeeks = Math.max(0, worseningWeeks - 1);
      previousGap = actualGap;
      previousRealProgress = actualProgress;

      projectRows.push({
        projectId,
        week,
        sector,
        projectType,
        complexity,
        durationWeeks,
        initialBufferDays,
        plannedProgress,
        actualProgress,
        progressGap: actualGap,
        bufferAvailableDays: initialBufferDays - cumulativeLoss,
        criticalPurchasesPlanned,
        criticalPurchasesPending,
        purchaseDelayDays,
        importedMaterialShare,
        drawingsPending,
        engineeringWaitDays,
        engineeringChanges,
        reworkHours,
        plannedStaff,
        availableStaff,
        productivity,
        fieldRestrictions,
        recoveredDays,
        worseningWeeks,
        dataQuality: clamp(normal(random, config.baseDataQuality, 0.04), 0.55, 1),
        delayed: 0,
        finalDelayDays: 0,
      });
    }

    const finalDelayDays = Math.max(0, Math.ceil(cumulativeLoss - initialBufferDays));
    const delayed: 0 | 1 = finalDelayDays > 0 ? 1 : 0;
    projectRows.forEach((row) => {
      row.delayed = delayed;
      row.finalDelayDays = finalDelayDays;
      rows.push(row);
    });
    projects.push({
      projectId,
      sector,
      projectType,
      complexity,
      durationWeeks,
      initialBufferDays,
      delayed,
      finalDelayDays,
      recoveredDays: cumulativeRecovery,
    });
  }

  return {
    rows,
    projects,
    generatedAt: new Date().toISOString(),
    config,
  };
}

export function datasetProfile(dataset: SyntheticDataset) {
  const delayed = dataset.projects.filter((project) => project.delayed === 1).length;
  const averageDuration =
    dataset.projects.reduce((sum, project) => sum + project.durationWeeks, 0) /
    dataset.projects.length;
  const averageBuffer =
    dataset.projects.reduce((sum, project) => sum + project.initialBufferDays, 0) /
    dataset.projects.length;
  const averageQuality =
    dataset.rows.reduce((sum, row) => sum + row.dataQuality, 0) /
    dataset.rows.length;
  return {
    projects: dataset.projects.length,
    weeklyCuts: dataset.rows.length,
    delayed,
    delayedShare: delayed / dataset.projects.length,
    averageDuration,
    averageBuffer,
    averageQuality,
  };
}

export function datasetToCsv(dataset: SyntheticDataset) {
  const headers = [
    "Proyecto",
    "Semana",
    "Sector",
    "Tipo de proyecto",
    "Complejidad",
    "Duración prevista",
    "Holgura inicial",
    "Avance previsto",
    "Avance real",
    "Brecha de avance",
    "Holgura disponible",
    "Compras críticas pendientes",
    "Demora de compras",
    "Planos pendientes",
    "Espera de ingeniería",
    "Cambios de ingeniería",
    "Horas de retrabajo",
    "Personal previsto",
    "Personal disponible",
    "Productividad",
    "Restricciones de campo",
    "Días recuperados",
    "Semanas empeorando",
    "Calidad del dato",
    "Terminó con retraso",
  ];
  const values = dataset.rows.map((row) => [
    row.projectId,
    row.week,
    row.sector,
    row.projectType,
    row.complexity,
    row.durationWeeks,
    row.initialBufferDays.toFixed(1),
    row.plannedProgress.toFixed(4),
    row.actualProgress.toFixed(4),
    row.progressGap.toFixed(4),
    row.bufferAvailableDays.toFixed(1),
    row.criticalPurchasesPending,
    row.purchaseDelayDays.toFixed(1),
    row.drawingsPending,
    row.engineeringWaitDays.toFixed(1),
    row.engineeringChanges,
    row.reworkHours.toFixed(1),
    row.plannedStaff,
    row.availableStaff,
    row.productivity.toFixed(4),
    row.fieldRestrictions,
    row.recoveredDays.toFixed(1),
    row.worseningWeeks,
    row.dataQuality.toFixed(4),
    row.delayed ? "Sí" : "No",
  ]);
  return [headers, ...values]
    .map((row) =>
      row
        .map((item) => `"${String(item).replaceAll('"', '""')}"`)
        .join(","),
    )
    .join("\n");
}
