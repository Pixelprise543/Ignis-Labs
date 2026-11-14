import type { Experiment } from '@/contracts/types'
import { SRC } from './sources'

/**
 * The older strand of the evidence base: the droplet and cool-flame campaigns
 * that ran in the Combustion Integrated Rack and the Microgravity Science
 * Glovebox, plus one ground facility. They are recorded because they establish
 * that "extinguished" is not the same as "chemically finished" - a reaction can
 * persist below the temperature where a visible flame exists.
 *
 * Records marked `curated` have no numeric value in this file. Their summaries
 * come from NASA pages; the numbers were not published on the pages retrieved,
 * so nothing is invented to fill the metric slots.
 */
export const legacyExperiments: Experiment[] = [
  {
    id: 'bass',
    name: 'Burning and Suppression of Solids',
    acronym: 'BASS',
    summary:
      'Burned solid fuel samples in the Microgravity Science Glovebox, including a one-centimetre synthetic resin sphere that produced a blue, almost perfectly spherical flame. After about two minutes the vapour coming off the fuel overwhelmed the low airflow and the flame became highly irregular.',
    facility: 'ISS-MSG',
    regime: 'microgravity',
    years: [2013, 2014],
    fuelType: 'solid',
    fuel: 'Synthetic resin sphere, 1 cm diameter',
    conditions: {
      gravityG: 0,
      o2Percent: null,
      diluent: 'air',
      pressureKPa: null,
      flowCmPerS: null,
    },
    metrics: [
      { key: 'sample-diameter', label: 'Sample diameter', unit: 'cm', value: 1 },
      {
        key: 'burn-duration',
        label: 'Time to irregular flame',
        unit: 'min',
        value: 2,
        note: 'Caption describes roughly two minutes of steady burning before the flame deformed.',
      },
    ],
    findings: [
      {
        id: 'bass-f1',
        text: 'A solid fuel can burn as a blue spherical flame in microgravity, a shape with no normal-gravity equivalent and no buoyant plume to carry heat or smoke away.',
        tags: ['solid-fuel', 'flame-shape', 'microgravity'],
      },
      {
        id: 'bass-f2',
        text: 'Fuel vapour accumulating near the surface eventually dominates the imposed airflow, so the flame stops being diffusion-controlled and becomes unstable.',
        tags: ['vaporisation', 'low-flow', 'flame-stability'],
      },
      {
        id: 'bass-f3',
        text: 'The investigation also tested suppression of solid fuels, tying the burn behaviour back to a crew response.',
        tags: ['suppression', 'safety-case'],
      },
    ],
    safetyTakeaway:
      'A solid fuel in microgravity can sustain a compact blue flame with no smoke plume to give it away, so smoke detection cannot be the only line of defence.',
    sources: [SRC.cir],
    confidence: 'verified',
    tags: ['solid-fuel', 'flame-shape', 'suppression', 'msg'],
  },
  {
    id: 'flex',
    name: 'Flame Extinguishment Experiment',
    acronym: 'FLEX',
    summary:
      'Burned single fuel droplets in the Combustion Integrated Rack to find the conditions that extinguish a flame in microgravity. It is the campaign that made low-temperature "cool flame" burning a flight-verified phenomenon rather than a laboratory curiosity.',
    facility: 'ISS-CIR',
    regime: 'microgravity',
    years: [2009, 2010],
    fuelType: 'droplet',
    fuel: 'Liquid fuel droplets (heptane and methanol)',
    conditions: {
      gravityG: 0,
      o2Percent: null,
      diluent: 'air',
      pressureKPa: null,
      flowCmPerS: null,
    },
    metrics: [
      {
        key: 'droplet-diameter',
        label: 'Initial droplet diameter',
        unit: 'mm',
        value: null,
        note: 'Varied across test points; not published on the retrieved page.',
      },
    ],
    findings: [
      {
        id: 'flex-f1',
        text: 'A droplet flame can appear to extinguish and then re-ignite, because a cool-flame reaction keeps the fuel vapour chemically active below the visible-flame temperature.',
        tags: ['cool-flame', 'extinction', 're-ignition'],
      },
      {
        id: 'flex-f2',
        text: 'Radiative heat loss, not just oxidiser starvation, can extinguish a microgravity flame, which is a loss mechanism that barely matters at normal gravity.',
        tags: ['radiative-extinction', 'microgravity'],
      },
    ],
    safetyTakeaway:
      'A fire that looks out can still be chemically alive; declaring it extinguished without a gas measurement risks a re-ignition the crew does not expect.',
    sources: [SRC.cir, SRC.combustion],
    confidence: 'curated',
    tags: ['droplet', 'cool-flame', 'extinction', 'cir'],
  },
  {
    id: 'flex-2',
    name: 'Flame Extinguishment Experiment-2',
    acronym: 'FLEX-2',
    summary:
      'Extended FLEX to flame spread across arrays of fuel droplets and to soot formation, so that extinction could be studied in a flame that moves rather than one anchored on a single droplet.',
    facility: 'ISS-CIR',
    regime: 'microgravity',
    years: [2011, 2012],
    fuelType: 'droplet',
    fuel: 'Liquid fuel droplet arrays',
    conditions: {
      gravityG: 0,
      o2Percent: null,
      diluent: 'air',
      pressureKPa: null,
      flowCmPerS: null,
    },
    metrics: [
      {
        key: 'flame-spread-rate',
        label: 'Flame spread rate',
        unit: 'cm/s',
        value: null,
        note: 'Reported per droplet spacing and flow condition.',
      },
    ],
    findings: [
      {
        id: 'flex-2-f1',
        text: 'Flame spread between droplets depends on the spacing and on the intervening vapour, not only on the fuel, so a fuel arrangement can be more hazardous than the fuel itself suggests.',
        tags: ['flame-spread', 'droplet-array', 'vapour'],
      },
      {
        id: 'flex-2-f2',
        text: 'Soot measurements in a moving droplet flame give a second, independent check on soot models that were tuned on steady gaseous flames.',
        tags: ['soot', 'modelling'],
      },
    ],
    safetyTakeaway:
      'A spilled or dispersed liquid fuel is not a uniform hazard: how the droplets are arranged can decide whether a flame spreads between them or dies out.',
    sources: [SRC.cir, SRC.combustion],
    confidence: 'curated',
    tags: ['droplet', 'flame-spread', 'soot', 'cir'],
  },
  {
    id: 'flex-2j',
    name: 'Flame Extinguishment Experiment-2J',
    acronym: 'FLEX-2J',
    summary:
      'A joint NASA and Japanese investigation that pushed droplet-array flame spread to the lowest flow speeds the rack could hold, near the extinction limit where a flame is easiest to stop and hardest to predict.',
    facility: 'ISS-CIR',
    regime: 'microgravity',
    years: [2015, 2015],
    fuelType: 'droplet',
    fuel: 'Liquid fuel droplet arrays at low ambient flow',
    conditions: {
      gravityG: 0,
      o2Percent: null,
      diluent: 'air',
      pressureKPa: null,
      flowCmPerS: null,
    },
    metrics: [
      {
        key: 'ambient-flow',
        label: 'Ambient flow speed',
        unit: 'cm/s',
        value: null,
        note: 'Held near the low-flow extinction limit.',
      },
    ],
    findings: [
      {
        id: 'flex-2j-f1',
        text: 'Near the extinction limit, small changes in flow decide whether a flame spreads or quenches, so a single "flammable / not flammable" label hides the operating margin.',
        tags: ['extinction-limit', 'low-flow', 'margin'],
      },
      {
        id: 'flex-2j-f2',
        text: 'The collaboration added a low-flow data set that a single agency campaign had not covered.',
        tags: ['data-set', 'method'],
      },
    ],
    safetyTakeaway:
      'Fire safety is a margin question near the extinction limit: a material rated non-flammable can still spread a flame if the airflow or oxygen moves slightly in the wrong direction.',
    sources: [SRC.cir, SRC.combustion],
    confidence: 'curated',
    tags: ['droplet', 'extinction-limit', 'low-flow', 'cir'],
  },
  {
    id: 'cfi',
    name: 'Cool Flames Investigation',
    acronym: 'CFI',
    summary:
      'Studied low-temperature combustion of gaseous fuels, where a reaction proceeds with no visible flame and very little heat release. Cool flames matter for spacecraft because they can keep a fuel source chemically primed long after the visible fire is gone.',
    facility: 'ISS-CIR',
    regime: 'microgravity',
    years: [2012, 2013],
    fuelType: 'cool-flame',
    fuel: 'Gaseous fuel in a low-temperature regime',
    conditions: {
      gravityG: 0,
      o2Percent: null,
      diluent: 'air',
      pressureKPa: null,
      flowCmPerS: null,
    },
    metrics: [
      {
        key: 'reaction-temperature',
        label: 'Cool-flame temperature',
        unit: 'K',
        value: null,
        note: 'Low-temperature regime; no single value on the retrieved page.',
      },
    ],
    findings: [
      {
        id: 'cfi-f1',
        text: 'A fuel can react at a temperature far below a visible flame, so the absence of light is not evidence that the reaction has stopped.',
        tags: ['cool-flame', 're-ignition', 'detection'],
      },
      {
        id: 'cfi-f2',
        text: 'Microgravity holds a cool flame steady long enough to measure it, because there is no buoyant flow to disturb a reaction this weak.',
        tags: ['method', 'microgravity'],
      },
    ],
    safetyTakeaway:
      'Smoke and flame detectors are tuned to visible fire; a cool flame can sit below both thresholds and still be a re-ignition source.',
    sources: [SRC.cir, SRC.combustion],
    confidence: 'curated',
    tags: ['cool-flame', 'detection', 're-ignition', 'cir'],
  },
  {
    id: 'dce-usml2',
    name: 'Droplet Combustion Experiment',
    acronym: 'DCE (USML-2)',
    summary:
      'A 1995 Space Shuttle experiment that burned single fuel droplets in the USML-2 laboratory module, testing droplet-burning theory without the buoyant flow that dominates a ground-based flame.',
    facility: 'Free-flyer',
    regime: 'microgravity',
    years: [1995, 1995],
    fuelType: 'droplet',
    fuel: 'Single liquid fuel droplets',
    conditions: {
      gravityG: 0,
      o2Percent: null,
      diluent: 'air',
      pressureKPa: null,
      flowCmPerS: null,
    },
    metrics: [
      {
        key: 'droplet-diameter',
        label: 'Initial droplet diameter',
        unit: 'mm',
        value: null,
        note: 'Varied across test points.',
      },
    ],
    findings: [
      {
        id: 'dce-usml2-f1',
        text: 'Without buoyancy, a droplet burns in a spherically symmetric way, which is the geometry the classical droplet-burning theory actually assumes.',
        tags: ['droplet', 'theory', 'microgravity'],
      },
      {
        id: 'dce-usml2-f2',
        text: 'Shuttle-era droplet data is still the reference against which later CIR droplet results are compared, which is why a 1995 experiment stays in the set.',
        tags: ['heritage', 'data-set'],
      },
    ],
    safetyTakeaway:
      'The textbook model of a burning fuel droplet only holds without buoyancy, so terrestrial droplet data cannot be carried into a spacecraft fire model unchanged.',
    sources: [SRC.combustion],
    confidence: 'curated',
    tags: ['droplet', 'heritage', 'shuttle', 'combustion-science'],
  },
  {
    id: 'drop-tower-2-2s',
    name: 'Glenn 2.2-Second Drop Tower',
    acronym: '2.2 s Drop Tower',
    summary:
      'A ground facility that gives about 2.2 seconds of free fall per drop and has been used for nearly fifty years to study combustion and fluid behaviour in microgravity. It is where a candidate material or burner can be screened before it takes a flight slot.',
    facility: 'Drop-tower',
    regime: 'microgravity',
    years: [1976, null],
    fuelType: 'gas',
    fuel: 'Gaseous and droplet combustion experiments in free fall',
    conditions: {
      gravityG: 0.0001,
      o2Percent: null,
      diluent: 'air',
      pressureKPa: null,
      flowCmPerS: null,
    },
    metrics: [
      {
        key: 'free-fall-duration',
        label: 'Free-fall duration per drop',
        unit: 's',
        value: 2.2,
      },
    ],
    findings: [
      {
        id: 'drop-tower-2-2s-f1',
        text: 'Two seconds is long enough to observe ignition and early flame growth, so the tower filters experiments before they consume a flight opportunity.',
        tags: ['ground-test', 'screening', 'method'],
      },
      {
        id: 'drop-tower-2-2s-f2',
        text: 'Nearly five decades of use means the facility has a long baseline of comparable microgravity combustion data.',
        tags: ['heritage', 'data-set'],
      },
    ],
    safetyTakeaway:
      'Ground microgravity facilities let a material or suppression concept fail cheaply, which is why flight experiments are reserved for questions that only long-duration microgravity can answer.',
    sources: [SRC.microgravityFacilities],
    confidence: 'verified',
    tags: ['ground-test', 'drop-tower', 'screening', 'glenn'],
  },
]
