/**
 * Single import point for PC1's data and store modules.
 *
 * Every PC3 feature imports data, scoring and scenario helpers from here and
 * nowhere else, so swapping from the early stubs to the real modules was one
 * file. The re-exports mirror the frozen module API in AGENTS.md.
 *
 * Rules:
 * - Types always come from `@/contracts/types`, never from this module.
 * - `askSI` is PC3's deterministic offline fallback until PC1 lands
 *   `@/lib/si`. It is grounded in the same dataset and never throws.
 */

import type { Experiment, Finding } from "@/contracts/types";
import { getExperiment, getFinding } from "@/lib/data";

export { SCENARIOS, customScenario, getScenario, regimeFor } from "@/lib/scenarios";
export { defaultWeights, rankExperiments } from "@/lib/scoring";
export {
  getExperiments,
  getExperiment,
  getFindings,
  getFinding,
  getMaterials,
  getMaterial,
  getTimeline,
  getGlossary,
  getGlossaryTerm,
} from "@/lib/data";
export { getInsights } from "@/lib/insights";
export { getMaterialRisks } from "@/lib/materials";
export { simulateRisk } from "@/lib/simulator";
export { getCoverage, getGaps } from "@/lib/coverage";
export { getPlaybook } from "@/lib/playbook";
export { buildBriefMarkdown } from "@/lib/brief";
export { useIgnis } from "@/store/useIgnis";
export { initUrlSync } from "@/store/urlSync";
export { askSI } from "./siFallback";

export interface EvidenceRef {
  experiment: Experiment;
  /** Set when the id names a finding rather than an experiment. */
  finding?: Finding;
}

/**
 * Evidence ids in the dataset name either an experiment (`saffire-i`) or one
 * of its findings (`saffire-i-f1`). Insights, materials and playbooks cite
 * findings, so a chip must resolve both without guessing.
 */
export function resolveEvidence(id: string): EvidenceRef | undefined {
  const experiment = getExperiment(id);
  if (experiment) return { experiment };

  const match = getFinding(id);
  if (match) return { experiment: match.experiment, finding: match.finding };

  return undefined;
}
