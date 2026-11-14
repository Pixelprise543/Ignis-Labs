import type { Experiment } from '@/contracts/types'
import { SRC } from './sources'

/**
 * Saffire flew six times between 2016 and 2024, always inside an uncrewed
 * Cygnus cargo vehicle after it left the station. That is the only way to burn
 * a sample of realistic spacecraft scale without putting a crew at risk, and it
 * is why Saffire is the reference point for "how big a fire gets before it is a
 * threat" - a question NASA had not answered for spacecraft before.
 *
 * Three flights only: the June 2016 first flight (the largest fire in space at the
 * time), the June 2017 third flight (a single large fabric sample swept through
 * several airflow rates), and the final flight in 2023-24, which varied oxygen
 * and pressure to approximate a crewed cabin. Saffire-II and IV-V are left out
 * because no retrieved NASA page gave their numbers.
 */
export const saffireExperiments: Experiment[] = [
  {
    id: 'saffire-i',
    name: 'Spacecraft Fire Safety Experiment I',
    acronym: 'Saffire-I',
    summary:
      'The first large-scale fire ever burned in space: a cotton-fiberglass fabric sample one metre long inside a departing Cygnus cargo ship. Ground controllers ignited it by hot wire and watched a slow flame cross the sample over about eight minutes.',
    facility: 'Free-flyer',
    regime: 'microgravity',
    years: [2016, 2016],
    fuelType: 'solid',
    fuel: 'Cotton-fiberglass blend (SIBAL) fabric, 0.4 m wide by 1 m long',
    conditions: {
      gravityG: 0,
      o2Percent: 21,
      diluent: 'air',
      pressureKPa: 101.3,
      flowCmPerS: null,
    },
    metrics: [
      { key: 'sample-length', label: 'Sample length', unit: 'm', value: 1 },
      {
        key: 'burn-duration',
        label: 'Visible burn duration',
        unit: 'min',
        value: 8,
        note: 'Preliminary mission update, about eight minutes.',
      },
      {
        key: 'images-downlinked',
        label: 'Images downlinked',
        unit: 'images',
        value: 40989,
        note: '25 Gb of data across the six-day mission.',
      },
    ],
    findings: [
      {
        id: 'saffire-i-f1',
        text: 'A metre-scale fabric sample supported a slow-moving flame for roughly eight minutes in microgravity, with smouldering continuing behind the flame front.',
        tags: ['flame-spread', 'solid-fuel', 'scale'],
      },
      {
        id: 'saffire-i-f2',
        text: 'Before this flight the largest fire experiment in space was about the size of an index card, so the test moved flammability data from coupon scale to spacecraft scale.',
        tags: ['scale', 'method'],
      },
      {
        id: 'saffire-i-f3',
        text: 'Running the burn in a vehicle that had already departed the station let the team use realistic sample sizes without crew exposure.',
        tags: ['operations', 'safety-case'],
      },
    ],
    safetyTakeaway:
      'Ordinary fabric can carry a slow but persistent flame at spacecraft scale, so a small ignition source is enough to threaten a cabin if it is not detected early.',
    sources: [SRC.saffireI, SRC.saffireFinal],
    confidence: 'verified',
    tags: ['fire-safety', 'flame-spread', 'solid-fuel', 'large-scale', 'cygnus'],
  },
  {
    id: 'saffire-iii',
    name: 'Spacecraft Fire Safety Experiment III',
    acronym: 'Saffire-III',
    summary:
      'A single large fabric sample burned at different airflow rates over roughly twenty minutes, inside a Cygnus that had already left the station. It closed the first Saffire phase and was the first flight to deliberately vary the flow over a spacecraft-scale sample.',
    facility: 'Free-flyer',
    regime: 'microgravity',
    years: [2017, 2017],
    fuelType: 'solid',
    fuel: 'Single large fabric sample (SIBAL), same material family as Saffire-I',
    conditions: {
      gravityG: 0,
      o2Percent: 21,
      diluent: 'air',
      pressureKPa: 101.3,
      flowCmPerS: null,
    },
    metrics: [
      {
        key: 'burn-duration',
        label: 'Burn duration',
        unit: 'min',
        value: 20,
        note: 'Approximate; the whole experiment ran for 2.5 hours including data collection.',
      },
      {
        key: 'experiment-duration',
        label: 'Total experiment duration',
        unit: 'h',
        value: 2.5,
      },
    ],
    findings: [
      {
        id: 'saffire-iii-f1',
        text: 'The same fabric was burned at several airflow rates, which separates the effect of ventilation from the effect of the material itself.',
        tags: ['ventilation', 'flame-spread', 'method'],
      },
      {
        id: 'saffire-iii-f2',
        text: 'The burn ran at the space station oxygen concentration, so the result is comparable with the cabin atmosphere a crew actually lives in.',
        tags: ['oxygen-concentration', 'cabin-relevant'],
      },
      {
        id: 'saffire-iii-f3',
        text: 'Saffire-II, flown in November 2016, burned nine samples of different materials, which is how the series moved from one fabric to a material comparison.',
        tags: ['material-flammability', 'scale', 'programme'],
      },
    ],
    safetyTakeaway:
      'Airflow rate changes how a spacecraft-scale fabric fire grows, so ventilation settings belong in the fire-response procedure rather than being treated as a fixed background.',
    sources: [SRC.saffireIII, SRC.saffireFinal],
    confidence: 'verified',
    tags: ['fire-safety', 'flame-spread', 'ventilation', 'solid-fuel', 'cygnus'],
  },
  {
    id: 'saffire-vi',
    name: 'Spacecraft Fire Safety Experiment VI',
    acronym: 'Saffire-VI',
    summary:
      'The final Saffire flight ran nineteen burns on plexiglass, cotton, Nomex and SIBAL fabric while raising the oxygen concentration and lowering the pressure to mimic a crewed cabin. It closed an eight-year series that began in 2016.',
    facility: 'Free-flyer',
    regime: 'microgravity',
    years: [2023, 2024],
    fuelType: 'solid',
    fuel: 'Plexiglass, cotton, Nomex and SIBAL fabric samples',
    conditions: {
      gravityG: 0,
      o2Percent: null,
      diluent: 'air',
      pressureKPa: null,
      flowCmPerS: null,
    },
    metrics: [
      { key: 'test-runs', label: 'Experiment runs', unit: 'runs', value: 19 },
      { key: 'materials-tested', label: 'Material types burned', unit: 'materials', value: 4 },
      {
        key: 'oxygen-concentration',
        label: 'Oxygen concentration',
        unit: '% O2',
        value: null,
        note: 'Deliberately varied above cabin level across the run matrix.',
      },
      {
        key: 'pressure',
        label: 'Chamber pressure',
        unit: 'kPa',
        value: null,
        note: 'Deliberately varied below cabin level across the run matrix.',
      },
    ],
    findings: [
      {
        id: 'saffire-vi-f1',
        text: 'Raising oxygen and lowering pressure changes how the same material burns, which is exactly the direction a lunar or Mars habitat design could drift if atmosphere choices are made for other reasons.',
        tags: ['oxygen-enriched', 'pressure', 'material-flammability'],
      },
      {
        id: 'saffire-vi-f2',
        text: 'Materials common in spacecraft interiors - plexiglass, cotton, Nomex and SIBAL fabric - were burned under the same flow hardware, giving a like-for-like comparison.',
        tags: ['material-flammability', 'method'],
      },
      {
        id: 'saffire-vi-f3',
        text: 'Heat release rate and combustion-product release rate were measured so they can be used as model inputs to predict fire growth in a vehicle.',
        tags: ['modelling', 'diagnostics'],
      },
    ],
    safetyTakeaway:
      'Habitat atmosphere is a fire-safety decision: the same furnishing can behave differently at elevated oxygen and reduced pressure, so it must be tested at the intended cabin condition.',
    sources: [SRC.saffireFinal, SRC.cir],
    confidence: 'verified',
    tags: ['fire-safety', 'material-flammability', 'oxygen-enriched', 'pressure', 'cygnus'],
  },
]
