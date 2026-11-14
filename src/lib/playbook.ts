import type { Playbook, PlaybookStep, ScenarioId } from '@/contracts/types'
import { getScenario } from '@/lib/scenarios'

/**
 * Crew response playbooks, one per scenario.
 *
 * The phases follow a real response sequence: detect, isolate, suppress,
 * ventilate, recover. Each step cites finding ids from the dataset, and the
 * scenario only changes the parts the evidence actually changes - the EVA suit
 * has no suppression agent, a partial-gravity habitat has no direct evidence -
 * so the same claim is never given two different explanations.
 *
 * This is decision support, not a flight rule. The first caveat on every
 * playbook says so.
 */

type Phase = PlaybookStep['phase']

interface StepTemplate {
  action: string
  rationale: string
  evidenceIds: string[]
}

const BASE_STEPS: Record<Phase, StepTemplate> = {
  detect: {
    action:
      'Treat the smoke and gas sensors as the primary alarm and assume any confirmed alarm is a live fire until a gas measurement says otherwise.',
    rationale:
      'A microgravity flame can burn as a compact blue ball with no rising plume, so a camera or a crew member may see nothing while soot and toxic products are already present.',
    evidenceIds: ['bass-f1', 'acme-cld-flame-f2', 'cfi-f1'],
  },
  isolate: {
    action:
      'De-energise the affected rack and close the affected volume, but keep the ventilation running while the crew is still in the compartment.',
    rationale:
      'Stopping the fans will not starve a solid fire - flames have persisted for minutes without airflow - and cutting ventilation also removes the flow that carries smoke to the detectors.',
    evidenceIds: ['acme-bre-f1', 'saffire-i-f1', 'sofie-nca-f1'],
  },
  suppress: {
    action:
      'Apply suppressant directly into the base of the flame with a forced jet, using the quantity qualified in microgravity rather than a terrestrial rating.',
    rationale:
      'With no buoyant plume the agent has to be driven into the reaction zone, so the mass that extinguishes a ground test is not a safe design value in orbit.',
    evidenceIds: ['sofie-mist-f2', 'bass-f3'],
  },
  ventilate: {
    action:
      'Keep ventilation under deliberate control: use it to clear smoke from the crew volume while remembering that the same flow feeds a surface flame.',
    rationale:
      'In microgravity the flow field around a surface sets the spread rate, and the same fabric burned differently at different airflow rates.',
    evidenceIds: ['saffire-iii-f1', 'sofie-rtdfs-f1'],
  },
  recover: {
    action:
      'Measure the atmosphere before reopening the volume, then inspect behind panels and inside stowage for a flame or a cool-flame reaction the sensors did not see.',
    rationale:
      'A fire that looks out can still be reacting below the visible-flame temperature, and narrow gaps are where a residual flame is hardest to find.',
    evidenceIds: ['flex-f1', 'cfi-f1', 'sofie-nca-f2'],
  },
}

const EVA_STEPS: Partial<Record<Phase, StepTemplate>> = {
  detect: {
    action:
      'Treat any over-temperature or gas-sensor warning in the suit as an immediate abort trigger and begin the return to the airlock.',
    rationale:
      'The suit runs pure oxygen at 29.6 kPa and the dataset contains no suit fire test, so the conservative response is to abort rather than diagnose the fire inside the suit.',
    evidenceIds: ['saffire-vi-f1', 'bass-f1'],
  },
  isolate: {
    action:
      'Seal the suit loop, stop any transfer and move to the airlock; do not open the suit inside the pressurised volume.',
    rationale:
      'Opening a pure-oxygen suit into a cabin adds oxygen to any fire and exposes the crew to the products already inside the loop.',
    evidenceIds: ['saffire-vi-f1', 'acme-bre-f1'],
  },
  suppress: {
    action:
      'Do not attempt to fight the fire inside the suit: there is no suppression agent available, so isolate the loop and return to the airlock.',
    rationale:
      'Suppression in microgravity already needs forced agent delivery, and the suit has neither an agent supply nor a way to deliver one into the flame.',
    evidenceIds: ['sofie-mist-f2', 'saffire-vi-f1'],
  },
  ventilate: {
    action:
      'Suit ventilation is the only flow available: use it to clear the helmet and do not rely on dilution to make the suit atmosphere safe.',
    rationale:
      'At 100% oxygen there is no inert diluent to absorb a leak, so the flammable range is set by the suit design rather than by the cabin air.',
    evidenceIds: ['saffire-vi-f1', 'acme-bre-f1'],
  },
}

const EVA_PHASES: Phase[] = ['detect', 'isolate', 'suppress', 'ventilate', 'recover']

function caveatsFor(id: ScenarioId): string[] {
  const scenario = getScenario(id)
  const caveats = [
    'Decision-support guidance assembled from the Ignis dataset, not a qualified crew procedure; follow the vehicle flight rules.',
    'Suppression quantities and timings are qualitative: the dataset does not publish a qualified agent mass for any scenario.',
  ]

  if (scenario.assumption) {
    caveats.push(
      'The cabin atmosphere for this scenario is a notional design point, so re-validate the response at the real composition.',
    )
  }

  if (scenario.gravityG >= 0.01 && scenario.gravityG < 0.9) {
    caveats.push(
      `No partial-gravity flame-spread data exists in this dataset; the playbook extrapolates microgravity findings to ${scenario.label.toLowerCase()}.`,
    )
  }

  if (id === 'eva') {
    caveats.push(
      'The dataset contains no EVA-suit fire test, so suit-specific steps are derived from oxygen-enrichment and suppression findings.',
    )
  }

  return caveats
}

/**
 * Returns a freshly built playbook. Unknown ids fall back to the ISS preset via
 * getScenario, so a hand-edited URL cannot crash the page.
 */
export function getPlaybook(id: ScenarioId): Playbook {
  const scenario = getScenario(id)
  const steps = EVA_PHASES.map((phase) => {
    const template = (id === 'eva' && EVA_STEPS[phase]) || BASE_STEPS[phase]
    return {
      phase,
      action: template.action,
      rationale: template.rationale,
      evidenceIds: [...template.evidenceIds],
    }
  })

  return {
    scenarioId: scenario.id,
    steps,
    caveats: caveatsFor(scenario.id),
  }
}
