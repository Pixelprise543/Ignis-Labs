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
  {
    id: 'saffire-iv',
    name: 'Spacecraft Fire Safety Experiment IV',
    acronym: 'Saffire-IV',
    summary:
      'A Cygnus vehicle that had already left the station was modelled in fire-simulation software, with the cargo layout of the descent phase reproduced as geometry. The team used the measured temperatures near the payload to derive heat release rate at the outlet and compared predicted combustion-product flow with the gas measurements from the flight. The retrieved report is a modelling paper and does not state the flight date, so the year shown is the report year.',
    facility: 'Free-flyer',
    regime: 'microgravity',
    years: [2022, 2022],
    fuelType: 'solid',
    fuel: 'Solid samples inside the Cygnus cargo vehicle',
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
        label: 'Burn duration',
        unit: 'min',
        value: null,
        note: 'Not stated in the retrieved modelling report.',
      },
    ],
    findings: [
      {
        id: 'saffire-iv-f1',
        text: 'Temperature sensors near the payload can be inverted into a heat release rate at the outlet, which gives a vehicle-scale fire a measurable source term rather than a visual impression.',
        tags: ['modelling', 'diagnostics', 'scale'],
      },
      {
        id: 'saffire-iv-f2',
        text: 'Combustion species measured downstream of the burn can be compared directly with a simulation of the cargo volume, so a fire model can be checked against a real spacecraft fire instead of a laboratory flame.',
        tags: ['modelling', 'smoke', 'safety-case'],
      },
      {
        id: 'saffire-iv-f3',
        text: 'The cargo arrangement present during descent changes the internal flow path, which means the same fire in a differently packed vehicle would transport heat and products differently.',
        tags: ['ventilation', 'modelling', 'cygnus'],
      },
    ],
    safetyTakeaway:
      'A spacecraft fire model can be validated against a real large-scale burn, which makes predicted smoke transport a usable input to detection and cleanup planning.',
    sources: [SRC.ntrsSaffireIV],
    confidence: 'curated',
    tags: ['fire-safety', 'modelling', 'solid-fuel', 'scale', 'cygnus'],
  },
  {
    id: 'saffire-v',
    name: 'Spacecraft Fire Safety Experiment V',
    acronym: 'Saffire-V',
    summary:
      'This flight burned thick thermoplastic samples as well as cotton, and the analysis used cabin sensors to predict how heat and carbon dioxide moved through the whole Cygnus vehicle. A heat-transfer coefficient calibrated on the cotton event then predicted the temperature response during the two thick-fuel events. The retrieved report is a modelling paper and does not state the flight date, so the year shown is the report year.',
    facility: 'Free-flyer',
    regime: 'microgravity',
    years: [2024, 2024],
    fuelType: 'solid',
    fuel: 'Thick thermoplastic samples and a cotton sample',
    conditions: {
      gravityG: 0,
      o2Percent: null,
      diluent: 'air',
      pressureKPa: null,
      flowCmPerS: null,
    },
    metrics: [
      {
        key: 'test-runs',
        label: 'Burn events modelled',
        unit: 'runs',
        value: 3,
        note: 'One cotton event plus two thick thermoplastic events, as described in the report.',
      },
      {
        key: 'burn-duration',
        label: 'Burn duration',
        unit: 'min',
        value: null,
        note: 'Not stated in the retrieved modelling report.',
      },
    ],
    findings: [
      {
        id: 'saffire-v-f1',
        text: 'Thick thermoplastic samples burn differently from thin fabric, and a heat-transfer coefficient fitted to the thin-fuel event still predicted the temperature response of the thick-fuel events.',
        tags: ['material-flammability', 'modelling', 'scale'],
      },
      {
        id: 'saffire-v-f2',
        text: 'The carbon dioxide difference between the inlet sensor and the sensor nearest the burn outlet was enough to reconstruct the carbon dioxide response in other parts of the vehicle.',
        tags: ['smoke', 'detection', 'modelling'],
      },
      {
        id: 'saffire-v-f3',
        text: 'Thick fuels keep releasing heat after the visible flame has moved on, so a detection and cleanup plan based only on flame duration would understate the event.',
        tags: ['detection', 'smouldering', 'safety-case'],
      },
    ],
    safetyTakeaway:
      'Thick interior materials extend a fire event beyond its visible flame, so detection and cleanup timelines must be sized on the whole event.',
    sources: [SRC.ntrsSaffireV],
    confidence: 'curated',
    tags: ['fire-safety', 'material-flammability', 'modelling', 'cygnus'],
  },
]
