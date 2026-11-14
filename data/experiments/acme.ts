import type { Experiment } from '@/contracts/types'
import { SRC } from './sources'

/**
 * ACME is five independent gaseous-flame studies in the Combustion Integrated
 * Rack, delivered on SpaceX CRS-11 in 2017. Only BRE exists for spacecraft fire
 * prevention; the other four are Earth-focused combustion science that the
 * dataset keeps because their extinction and soot results are what make the
 * "flame behaviour changes with gravity" story measurable.
 *
 * All five burn laminar, gaseous, non-premixed flames, so they do not answer
 * questions about fabric or foam. That is SoFIE and Saffire's job.
 */
export const acmeExperiments: Experiment[] = [
  {
    id: 'acme-bre',
    name: 'Burning Rate Emulator',
    acronym: 'ACME-BRE',
    summary:
      'The one ACME investigation built for spacecraft fire prevention: it burns gaseous fuel from a flat surface to study extinction and the conditions needed for sustained combustion, and to test whether normal-gravity flammability screening still means anything at low gravity. NASA reports that materials can burn for minutes without any airflow.',
    facility: 'ISS-CIR',
    regime: 'microgravity',
    years: [2017, null],
    fuelType: 'gas',
    fuel: 'Gaseous fuel supplied through a flat porous burner',
    conditions: {
      gravityG: 0,
      o2Percent: null,
      diluent: 'air',
      pressureKPa: null,
      flowCmPerS: null,
    },
    metrics: [
      {
        key: 'burn-duration',
        label: 'Sustained burn without airflow',
        unit: 'min',
        value: null,
        note: 'NASA describes burns lasting minutes; the exact figure varies by test point.',
      },
    ],
    findings: [
      {
        id: 'acme-bre-f1',
        text: 'Materials can keep burning for minutes with no airflow at all, which removes the terrestrial assumption that a flame starves when ventilation stops.',
        tags: ['extinction', 'low-flow', 'material-flammability'],
      },
      {
        id: 'acme-bre-f2',
        text: 'BRE exists specifically to check whether the standard flammability test used to screen spacecraft materials remains relevant in low and partial gravity.',
        tags: ['screening', 'method', 'partial-g'],
      },
      {
        id: 'acme-bre-f3',
        text: 'The burner is a flat surface rather than a coupon, so the result can be used to calibrate models of flame spread over a wall or panel.',
        tags: ['modelling', 'flame-spread'],
      },
    ],
    safetyTakeaway:
      'Stopping the fans is not a fire-suppression strategy in microgravity: a flame on a solid surface can persist for minutes without airflow, so detection and agent delivery have to do the work.',
    sources: [SRC.acmeMission, SRC.acmeResults],
    confidence: 'curated',
    tags: ['fire-safety', 'extinction', 'material-flammability', 'gaseous', 'acme'],
  },
  {
    id: 'acme-cld-flame',
    name: 'Coflow Laminar Diffusion Flame',
    acronym: 'ACME-CLD Flame',
    summary:
      'A stable coflow flame used to extend the range of conditions that combustion models can predict, by testing chemical-kinetic and soot-formation submodels against measurements in microgravity.',
    facility: 'ISS-CIR',
    regime: 'microgravity',
    years: [2017, null],
    fuelType: 'gas',
    fuel: 'Gaseous fuel in a coflow burner',
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
        note: 'Measured across the flame at each test point.',
      },
    ],
    findings: [
      {
        id: 'acme-cld-flame-f1',
        text: 'Microgravity removes buoyant instabilities, giving a steady laminar flame that isolates the chemistry and soot models from the mixing noise of a ground flame.',
        tags: ['soot', 'kinetics', 'modelling'],
      },
      {
        id: 'acme-cld-flame-f2',
        text: 'Better soot submodels are what let a spacecraft fire model predict smoke production, not just heat release.',
        tags: ['smoke', 'modelling', 'safety-case'],
      },
    ],
    safetyTakeaway:
      'Smoke is the first thing a crew detects and the main threat to escape, so a fire model that cannot predict soot is not yet a fire-safety model.',
    sources: [SRC.acmeMission],
    confidence: 'curated',
    tags: ['soot', 'gaseous', 'modelling', 'acme'],
  },
  {
    id: 'acme-e-field',
    name: 'Electric-Field Effects on Laminar Diffusion Flames',
    acronym: 'ACME-E-FIELD',
    summary:
      'Applies an electric field to a non-premixed flame to study how ions form in the reaction zone and whether that field can be used to control the flame, including pushing it away from a surface.',
    facility: 'ISS-CIR',
    regime: 'microgravity',
    years: [2017, null],
    fuelType: 'gas',
    fuel: 'Gaseous fuel in a non-premixed burner',
    conditions: {
      gravityG: 0,
      o2Percent: null,
      diluent: 'air',
      pressureKPa: null,
      flowCmPerS: null,
    },
    metrics: [
      {
        key: 'applied-field-strength',
        label: 'Applied field strength',
        unit: 'kV/m',
        value: null,
        note: 'Swept across test points.',
      },
    ],
    findings: [
      {
        id: 'acme-e-field-f1',
        text: 'Flames contain ions, and an applied field can move a flame without a moving part, which is attractive where a mechanism must work without airflow.',
        tags: ['electric-field', 'flame-control', 'gaseous'],
      },
      {
        id: 'acme-e-field-f2',
        text: 'Microgravity removes buoyancy so the electric body force can be measured on its own, which is not possible in a normal-gravity flame.',
        tags: ['method', 'electric-field'],
      },
    ],
    safetyTakeaway:
      'Electric-field flame control is a candidate for suppression hardware that does not depend on a gas supply, but it is still a laboratory result, not a qualified device.',
    sources: [SRC.acmeMission],
    confidence: 'curated',
    tags: ['electric-field', 'flame-control', 'gaseous', 'acme'],
  },
  {
    id: 'acme-flame-design',
    name: 'Flame Design',
    acronym: 'ACME-Flame Design',
    summary:
      'Studies soot inception and control so that oxygen-enriched flames can be made both robust and soot-free. The relevance to a spacecraft is direct: an oxygen-enriched cabin is a fire-safety trade, and this investigation is about what that trade does to a flame.',
    facility: 'ISS-CIR',
    regime: 'microgravity',
    years: [2017, null],
    fuelType: 'gas',
    fuel: 'Gaseous fuel, oxygen-enriched mixtures',
    conditions: {
      gravityG: 0,
      o2Percent: null,
      diluent: 'oxygen-enriched air',
      pressureKPa: null,
      flowCmPerS: null,
    },
    metrics: [
      {
        key: 'oxygen-concentration',
        label: 'Oxygen concentration',
        unit: '% O2',
        value: null,
        note: 'Varied to map the soot-free operating window.',
      },
    ],
    findings: [
      {
        id: 'acme-flame-design-f1',
        text: 'There is an operating window where an oxygen-enriched flame stays stable but produces little soot, and the boundaries of that window can be mapped rather than guessed.',
        tags: ['oxygen-enriched', 'soot', 'flame-stability'],
      },
      {
        id: 'acme-flame-design-f2',
        text: 'The same oxygen enrichment that makes a flame efficient on Earth raises the oxidiser available to any unwanted fire in a cabin.',
        tags: ['oxygen-enriched', 'habitat-atmosphere', 'trade-off'],
      },
    ],
    safetyTakeaway:
      'Oxygen-enriched atmospheres are a double-edged design choice: they improve combustion performance and simultaneously widen the range of materials that will burn.',
    sources: [SRC.acmeMission],
    confidence: 'curated',
    tags: ['oxygen-enriched', 'soot', 'gaseous', 'acme'],
  },
  {
    id: 'acme-s-flame',
    name: 'Structure and Response of Spherical Flames',
    acronym: 'ACME-s-Flame',
    summary:
      'Grows spherical flames so their structure and extinction can be predicted without the complications of a burner edge. Across ACME as a whole, NASA reports more than 1,500 flames burned in the rack.',
    facility: 'ISS-CIR',
    regime: 'microgravity',
    years: [2017, null],
    fuelType: 'gas',
    fuel: 'Gaseous fuel forming a spherical flame',
    conditions: {
      gravityG: 0,
      o2Percent: null,
      diluent: 'air',
      pressureKPa: null,
      flowCmPerS: null,
    },
    metrics: [
      {
        key: 'flames-studied',
        label: 'Flames studied across ACME',
        unit: 'flames',
        value: 1500,
        note: 'Programme-wide total reported by NASA, not this investigation alone.',
      },
    ],
    findings: [
      {
        id: 'acme-s-flame-f1',
        text: 'A spherical flame has no burner rim to anchor it, so extinction is governed by the chemistry and the strain alone, which makes it a clean test of a flame model.',
        tags: ['extinction', 'spherical-flame', 'modelling'],
      },
      {
        id: 'acme-s-flame-f2',
        text: 'More than 1,500 flames were burned across the five ACME investigations, giving model developers a data set large enough to find where a submodel fails.',
        tags: ['data-set', 'modelling', 'scale'],
      },
    ],
    safetyTakeaway:
      'Extinction data from an anchored flame includes the influence of the burner; spherical flames separate the limits of the flame itself from the hardware, which is what a predictive fire model needs.',
    sources: [SRC.acmeMission, SRC.acmeResults],
    confidence: 'verified',
    tags: ['extinction', 'gaseous', 'modelling', 'acme'],
  },
]
