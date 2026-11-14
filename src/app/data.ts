/**
 * Single swap point for PC1's data and store modules.
 *
 * Today these re-export illustrative stubs. When `@/lib/*` and
 * `@/store/useIgnis` land on main, replace the import block below with the
 * frozen module API and delete `_stubs.ts`. No feature file imports stubs
 * directly, so the swap is one file and one commit.
 *
 * Frozen API being mirrored (see AGENTS.md):
 *   @/lib/data       getExperiments, getExperiment, getMaterials, getTimeline,
 *                    getGlossary, getGlossaryTerm
 *   @/lib/scenarios  SCENARIOS, getScenario, customScenario
 *   @/lib/insights   getInsights
 *   @/lib/si         askSI
 *   @/lib/scenarios  SCENARIOS
 *   @/store/urlSync  initUrlSync
 *   @/store/useIgnis zustand hook
 */

import type { Experiment, GlossaryTerm, Insight, Material, Playbook, Scenario, ScenarioId, ScoreWeights, SIRequest, SIResponse, SimInput, SimResult } from "@/contracts/types";
import {
  stubAskSI,
  stubBuildBriefMarkdown,
  stubCustomScenario,
  stubDefaultWeights,
  stubExperiments,
  stubGetGlossaryTerm,
  stubGetExperiment,
  stubGetPlaybook,
  stubGlossary,
  stubInitUrlSync,
  stubInsights,
  stubMaterials,
  stubScenarios,
  stubSimulateRisk,
  useIgnisStub,
} from "./_stubs";

export const SCENARIOS: Scenario[] = stubScenarios;
export const defaultWeights: ScoreWeights = stubDefaultWeights;

export function getExperiments(): Experiment[] {
  return stubExperiments;
}

export function getMaterials(): Material[] {
  return stubMaterials;
}

export function simulateRisk(input: SimInput): SimResult {
  return stubSimulateRisk(input);
}

export function getPlaybook(id: ScenarioId): Playbook {
  return stubGetPlaybook(id);
}

export function buildBriefMarkdown(
  scenario: Scenario,
  weights: ScoreWeights,
  compareIds: string[],
): string {
  return stubBuildBriefMarkdown(scenario, weights, compareIds);
}

export function getExperiment(id: string): Experiment | undefined {
  return stubGetExperiment(id);
}

export function getGlossary(): GlossaryTerm[] {
  return stubGlossary;
}

export function getGlossaryTerm(id: string): GlossaryTerm | undefined {
  return stubGetGlossaryTerm(id);
}

/**
 * Insights for the active scenario. Custom scenarios inherit every insight
 * because the crew may land outside the three named regimes.
 */
export function getInsights(scenario: Scenario): Insight[] {
  const scoped = stubInsights.filter((insight) => insight.scenarios.includes(scenario.id));
  return scoped.length > 0 ? scoped : stubInsights;
}

export function customScenario(gravityG: number, o2Percent: number, pressureKPa: number): Scenario {
  return stubCustomScenario(gravityG, o2Percent, pressureKPa);
}

export function askSI(req: SIRequest): Promise<SIResponse> {
  return stubAskSI(req);
}

export function initUrlSync(): () => void {
  return stubInitUrlSync();
}

export const useIgnis = useIgnisStub;
