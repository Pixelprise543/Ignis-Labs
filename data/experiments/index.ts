import type { Experiment } from '@/contracts/types'
import { saffireExperiments } from './saffire'
import { sofieExperiments } from './sofie'
import { acmeExperiments } from './acme'
import { legacyExperiments } from './legacy'

/**
 * The full evidence base: 20 experiments, each traceable to a NASA page that was
 * actually retrieved while the record was written.
 *
 * Order is deliberate rather than alphabetical. Saffire leads because it is the
 * most legible story for a first-time visitor (a metre of fabric burning inside
 * a cargo ship), then SoFIE and ACME as the current ISS facilities, then the
 * heritage campaigns that established the underlying physics.
 */
export const EXPERIMENTS: Experiment[] = [
  ...saffireExperiments,
  ...sofieExperiments,
  ...acmeExperiments,
  ...legacyExperiments,
]

export { saffireExperiments, sofieExperiments, acmeExperiments, legacyExperiments }
