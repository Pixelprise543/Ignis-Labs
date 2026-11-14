import type { Insight, Scenario, ScenarioId, Severity } from '@/contracts/types'
import { getFinding } from '@/lib/data'
import { formatGravity } from '@/lib/scenarios'
import { severityRank } from '@/lib/severity'

export { severityRank }

/**
 * Insights are curated rules, not generated prose.
 *
 * Each rule encodes one transferable lesson from the dataset, states the
 * scenarios it applies to, and cites finding ids that actually exist. The
 * scenarios and severities move with the selected habitat - oxygen enrichment in
 * the EVA suit is critical, the same lesson is absent from a sea-level cabin -
 * but the underlying claim never changes. That keeps the Insights page honest:
 * a reader can trace every sentence to a finding.
 */

const ALL_SCENARIOS: ScenarioId[] = ['iss', 'lunar', 'mars', 'eva', 'custom']
const PARTIAL_G_SCENARIOS: ScenarioId[] = ['lunar', 'mars', 'custom']
const ENRICHED_SCENARIOS: ScenarioId[] = ['eva', 'custom']
const LOW_PRESSURE_SCENARIOS: ScenarioId[] = ['eva', 'custom']

interface InsightRule {
  id: string
  title: string
  scenarioIds: ScenarioId[]
  confidence: number
  evidenceIds: string[]
  applies: (scenario: Scenario) => boolean
  severity: (scenario: Scenario) => Severity
  summary: (scenario: Scenario) => string
  recommendation: string
}

const isPartialGravity = (scenario: Scenario) =>
  scenario.gravityG >= 0.01 && scenario.gravityG < 0.9

const RULES: InsightRule[] = [
  {
    id: 'no-partial-gravity-data',
    title: 'No partial-gravity flame-spread data exists',
    scenarioIds: PARTIAL_G_SCENARIOS,
    confidence: 35,
    evidenceIds: ['acme-bre-f2', 'sofie-mist-f2', 'saffire-vi-f1'],
    applies: isPartialGravity,
    severity: () => 'high',
    summary: (scenario) =>
      `At ${formatGravity(scenario.gravityG)}, a flame sits between the microgravity case and the normal-gravity case, but no experiment in this dataset measured flame spread at that gravity. Every result shown for this habitat is an extrapolation from microgravity plus theory.`,
    recommendation:
      'Treat rankings, material risks and simulator output for this scenario as an extrapolation, and fund a partial-gravity test before a result informs a design decision.',
  },
  {
    id: 'ventilation-controls-spread',
    title: 'Ventilation controls how fast a fire spreads',
    scenarioIds: ALL_SCENARIOS,
    confidence: 88,
    evidenceIds: ['saffire-iii-f1', 'sofie-rtdfs-f1', 'acme-bre-f1'],
    applies: () => true,
    severity: () => 'high',
    summary: () =>
      'In microgravity there is no rising plume to feed a flame, so the airflow field near a surface takes over that job. The same fabric burned at different airflow rates spread differently, and a solid surface kept burning for minutes with no airflow at all.',
    recommendation:
      'Keep air handling inside the fire-response procedure, and do not assume that stopping the fans will starve a flame.',
  },
  {
    id: 'oxygen-enrichment',
    title: 'Oxygen enrichment lowers the fire-safety margin',
    scenarioIds: ENRICHED_SCENARIOS,
    confidence: 82,
    evidenceIds: ['saffire-vi-f1', 'sofie-gel-f1', 'acme-flame-design-f1'],
    applies: (scenario) => scenario.o2Percent >= 25,
    severity: (scenario) => (scenario.o2Percent >= 50 ? 'critical' : 'high'),
    summary: (scenario) =>
      `This habitat runs at ${scenario.o2Percent}% oxygen instead of the 21% of sea-level air. Higher oxygen lowers the energy needed for ignition and widens the range of materials that will sustain a flame, and it changes the way a material that is already qualified in air will burn.`,
    recommendation:
      'Repeat material flammability screening at the oxygen fraction actually planned; a pass in sea-level air does not transfer to this cabin.',
  },
  {
    id: 'suppression-does-not-transfer',
    title: 'A suppression procedure qualified on Earth is not enough',
    scenarioIds: ALL_SCENARIOS,
    confidence: 78,
    evidenceIds: ['sofie-mist-f2', 'bass-f3'],
    applies: () => true,
    severity: () => 'high',
    summary: () =>
      'With no buoyant plume, a suppression agent has to be driven into the flame rather than falling into it. The mass of agent that extinguishes a ground test is therefore not a safe design quantity in orbit, and suppression has to be measured in the relevant gravity.',
    recommendation:
      'Size suppression for forced delivery into the flame and verify the quantity in microgravity instead of scaling a terrestrial test.',
  },
  {
    id: 'extinguished-is-not-out',
    title: 'A fire that looks extinguished may still be reacting',
    scenarioIds: ALL_SCENARIOS,
    confidence: 80,
    evidenceIds: ['flex-f1', 'cfi-f1'],
    applies: () => true,
    severity: () => 'high',
    summary: () =>
      'Cool-flame chemistry can consume fuel at a temperature far below a visible flame, and a droplet flame can appear to extinguish and then re-ignite. The absence of light is not evidence that the reaction has stopped.',
    recommendation:
      'Confirm with a gas measurement before declaring a fire out, removing protective equipment or reopening a panel.',
  },
  {
    id: 'concealed-fire',
    title: 'Gaps behind panels can hide a spreading flame',
    scenarioIds: ALL_SCENARIOS,
    confidence: 70,
    evidenceIds: ['sofie-nca-f1', 'sofie-nca-f2'],
    applies: () => true,
    severity: () => 'high',
    summary: () =>
      'Narrow channels concentrate the same ventilation flow into a smaller cross-section, so a material that passes an open-surface test can still sustain a flame where the fire is hardest for the crew or a detector to see.',
    recommendation:
      'Include rack gaps, wall cavities and stowage interiors in detection design and inspection, not only exposed surfaces.',
  },
  {
    id: 'screening-does-not-qualify',
    title: 'Ground flammability screening does not qualify a material for flight',
    scenarioIds: ALL_SCENARIOS,
    confidence: 74,
    evidenceIds: ['sofie-smurf-f1', 'acme-bre-f2'],
    applies: () => true,
    severity: () => 'caution',
    summary: () =>
      'The standard screening test was developed at normal gravity. Passing it shows how a material behaves in a ground test, not how it behaves in the gravity and atmosphere of the vehicle being designed.',
    recommendation:
      'Use ground screening as a first filter, then test the shortlisted materials in the relevant gravity and atmosphere.',
  },
  {
    id: 'smoke-is-the-first-threat',
    title: 'Smoke, not flame, is the first credible threat',
    scenarioIds: ALL_SCENARIOS,
    confidence: 68,
    evidenceIds: ['acme-cld-flame-f2', 'bass-f1'],
    applies: () => true,
    severity: () => 'high',
    summary: () =>
      'A microgravity flame can burn as a compact blue ball with no rising plume to carry smoke to a detector, while soot production still sets smoke opacity and toxicity. Detection therefore has to work in the cabin flow field rather than in a terrestrial plume.',
    recommendation:
      'Place detectors where the ventilation flow will carry smoke, and back them with gas sensing instead of relying on visible flame.',
  },
  {
    id: 'pressure-extinction-limit',
    title: 'Low pressure changes the flame before it stops it',
    scenarioIds: LOW_PRESSURE_SCENARIOS,
    confidence: 72,
    evidenceIds: ['sofie-gel-f1', 'sofie-gel-f2'],
    applies: (scenario) => scenario.pressureKPa < 60,
    severity: (scenario) => (scenario.pressureKPa < 40 ? 'critical' : 'high'),
    summary: (scenario) =>
      `This habitat runs at ${Number(scenario.pressureKPa.toPrecision(3))} kPa, well below sea level. A flame can change colour and shrink as pressure falls and still burn, and the pressure at which it finally extinguishes depends on the material and the oxygen fraction.`,
    recommendation:
      'Measure extinction at the planned pressure and oxygen combination instead of assuming a lower-pressure cabin is automatically safer.',
  },
  {
    id: 'scale-changes-the-fire',
    title: 'Coupon-scale tests understate a real cabin fire',
    scenarioIds: ALL_SCENARIOS,
    confidence: 85,
    evidenceIds: ['saffire-i-f1', 'saffire-i-f2'],
    applies: () => true,
    severity: () => 'caution',
    summary: () =>
      'Before Saffire-I the largest fire burned in space was about the size of an index card. A metre-scale sample then supported a slow flame for roughly eight minutes, with smouldering continuing behind the flame front, which is behaviour a coupon-sized test cannot show.',
    recommendation:
      'Size detection and suppression from large-scale fire-growth data or a validated model, not from coupon results alone.',
  },
]

/** Fails fast on a typo: a citation that does not resolve is a build error. */
for (const rule of RULES) {
  for (const findingId of rule.evidenceIds) {
    if (!getFinding(findingId)) {
      throw new Error(`Insight rule "${rule.id}" cites missing finding "${findingId}"`)
    }
  }
}

/**
 * Returns the rules that apply to a scenario, most urgent first. Ties break on
 * id so the order is stable across renders.
 */
export function getInsights(scenario: Scenario): Insight[] {
  return RULES.filter((rule) => rule.applies(scenario))
    .map((rule) => ({
      id: rule.id,
      title: rule.title,
      summary: rule.summary(scenario),
      severity: rule.severity(scenario),
      scenarios: [...rule.scenarioIds],
      evidenceIds: [...rule.evidenceIds],
      confidence: rule.confidence,
      recommendation: rule.recommendation,
    }))
    .sort(
      (a, b) =>
        severityRank(b.severity) - severityRank(a.severity) || a.id.localeCompare(b.id),
    )
}
