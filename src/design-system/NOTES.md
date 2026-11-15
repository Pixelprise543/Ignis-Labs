# Design-system notes

## The glass recipe, and where it lives

Every surface in the app is a glass sheet, and every primitive that draws one is defined once in
`theme.css`. Components only choose *which* primitive and *which* tone; none of them paint a
`backdrop-filter`, a gradient or a shadow themselves.

| Class | What it is | Where it is used |
|---|---|---|
| `.ig-glass` | A sheet: translucent warm charcoal + a faint sheen + a 1px inset rim | `Panel`, `Card`, `Collapsible` (panel tone), chart frames, PC2 page sheets |
| `.ig-glass--borderless` | Same sheet, rim removed, for surfaces flush to a viewport edge | side rail, mobile header |
| `.ig-glass--solid` | Near-opaque fill, no blur | long-form reading: glossary terms, method sections |
| `.ig-glass-nav` | Lighter fill, slightly less blur | rail, mobile header, scenario bar |
| `.ig-glass-overlay` | Near-solid dialog fill + one heavy blur | drawer, command palette, sheets, tooltips |
| `.ig-glass-scrim` | Modal scrim (blur + dark wash) | behind drawer, palette, mobile sheets |
| `.ig-glass-tint` | Tinted chip/card, colour rides on fill + rim, text stays frost | generic tone badges, tinted cards |
| `.ig-solid-chip` | Solid fill with dark ink | severity and confidence badges, unresolved citation chips |

## Why the blur is on `::before`

`backdrop-filter` on an element that also carries a border and text flickers over a photo backdrop
in Chromium, and it forces the border to be re-composited with the blur. So the sheet element stays
transparent, its rim is an **inset** `box-shadow` (no layout cost, no shadow outside the box), and
the blur + fill are painted on a `::before` layer at `z-index: -1`. The element sets
`isolation: isolate` so that layer cannot escape behind an ancestor.

Do not move the blur back onto the element. That was the first attempt and it flickered.

## One blur per ancestor chain

Two stacked `backdrop-filter`s are expensive and read as mud, so the CSS guarantees that no glass
surface is ever drawn inside another one that already blurs. The rules are:

- a sheet inside an overlay, or an overlay inside a sheet, drops its blur;
- a sheet inside a sheet (a `Card` inside a `Panel`, a `Collapsible` inside a section) drops its
  blur and becomes a plain translucent fill — that layered translucency is the depth cue, since no
  shadow is allowed;
- an overlay inside an overlay (a tooltip inside the Ask Ignis drawer) drops its blur;
- `--solid` sheets are excluded from the nested rule: they already paint an opaque fill and carry
  no blur, so a nested sheet must not overwrite their background.

Full-screen overlays are portaled to `<body>`, so they sit outside every sheet and keep the heavy
blur. If you add a new overlay, render it through `Drawer` or as a sibling of a scrim — not inside
a panel.

## Contrast

The dark glass base (`rgba(28,22,18,0.58)`) is what buys the contrast budget: it holds `--ig-muted`
above AA even over the brightest pillar in the backdrop photo. `--ig-muted` was lifted from
`#b3a394` to `#c4b6a8` for this reason (5.0:1 on glass where the old value managed 4.3:1).

Solid chips use `--ig-on-accent` (`#1a1512`) as ink. Measured worst case is critical/alarm at 6.0:1;
info/gold is 9.7:1, caution/amber 10.3:1, high/ember 6.5:1, verified/olive 8.4:1, illustrative/muted
7.4:1. Every chip also carries an icon and a word, so colour is never the only signal.

Do not lighten the glass base or the sheen without re-measuring `--ig-muted` over the photo.

## Fallbacks

- **No `backdrop-filter`**: `@supports not (...)` swaps every sheet and overlay to the solid warm
  fill. The app stays usable and legible, it just stops being translucent.
- **`prefers-reduced-transparency: reduce`**: same swap, same reason.
- **Print**: `app.css` drops the sheets entirely (`::before` hidden, rims removed), paints overlays
  white, and forces `#111111` text on a `#b9b2a7` hairline. Tinted chips keep their tone and gain a
  border so they survive grayscale.
- **Phones (≤640px)**: blur radii drop to 12/12/20px — fewer pixels to filter, same look at arm's
  length.

## Known trade-offs

- `--ig-glass-fill` is a two-stop white gradient (`#ffffff14 → #ffffff05`). It is the one gradient
  in the app and it is deliberate: it is what makes a sheet read as glass rather than as a flat
  translucent rectangle. Nothing else in the UI may use a gradient — the orb, buttons, charts and
  heatmaps all stay solid.
- Active tabs use frost text plus a gold underline, not gold text: gold on `--ig-glass-pressed`
  measures 4.44:1 and fails AA.
- Heatmap cells keep a 2px radius and the "no data" cells keep the SVG diagonal `<pattern>`; that
  grid is meant to read as discrete cells, not as glass.
