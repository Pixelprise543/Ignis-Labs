/**
 * TEMPORARY typed data stubs for PC3.
 *
 * The scaffold has the frozen contract but not PC1's `@/lib/*` data or
 * `@/store/*` store yet. Everything here is illustrative placeholder data
 * typed against `@/contracts/types`, so swapping to the real modules is a
 * single import change. Delete this file in the commit that switches over.
 *
 * Keep values illustrative: the HONESTY RULE applies to stubs too.
 */

import { useSyncExternalStore } from "react";
import type {
  Experiment,
  GlossaryTerm,
  Insight,
  Material,
  Playbook,
  PlaybookStep,
  Scenario,
  ScenarioId,
  ScoreWeights,
  SIRequest,
  SIResponse,
  SimDriver,
  SimInput,
  SimResult,
  Source,
} from "@/contracts/types";

// --- Illustrative stub data ------------------------------------------------

const stubSource = (title: string, year: number): Source => ({
  title,
  org: "NASA (stub citation, replace with PC1 data)",
  year,
});

export const stubScenarios: Scenario[] = [
  {
    id: "iss",
    label: "ISS 0g",
    gravityG: 0,
    o2Percent: 21,
    pressureKPa: 101.3,
    description: "Low-Earth-orbit microgravity station cabin.",
    assumption: false,
  },
  {
    id: "lunar",
    label: "Lunar 0.16g",
    gravityG: 0.16,
    o2Percent: 21,
    pressureKPa: 101.3,
    description: "Lunar surface habitat at one-sixth Earth gravity.",
    assumption: true,
  },
  {
    id: "mars",
    label: "Mars 0.38g",
    gravityG: 0.38,
    o2Percent: 21,
    pressureKPa: 101.3,
    description: "Mars surface habitat at two-fifths Earth gravity.",
    assumption: true,
  },
  {
    id: "eva",
    label: "EVA suit",
    gravityG: 0,
    o2Percent: 100,
    pressureKPa: 29.6,
    description: "Pressurized suit at low pressure with a pure-oxygen atmosphere.",
    assumption: true,
  },
  {
    id: "custom",
    label: "Custom",
    gravityG: 0,
    o2Percent: 21,
    pressureKPa: 101.3,
    description: "Your own gravity, oxygen and pressure combination.",
    assumption: true,
  },
];

export function stubCustomScenario(
  gravityG: number,
  o2Percent: number,
  pressureKPa: number,
): Scenario {
  return {
    id: "custom",
    label: "Custom",
    gravityG,
    o2Percent,
    pressureKPa,
    description: "Your own gravity, oxygen and pressure combination.",
    assumption: true,
  };
}

export function stubGetExperiment(id: string): Experiment | undefined {
  return stubExperiments.find((experiment) => experiment.id === id);
}

export const stubExperiments: Experiment[] = [
  {
    id: "stub-saffire",
    name: "Spacecraft Fire Experiment (stub)",
    acronym: "SAFFIRE",
    summary:
      "Illustrative placeholder for a spacecraft fire-safety experiment. Replace with PC1's curated record.",
    facility: "Free-flyer",
    regime: "microgravity",
    years: [2016, null],
    fuelType: "solid",
    fuel: "Placeholder material",
    conditions: {
      gravityG: 0,
      o2Percent: 21,
      diluent: "N2",
      pressureKPa: 101.3,
      flowCmPerS: null,
    },
    metrics: [],
    findings: [
      { id: "stub-saffire-f1", text: "Illustrative finding, not a NASA result.", tags: ["placeholder"] },
    ],
    safetyTakeaway: "Illustrative only: confirms the stub renders end to end.",
    sources: [stubSource("Stub source", 2016)],
    confidence: "illustrative",
    tags: ["stub"],
  },
  {
    id: "stub-bass",
    name: "Burning and Suppression of Solids (stub)",
    acronym: "BASS",
    summary:
      "Illustrative placeholder for a microgravity solid-fuel experiment. Replace with PC1's curated record.",
    facility: "ISS-other",
    regime: "microgravity",
    years: [2011, null],
    fuelType: "solid",
    fuel: "Placeholder material",
    conditions: {
      gravityG: 0,
      o2Percent: 21,
      diluent: "N2",
      pressureKPa: 101.3,
      flowCmPerS: null,
    },
    metrics: [],
    findings: [
      { id: "stub-bass-f1", text: "Illustrative finding, not a NASA result.", tags: ["placeholder"] },
    ],
    safetyTakeaway: "Illustrative only: stub for layout work.",
    sources: [stubSource("Stub source", 2011)],
    confidence: "illustrative",
    tags: ["stub"],
  },
  {
    id: "stub-flex",
    name: "Flame Extinguishment Experiment (stub)",
    acronym: "FLEX",
    summary:
      "Illustrative placeholder for a droplet-combustion experiment. Replace with PC1's curated record.",
    facility: "ISS-other",
    regime: "microgravity",
    years: [2009, null],
    fuelType: "droplet",
    fuel: "Placeholder fuel",
    conditions: {
      gravityG: 0,
      o2Percent: 21,
      diluent: "N2",
      pressureKPa: 101.3,
      flowCmPerS: null,
    },
    metrics: [],
    findings: [
      { id: "stub-flex-f1", text: "Illustrative finding, not a NASA result.", tags: ["placeholder"] },
    ],
    safetyTakeaway: "Illustrative only: stub for layout work.",
    sources: [stubSource("Stub source", 2009)],
    confidence: "illustrative",
    tags: ["stub"],
  },
];

export const stubInsights: Insight[] = [
  {
    id: "stub-insight-o2",
    title: "Stub insight: oxygen enrichment drives risk",
    summary:
      "Illustrative placeholder. The real insight will come from getInsights(scenario) once PC1's data lands.",
    severity: "high",
    scenarios: ["iss", "lunar", "mars"],
    evidenceIds: ["stub-saffire", "stub-bass"],
    confidence: 40,
    recommendation: "Replace this stub with an evidence-linked recommendation.",
  },
  {
    id: "stub-insight-flow",
    title: "Stub insight: low-flow smoldering",
    summary:
      "Illustrative placeholder used only to check severity grouping and layout.",
    severity: "caution",
    scenarios: ["iss"],
    evidenceIds: ["stub-flex"],
    confidence: 30,
    recommendation: "Replace this stub with an evidence-linked recommendation.",
  },
];

// --- Stub glossary ---------------------------------------------------------

export const stubGlossary: GlossaryTerm[] = [
  {
    id: "microgravity",
    term: "Microgravity",
    plain: "A condition where things float because the spacecraft is falling around Earth.",
    technical: "An environment where effective gravity is very small relative to Earth gravity (g).",
    related: ["buoyancy", "flame-sphere"],
  },
  {
    id: "buoyancy",
    term: "Buoyancy",
    plain: "Warm air rising, which on Earth pulls flames into a teardrop shape.",
    technical: "The upward force on a fluid due to density differences in a gravity field.",
    related: ["microgravity", "flame-sphere"],
  },
  {
    id: "flame-sphere",
    term: "Flame sphere",
    plain: "The round, dim flame you get when there is almost no buoyancy.",
    technical: "A nearly spherical diffusion flame sustained by molecular diffusion instead of convection.",
    related: ["microgravity", "buoyancy"],
  },
];

export function stubGetGlossaryTerm(id: string): GlossaryTerm | undefined {
  return stubGlossary.find((term) => term.id === id);
}

// --- Stub URL sync ---------------------------------------------------------

export function stubInitUrlSync(): () => void {
  return () => {};
}

// --- Stub store ------------------------------------------------------------

export interface StubState {
  scenario: Scenario;
  weights: ScoreWeights;
  compareIds: string[];
  selectedId: string | null;
  drawerOpen: boolean;
  paletteOpen: boolean;
}

let state: StubState = {
  scenario: stubScenarios[0],
  weights: { hazardSeverity: 0.35, exploration: 0.25, evidence: 0.25, recency: 0.15 },
  compareIds: [],
  selectedId: null,
  drawerOpen: false,
  paletteOpen: false,
};

const listeners = new Set<() => void>();

function set(patch: Partial<StubState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useIgnisStub() {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );

  return {
    ...snapshot,
    setScenario: (scenario: Scenario) => set({ scenario }),
    setWeights: (weights: ScoreWeights) => set({ weights }),
    resetWeights: () => set({ weights: { ...stubDefaultWeights } }),
    toggleCompare: (id: string) =>
      set({
        compareIds: state.compareIds.includes(id)
          ? state.compareIds.filter((entry) => entry !== id)
          : state.compareIds.length >= 4
            ? state.compareIds
            : [...state.compareIds, id],
      }),
    clearCompare: () => set({ compareIds: [] }),
    select: (id: string | null) => set({ selectedId: id }),
    setDrawerOpen: (open: boolean) => set({ drawerOpen: open }),
    setPaletteOpen: (open: boolean) => set({ paletteOpen: open }),
  };
}

// --- Stub SI ---------------------------------------------------------------

export async function stubAskSI(req: SIRequest): Promise<SIResponse> {
  const scenario = req.scenario;
  const o2 = scenario.o2Percent ?? 21;
  const question = (req.question ?? "").toLowerCase();
  const asksAboutOxygen = /oxygen|o2|cabin air|enrich/.test(question);
  const asksAboutSuppression = /suppress|extinguish|put out|fight/.test(question);

  const chosen = req.experimentIds.length
    ? req.experimentIds
        .map((id) => stubExperiments.find((experiment) => experiment.id === id))
        .filter((experiment): experiment is Experiment => Boolean(experiment))
    : [...stubExperiments]
        .sort(
          (a, b) =>
            Math.abs(a.conditions.gravityG - scenario.gravityG) +
            Math.abs((a.conditions.o2Percent ?? 21) - o2) / 20 -
            (Math.abs(b.conditions.gravityG - scenario.gravityG) +
              Math.abs((b.conditions.o2Percent ?? 21) - o2) / 20),
        )
        .slice(0, 2);

  const citations = chosen.map((experiment) => experiment.id);
  const highOxygen = o2 > 30;
  const oxygenClause = highOxygen
    ? `${o2}% oxygen gives a flame roughly ${(o2 / 21).toFixed(1)} times the oxidiser of air, and the loaded experiments do not cover a test above 30% O2 in ${scenario.label}.`
    : `${o2}% oxygen is close to air, so oxygen enrichment is not the dominant driver at this baseline.`;

  const headline = asksAboutOxygen
    ? highOxygen
      ? `**Short answer:** yes. A ${o2}% oxygen cabin is the higher-risk case by construction: more oxidiser is available to any ignition source, and the dataset has little direct coverage at that enrichment.`
      : `**Short answer:** at ${o2}% oxygen this cabin is not oxygen-enriched compared with air, so the risk comes from material choice and gravity rather than oxygen alone.`
    : asksAboutSuppression
      ? `**Short answer:** isolate ventilation first, then suppress and re-check. Without buoyancy a flame can keep smouldering after the visible flame is gone.`
      : `**Scenario read:** ${scenario.label} combines ${scenario.gravityG.toFixed(2)}g with ${o2}% oxygen. Material choice and airflow matter more than a single headline number.`;

  const evidenceLines = chosen.map(
    (experiment) =>
      `- **${experiment.acronym}** (${experiment.years[0]}${experiment.years[1] ? `–${experiment.years[1]}` : ""}): ${experiment.safetyTakeaway} [${experiment.id}]`,
  );

  const answerMarkdown = [
    headline,
    "",
    `At **${scenario.label}** (${scenario.gravityG.toFixed(2)}g, ${o2}% O2, ${scenario.pressureKPa.toFixed(1)} kPa), ${oxygenClause}`,
    "",
    "**What the evidence says**",
    ...evidenceLines,
    "",
    "**Caveats**",
    "- The loaded records are illustrative placeholders, not verified NASA results.",
    "- Scores and projections are decision-support estimates, not a validated fire model.",
    "",
    "> Decision-support only, not a physics simulation.",
  ].join("\n");

  return {
    answerMarkdown,
    citations,
    model: "offline-fallback",
    fallback: true,
    groundingScore: citations.length > 0 ? 100 : 0,
    invalidCitationsRemoved: 0,
  };
}

// --- Stub materials, simulator, playbook and brief -------------------------

export const stubDefaultWeights: ScoreWeights = {
  hazardSeverity: 0.35,
  exploration: 0.25,
  evidence: 0.25,
  recency: 0.15,
};

export const stubMaterials: Material[] = [
  {
    id: "polyurethane-foam",
    name: "Polyurethane foam",
    category: "foam",
    usedFor: "Seat padding and acoustic insulation",
    evidenceIds: ["stub-saffire", "stub-bass"],
    baseFlammability: 86,
    notes: "Illustrative baseline. Real ignition behaviour depends on formulation and test conditions.",
  },
  {
    id: "cotton-towel",
    name: "Cotton towel",
    category: "textile",
    usedFor: "Crew hygiene and cleanup",
    evidenceIds: ["stub-bass"],
    baseFlammability: 78,
    notes: "Illustrative baseline. Loose fabric is a classic microgravity fire vector.",
  },
  {
    id: "polyethylene",
    name: "Polyethylene sheet",
    category: "polymer",
    usedFor: "Stowage bags and packaging",
    evidenceIds: ["stub-saffire"],
    baseFlammability: 72,
    notes: "Illustrative baseline. Melts and drips differently without buoyancy.",
  },
  {
    id: "paper-sheet",
    name: "Paper checklist",
    category: "paper",
    usedFor: "Printed procedures and labels",
    evidenceIds: ["stub-bass"],
    baseFlammability: 70,
    notes: "Illustrative baseline. Thin fuels can sustain low-flow smoldering.",
  },
  {
    id: "pmma-window",
    name: "Acrylic window",
    category: "composite",
    usedFor: "Viewport glazing and light covers",
    evidenceIds: ["stub-flex"],
    baseFlammability: 58,
    notes: "Illustrative baseline. Thick thermoplastics need a sustained ignition source.",
  },
  {
    id: "nomex-fabric",
    name: "Nomex fabric",
    category: "textile",
    usedFor: "Crew clothing and fire barriers",
    evidenceIds: ["stub-bass"],
    baseFlammability: 24,
    notes: "Illustrative baseline. Flame-resistant, not fireproof.",
  },
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function riskLevel(risk: number): "info" | "caution" | "high" | "critical" {
  if (risk >= 75) return "critical";
  if (risk >= 50) return "high";
  if (risk >= 30) return "caution";
  return "info";
}

function safeNumber(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

/**
 * Deterministic decision-support estimator for the stub dataset. The real
 * implementation is PC1's `simulateRisk`; this exists only so the simulator
 * page can be built and demoed offline.
 */
export function stubSimulateRisk(input: SimInput): SimResult {
  const material = stubMaterials.find((entry) => entry.id === input.materialId) ?? stubMaterials[0];
  const o2 = safeNumber(input.o2Percent, 21);
  const gravity = safeNumber(input.gravityG, 0);
  const pressure = safeNumber(input.pressureKPa, 101.3);
  const flow = safeNumber(input.flowCmPerS, 0);

  const oxygenEffect = (o2 - 21) * 1.2;
  const gravityEffect = clamp(gravity, 0, 1) * 9;
  const flowEffect = clamp(flow / 5, 0, 8);
  const pressureEffect = pressure < 60 ? -7 : pressure > 120 ? 2 : 0;

  const risk = Math.round(
    clamp(
      material.baseFlammability * 0.62 + oxygenEffect + gravityEffect + flowEffect + pressureEffect,
      0,
      100,
    ),
  );

  const drivers: SimDriver[] = [
    {
      factor: "Material baseline",
      direction: "raises",
      weight: 0.34,
      explanation: `${material.name} starts at a qualitative flammability index of ${material.baseFlammability}/100.`,
      evidenceIds: material.evidenceIds,
    },
    {
      factor: "Oxygen enrichment",
      direction: oxygenEffect >= 0 ? "raises" : "lowers",
      weight: 0.26,
      explanation:
        o2 > 21
          ? `${o2}% oxygen in the cabin raises the oxidiser available to a flame compared with air.`
          : `${o2}% oxygen gives a flame less oxidiser than a 21% air cabin.`,
      evidenceIds: ["stub-saffire", "stub-flex"],
    },
    {
      factor: "Gravity regime",
      direction: gravityEffect >= 0 ? "raises" : "lowers",
      weight: 0.18,
      explanation:
        gravity < 0.05
          ? "Microgravity removes buoyant flow, so hot gas leaves the flame by diffusion only."
          : `At ${gravity.toFixed(2)}g, partial buoyancy feeds fresh oxygen to the flame and can spread it faster.`,
      evidenceIds: ["stub-bass", "stub-flex"],
    },
    {
      factor: "Cabin pressure",
      direction: pressureEffect >= 0 ? "raises" : "lowers",
      weight: 0.1,
      explanation:
        pressure < 60
          ? `${pressure.toFixed(1)} kPa is a low-pressure cabin. Thin air slows some flame spread but changes suppression behaviour.`
          : `${pressure.toFixed(1)} kPa is near sea-level pressure, so oxygen is delivered at normal density.`,
      evidenceIds: ["stub-saffire"],
    },
    {
      factor: "Forced flow",
      direction: flowEffect >= 0 ? "raises" : "lowers",
      weight: 0.12,
      explanation:
        flow > 0
          ? `${flow.toFixed(1)} cm/s of cabin airflow supplies fresh oxidiser to the flame zone.`
          : "No forced flow. Ventilation fans and crew movement still move air in practice.",
      evidenceIds: ["stub-bass"],
    },
  ];

  const nearest = [...stubExperiments]
    .sort(
      (a, b) =>
        Math.abs(a.conditions.gravityG - gravity) * 3 +
        Math.abs((a.conditions.o2Percent ?? 21) - o2) / 10 -
        (Math.abs(b.conditions.gravityG - gravity) * 3 +
          Math.abs((b.conditions.o2Percent ?? 21) - o2) / 10),
    )
    .slice(0, 3)
    .map((experiment) => experiment.id);

  return {
    risk,
    level: riskLevel(risk),
    drivers,
    nearestExperimentIds: nearest,
    caveats: [
      "Decision-support estimate built from qualitative material indices, not a physics simulation.",
      "The stub dataset does not contain a high-oxygen microgravity test, so 34% O2 results carry extra uncertainty.",
      "Flow, pressure and gravity interact. Change one input at a time when comparing runs.",
    ],
  };
}

export function stubGetPlaybook(scenarioId: ScenarioId): Playbook {
  const scenario = stubScenarios.find((entry) => entry.id === scenarioId) ?? stubScenarios[0];

  const steps: PlaybookStep[] = [
    {
      phase: "detect",
      action: "Confirm the alarm on the affected rack and look for smoke, soot or an unexpected heat signature before you open anything.",
      rationale:
        "Microgravity smoke may not rise to a ceiling detector. Local confirmation avoids opening a rack onto a hidden fire.",
      evidenceIds: ["stub-saffire"],
    },
    {
      phase: "detect",
      action: `Announce the fire on the crew loop and call the ${scenario.label} scenario so responders share one atmosphere model.`,
      rationale: "Shared scenario values prevent a crew member from using Earth-air assumptions.",
      evidenceIds: ["stub-bass"],
    },
    {
      phase: "isolate",
      action: "Close the rack hatch and shut down ventilation to that rack, then de-energise the affected equipment if it is safe.",
      rationale: "Removing forced flow starves the flame of fresh oxidiser and limits smoke transport.",
      evidenceIds: ["stub-bass", "stub-flex"],
    },
    {
      phase: "isolate",
      action: "Move the crew upwind and account for every person before you attempt suppression.",
      rationale: "Fire response never starts until the crew is accounted for.",
      evidenceIds: ["stub-saffire"],
    },
    {
      phase: "suppress",
      action: "Apply the installed suppression agent to the base of the flame, then wait and re-check instead of assuming it is out.",
      rationale:
        "Without buoyancy, a flame can persist as a cool, invisible smoulder after visible flame is gone.",
      evidenceIds: ["stub-flex"],
    },
    {
      phase: "suppress",
      action: "Keep the hatch closed after suppression until the atmosphere is sampled and the surface temperature is falling.",
      rationale: "Reopening a hatch can reintroduce oxygen to a still-hot fuel bed.",
      evidenceIds: ["stub-saffire"],
    },
    {
      phase: "ventilate",
      action: "Vent the affected volume to the vehicle's atmosphere-control system and monitor CO, CO2 and particulate levels.",
      rationale: "Combustion products must be removed before the crew removes masks.",
      evidenceIds: ["stub-saffire"],
    },
    {
      phase: "ventilate",
      action: "Restore filtered airflow gradually and watch for a re-ignition signature.",
      rationale: "A sudden return of oxygen and flow can revive a smouldering fuel.",
      evidenceIds: ["stub-bass"],
    },
    {
      phase: "recover",
      action: "Log the event, the atmosphere readings and the suppression agent used, then quarantine the damaged material.",
      rationale: "Post-fire evidence is the input for the next safety review.",
      evidenceIds: ["stub-saffire", "stub-bass"],
    },
    {
      phase: "recover",
      action: "Replace or re-test every material exposed to heat and review the scenario assumptions that shaped this playbook.",
      rationale: "Heat-damaged materials can fail later even when they look intact.",
      evidenceIds: ["stub-bass"],
    },
  ];

  return {
    scenarioId: scenario.id,
    steps,
    caveats: [
      "Derived from cited experiments for training and planning. It does not replace the vehicle's flight rules or a crew procedure.",
      "The stub dataset is illustrative. Confirm every action against the current vehicle checklist before use.",
    ],
  };
}

export function stubBuildBriefMarkdown(
  scenario: Scenario,
  weights: ScoreWeights,
  compareIds: string[],
): string {
  const insights = stubInsights.filter((insight) => insight.scenarios.includes(scenario.id));
  const scopedInsights = insights.length > 0 ? insights : stubInsights;
  const o2 = scenario.o2Percent ?? 21;

  const rankedMaterials = [...stubMaterials]
    .map((material) => ({
      material,
      risk: Math.round(
        clamp(material.baseFlammability * 0.7 + (o2 - 21) * 1.3 + scenario.gravityG * 8, 0, 100),
      ),
    }))
    .sort((a, b) => b.risk - a.risk)
    .slice(0, 3);

  const compared = compareIds
    .map((id) => stubExperiments.find((experiment) => experiment.id === id))
    .filter((experiment): experiment is Experiment => Boolean(experiment));

  const lines: string[] = [
    `# Mission safety brief — ${scenario.label}`,
    "",
    `Generated ${new Date().toISOString().slice(0, 10)} by Ignis (decision support, not a physics simulation).`,
    "",
    "## Scenario",
    "",
    `- ${scenario.description}`,
    `- Gravity: ${scenario.gravityG.toFixed(2)} g`,
    `- Oxygen: ${o2}%`,
    `- Pressure: ${scenario.pressureKPa.toFixed(1)} kPa`,
    scenario.assumption ? "- These values are assumptions. Verify them before use." : "",
    "",
    "## Headline risks",
    "",
    ...scopedInsights
      .slice(0, 3)
      .map(
        (insight) =>
          `- **${insight.title}** (${insight.severity}, confidence ${insight.confidence}%). ${insight.recommendation} Evidence: ${insight.evidenceIds.join(", ")}.`,
      ),
    "",
    "## Material priorities",
    "",
    ...rankedMaterials.map(
      (entry, index) =>
        `${index + 1}. ${entry.material.name}: risk ${entry.risk}/100 (${riskLevel(entry.risk)}). ${entry.material.usedFor}. Baseline index ${entry.material.baseFlammability}/100.`,
    ),
    "",
    "## Crew response",
    "",
    ...stubGetPlaybook(scenario.id).steps.map(
      (step) => `- **${step.phase}**: ${step.action} _${step.rationale}_ (${step.evidenceIds.join(", ")})`,
    ),
    "",
  ];

  if (compared.length > 0) {
    lines.push("## Compared experiments", "");
    compared.forEach((experiment) => {
      lines.push(
        `- ${experiment.acronym}: ${experiment.name} (${experiment.confidence}). ${experiment.safetyTakeaway}`,
      );
    });
    lines.push("");
  }

  lines.push(
    "## Scoring weights",
    "",
    `Hazard severity ${Math.round(weights.hazardSeverity * 100)}%, exploration value ${Math.round(weights.exploration * 100)}%, evidence strength ${Math.round(weights.evidence * 100)}%, recency ${Math.round(weights.recency * 100)}%.`,
    "",
    "## Evidence and confidence",
    "",
    ...scopedInsights.map(
      (insight) =>
        `- ${insight.title}: ${insight.evidenceIds.length} linked experiment(s), confidence ${insight.confidence}%.`,
    ),
    "",
    "## Limitations",
    "",
    "- Derived scores and material risks are decision-support estimates, not measured ignition thresholds.",
    "- The stub dataset is illustrative. Re-generate this brief once the verified dataset is loaded.",
    "- Absence of a risk signal is not evidence of safety; check the coverage map for gaps.",
    "",
  );

  return lines.join("\n");
}
