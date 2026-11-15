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
  // --- Added 2026-11-15. Each was opened through the NTRS citation API and its
  // abstract read before the record was written; url points at the citation page.
  ntrsSaffireIV: {
    title: 'Model Development of Large-Scale Spacecraft Fires During the Saffire-IV Experiments',
    url: 'https://ntrs.nasa.gov/citations/20220002714',
    org: 'NASA Glenn Research Center',
    year: 2022,
  },
  ntrsSaffireV: {
    title: 'Vehicle Modeling During the Burning of Thermally Thick Samples in the Saffire V Experiments',
    url: 'https://ntrs.nasa.gov/citations/20240008602',
    org: 'NASA Glenn Research Center',
    year: 2024,
  },
  ntrsBassII: {
    title: 'Burning and Suppression of Solids-II (BASS-II) Summary Report',
    url: 'https://ntrs.nasa.gov/citations/20210011385',
    org: 'NASA Glenn Research Center',
    year: 2021,
  },
  ntrsSofball: {
    title: 'Structure of Flame Balls at Low Lewis-Number (SOFBALL): Preliminary Results From the STS-83 and STS-94 Space Flight Experiments',
    url: 'https://ntrs.nasa.gov/citations/19990019803',
    org: 'NASA Johnson Space Center',
    year: 1998,
  },
  ntrsLsp: {
    title: 'Laminar Soot Processes',
    url: 'https://ntrs.nasa.gov/citations/19990053996',
    org: 'NASA Glenn Research Center',
    year: 1999,
  },
  ntrsCandle: {
    title: 'Candle Flames in Microgravity',
    url: 'https://ntrs.nasa.gov/citations/19990053984',
    org: 'NASA Glenn Research Center',
    year: 1999,
  },
  ntrsMsc: {
    title: 'Smoldering Combustion Experiments in Microgravity',
    url: 'https://ntrs.nasa.gov/citations/19970020606',
    org: 'NASA Glenn Research Center',
    year: 1997,
  },
  ntrsTgdf: {
    title: 'Microgravity Turbulent Gas-Jet Diffusion Flames',
    url: 'https://ntrs.nasa.gov/citations/20050172094',
    org: 'NASA Glenn Research Center',
    year: 1996,
  },
  ntrsLuci: {
    title: 'Lunar Combustion Investigation: Flammability Results from a Rotating Sounding Rocket',
    url: 'https://ntrs.nasa.gov/citations/20250010653',
    org: 'NASA Glenn Research Center',
    year: 2025,
  },
  ntrsFm2: {
    title: 'Flammability of Materials on the Moon',
    url: 'https://ntrs.nasa.gov/citations/20240015307',
    org: 'NASA Glenn Research Center',
    year: 2024,
  },
} satisfies Record<string, Source>
