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
| `flame-lifetime` | Flame lifetime | `min` | candle-flames |
| `flame-oscillation` | Pre-extinction oscillation | `Hz` | candle-flames |
| `flame-balls` | Flame-ball configurations tested | `flames` | sofbail |
| `smolder-rate` | Smoulder propagation rate | `mm/min` | msc |
| `jet-exit-velocity` | Jet exit velocity | `m/s` | tgdf |
| `spin-rate` | Vehicle spin rate | `RPM` | luci |
| `test-samples` | Samples planned | `samples` | fm2 |

Adding a key? Add the row here in the same commit.

## Tag vocabulary

Free-form in the contract, controlled in practice. Reuse these before inventing:

`fire-safety`, `flame-spread`, `solid-fuel`, `gaseous`, `droplet`, `cool-flame`,
`material-flammability`, `extinction`, `extinction-limit`, `suppression`,
`ignition`, `smoke`, `soot`, `smouldering`, `oxygen-enriched`, `pressure`, `ventilation`,
`low-flow`, `narrow-channel`, `concealed-fire`, `re-ignition`, `detection`,
`habitat-atmosphere`, `modelling`, `screening`, `method`, `scale`, `data-set`,
`heritage`, `ground-test`, `safety-case`, `trade-off`, `cygnus`, `cir`, `msg`,
`sofie`, `acme`, `combustion-science`, `lunar-habitat`, `mars-transit`,
`partial-gravity`, `sounding-rocket`.

## Year rule for new records

`years` is the flight or test window when the retrieved page states it (mission
names, campaign dates). When the page genuinely does not say - older conference
papers often do not - use the report's publication window instead and say so in
the record's `summary`, in the form "The retrieved report ... does not state the
flight date, so the year shown is the report year." A reader must never have to
guess which convention a record uses. `recency` scoring reads this field, so the
note also explains why an old experiment scores as old.

## Coverage fact the UI must not paper over

The partial-gravity row is **partially** covered, and the app has to say exactly
which part. Two records sit there, both lunar gravity (about 0.16 g):

- `luci` - measured in flight (spinning New Shepard), 21% oxygen in air
- `fm2` - a payload in preparation, designed for 21% at 14.7 psia and 34%
  oxygen at 8.2 psia; its record is a plan, not a result

Everything else in `partial-gravity` is a gap, and **Mars gravity (0.38 g) has no
record at all**. So:

- a lunar scenario is an interpolation from one measured gravity level
- a Mars scenario is an extrapolation past the highest gravity anyone measured
- the ISS and EVA scenarios are unaffected

Copy must not hardcode "no partial-gravity data exists". Call
`hasPartialGravityData()` / `maxMeasuredPartialGravityG()` from
`src/lib/coverage.ts` and branch, so the sentence stays true if a Mars-gravity
record ever lands.

The scenario presets still carry `assumption: true` for lunar, Mars and custom -
keep that badge visible wherever those are compared with the ISS or EVA.

## Sources

`data/experiments/sources.ts` holds every citation as a named constant. Add new
sources there, not inline. A URL in this project is a claim that the page was
retrieved and read, so do not paste a plausible-looking link from memory.

## Validation

`npm run validate:data` enforces, per record: the full contract shape (zod),
uniqueness of experiment ids, finding ids and metric keys, non-empty sources with
a URL, the confidence enum, `years[0] <= years[1]`, and at least one metric and
one finding. Across the catalogue it checks that every material, insight and
playbook `evidenceIds` entry resolves to a real finding, that glossary `related`
ids resolve, and that the 12-cell coverage grid lists each experiment once.

Added for the 30-record dataset - each one closes a way the hand-written data
actually drifted:

| Rule | Why |
|---|---|
| `value: null` needs a `note` of 12+ characters | otherwise "not published" renders as an empty cell and looks like a missing feature |
| `pressureKPa` must be `> 0` when present | `0` means vacuum, and every record here burned in a gas; "unknown" is `null` |
| `verified` / `curated` sources must be on `nasa.gov` | the honesty rule says NASA sources only at those tiers; a non-NASA page forces `illustrative` |
| finding id must start with `<experiment-id>-f` | a copied finding becomes visible in its own id instead of citing someone else's number |
| no two records may share a finding sentence | a repeated sentence means a record was copied rather than read |
| `regime` must match the numeric `gravityG` band | a label that disagrees with its gravity silently moves a coverage row |
| summary and takeaway must not contain filler markers | `TODO`, `TBD`, `lorem ipsum`, `placeholder` are what a half-written record looks like |

The script loads the validator through Vite, not plain Node, because the data
modules import `@/contracts/types` and each other without extensions.

It cannot check whether a sentence is true; that is what the `verified` /
`curated` split is for.
