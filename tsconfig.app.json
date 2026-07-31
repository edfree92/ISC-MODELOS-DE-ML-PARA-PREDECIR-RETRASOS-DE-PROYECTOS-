import { describe, expect, it } from "vitest";
import { runExperiment } from "./ml";
import { buildAcademicPdf } from "./report";
import {
  datasetProfile,
  generateSyntheticDataset,
  validateConfig,
} from "./simulation";
import { DEFAULT_CONFIG } from "./types";

describe("ISC UNIVERSE", () => {
  it("valida los rangos de configuración", () => {
    expect(validateConfig(DEFAULT_CONFIG)).toEqual([]);
    expect(
      validateConfig({ ...DEFAULT_CONFIG, durationMin: 40, durationMax: 12 }),
    ).toContain("La duración máxima no puede ser menor que la mínima.");
  });

  it("repite la misma simulación cuando conserva la semilla", () => {
    const config = { ...DEFAULT_CONFIG, projectCount: 40, seed: 2026 };
    const first = generateSyntheticDataset(config);
    const second = generateSyntheticDataset(config);
    expect(first.projects).toEqual(second.projects);
    expect(first.rows).toEqual(second.rows);
  });

  it("genera proyectos y cortes semanales coherentes", () => {
    const config = { ...DEFAULT_CONFIG, projectCount: 40 };
    const dataset = generateSyntheticDataset(config);
    const profile = datasetProfile(dataset);
    expect(dataset.projects).toHaveLength(40);
    expect(dataset.rows.length).toBeGreaterThan(40);
    expect(profile.projects).toBe(40);
    expect(profile.weeklyCuts).toBe(dataset.rows.length);
  });
});

describe("ISC ARENA", () => {
  it("ejecuta los tres modelos sobre la misma base", async () => {
    const dataset = generateSyntheticDataset({
      ...DEFAULT_CONFIG,
      projectCount: 45,
      durationMin: 8,
      durationMax: 14,
      seed: 77,
    });
    const result = await runExperiment(dataset, "todos", () => undefined);
    expect(result.results).toHaveLength(3);
    expect(result.results.map((item) => item.key).sort()).toEqual(
      ["arbol", "bosque", "logistica"].sort(),
    );
    for (const model of result.results) {
      expect(model.metrics.balancedAccuracy).toBeGreaterThanOrEqual(0);
      expect(model.metrics.balancedAccuracy).toBeLessThanOrEqual(1);
      expect(model.predictions.length).toBeGreaterThan(0);
    }
  }, 30_000);

  it("construye el reporte PDF completo", async () => {
    const dataset = generateSyntheticDataset({
      ...DEFAULT_CONFIG,
      projectCount: 35,
      durationMin: 8,
      durationMax: 12,
      seed: 92,
    });
    const result = await runExperiment(dataset, "logistica", () => undefined);
    const pdf = buildAcademicPdf(result);
    expect(pdf.byteLength).toBeGreaterThan(20_000);
    expect(new TextDecoder().decode(pdf.slice(0, 8))).toContain("%PDF-");
  }, 30_000);
});
