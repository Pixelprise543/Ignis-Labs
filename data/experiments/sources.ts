import type { Source } from '@/contracts/types'

/**
 * Every Source below was retrieved from nasa.gov while building this dataset.
 * Reuse these constants instead of retyping citations: a typo in a URL is a
 * broken evidence link, and the whole app is built on those links working.
 *
 * Rules for adding a source:
 *  - url must be the page you actually read, not a search result
 *  - year is the page's publication year when it shows one
 */
export const SRC = {
  cir: {
    title: 'Fluids and Combustion Facility: Combustion Integrated Rack',
    url: 'https://www1.grc.nasa.gov/space/iss-research/iss-fcf/cir/',
    org: 'NASA Glenn Research Center',
    year: 2025,
  },
  sofieMission: {
    title: 'SoFIE - Solid Fuel Ignition and Extinction',
    url: 'https://science.nasa.gov/mission/sofie/',
    org: 'NASA Science',
    year: 2023,
  },
  sofieFive: {
    title: 'Fighting Fire with Fire: New Space Station Experiments Study Flames in Space',
    url: 'https://www.nasa.gov/feature/glenn/2022/fighting-fire-with-fire-new-space-station-experiments-study-flames-in-space/',
    org: 'NASA Glenn Research Center',
    year: 2022,
  },
  acmeMission: {
    title: 'ACME - Advanced Combustion via Microgravity Experiments',
    url: 'https://science.nasa.gov/mission/acme/',
    org: 'NASA Science',
    year: 2023,
  },
  acmeResults: {
    title: "Space Station's Quest for the Secrets of Fire",
    url: 'https://www.nasa.gov/feature/glenn/2022/space-stations-quest-for-the-secrets-of-fire/',
    org: 'NASA Glenn Research Center',
    year: 2022,
  },
  saffireFinal: {
    title: "Flame Burns Out on NASA's Long-Running Spacecraft Fire Experiment",
    url: 'https://www.nasa.gov/centers-and-facilities/glenn/flame-burns-out-on-nasas-long-running-spacecraft-fire-experiment/',
    org: 'NASA Glenn Research Center',
    year: 2024,
  },
  saffireI: {
    title: 'NASA Ignites Fire Experiment Aboard Space Cargo Ship',
    url: 'https://www.nasa.gov/centers-and-facilities/glenn/nasa-ignites-fire-experiment-aboard-space-cargo-ship/',
    org: 'NASA Glenn Research Center',
    year: 2016,
  },
  saffireIII: {
    title: 'NASA Prepares to Ignite Third SAFFIRE Experiment',
    url: 'https://www.nasa.gov/news-release/nasa-prepares-to-ignite-third-saffire-experiment/',
    org: 'NASA',
    year: 2017,
  },
  combustion: {
    title: 'Combustion Science focus area',
    url: 'https://science.nasa.gov/biological-physical/focus-areas/combustion-science/',
    org: 'NASA Biological and Physical Sciences',
    year: 2023,
  },
  microgravityFacilities: {
    title: 'NASA Glenn Labs and Test Facilities: Microgravity Facilities',
    url: 'https://www1.grc.nasa.gov/facilities/zero-g/',
    org: 'NASA Glenn Research Center',
    year: 2026,
  },
} satisfies Record<string, Source>
