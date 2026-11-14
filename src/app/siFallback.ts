import type {
  Experiment,
  Insight,
  Scenario,
  Severity,
  SIRequest,
  SIResponse,
} from "@/contracts/types";
import {
  getExperiment,
  getExperiments,
  getFinding,
  getMaterials,
} from "@/lib/data";
import { getInsights } from "@/lib/insights";
import { getMaterialRisks } from "@/lib/materials";
import { getPlaybook } from "@/lib/playbook";
import { formatGravity } from "@/lib/scenarios";
import { defaultWeights, rankExperiments } from "@/lib/scoring";

/**
 * Deterministic, offline "Ask Ignis" fallback.
 *
 * PC1's `@/lib/si` does not exist yet, and the demo must work with no network
 * and no API key. This module answers only from the same dataset every view
 * uses: insights, experiment findings, material risks and the playbook.
 *
 * Guarantees the UI relies on:
 * - it never throws and never returns an uncited scientific claim;
 * - every citation is checked against real experiment or finding ids, and the
 *   number of rejected ids is reported in `invalidCitationsRemoved`;
 * - it labels itself as a fallback so the UI can badge it.
 *
 * This is decision support. It is not a live model and not a physics code.
 */

const MODEL = "ignis-offline-fallback";
const MAX_CITATIONS = 6;

const SEVERITY_RANK: Record<Severity, number> = {
  critical: 0,
  high: 1,
  caution: 2,
  info: 3,
};

type Intent = "oxygen" | "spread" | "suppression" | "material" | "response" | "coverage" | "general";

const INTENT_HINTS: Record<Intent, string[]> = {
  oxygen: ["oxygen-enrichment", "pressure-extinction-limit", "screening-does-not-qualify"],
  spread: ["ventilation-controls-spread", "no-partial-gravity-data", "scale-changes-the-fire"],
  suppression: ["suppression-does-not-transfer", "extinguished-is-not-out"],
  material: ["screening-does-not-qualify", "oxygen-enrichment", "scale-changes-the-fire"],
  response: ["smoke-is-the-first-threat", "concealed-fire", "no-partial-gravity-data"],
  coverage: ["no-partial-gravity-data", "scale-changes-the-fire", "pressure-extinction-limit"],
  general: [],
};

function detectIntent(question: string, mode: SIRequest["mode"]): Intent {
  if (mode === "playbook") return "response";
  if (mode === "interpret") return "coverage";
  const text = question.toLowerCase();
  if (/oxygen|o2|enrich|pure|34\s*%|partial pressure/.test(text)) return "oxygen";
  if (/spread|airflow|ventilat|flow|fan|buoyan/.test(text)) return "spread";
  if (/suppress|extinguish|put out|fight|agent|sprinkler/.test(text)) return "suppression";
  if (/material|fabric|foam|plastic|paper|fuel|ignit/.test(text)) return "material";
  if (/first|response|crew|playbook|procedure|detect|isolate|recover/.test(text)) return "response";
  if (/gap|missing|cover|unknown|evidence|data/.test(text)) return "coverage";
  return "general";
}

function isKnownEvidence(id: string): boolean {
  return getExperiment(id) !== undefined || getFinding(id) !== undefined;
}

function sanitizeCitations(ids: string[]): { citations: string[]; removed: number } {
  const seen = new Set<string>();
  const citations: string[] = [];
  let removed = 0;

  for (const id of ids) {
    if (!id) continue;
    if (!isKnownEvidence(id)) {
      removed += 1;
      continue;
    }
    if (seen.has(id)) continue;
    seen.add(id);
    citations.push(id);
  }

  return { citations: citations.slice(0, MAX_CITATIONS), removed };
}

function experimentForEvidence(id: string): Experiment | undefined {
  const direct = getExperiment(id);
  if (direct) return direct;
  return getFinding(id)?.experiment;
}

function focusInsights(scenario: Scenario, intent: Intent, mode: SIRequest["mode"]): Insight[] {
  const available = getInsights(scenario);
  const wanted = new Set(INTENT_HINTS[intent]);
  const matched = available.filter((insight) => wanted.has(insight.id));

  if (matched.length > 0) {
    return matched.sort(
      (a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] || b.confidence - a.confidence,
    );
  }

  const ranked = [...available].sort(
    (a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] || b.confidence - a.confidence,
  );

  return mode === "summarize" || mode === "brief" ? ranked.slice(0, 3) : ranked.slice(0, 2);
}

function focusExperiments(req: SIRequest, insights: Insight[]): Experiment[] {
  const requested = req.experimentIds
    .map((id) => getExperiment(id))
    .filter((experiment): experiment is Experiment => Boolean(experiment));
  if (requested.length > 0) return requested.slice(0, 4);

  const cited = new Map<string, Experiment>();
  for (const insight of insights) {
    for (const id of insight.evidenceIds) {
      const experiment = experimentForEvidence(id);
      if (experiment) cited.set(experiment.id, experiment);
    }
  }
  if (cited.size > 0) return [...cited.values()].slice(0, 3);

  return rankExperiments(getExperiments(), defaultWeights, req.scenario)
    .slice(0, 3)
    .map((entry) => entry.experiment);
}

function scenarioLine(scenario: Scenario): string {
  const pressure = Number(scenario.pressureKPa.toPrecision(3));
  return `${scenario.label} — ${formatGravity(scenario.gravityG)}, ${scenario.o2Percent}% O2, ${pressure} kPa${
    scenario.assumption ? " (notional design point, assumption to verify)" : ""
  }.`;
}

function caveatsFor(scenario: Scenario): string[] {
  const caveats = [
    "Decision-support estimate built from cited experiments, not a physics simulation.",
  ];

  if (scenario.gravityG >= 0.01 && scenario.gravityG < 0.9) {
    caveats.push(
      "No partial-gravity flame-spread data exists in this dataset, so results for this habitat are an extrapolation from microgravity evidence.",
    );
  }
  if (scenario.o2Percent >= 30) {
    caveats.push(
      "The dataset has little coverage above 30% oxygen, so read oxygen-driven differences as a range, not a point value.",
    );
  }
  if (scenario.assumption) {
    caveats.push(
      "This scenario's atmosphere is a planning assumption. Re-check the answer at the real cabin composition.",
    );
  }

  return caveats;
}

function opening(req: SIRequest, intent: Intent, insights: Insight[]): string {
  const o2 = req.scenario.o2Percent;
  const enriched = o2 >= 25;

  if (req.mode === "compare") {
    return `**Comparison, not a verdict.** The records below differ in facility, gravity and conditions; read the differences before you rank one above the other.`;
  }
  if (req.mode === "brief" || req.mode === "summarize") {
    return `**Scenario summary.** The strongest evidence-linked findings for ${req.scenario.label} are below, most severe first.`;
  }

  switch (intent) {
    case "oxygen":
      return enriched
        ? `**Short answer: yes.** At ${o2}% oxygen this habitat carries more oxidiser than sea-level air, which lowers the energy needed for ignition and widens the range of materials that will sustain a flame. It is not just "more oxygen": a material qualified in air does not transfer unchanged.`
        : `**Short answer: not from oxygen alone.** At ${o2}% oxygen this cabin is close to air, so material choice, airflow and gravity regime matter more than enrichment. The risk does not disappear, it moves.`;
    case "spread":
      return `**Short answer: the airflow field is the main spread control.** Without buoyancy there is no rising plume to feed a flame, so ventilation near a surface takes over that job. Stopping the fans is not automatically safe.`;
    case "suppression":
      return `**Short answer: isolate first, then suppress, then prove it is out.** A microgravity flame can keep reacting as a cool smoulder after the visible flame disappears, so "looks out" is not evidence of out.`;
    case "material":
      return `**Short answer: treat material choice as a design control.** The catalogue ranks qualitative flammability indices; the highest-risk entries for this scenario are called out below with the evidence behind them.`;
    case "response":
      return `**Short answer: detect, isolate, suppress, ventilate, recover — in that order.** Every step below is linked to a finding in the dataset, and the scenario changes the parts the evidence actually changes.`;
    case "coverage":
      return `**Short answer: the dataset cannot fully answer this scenario.** The gaps below are research gaps, not evidence of safety. Treat extrapolations as questions to test.`;
    case "general":
    default:
      return insights.length > 0
        ? `**Scenario read.** ${scenarioLine(req.scenario)} The evidence-linked priorities for this configuration are below.`
        : `**Scenario read.** ${scenarioLine(req.scenario)} No insight in the dataset is scoped to this exact configuration, so the nearest experiments are listed instead.`;
  }
}

function insightBlock(insights: Insight[]): string[] {
  if (insights.length === 0) {
    return [
      "**What the evidence says**",
      "- No curated insight is scoped to this scenario. That is a coverage gap, not a clean bill of health.",
    ];
  }

  return [
    "**What the evidence says**",
    ...insights.map(
      (insight) =>
        `- **${insight.title}** (${insight.severity}, confidence ${insight.confidence}%). ${insight.summary} Evidence: ${insight.evidenceIds.join(", ")}.`,
    ),
  ];
}

function experimentBlock(experiments: Experiment[], req: SIRequest): string[] {
  if (experiments.length === 0) {
    return ["**Nearest experiments**", "- No experiment in the dataset supports a grounded answer."];
  }

  if (req.mode === "compare") {
    return [
      "**Side by side**",
      ...experiments.map((experiment) => {
        const pressure =
          experiment.conditions.pressureKPa === null
            ? "pressure not published"
            : `${Number(experiment.conditions.pressureKPa.toPrecision(3))} kPa`;
        const oxygen =
          experiment.conditions.o2Percent === null
            ? "oxygen not published"
            : `${experiment.conditions.o2Percent}% O2`;
        return `- **${experiment.acronym}** (${experiment.years[0]}${
          experiment.years[1] ? `–${experiment.years[1]}` : ""
        }, ${experiment.facility}, ${experiment.confidence}) — ${formatGravity(
          experiment.conditions.gravityG,
        )}, ${oxygen}, ${pressure}, fuel: ${experiment.fuel}. ${experiment.safetyTakeaway} [${experiment.id}]`;
      }),
    ];
  }

  return [
    "**Nearest supporting experiments**",
    ...experiments.map(
      (experiment) =>
        `- **${experiment.acronym}** (${experiment.years[0]}${
          experiment.years[1] ? `–${experiment.years[1]}` : ""
        }, ${experiment.facility}, ${experiment.confidence}) — ${experiment.safetyTakeaway} [${experiment.id}]`,
    ),
  ];
}

function playbookBlock(req: SIRequest): string[] {
  const playbook = getPlaybook(req.scenario.id);
  const steps = playbook.steps.slice(0, 5);
  return [
    "**Crew response, first five steps**",
    ...steps.map(
      (step, index) =>
        `${index + 1}. **${step.phase}** — ${step.action} Evidence: ${step.evidenceIds.join(", ")}.`,
    ),
    "",
    `Caveats: ${playbook.caveats.join(" ")}`,
  ];
}

function materialBlock(req: SIRequest): string[] {
  const materials = getMaterials();
  const risks = getMaterialRisks(req.scenario)
    .slice()
    .sort((a, b) => b.risk - a.risk)
    .slice(0, 3);

  if (risks.length === 0) return [];

  return [
    "**Highest material risks in this scenario**",
    ...risks.map((risk) => {
      const material = materials.find((entry) => entry.id === risk.materialId);
      return `- **${material?.name ?? risk.materialId}** — risk ${risk.risk}/100 (${risk.level}). ${risk.rationale} Evidence: ${risk.evidenceIds.join(", ")}.`;
    }),
  ];
}

function buildAnswer(req: SIRequest): SIResponse {
  const intent = detectIntent(req.question ?? "", req.mode);
  const insights = focusInsights(req.scenario, intent, req.mode);
  const experiments = focusExperiments(req, insights);

  const rawCitations: string[] = [];
  for (const experiment of experiments) rawCitations.push(experiment.id);
  for (const insight of insights) rawCitations.push(...insight.evidenceIds);

  const requestedInvalid = req.experimentIds.filter((id) => !isKnownEvidence(id)).length;
  const { citations, removed } = sanitizeCitations(rawCitations);
  const considered = citations.length + removed + requestedInvalid;

  const parts: string[] = [
    opening(req, intent, insights),
    "",
    scenarioLine(req.scenario),
    "",
    ...insightBlock(insights),
    "",
    ...experimentBlock(experiments, req),
  ];

  if (intent === "material" || req.mode === "interpret") {
    const materials = materialBlock(req);
    if (materials.length > 0) parts.push("", ...materials);
  }

  if (intent === "response" || req.mode === "playbook") {
    parts.push("", ...playbookBlock(req));
  }

  parts.push(
    "",
    "**Caveats**",
    ...caveatsFor(req.scenario).map((caveat) => `- ${caveat}`),
    "",
    "> Offline deterministic fallback, grounded only in this dataset. Decision support, not a physics simulation.",
  );

  return {
    answerMarkdown: parts.join("\n"),
    citations,
    model: MODEL,
    fallback: true,
    groundingScore:
      considered === 0 ? 100 : Math.round((citations.length / Math.max(considered, 1)) * 100),
    invalidCitationsRemoved: removed + requestedInvalid,
  };
}

/**
 * Contract entry point. Resolves for every input, including nonsense, and
 * reports a low-grounding answer rather than throwing.
 */
export async function askSI(req: SIRequest): Promise<SIResponse> {
  try {
    return buildAnswer(req);
  } catch {
    return {
      answerMarkdown: [
        "**Ignis could not build a grounded answer for this request.**",
        "",
        "The dataset is still available in Explore, Insights and the Simulator. Try a narrower question, or read the Method page to see what the assistant can answer.",
        "",
        "> Offline deterministic fallback. No claim is made here.",
      ].join("\n"),
      citations: [],
      model: MODEL,
      fallback: true,
      groundingScore: 0,
      invalidCitationsRemoved: 0,
    };
  }
}
