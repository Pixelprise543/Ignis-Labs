import type { Experiment } from '@/contracts/types'
import { SRC } from './sources'

/**
 * Partial-gravity records: the row the dataset used to leave empty.
 *
 * Everything here is lunar gravity (about 0.16 g). Both records come from Glenn
 * Research Center, and they matter because the coverage view used to show the
 * whole partial-gravity row as a gap. That gap is now partially closed - which
 * changes what the app is allowed to claim for a lunar scenario, and leaves Mars
 * (0.38 g) genuinely uncovered.
 *
 * Neither record is a Mars test, and nothing here was flown on the lunar surface
 * yet: LUCI used a spinning suborbital rocket, FM2 is a payload in preparation.
 * The summaries say so, because the difference between "measured at lunar
 * gravity" and "will be measured on the Moon" is the whole point.
 */
export const lunarExperiments: Experiment[] = [
  {
    id: 'luci',
    name: 'Lunar Combustion Investigation',
    acronym: 'LUCI',
    summary:
      'A Blue Origin New Shepard capsule was spun at 11 RPM so that centrifugal acceleration stood in for lunar gravity, and two samples were burned together in air: a cotton-fiberglass fabric sheet and a 4 mm acrylic rod. The burns ran for over two and a half minutes, which the report describes as the first extended-duration combustion tests in simulated lunar gravity.',
    facility: 'Sounding-rocket',
    regime: 'partial-g',
    years: [2025, 2025],
    fuelType: 'solid',
    fuel: 'Cotton-fiberglass (SIBAL) fabric sheet and a 4 mm acrylic rod',
    conditions: {
      gravityG: 0.16,
      o2Percent: 21,
      diluent: 'air',
      pressureKPa: 101.3,
      flowCmPerS: 0,
    },
    metrics: [
      {
        key: 'burn-duration',
        label: 'Burn duration',
        unit: 'min',
        value: 2.5,
        note: 'The report states the burn lasted for over two and a half minutes.',
      },
      {
        key: 'spin-rate',
        label: 'Vehicle spin rate',
        unit: 'RPM',
        value: 11,
        note: 'Steady rotation used to generate lunar-equivalent acceleration.',
      },
      {
        key: 'sample-diameter',
        label: 'Rod diameter',
        unit: 'cm',
        value: 0.4,
        note: '4 mm acrylic rod, converted to centimetres.',
      },
    ],
    findings: [
      {
        id: 'luci-f1',
        text: 'Lunar-gravity combustion can be studied for minutes rather than seconds by spinning a suborbital vehicle, which is long enough to measure flame spread, growth and extinction.',
        tags: ['method', 'flame-spread', 'scale'],
      },
      {
        id: 'luci-f2',
        text: 'Oxygen concentration in the chamber fell as the burn progressed, which allowed a limiting oxygen value for extinction to be defined from the flight itself.',
        tags: ['extinction-limit', 'oxygen-concentration'],
      },
      {
        id: 'luci-f3',
        text: 'Rotation introduces Coriolis effects that a pure lunar-gravity test would not have, and the report compares the results with 1 g work, drop-tower tests, aircraft flights and modelling.',
        tags: ['method', 'modelling', 'lunar-habitat'],
      },
    ],
    safetyTakeaway:
      'Lunar gravity sits in a middle regime where heat loss is reduced but some buoyant flow still exists, so neither microgravity data nor Earth data can substitute for a test at that gravity.',
    sources: [SRC.ntrsLuci],
    confidence: 'verified',
    tags: ['fire-safety', 'flame-spread', 'extinction-limit', 'lunar-habitat', 'partial-gravity'],
  },
  {
    id: 'fm2',
    name: 'Flammability of Materials on the Moon',
    acronym: 'FM2',
    summary:
      'A self-contained combustion chamber is being prepared for a Commercial Lunar Payload Services lander, with its own environmental control to reproduce the atmospheres a lander or rover would use. Four samples are planned: two cotton-fiberglass fabrics burned in air, and two acrylic rods burned in a normoxic space-exploration atmosphere of 34% oxygen at 8.2 psia. The retrieved report describes a laboratory prototype that had just become operational, so this record is a plan, not a result.',
    facility: 'Free-flyer',
    regime: 'partial-g',
    years: [2024, null],
    fuelType: 'solid',
    fuel: 'Cotton-fiberglass (SIBAL) fabric and acrylic rod samples',
    conditions: {
      gravityG: 0.16,
      o2Percent: 34,
      diluent: 'not specified',
      pressureKPa: 56.5,
      flowCmPerS: null,
    },
    metrics: [
      {
        key: 'test-samples',
        label: 'Samples planned',
        unit: 'samples',
        value: 4,
        note: 'Two SIBAL fabrics and two acrylic rods, each burned in one direction.',
      },
      {
        key: 'oxygen-concentration',
        label: 'Exploration-atmosphere oxygen fraction',
        unit: '% O2',
        value: 34,
        note: 'Normoxic space-exploration atmosphere at 8.2 psia; the air case is 21% at 14.7 psia.',
      },
    ],
    findings: [
      {
        id: 'fm2-f1',
        text: 'Lunar gravity raises the flammability limit for some materials above the Earth-gravity limit, because convective heat loss drops while buoyant flow still brings fresh oxygen into the flame zone.',
        tags: ['material-flammability', 'extinction-limit', 'lunar-habitat'],
      },
      {
        id: 'fm2-f2',
        text: 'SIBAL fabric burns downward in lunar gravity, whereas on Earth it extinguishes shortly after ignition, so a material that passes on the ground can fail the same test at lunar gravity.',
        tags: ['screening', 'material-flammability', 'flame-spread'],
      },
      {
        id: 'fm2-f3',
        text: 'The experiment is designed for the two atmospheres a lander or rover would actually use, which is the comparison a habitat fire-safety case needs.',
        tags: ['habitat-atmosphere', 'oxygen-enriched', 'safety-case'],
      },
    ],
    safetyTakeaway:
      'A material that self-extinguishes in a ground test can sustain a downward flame at lunar gravity, and the planned atmospheres raise oxygen further, so lunar material qualification needs lunar-gravity data.',
    sources: [SRC.ntrsFm2, SRC.ntrsLuci],
    confidence: 'curated',
    tags: ['fire-safety', 'material-flammability', 'lunar-habitat', 'partial-gravity', 'screening'],
  },
]
