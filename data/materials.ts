import type { Material } from '@/contracts/types'

/**
 * The material catalogue behind the Material Risk view.
 *
 * `baseFlammability` is a qualitative 0-100 index assembled from the flight
 * evidence, not a measured quantity. It is deliberately coarse: its job is to
 * order materials sensibly, and the simulator then moves that order with the
 * scenario. Any UI that shows the number must label it "qualitative index".
 *
 * `evidenceIds` point at findings, never at experiments, so a material claim can
 * be traced to the sentence that supports it.
 */
export const MATERIALS: Material[] = [
  {
    id: 'sibal-fabric',
    name: 'SIBAL fabric (cotton-fiberglass blend)',
    category: 'textile',
    usedFor: 'Stowage bags, covers and the Saffire test samples',
    evidenceIds: ['saffire-i-f1', 'saffire-iii-f1', 'saffire-vi-f2'],
    baseFlammability: 72,
    notes:
      'Carried a slow flame across a one-metre sample for about eight minutes in Saffire-I, so it is the best-evidenced fabric in the set. The fiberglass component slows spread without stopping it.',
  },
  {
    id: 'cotton',
    name: 'Cotton',
    category: 'textile',
    usedFor: 'Clothing and soft goods',
    evidenceIds: ['saffire-vi-f2', 'sofie-smurf-f1'],
    baseFlammability: 78,
    notes:
      'Burned alongside plexiglass, Nomex and SIBAL in Saffire-VI. A conventional textile with no flame-retardant treatment in the tested form.',
  },
  {
    id: 'nomex',
    name: 'Nomex (aramid)',
    category: 'textile',
    usedFor: 'Flight suits and fire-resistant soft goods',
    evidenceIds: ['saffire-vi-f2'],
    baseFlammability: 28,
    notes:
      'Included in Saffire-VI as the flame-resistant comparison. A low index is not zero: the dataset has no Saffire-VI result showing it refusing to burn at every oxygen level.',
  },
  {
    id: 'plexiglass',
    name: 'Plexiglass (acrylic)',
    category: 'polymer',
    usedFor: 'Windows, guards and rigid transparent parts',
    evidenceIds: ['saffire-vi-f2'],
    baseFlammability: 55,
    notes:
      'One of the four Saffire-VI materials. Thermoplastic, so it melts and drips as well as burns, which changes the fire signature a detector has to catch.',
  },
  {
    id: 'synthetic-resin',
    name: 'Synthetic resin',
    category: 'polymer',
    usedFor: 'Test spheres and cast parts',
    evidenceIds: ['bass-f1', 'bass-f2'],
    baseFlammability: 60,
    notes:
      'A one-centimetre resin sphere produced a blue spherical flame in BASS, then deformed after about two minutes as fuel vapour overwhelmed the airflow.',
  },
  {
    id: 'heptane',
    name: 'Heptane',
    category: 'liquid-fuel',
    usedFor: 'Droplet-combustion test fuel',
    evidenceIds: ['flex-f1', 'flex-2-f1'],
    baseFlammability: 85,
    notes:
      'A reference hydrocarbon for droplet work because its combustion chemistry is well characterised. The FLEX campaign burned heptane droplets through extinction and cool-flame transitions.',
  },
  {
    id: 'methanol',
    name: 'Methanol',
    category: 'liquid-fuel',
    usedFor: 'Droplet-combustion test fuel',
    evidenceIds: ['flex-f1'],
    baseFlammability: 70,
    notes:
      'The second FLEX fuel. Its simpler chemistry makes it the cleaner comparison against heptane when a model is being checked.',
  },
  {
    id: 'methane',
    name: 'Methane',
    category: 'gas',
    usedFor: 'Gaseous burner fuel in ACME',
    evidenceIds: ['acme-bre-f1', 'acme-s-flame-f1'],
    baseFlammability: 65,
    notes:
      'The gaseous reference fuel for ACME. A gas leak is a different hazard shape from a solid: no smouldering phase, and the flammable volume is the whole compartment.',
  },
]
