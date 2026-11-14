import type { Experiment } from '@/contracts/types'
import { SRC } from './sources'

/**
 * SoFIE is the current ISS solid-fuel fire-safety facility, mounted in the
 * Combustion Integrated Rack. NASA describes it as five separate investigations
 * that share one hardware insert, so they are recorded separately here: the
 * design question (will this material burn?) is answered by a different test
 * than the suppression question (how do we put it out?).
 *
 * SoFIE's stated objective is how materials burn in lunar or Martian gravity.
 * The ISS only provides microgravity, so the facility varies oxygen, pressure
 * and flow instead and those results are extrapolated. That extrapolation is
 * the honest caveat on every SoFIE record: there is no partial-g data set.
 */
export const sofieExperiments: Experiment[] = [
  {
    id: 'sofie-rtdfs',
    name: 'Residence Time Driven Flame Spread',
    acronym: 'SoFIE-RTDFS',
    summary:
      'Flame spread over solid samples where the time the gas spends near the surface, rather than buoyancy, controls how fast the flame moves. It is the SoFIE investigation closest to the practical question of how a fire travels along a wall in a ventilated module.',
    facility: 'ISS-CIR',
    regime: 'microgravity',
    years: [2022, null],
    fuelType: 'solid',
    fuel: 'Solid spacecraft materials in the CIR flow duct',
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
        note: 'Depends on the flow condition of each test point; no single value describes the investigation.',
      },
    ],
    findings: [
      {
        id: 'sofie-rtdfs-f1',
        text: 'When buoyancy is absent, the residence time of oxidiser near the fuel surface becomes a first-order control on flame spread, so ventilation design changes fire behaviour directly.',
        tags: ['flame-spread', 'ventilation', 'residence-time'],
      },
      {
        id: 'sofie-rtdfs-f2',
        text: 'The investigation was designed to produce spread-rate data at the low flow speeds a quiet cabin actually has, not the forced flows used to make ground tests repeatable.',
        tags: ['low-flow', 'method', 'cabin-relevant'],
      },
    ],
    safetyTakeaway:
      'Ventilation is not a passive background condition: in microgravity the flow field around a surface sets how fast a flame spreads, so air handling is part of the fire-safety design.',
    sources: [SRC.sofieMission, SRC.sofieFive],
    confidence: 'curated',
    tags: ['fire-safety', 'flame-spread', 'ventilation', 'solid-fuel', 'sofie'],
  },
  {
    id: 'sofie-nca',
    name: 'Narrow Channel Apparatus',
    acronym: 'SoFIE-NCA',
    summary:
      'Flame spread through narrow gaps between surfaces, the geometry behind a wall panel or inside a stowage rack. Narrow channels are where a fire can hide from both the crew and the smoke detector while still being fed by ventilation.',
    facility: 'ISS-CIR',
    regime: 'microgravity',
    years: [2022, null],
    fuelType: 'solid',
    fuel: 'Solid sample inside a narrow channel',
    conditions: {
      gravityG: 0,
      o2Percent: null,
      diluent: 'air',
      pressureKPa: null,
      flowCmPerS: null,
    },
    metrics: [
      {
        key: 'channel-gap',
        label: 'Channel gap',
        unit: 'mm',
        value: null,
        note: 'The apparatus varies gap width across test points.',
      },
    ],
    findings: [
      {
        id: 'sofie-nca-f1',
        text: 'Narrow channels concentrate the oxidiser flow into a small cross-section, so the same ventilation rate can support a faster flame than in open cabin volume.',
        tags: ['flame-spread', 'narrow-channel', 'concealed-fire'],
      },
      {
        id: 'sofie-nca-f2',
        text: 'The geometry is a direct model of the gaps behind racks and panels, so the results speak to where fires are hardest to see rather than to open-surface coupons.',
        tags: ['concealed-fire', 'geometry', 'safety-case'],
      },
    ],
    safetyTakeaway:
      'Gaps behind panels are a credible fire path; a material that passes an open-surface test can still sustain a flame in a narrow channel.',
    sources: [SRC.sofieMission, SRC.sofieFive],
    confidence: 'curated',
    tags: ['fire-safety', 'narrow-channel', 'concealed-fire', 'solid-fuel', 'sofie'],
  },
  {
    id: 'sofie-gel',
    name: 'Growth and Extinction Limit',
    acronym: 'SoFIE-GEL',
    summary:
      'Grows a flame on a solid fuel and then lowers the ambient pressure until the flame goes out, producing the pressure limit for sustained burning. The published test sequence starts at 28 percent oxygen with a yellow sooty flame and ends with a small blue flame that extinguishes.',
    facility: 'ISS-CIR',
    regime: 'microgravity',
    years: [2022, null],
    fuelType: 'solid',
    fuel: 'Solid spacecraft material sample',
    conditions: {
      gravityG: 0,
      o2Percent: 28,
      diluent: 'air',
      pressureKPa: null,
      flowCmPerS: null,
    },
    metrics: [
      {
        key: 'oxygen-concentration',
        label: 'Oxygen concentration at test start',
        unit: '% O2',
        value: 28,
        note: 'One published test point; the investigation sweeps a range.',
      },
      {
        key: 'extinction-pressure',
        label: 'Extinction pressure',
        unit: 'kPa',
        value: null,
        note: 'Measured per test point, not yet published as a single figure.',
      },
    ],
    findings: [
      {
        id: 'sofie-gel-f1',
        text: 'A flame that starts yellow and sooty turns blue and shrinks as pressure falls, then extinguishes, giving a pressure limit that can be compared with a habitat atmosphere.',
        tags: ['extinction', 'pressure', 'oxygen-enriched'],
      },
      {
        id: 'sofie-gel-f2',
        text: 'Extinction limits measured in microgravity are the closest available data for judging whether a low-pressure cabin makes a material safer or merely changes how it burns.',
        tags: ['extinction', 'habitat-atmosphere', 'safety-case'],
      },
    ],
    safetyTakeaway:
      'Reducing cabin pressure is not a simple fire-safety win: the flame changes colour and size before it dies, so the pressure limit has to be measured for the material and oxygen level actually planned.',
    sources: [SRC.sofieMission, SRC.cir],
    confidence: 'verified',
    tags: ['fire-safety', 'extinction', 'pressure', 'oxygen-enriched', 'sofie'],
  },
  {
    id: 'sofie-mist',
    name: 'Material Ignition and Suppression Test',
    acronym: 'SoFIE-MIST',
    summary:
      'Ignites spacecraft materials and then applies a suppression agent, measuring both how hard the sample is to light and how much suppressant is needed to stop it. This is the SoFIE investigation that maps directly onto a crew response procedure.',
    facility: 'ISS-CIR',
    regime: 'microgravity',
    years: [2022, null],
    fuelType: 'solid',
    fuel: 'Spacecraft interior materials',
    conditions: {
      gravityG: 0,
      o2Percent: null,
      diluent: 'air',
      pressureKPa: null,
      flowCmPerS: null,
    },
    metrics: [
      {
        key: 'ignition-time',
        label: 'Ignition time',
        unit: 's',
        value: null,
        note: 'Recorded per material and test point.',
      },
      {
        key: 'suppressant-mass',
        label: 'Suppressant mass to extinguish',
        unit: 'g',
        value: null,
        note: 'Recorded per material and test point.',
      },
    ],
    findings: [
      {
        id: 'sofie-mist-f1',
        text: 'Ignition and suppression are measured on the same sample in the same facility, so the two halves of a fire-safety case are not drawn from different test campaigns.',
        tags: ['ignition', 'suppression', 'method'],
      },
      {
        id: 'sofie-mist-f2',
        text: 'Suppression in microgravity has no buoyant plume to carry agent into the flame, so the quantity that works on the ground is not a safe design value in orbit.',
        tags: ['suppression', 'microgravity', 'safety-case'],
      },
    ],
    safetyTakeaway:
      'A suppression procedure qualified on Earth underestimates what a crew needs in microgravity, because the agent has to be delivered into the flame rather than falling into it.',
    sources: [SRC.sofieMission, SRC.cir],
    confidence: 'curated',
    tags: ['fire-safety', 'ignition', 'suppression', 'solid-fuel', 'sofie'],
  },
  {
    id: 'sofie-smurf',
    name: 'Spacecraft Materials Microgravity Research on Flammability',
    acronym: 'SoFIE-SMuRF',
    summary:
      'A screening investigation that burns representative spacecraft materials in microgravity so that material selection can be based on how they behave in the destination environment, not only on the standard ground flammability test.',
    facility: 'ISS-CIR',
    regime: 'microgravity',
    years: [2022, null],
    fuelType: 'solid',
    fuel: 'Representative spacecraft materials',
    conditions: {
      gravityG: 0,
      o2Percent: null,
      diluent: 'air',
      pressureKPa: null,
      flowCmPerS: null,
    },
    metrics: [
      {
        key: 'materials-tested',
        label: 'Material types tested',
        unit: 'materials',
        value: null,
        note: 'The screening matrix is not published as a single count.',
      },
    ],
    findings: [
      {
        id: 'sofie-smurf-f1',
        text: 'Ground flammability screening was developed for normal gravity, so a material that passes it has not been shown to resist ignition in microgravity or at a reduced-pressure cabin condition.',
        tags: ['material-flammability', 'screening', 'method'],
      },
      {
        id: 'sofie-smurf-f2',
        text: 'The investigation is aimed at giving material selection a microgravity data point before a vehicle is built, rather than discovering the difference during flight.',
        tags: ['material-selection', 'safety-case'],
      },
    ],
    safetyTakeaway:
      'Passing the standard ground flammability test is not evidence that a material is safe in a spacecraft cabin; the screening has to be repeated in the relevant gravity and atmosphere.',
    sources: [SRC.sofieMission, SRC.sofieFive],
    confidence: 'curated',
    tags: ['fire-safety', 'material-flammability', 'screening', 'sofie'],
  },
]
