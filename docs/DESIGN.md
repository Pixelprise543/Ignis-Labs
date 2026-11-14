# Ember Professional — design notes

A warm, dark, business-grade mission-control UI. Charcoal-brown surfaces, cream
text, gold and amber accents. The palette follows the physics: without buoyancy
a flame is a pale-gold sphere; with gravity it becomes a deeper amber teardrop.

## Tokens

Defined in `src/design-system/theme.css` and exposed to Tailwind v4 as
`bg-ig-*`, `text-ig-*`, `border-ig-*` utilities.

| Token | Value | Role |
| --- | --- | --- |
| `--ig-vacuum` | `#1A1512` | App background, warm charcoal |
| `--ig-hull` | `#231D18` | Panels, tables |
| `--ig-raised` | `#2E2620` | Hover, selected, popovers |
| `--ig-line` | `#40362D` | 1px borders, dividers |
| `--ig-frost` | `#F6EFE6` | Primary text, warm cream |
| `--ig-muted` | `#B3A394` | Secondary text |
| `--ig-flame-blue` | `#E3B76B` | Brand, links, primary button, microgravity data |
| `--ig-quench` | `#8DBF6A` | Low risk, partial-gravity data |
| `--ig-amber` | `#F5B942` | Caution, normal-gravity data |
| `--ig-ember` | `#EE7B3A` | High risk |
| `--ig-alarm` | `#F06A6E` | Critical only |

The token name `--ig-flame-blue` is kept for module-API compatibility; its value
is warm gold. Gold and alarm were nudged from the original spec to reach WCAG AA
on the `raised` surface. Contrast ratios are recorded in `theme.css`.

Risk is four discrete solid steps: quench → amber → ember → alarm. Severity adds
an icon and a word, so colour never carries meaning alone. Gravity regimes pair
gold/olive/amber with circle/diamond/square markers and direct labels.

## Flat rules (hard)

- No gradients, glows, blurs or drop shadows — anywhere.
- Depth comes only from 1px `--ig-line` borders and the
  vacuum/hull/raised background steps.
- Radius: 6px panels, 4px controls.
- Heatmaps and risk bars use discrete solid steps, never a continuous ramp.
- "No data" uses an SVG diagonal-line `<pattern>`, not a CSS gradient.
- Charts use solid fills and strokes.

## Type and layout

- Inter for headings and body; JetBrains Mono for numbers and units only,
  tabular figures.
- Slim left rail with a quiet active state: 2px gold left bar plus raised
  background. Top scenario bar is a flat segmented control.
- At 375px the rail becomes a bottom tab bar with a "More" sheet.
- Sentence case throughout; no all-caps eyebrow labels.

## Accessibility

- Visible focus ring on every interactive element.
- `prefers-reduced-motion` disables the Flame Orb morph and all non-essential
  motion.
- The orb has a pause control and an `aria-label` describing the shape.
- Charts and score bars expose a text summary or an accessible label; colour is
  never the only signal.
- Drawer and command palette are dialogs: focus moves in, Escape closes, body
  scroll locks, focus returns to the trigger.
- Verified contrast and no horizontal overflow at 375px and 1440px with a
  Playwright sweep over Home, Insights, Simulator, Playbook and Brief.

## Motion

The Flame Orb is the only ambient animation. It is a sampled polar path
interpolated by framer-motion from a circle at 0g to a teardrop at 1g. Other
motion responds to a user action (rows re-sorting, drawers opening, tabs
switching) and is short.
