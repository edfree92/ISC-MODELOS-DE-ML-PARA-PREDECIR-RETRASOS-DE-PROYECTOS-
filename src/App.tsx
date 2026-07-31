import { useMemo, useState } from "react";
import { runExperiment } from "../lib/ml";
import { generateAcademicPdf } from "../lib/report";
import {
  datasetProfile,
  datasetToCsv,
  generateSyntheticDataset,
  validateConfig,
} from "../lib/simulation";
import {
  DEFAULT_CONFIG,
  ExperimentResult,
  MODEL_META,
  ModelChoice,
  ModelKey,
  SimulationConfig,
  SyntheticDataset,
} from "../lib/types";

type ConfigKey = keyof SimulationConfig;

interface FieldDefinition {
  key: ConfigKey;
  label: string;
  help: string;
  example: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
  percent?: boolean;
  required?: boolean;
}

const basicFields: FieldDefinition[] = [
  {
    key: "projectCount",
    label: "Número de proyectos",
    help: "Cantidad total de historias que se crearán para el experimento.",
    example: "Ejemplo: 250 genera 250 proyectos distintos.",
    min: 30,
    max: 1000,
    step: 10,
    required: true,
  },
  {
    key: "durationMin",
    label: "Duración mínima",
    help: "Proyecto más corto que puede aparecer en la simulación.",
    example: "Ejemplo: 12 semanas.",
    min: 4,
    max: 100,
    step: 1,
    unit: "semanas",
    required: true,
  },
  {
    key: "durationMax",
    label: "Duración máxima",
    help: "Proyecto más largo que puede aparecer en la simulación.",
    example: "Debe ser igual o mayor que la duración mínima.",
    min: 4,
    max: 100,
    step: 1,
    unit: "semanas",
    required: true,
  },
  {
    key: "bufferMin",
    label: "Holgura mínima",
    help: "Menor margen disponible antes de comprometer la fecha.",
    example: "Ejemplo: 5 días de protección.",
    min: 0,
    max: 150,
    step: 1,
    unit: "días",
    required: true,
  },
  {
    key: "bufferMax",
    label: "Holgura máxima",
    help: "Mayor margen que puede recibir un proyecto al comenzar.",
    example: "Ejemplo: 15 días de protección.",
    min: 0,
    max: 150,
    step: 1,
    unit: "días",
    required: true,
  },
];

const operationalFields: FieldDefinition[] = [
  {
    key: "purchaseDelayProbability",
    label: "Compra crítica atrasada",
    help: "Frecuencia semanal con la que una compra importante puede quedar pendiente.",
    example: "14% significa aproximadamente 14 de cada 100 oportunidades.",
    min: 0,
    max: 80,
    step: 1,
    percent: true,
    required: true,
  },
  {
    key: "purchaseDelayMean",
    label: "Demora promedio de compra",
    help: "Días que suele tardar una compra crítica cuando presenta demora.",
    example: "Ejemplo: 7 días.",
    min: 0,
    max: 60,
    step: 0.5,
    unit: "días",
    required: true,
  },
  {
    key: "drawingPendingProbability",
    label: "Plano pendiente",
    help: "Frecuencia semanal de planos todavía no aprobados.",
    example: "16% representa una condición moderadamente frecuente.",
    min: 0,
    max: 80,
    step: 1,
    percent: true,
    required: true,
  },
  {
    key: "approvalDaysMean",
    label: "Tiempo de aprobación",
    help: "Días promedio que requiere una aprobación de Ingeniería.",
    example: "Ejemplo: 8 días.",
    min: 0,
    max: 60,
    step: 0.5,
    unit: "días",
    required: true,
  },
  {
    key: "staffAvailability",
    label: "Personal disponible",
    help: "Porcentaje promedio de la dotación planificada que realmente estará disponible.",
    example: "92% significa que normalmente falta 8% de la dotación.",
    min: 40,
    max: 100,
    step: 1,
    percent: true,
    required: true,
  },
  {
    key: "fieldRestrictionProbability",
    label: "Restricción de campo",
    help: "Frecuencia semanal de bloqueos por acceso, permisos o interferencias.",
    example: "9% significa una restricción ocasional.",
    min: 0,
    max: 75,
    step: 1,
    percent: true,
    required: true,
  },
  {
    key: "recoveryDaysMean",
    label: "Capacidad de recuperación",
    help: "Días que el equipo puede recuperar por semana cuando ejecuta un plan de acción.",
    example: "Ejemplo: 0.9 días recuperados.",
    min: 0,
    max: 5,
    step: 0.1,
    unit: "días",
    required: true,
  },
];

const optionalFields: FieldDefinition[] = [
  {
    key: "engineeringChangeProbability",
    label: "Cambios de ingeniería",
    help: "Frecuencia semanal de cambios técnicos que generan nuevas tareas.",
    example: "Úsalo si deseas representar proyectos con rediseño.",
    min: 0,
    max: 70,
    step: 1,
    percent: true,
  },
  {
    key: "reworkHoursMean",
    label: "Horas de retrabajo",
    help: "Horas semanales repetidas por correcciones, fallas o cambios.",
    example: "Ejemplo: 6 horas por semana.",
    min: 0,
    max: 100,
    step: 0.5,
    unit: "horas",
  },
  {
    key: "importedMaterialShare",
    label: "Material importado",
    help: "Parte del abastecimiento expuesta a fabricación, transporte o aduana internacional.",
    example: "32% significa casi un tercio del material.",
    min: 0,
    max: 90,
    step: 1,
    percent: true,
  },
  {
    key: "baseDataQuality",
    label: "Calidad base del dato",
    help: "Nivel esperado de integridad y consistencia del reporte semanal.",
    example: "93% representa un reporte generalmente confiable.",
    min: 55,
    max: 100,
    step: 1,
    percent: true,
  },
  {
    key: "highComplexityShare",
    label: "Proyectos de alta complejidad",
    help: "Porción del universo con mayor cantidad de dependencias y exposición.",
    example: "25% significa uno de cada cuatro proyectos.",
    min: 5,
    max: 70,
    step: 1,
    percent: true,
  },
];

const academicFields: FieldDefinition[] = [
  {
    key: "seed",
    label: "Semilla aleatoria",
    help: "Código que permite volver a generar exactamente el mismo universo.",
    example: "Si conservas 2026, la misma configuración repite la corrida.",
    min: 0,
    max: 999999,
    step: 1,
    required: true,
  },
  {
    key: "alertProgress",
    label: "Momento de la alerta",
    help: "Avance del plazo en el que se tomará la fotografía para evaluar el riesgo.",
    example: "60% permite intervenir antes del cierre.",
    min: 20,
    max: 90,
    step: 5,
    percent: true,
    required: true,
  },
  {
    key: "mediumRiskThreshold",
    label: "Inicio de riesgo medio",
    help: "Probabilidad desde la cual un proyecto entra en seguimiento.",
    example: "35% activa una vigilancia temprana.",
    min: 20,
    max: 80,
    step: 5,
    percent: true,
    required: true,
  },
  {
    key: "highRiskThreshold",
    label: "Inicio de riesgo alto",
    help: "Probabilidad desde la cual un proyecto pasa a revisión prioritaria.",
    example: "65% activa la cola roja del comité.",
    min: 30,
    max: 95,
    step: 5,
    percent: true,
    required: true,
  },
];

const formatPercent = (value: number, digits = 1) =>
  `${(value * 100).toFixed(digits)}%`;

function Field({
  definition,
  value,
  onChange,
}: {
  definition: FieldDefinition;
  value: number;
  onChange: (value: number) => void;
}) {
  const displayValue = definition.percent ? value * 100 : value;
  return (
    <label className="field-card">
      <span className="field-heading">
        <span>{definition.label}</span>
        <span className={definition.required ? "pill required" : "pill optional"}>
          {definition.required ? "Obligatoria" : "Opcional"}
        </span>
      </span>
      <span className="input-shell">
        <input
          aria-label={definition.label}
          type="number"
          min={definition.min}
          max={definition.max}
          step={definition.step}
          value={Number.isFinite(displayValue) ? displayValue : ""}
          onChange={(event) => {
            const raw = Number(event.target.value);
            onChange(definition.percent ? raw / 100 : raw);
          }}
        />
        {definition.percent ? <span>%</span> : definition.unit && <span>{definition.unit}</span>}
      </span>
      <span className="field-help">{definition.help}</span>
      <span className="field-example">{definition.example}</span>
    </label>
  );
}

function ProgressPanel({ value, label }: { value: number; label: string }) {
  return (
    <div className="processing-panel" role="status" aria-live="polite">
      <div className="processing-orbit">
        <span>{value}%</span>
      </div>
      <div className="processing-copy">
        <span className="eyebrow">PROCESANDO EXPERIMENTO</span>
        <h3>{label}</h3>
        <div className="progress-track">
          <span style={{ width: `${value}%` }} />
        </div>
        <p>No cierres esta ventana. Cada etapa utiliza la misma base sintética.</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<SimulationConfig>(() => {
    if (typeof window === "undefined") return DEFAULT_CONFIG;
    const saved = window.localStorage.getItem("isc-pulso-config-v2");
    if (!saved) return DEFAULT_CONFIG;
    try {
      return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    } catch {
      window.localStorage.removeItem("isc-pulso-config-v2");
      return DEFAULT_CONFIG;
    }
  });
  const [dataset, setDataset] = useState<SyntheticDataset | null>(null);
  const [experiment, setExperiment] = useState<ExperimentResult | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelKey>("logistica");
  const [errors, setErrors] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const profile = useMemo(() => (dataset ? datasetProfile(dataset) : null), [dataset]);
  const winner = experiment?.results.find((result) => result.key === experiment.winner);

  const updateConfig = (key: ConfigKey, value: number) => {
    setConfig((current) => ({ ...current, [key]: value }));
    setErrors([]);
  };

  const moveTo = (target: number) => {
    if (target === 1) setStep(1);
    if (target === 2 && dataset) setStep(2);
    if (target === 3 && dataset) setStep(3);
    if (target === 4 && experiment) setStep(4);
  };

  const generateData = async () => {
    const validation = validateConfig(config);
    if (validation.length) {
      setErrors(validation);
      return;
    }
    setProcessing(true);
    setProgress(8);
    setProgressLabel("Validando parámetros y rangos");
    await new Promise((resolve) => setTimeout(resolve, 180));
    setProgress(32);
    setProgressLabel("Creando proyectos, sectores y complejidades");
    await new Promise((resolve) => setTimeout(resolve, 180));
    const generated = generateSyntheticDataset(config);
    setProgress(72);
    setProgressLabel("Construyendo cortes semanales y resultado final");
    await new Promise((resolve) => setTimeout(resolve, 220));
    setDataset(generated);
    setExperiment(null);
    window.localStorage.setItem("isc-pulso-config-v2", JSON.stringify(config));
    setProgress(100);
    setProgressLabel("Bases sintéticas listas");
    await new Promise((resolve) => setTimeout(resolve, 260));
    setProcessing(false);
    setStep(2);
  };

  const executeModels = async (choice: ModelChoice) => {
    if (!dataset) return;
    setProcessing(true);
    setProgress(0);
    setProgressLabel("Preparando el experimento");
    try {
      const result = await runExperiment(dataset, choice, (value, label) => {
        setProgress(value);
        setProgressLabel(label);
      });
      setExperiment(result);
      await new Promise((resolve) => setTimeout(resolve, 320));
      setStep(4);
    } finally {
      setProcessing(false);
    }
  };

  const downloadCsv = () => {
    if (!dataset) return;
    const blob = new Blob(["\uFEFF", datasetToCsv(dataset)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ISC_BASE_SINTETICA_${config.seed}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = async () => {
    if (!experiment) return;
    setPdfGenerating(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 60));
      generateAcademicPdf(experiment);
    } finally {
      setPdfGenerating(false);
    }
  };

  return (
    <main className="site-shell">
      <div className="blueprint-grid" aria-hidden="true" />
      <div className="technical-mark left-mark" aria-hidden="true">
        <span>0</span><span>50</span><span>100</span><span>150</span><span>200</span>
      </div>
      <div className="technical-mark right-mark" aria-hidden="true">
        N 8.345.210<br />E -76.540.890
      </div>

      <header className="topbar">
        <button className="brand" onClick={() => moveTo(1)} aria-label="Volver al inicio">
          ISC PULSO <strong>Studio</strong>
        </button>
        <nav className="stepper" aria-label="Etapas del experimento">
          {[
            ["Configurar universo", 1],
            ["Generar datos", 2],
            ["Ejecutar modelos", 3],
            ["Reporte PDF", 4],
          ].map(([label, number]) => {
            const index = Number(number);
            const enabled =
              index === 1 || (index === 2 && dataset) || (index === 3 && dataset) || (index === 4 && experiment);
            return (
              <button
                key={String(label)}
                className={`${step === index ? "active" : ""} ${step > index ? "complete" : ""}`}
                onClick={() => enabled && moveTo(index)}
                disabled={!enabled}
              >
                <span>{index}</span>
                <em>{label}</em>
              </button>
            );
          })}
        </nav>
      </header>

      <div className="content-wrap">
        {processing ? (
          <ProgressPanel value={progress} label={progressLabel} />
        ) : (
          <>
            {step === 1 && (
              <section className="stage" aria-labelledby="stage-one-title">
                <div className="stage-heading">
                  <span className="eyebrow">PASO 1 DE 4 · CONFIGURAR UNIVERSO</span>
                  <h1 id="stage-one-title">Primero construimos el mundo que el modelo va a aprender</h1>
                  <p>
                    Configura proyectos industriales sintéticos con reglas claras. Al guardar,
                    el sistema recalculará las bases que usarán exactamente los mismos modelos.
                  </p>
                </div>

                <div className="layout-with-guide">
                  <div className="blueprint-panel main-panel">
                    <div className="panel-title">
                      <div>
                        <span className="panel-number">01</span>
                        <h2>Parámetros iniciales</h2>
                      </div>
                      <p>Empieza con cinco valores. Los demás ya tienen una configuración sugerida.</p>
                    </div>
                    <div className="field-grid">
                      {basicFields.map((field) => (
                        <Field
                          key={field.key}
                          definition={field}
                          value={Number(config[field.key])}
                          onChange={(value) => updateConfig(field.key, value)}
                        />
                      ))}
                    </div>

                    <details className="parameter-block" open>
                      <summary>
                        <span><b>02</b> Comportamiento operativo</span>
                        <small>7 variables obligatorias</small>
                      </summary>
                      <p>
                        Describe qué tan seguido aparecen problemas de Compras, Ingeniería y Campo.
                      </p>
                      <div className="field-grid compact">
                        {operationalFields.map((field) => (
                          <Field
                            key={field.key}
                            definition={field}
                            value={Number(config[field.key])}
                            onChange={(value) => updateConfig(field.key, value)}
                          />
                        ))}
                      </div>
                    </details>

                    <details className="parameter-block">
                      <summary>
                        <span><b>03</b> Variables opcionales</span>
                        <small>Ya tienen valores sugeridos</small>
                      </summary>
                      <p>
                        Permiten hacer el universo más parecido a un entorno industrial complejo.
                        Si no conoces un valor, conserva el sugerido.
                      </p>
                      <div className="field-grid compact">
                        {optionalFields.map((field) => (
                          <Field
                            key={field.key}
                            definition={field}
                            value={Number(config[field.key])}
                            onChange={(value) => updateConfig(field.key, value)}
                          />
                        ))}
                      </div>
                    </details>

                    <details className="parameter-block">
                      <summary>
                        <span><b>04</b> Controles académicos</span>
                        <small>Reproducibilidad y umbrales</small>
                      </summary>
                      <p>
                        Indican cuándo observar el proyecto y cómo convertir la probabilidad en nivel de riesgo.
                      </p>
                      <div className="field-grid compact">
                        {academicFields.map((field) => (
                          <Field
                            key={field.key}
                            definition={field}
                            value={Number(config[field.key])}
                            onChange={(value) => updateConfig(field.key, value)}
                          />
                        ))}
                      </div>
                    </details>

                    {errors.length > 0 && (
                      <div className="error-box" role="alert">
                        <strong>Revisa estos valores:</strong>
                        <ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul>
                      </div>
                    )}

                    <div className="panel-actions">
                      <span><i>i</i> Los campos obligatorios definen la estructura mínima del experimento.</span>
                      <button className="primary-button" onClick={generateData}>
                        Guardar y generar bases <b>→</b>
                      </button>
                    </div>
                  </div>

                  <aside className="guide-panel">
                    <div className="compass-icon" aria-hidden="true">⌖</div>
                    <span className="eyebrow">LECTURA RÁPIDA</span>
                    <h2>¿Qué va aquí?</h2>
                    <p>
                      Los valores describen el universo inicial. No son el resultado del modelo:
                      sirven para crear proyectos y enseñarle qué patrones debe observar.
                    </p>
                    <div className="guide-example">
                      <span>!</span>
                      <p>
                        <b>Ejemplo:</b> 10 días de holgura significa que un proyecto puede absorber
                        hasta 10 días de desviación antes de comprometer su fecha.
                      </p>
                    </div>
                    <div className="guide-flow">
                      <span>Parámetros</span><i>→</i><span>Bases</span><i>→</i><span>Modelos</span>
                    </div>
                  </aside>
                </div>
              </section>
            )}

            {step === 2 && dataset && profile && (
              <section className="stage" aria-labelledby="stage-two-title">
                <div className="stage-heading compact-heading">
                  <span className="eyebrow">PASO 2 DE 4 · BASES GENERADAS</span>
                  <h1 id="stage-two-title">El universo ya tiene historias, semanas y un resultado final</h1>
                  <p>
                    Esta base se generó desde cero con la configuración guardada. Todos los modelos
                    recibirán exactamente estas mismas historias.
                  </p>
                </div>
                <div className="metric-strip">
                  <article><span>Proyectos</span><strong>{profile.projects}</strong><small>Historias independientes</small></article>
                  <article><span>Cortes semanales</span><strong>{profile.weeklyCuts.toLocaleString("es-PE")}</strong><small>Una fila por proyecto y semana</small></article>
                  <article><span>Con retraso</span><strong>{formatPercent(profile.delayedShare, 0)}</strong><small>{profile.delayed} proyectos sintéticos</small></article>
                  <article><span>Calidad media</span><strong>{formatPercent(profile.averageQuality, 0)}</strong><small>Integridad del corte</small></article>
                </div>
                <div className="two-column">
                  <div className="blueprint-panel data-panel">
                    <div className="panel-title">
                      <div><span className="panel-number">BD</span><h2>Muestra de la base semanal</h2></div>
                      <button className="secondary-button" onClick={downloadCsv}>Descargar CSV</button>
                    </div>
                    <div className="table-scroll">
                      <table>
                        <thead>
                          <tr>
                            <th>Proyecto</th><th>Semana</th><th>Complejidad</th><th>Holgura</th>
                            <th>Brecha</th><th>Compras</th><th>Planos</th><th>Resultado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dataset.rows.slice(0, 8).map((row) => (
                            <tr key={`${row.projectId}-${row.week}`}>
                              <td>{row.projectId}</td><td>{row.week}</td><td>{row.complexity}</td>
                              <td>{row.bufferAvailableDays.toFixed(1)} d</td>
                              <td>{formatPercent(row.progressGap)}</td>
                              <td>{row.criticalPurchasesPending}</td><td>{row.drawingsPending}</td>
                              <td><span className={`status ${row.delayed ? "danger" : "safe"}`}>{row.delayed ? "Con retraso" : "A tiempo"}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <aside className="blueprint-panel explanation-card">
                    <span className="eyebrow">QUÉ ACABA DE OCURRIR</span>
                    <h2>La etiqueta se conoce solo porque esto es un laboratorio</h2>
                    <p>
                      El sistema simuló toda la vida del proyecto. Por eso puede escribir al final
                      “Sí” o “No” y usar esa respuesta para enseñar y examinar los modelos.
                    </p>
                    <ul className="check-list">
                      <li>Sin celdas imposibles.</li>
                      <li>Semilla reproducible: {config.seed}.</li>
                      <li>Una historia nunca se divide entre grupos.</li>
                    </ul>
                  </aside>
                </div>
                <div className="stage-actions">
                  <button className="ghost-button" onClick={() => setStep(1)}>← Editar parámetros</button>
                  <button className="primary-button" onClick={() => setStep(3)}>Escoger modelos <b>→</b></button>
                </div>
              </section>
            )}

            {step === 3 && dataset && (
              <section className="stage" aria-labelledby="stage-three-title">
                <div className="stage-heading compact-heading">
                  <span className="eyebrow">PASO 3 DE 4 · ISC ARENA</span>
                  <h1 id="stage-three-title">Escoge un modelo para estudiarlo o ejecuta la comparación completa</h1>
                  <p>
                    La arena mantiene el reparto 70%-15%-15%, calibra probabilidades y somete cada
                    modelo a la misma prueba con datos incompletos.
                  </p>
                </div>
                <div className="model-grid">
                  {(Object.keys(MODEL_META) as ModelKey[]).map((key, index) => {
                    const meta = MODEL_META[key];
                    return (
                      <button
                        key={key}
                        className={`model-card ${selectedModel === key ? "selected" : ""}`}
                        onClick={() => setSelectedModel(key)}
                      >
                        <span className="model-index">0{index + 1}</span>
                        <span className="model-symbol">{key === "logistica" ? "σ" : key === "arbol" ? "Y" : "⋔"}</span>
                        <h2>{meta.name}</h2>
                        <p>{meta.shortDescription}</p>
                        <small>{meta.academicUse}</small>
                        <i>{selectedModel === key ? "Seleccionado" : "Seleccionar"}</i>
                      </button>
                    );
                  })}
                </div>
                <div className="arena-actions blueprint-panel">
                  <div>
                    <span className="eyebrow">DOS FORMAS DE CORRER</span>
                    <h2>Modo académico o comparación automática</h2>
                    <p>
                      Un modelo permite estudiarlo con detalle. “Todos” ejecuta los tres y elige
                      al ganador usando validación, sin mirar la prueba final.
                    </p>
                  </div>
                  <div className="button-stack">
                    <button className="secondary-button large" onClick={() => executeModels(selectedModel)}>
                      Ejecutar {MODEL_META[selectedModel].name}
                    </button>
                    <button className="primary-button large" onClick={() => executeModels("todos")}>
                      Ejecutar todos los modelos <b>→</b>
                    </button>
                  </div>
                </div>
              </section>
            )}

            {step === 4 && experiment && winner && (
              <section className="stage" aria-labelledby="stage-four-title">
                <div className="stage-heading compact-heading">
                  <span className="eyebrow">PASO 4 DE 4 · RESULTADO Y REPORTE</span>
                  <h1 id="stage-four-title">{winner.name} lideró esta corrida</h1>
                  <p>
                    El modelo ganó por su desempeño de validación. Los valores que ves abajo
                    pertenecen a la prueba final reservada y quedarán explicados dentro del PDF.
                  </p>
                </div>
                <div className="result-hero blueprint-panel">
                  <div>
                    <span className="eyebrow">MODELO DE REFERENCIA</span>
                    <h2>{winner.name}</h2>
                    <p>{winner.shortDescription}</p>
                    <span className="run-id">Ejecución {experiment.runId}</span>
                  </div>
                  <div className="result-gauge">
                    <strong>{formatPercent(winner.metrics.balancedAccuracy)}</strong>
                    <span>Exactitud equilibrada</span>
                    <small>Prueba final fuera de muestra</small>
                  </div>
                  <button className="pdf-button" onClick={downloadPdf} disabled={pdfGenerating}>
                    <span>{pdfGenerating ? "GENERANDO" : "PDF"}</span>
                    <b>{pdfGenerating ? "Construyendo reporte…" : "Descargar reporte detallado"}</b>
                    <i>15 páginas · portada + 14 capítulos</i>
                  </button>
                </div>

                <div className="metric-strip results">
                  <article><span>Detección de retrasos</span><strong>{formatPercent(winner.metrics.recall)}</strong><small>Recall</small></article>
                  <article><span>Ordenamiento de riesgo</span><strong>{formatPercent(winner.metrics.auc)}</strong><small>AUC</small></article>
                  <article><span>Error probabilístico</span><strong>{winner.metrics.brier.toFixed(3)}</strong><small>Brier · menor es mejor</small></article>
                  <article><span>Prueba final</span><strong>{experiment.testProjects}</strong><small>Proyectos no vistos</small></article>
                </div>

                {experiment.results.length > 1 && (
                  <div className="blueprint-panel comparison-panel">
                    <div className="panel-title">
                      <div><span className="panel-number">ML</span><h2>Comparación de los tres modelos</h2></div>
                    </div>
                    <div className="table-scroll">
                      <table>
                        <thead><tr><th>Modelo</th><th>Balanced</th><th>Recall</th><th>AUC</th><th>Brier</th><th>Robustez</th></tr></thead>
                        <tbody>
                          {experiment.results.map((result) => (
                            <tr key={result.key} className={result.key === experiment.winner ? "winner-row" : ""}>
                              <td>{result.key === experiment.winner ? "★ " : ""}{result.name}</td>
                              <td>{formatPercent(result.metrics.balancedAccuracy)}</td>
                              <td>{formatPercent(result.metrics.recall)}</td>
                              <td>{formatPercent(result.metrics.auc)}</td>
                              <td>{result.metrics.brier.toFixed(3)}</td>
                              <td>{formatPercent(result.validationScore)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="results-grid">
                  <div className="blueprint-panel">
                    <div className="panel-title"><div><span className="panel-number">R</span><h2>Robustez ante vacíos</h2></div></div>
                    <div className="stress-list">
                      {winner.stress.map((item) => (
                        <div key={item.scenario}>
                          <span>{item.scenario}<small>{formatPercent(item.dataAvailable, 0)} disponible</small></span>
                          <div><i style={{ width: `${item.metrics.balancedAccuracy * 100}%` }} /></div>
                          <strong>{formatPercent(item.metrics.balancedAccuracy)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="blueprint-panel">
                    <div className="panel-title"><div><span className="panel-number">V</span><h2>Variables principales</h2></div></div>
                    <div className="importance-list">
                      {winner.importance.slice(0, 7).map((item) => (
                        <div key={item.feature}>
                          <span>{item.feature}</span>
                          <div><i style={{ width: `${Math.min(100, item.importance * 500)}%` }} /></div>
                          <strong>{formatPercent(item.importance)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="blueprint-panel priorities-panel">
                  <div className="panel-title">
                    <div><span className="panel-number">!</span><h2>Primeros proyectos de la cola de revisión</h2></div>
                    <p>La alerta prioriza dónde mirar; no declara que el retraso sea inevitable.</p>
                  </div>
                  <div className="table-scroll">
                    <table>
                      <thead><tr><th>Proyecto</th><th>Probabilidad</th><th>Nivel</th><th>Confianza</th><th>Señal disponible</th></tr></thead>
                      <tbody>
                        {winner.predictions.slice(0, 8).map((item) => (
                          <tr key={item.projectId}>
                            <td>{item.projectId}</td><td>{formatPercent(item.probability)}</td>
                            <td><span className={`status ${item.risk.toLowerCase()}`}>{item.risk}</span></td>
                            <td>{item.confidence}</td><td>{item.mainSignal}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="stage-actions">
                  <button className="ghost-button" onClick={() => setStep(3)}>← Probar otro modelo</button>
                  <button className="primary-button" onClick={downloadPdf} disabled={pdfGenerating}>
                    {pdfGenerating ? "Generando PDF…" : "Descargar reporte PDF"} <b>↓</b>
                  </button>
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <footer>
        <span>ISC PULSO Studio · Laboratorio sintético de riesgo de plazos</span>
        <span>Los resultados no representan desempeño histórico real de ISC.</span>
      </footer>
    </main>
  );
}
