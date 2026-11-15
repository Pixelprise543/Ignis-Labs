import type { Experiment } from '@/contracts/types'
import { SRC } from './sources'

/**
 * Shuttle-era microgravity combustion experiments (1985-1999).
 *
 * These records exist because they answer questions the modern ISS facilities
 * no longer ask: what a flame does with almost no oxidiser motion (SOFBALL),
 * where soot comes from (LSP), whether a candle can even survive (Candle), how
 * a porous material smoulders without a plume (MSC), and what turbulence looks
 * like without buoyancy (TGDF). They are the physics that the later fire-safety
 * work leans on, so they belong in the evidence base rather than a history page.
 *
 * Year rule: `years` is the flight window when the retrieved page states the
 * missions, and the report publication window when it does not. Each record says
 * which one it is in its summary, so nobody has to guess.
 */
export const heritageExperiments: Experiment[] = [
  {
    id: 'sofbail',
    name: 'Structure of Flame Balls at Low Lewis-Number',
    acronym: 'SOFBALL',
    summary:
      'Weak hydrogen-air mixtures were ignited in a quiescent chamber on the STS-83 and STS-94 shuttle missions to see whether a flame could settle into a stable sphere. It did, and the spheres proved far more sensitive to the tiniest accelerations than pre-flight models predicted.',
    facility: 'Free-flyer',
    regime: 'microgravity',
    years: [1997, 1997],
    fuelType: 'gas',
    fuel: 'Very lean hydrogen-air mixtures',
    conditions: {
      gravityG: 0,
      o2Percent: null,
      diluent: 'air',
      pressureKPa: null,
      flowCmPerS: null,
    },
    metrics: [
      {
        key: 'flame-balls',
        label: 'Flame-ball configurations tested',
        unit: 'flames',
        value: null,
        note: 'Several mixtures were tested; the retrieved report gives no single count.',
      },
    ],
    findings: [
      {
        id: 'sofbail-f1',
        text: 'A flame can hold a steady spherical shape in microgravity with no buoyant plume to feed it, which is the cleanest case of a reaction limited purely by transport.',
        tags: ['combustion-science', 'gaseous'],
      },
      {
        id: 'sofbail-f2',
        text: 'Drift speeds caused by residual acceleration were much lower than predicted, and flame balls responded visibly to attitude-control firings of the Orbiter.',
        tags: ['combustion-science', 'method'],
      },
      {
        id: 'sofbail-f3',
        text: 'Adjacent flame balls repelled each other, and the experimental heat release disagreed with accepted chemistry models for very lean hydrogen mixtures.',
        tags: ['modelling', 'combustion-science'],
      },
    ],
    safetyTakeaway:
      'A weak mixture can still support a stable reaction zone, so an oxygen or fuel concentration that looks too lean to burn deserves a test rather than an assumption.',
    sources: [SRC.ntrsSofball],
    confidence: 'curated',
    tags: ['combustion-science', 'gaseous', 'heritage', 'extinction-limit'],
  },
  {
    id: 'lsp',
    name: 'Laminar Soot Processes',
    acronym: 'LSP',
    summary:
      'Soot formation in laminar diffusion flames was measured on two flights of Space Shuttle Columbia. Removing buoyancy let the team see soot concentration, flame shape and the smoke point without the flickering instability that muddies the same measurements on the ground. The retrieved report gives no flight years, so the year shown is the report year.',
    facility: 'Free-flyer',
    regime: 'microgravity',
    years: [1999, 1999],
    fuelType: 'gas',
    fuel: 'Hydrocarbon diffusion flames',
    conditions: {
      gravityG: 0,
      o2Percent: null,
      diluent: 'air',
      pressureKPa: null,
      flowCmPerS: null,
    },
    metrics: [
      {
        key: 'soot-volume-fraction',
        label: 'Soot volume fraction',
        unit: 'ppm',
        value: null,
        note: 'Measured in the experiment; the retrieved report does not print the values.',
      },
    ],
    findings: [
      {
        id: 'lsp-f1',
        text: 'Buoyancy interferes with soot processes in laminar diffusion flames, so microgravity is the only place those processes can be isolated from the plume.',
        tags: ['soot', 'smoke', 'combustion-science'],
      },
      {
        id: 'lsp-f2',
        text: 'Soot concentration, laminar flame shape and smoke points were all measured in the same campaign, which is what lets a smoke-point observation be tied to a soot quantity.',
        tags: ['soot', 'method', 'data-set'],
      },
      {
        id: 'lsp-f3',
        text: 'Radiation from soot controls how an unwanted fire grows, which is why a soot measurement is a fire-safety measurement and not only a combustion-science one.',
        tags: ['soot', 'fire-safety'],
      },
    ],
    safetyTakeaway:
      'Soot production sets both the radiation that drives fire growth and the smoke a detector must see, so it has to be measured in the gravity the vehicle will fly in.',
    sources: [SRC.ntrsLsp],
    confidence: 'curated',
    tags: ['soot', 'smoke', 'combustion-science', 'heritage'],
  },
  {
    id: 'candle-flames',
    name: 'Candle Flames in Microgravity',
    acronym: 'CFM',
    summary:
      'A candle was burned in orbit as the simplest possible steady diffusion flame: no forced flow, no jet, nothing but a wick and still air. Earlier shuttle and Mir runs produced dim blue near-steady flames that lasted as long as 45 minutes, with a one-hertz oscillation before extinction. The retrieved paper reports the modelling that followed, and gives no flight years, so the year shown is the report year.',
    facility: 'Free-flyer',
    regime: 'microgravity',
    years: [1999, 1999],
    fuelType: 'solid',
    fuel: 'Paraffin candle wax on a wick',
    conditions: {
      gravityG: 0,
      o2Percent: 21,
      diluent: 'air',
      pressureKPa: null,
      flowCmPerS: 0,
    },
    metrics: [
      {
        key: 'flame-lifetime',
        label: 'Flame lifetime',
        unit: 'min',
        value: 45,
        note: 'Reported for the earlier shuttle and Mir candle runs summarized in this paper.',
      },
      {
        key: 'flame-oscillation',
        label: 'Pre-extinction oscillation',
        unit: 'Hz',
        value: 1,
        note: 'One-hertz spontaneous oscillation observed before extinction.',
      },
    ],
    findings: [
      {
        id: 'candle-flames-f1',
        text: 'A candle can sustain a dim blue flame in quiescent microgravity for tens of minutes, which means a flame does not need a plume to keep burning.',
        tags: ['combustion-science', 'low-flow'],
      },
      {
        id: 'candle-flames-f2',
        text: 'The flame oscillates at about one hertz shortly before it extinguishes, so flicker in microgravity is a sign of an approaching limit rather than a draught.',
        tags: ['extinction', 'detection'],
      },
      {
        id: 'candle-flames-f3',
        text: 'Two closely spaced candle flames interact, so a second ignition source nearby changes the behaviour of the first.',
        tags: ['combustion-science', 'ignition'],
      },
    ],
    safetyTakeaway:
      'A small flame with almost no airflow can survive far longer than a terrestrial one, so an ignition that appears to fade is not necessarily going out.',
    sources: [SRC.ntrsCandle],
    confidence: 'verified',
    tags: ['combustion-science', 'low-flow', 'extinction', 'heritage'],
  },
  {
    id: 'msc',
    name: 'Microgravity Smoldering Combustion',
    acronym: 'MSC',
    summary:
      'Polyurethane foam was smouldered inside Get Away Special canisters on STS-69 and STS-77, once in still air and once in a forced oxidiser flow, and compared with identical ground tests. Smouldering is the flameless reaction that can travel through insulation and foam, so it is the fire a crew is most likely to miss.',
    facility: 'Free-flyer',
    regime: 'microgravity',
    years: [1995, 1996],
    fuelType: 'solid',
    fuel: 'Polyurethane foam samples',
    conditions: {
      gravityG: 0,
      o2Percent: null,
      diluent: 'air',
      pressureKPa: null,
      flowCmPerS: null,
    },
    metrics: [
      {
        key: 'smolder-rate',
        label: 'Smoulder propagation rate',
        unit: 'mm/min',
        value: null,
        note: 'Measured for both diffusion-driven and flow-driven cases; values are not printed in the retrieved abstract.',
      },
    ],
    findings: [
      {
        id: 'msc-f1',
        text: 'Smouldering propagates through a porous material with no flame at all, driven by oxygen reaching the interior rather than by a visible reaction front.',
        tags: ['smouldering', 'concealed-fire', 'material-flammability'],
      },
      {
        id: 'msc-f2',
        text: 'Ambient oxygen concentration and forced flow velocity both change the smoulder rate, so ventilation settings alter a hazard that has no flame to see.',
        tags: ['ventilation', 'oxygen-concentration', 'smouldering'],
      },
      {
        id: 'msc-f3',
        text: 'Microgravity smoulder was compared with identical normal-gravity tests, which is the only way to tell which part of the behaviour is buoyancy.',
        tags: ['method', 'smouldering', 'heritage'],
      },
    ],
    safetyTakeaway:
      'Foam and insulation can carry a flameless reaction behind a panel, so detection has to smell the products of smouldering, not wait for a flame.',
    sources: [SRC.ntrsMsc],
    confidence: 'curated',
    tags: ['smouldering', 'concealed-fire', 'material-flammability', 'heritage', 'detection'],
  },
  {
    id: 'tgdf',
    name: 'Microgravity Turbulent Gas-Jet Diffusion Flames',
    acronym: 'TGDF',
    summary:
      'A gas jet burning in still air is the laboratory model of an accidental fire, and on the ground its turbulence is tangled up with buoyant flicker. Flying the burner let the team study a turbulent diffusion flame without that interference. The retrieved report is from 1996 and gives no flight years, so the year shown is the report year.',
    facility: 'Free-flyer',
    regime: 'microgravity',
    years: [1996, 1996],
    fuelType: 'gas',
    fuel: 'Gaseous fuel jet (propane-type hydrocarbon)',
    conditions: {
      gravityG: 0,
      o2Percent: null,
      diluent: 'air',
      pressureKPa: null,
      flowCmPerS: null,
    },
    metrics: [
      {
        key: 'jet-exit-velocity',
        label: 'Jet exit velocity',
        unit: 'm/s',
        value: null,
        note: 'Varied across the test matrix; the retrieved abstract gives no single value.',
      },
    ],
    findings: [
      {
        id: 'tgdf-f1',
        text: 'Buoyant instabilities in a normal-gravity jet interfere with the turbulence being measured, so the microgravity case is the cleaner experiment.',
        tags: ['combustion-science', 'method'],
      },
      {
        id: 'tgdf-f2',
        text: 'A turbulent diffusion flame embodies the mechanisms operating in accidental fires, which is why burner-scale results transfer to fire safety at all.',
        tags: ['fire-safety', 'combustion-science'],
      },
      {
        id: 'tgdf-f3',
        text: 'Improved understanding of turbulent mixing is aimed at combustor design and at predicting how fast fuel and air meet in a fire.',
        tags: ['modelling', 'ventilation'],
      },
    ],
    safetyTakeaway:
      'Turbulence sets how quickly fuel and oxygen mix, so a fire model that ignores the flow field will misjudge growth even when the material data is right.',
    sources: [SRC.ntrsTgdf],
    confidence: 'curated',
    tags: ['combustion-science', 'gaseous', 'heritage', 'modelling'],
  },
]
