# Ignis experiment dataset - schema and rules

Owner: PC1 (Core). Consumers: PC2 (Explore), PC3 (Experience).

`data/experiments/*.ts` is the only source of experiment facts in the app. Every
view reads it through the accessors in `src/lib/data.ts`; nothing imports the raw
module files.

## Record shape

The TypeScript truth is `src/contracts/types.ts` (`Experiment`). Do not restate it
here - read it. The fields that cause trouble in the UI:

| Field | Notes for rendering |
|---|---|
| `years` | `[start, end]`. `end === null` means "started then, still running or no published end". Render as `2016` or `2016-2024`. |
| `conditions` | Physical test conditions. Any of `o2Percent`, `pressureKPa`, `flowCmPerS` can be `null` meaning "varied across test points" or "not published". Never render `null` as `0`. |
| `metrics[].value` | `null` means the investigation measured it but no figure was published on the page we could retrieve. Render the label and a "not published" affordance, not an empty cell. |
| `findings[].id` | Global handle. Insights, playbooks and SI citations point at finding ids, not experiment ids. |
| `sources[].url` | Optional in the contract, always present in this dataset. Must resolve. |
| `confidence` | `verified` / `curated` / `illustrative`. See below. |

## Confidence rules

The whole product claims an audit trail, so the label has to mean something:

- **`verified`** - at least one number in `metrics` was read on a cited NASA page,
  and the summary contains no claim that page does not support.
- **`curated`** - the summary is a faithful condensation of cited NASA pages, but
  every metric `value` is `null` because no figure was published on the pages we
  retrieved. Curated is not a lower-quality record; it is an honest one.
- **`illustrative`** - placeholder or synthesised content. Currently unused. If
  you add one, it must be visibly badged in the UI.

Years on `curated` records are the flight span reported by NASA sources; on two
heritage records (`flex`, `flex-2`) the span is the commonly published mission
window and is the only non-numeric fact not re-confirmed page by page.

## Metric key registry

Keys are kebab-case and stable. Two records that measure the same thing must use
the same key and unit, otherwise compare and chart views break silently.

| key | label | canonical unit | used by |
|---|---|---|---|
| `sample-length` | Sample length | `m` | saffire-i |
| `sample-diameter` | Sample diameter | `cm` | bass |
| `burn-duration` | Burn duration | `min` | saffire-i, saffire-iii, acme-bre, bass |
| `experiment-duration` | Total experiment duration | `h` | saffire-iii |
| `test-runs` | Experiment runs | `runs` | saffire-vi |
| `materials-tested` | Material types tested | `materials` | saffire-vi, sofie-smurf |
| `images-downlinked` | Images downlinked | `images` | saffire-i |
| `flames-studied` | Flames studied | `flames` | acme-s-flame |
| `oxygen-concentration` | Oxygen concentration | `% O2` | saffire-vi, sofie-gel, acme-flame-design |
| `pressure` | Chamber pressure | `kPa` | saffire-vi |
| `extinction-pressure` | Extinction pressure | `kPa` | sofie-gel |
| `flame-spread-rate` | Flame spread rate | `cm/s` | sofie-rtdfs, flex-2 |
| `channel-gap` | Channel gap | `mm` | sofie-nca |
| `ignition-time` | Ignition time | `s` | sofie-mist |
| `suppressant-mass` | Suppressant mass to extinguish | `g` | sofie-mist |
| `soot-volume-fraction` | Soot volume fraction | `ppm` | acme-cld-flame |
| `applied-field-strength` | Applied field strength | `kV/m` | acme-e-field |
| `droplet-diameter` | Initial droplet diameter | `mm` | flex, dce-usml2 |
| `ambient-flow` | Ambient flow speed | `cm/s` | flex-2j |
| `reaction-temperature` | Cool-flame temperature | `K` | cfi |
| `free-fall-duration` | Free-fall duration | `s` | drop-tower-2-2s |

Adding a key? Add the row here in the same commit.

## Tag vocabulary

Free-form in the contract, controlled in practice. Reuse these before inventing:

`fire-safety`, `flame-spread`, `solid-fuel`, `gaseous`, `droplet`, `cool-flame`,
`material-flammability`, `extinction`, `extinction-limit`, `suppression`,
`ignition`, `smoke`, `soot`, `oxygen-enriched`, `pressure`, `ventilation`,
`low-flow`, `narrow-channel`, `concealed-fire`, `re-ignition`, `detection`,
`habitat-atmosphere`, `modelling`, `screening`, `method`, `scale`, `data-set`,
`heritage`, `ground-test`, `safety-case`, `trade-off`, `cygnus`, `cir`, `msg`,
`sofie`, `acme`, `combustion-science`, `lunar-habitat`, `mars-transit`.

## Coverage fact the UI must not paper over

All flight records are `microgravity`. The only other gravity regime in the set is
`normal-g` (none of the records actually fly at 1 g, but the drop tower is
microgravity and the ground comparison point is the reader's own experience).
There is **no partial-gravity flame-spread experiment** in the dataset, because no
such flight experiment exists in the retrieved sources.

Consequence: lunar (0.16 g) and Mars (0.38 g) scenarios are extrapolations from
microgravity plus theory. The coverage view must show those bands as gaps, and
the simulator must include a caveat saying so. The scenario presets already carry
`assumption: true` for exactly this reason - keep that badge visible wherever a
lunar, Mars or custom scenario is compared with the ISS or EVA.

## Sources

`data/experiments/sources.ts` holds every citation as a named constant. Add new
sources there, not inline. A URL in this project is a claim that the page was
retrieved and read, so do not paste a plausible-looking link from memory.

## Validation

`node --experimental-strip-types scripts/validate-data.ts` (wired as
`npm run validate:data` from tier M) enforces uniqueness of experiment ids,
finding ids and metric keys per record, non-empty sources, confidence enum,
`years[0] <= years[1]`, and that every metric with `value !== null` has a numeric
unit string. It cannot check whether a sentence is true; that is what the
`verified`/`curated` split is for.
