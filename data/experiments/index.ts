import type { Experiment } from '@/contracts/types'
import { saffireExperiments } from './saffire'
import { sofieExperiments } from './sofie'
import { acmeExperiments } from './acme'
import { legacyExperiments } from './legacy'
import { heritageExperiments } from './heritage'
import { lunarExperiments } from './lunar'

/**
 * The full evidence base: 30 experiments, each traceable to a NASA page that was
 * actually retrieved while the record was written.
 *
 * Order is deliberate rather than alphabetical. Saffire leads because it is the
 * most legible story for a first-time visitor (a metre of fabric burning inside
 * a cargo ship), then SoFIE and ACME as the current ISS facilities, then the
 * heritage campaigns that established the underlying physics, and finally the
 * partial-gravity records - which are last because they are the scarcest, not
 * because they matter least.
 */
export const EXPERIMENTS: Experiment[] = [
  ...saffireExperiments,
  ...sofieExperiments,
  ...acmeExperiments,
  ...legacyExperiments,
  ...heritageExperiments,
  ...lunarExperiments,
]

export {
  saffireExperiments,
  sofieExperiments,
  acmeExperiments,
  legacyExperiments,
  heritageExperiments,
  lunarExperiments,
}
