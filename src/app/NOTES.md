# App shell notes

## Two shells, one router

- `CORPORATE_ROUTES` (`/`, `/product`, `/solutions`, `/technology`, `/pricing`, `/about`) render `CorporateShell`.
- Everything under `/app/*` renders the platform shell: folded rail, mobile tabs, scenario bar.
- Exact-path match decides which shell wins, so `/product` cannot be mistaken for a platform route.

## Why the rail is folded

Clicking "Open platform" used to land on a rail that listed all fourteen views at once, which
read as the old app's feature menu. `RailGroups` and the mobile "All views" sheet now start with
every group folded and open only the group that contains the current page. The reader sees five
short headings instead of fourteen links, and orientation is preserved because the active group
opens itself.

Do not "fix" this by expanding everything again. If a new group is added to `NAV_GROUPS`, it is
folded by default automatically.

## Collapsible text

`@/design-system` exports `Collapsible`. Rules for using it:

- The `title` is plain text. Never nest a link or button inside it; the whole row is a button.
- Always give a `summary` line, so the folded state still says something useful.
- Fold supporting detail, never the claim itself. Evidence ids must remain reachable - the
  honesty rule needs every insight, material risk and playbook step to link to real evidence.
- Keep "Limitations" and honesty sections available; they may be folded, never deleted.

## Readability floor

Body copy is `text-sm` (14px) minimum. Secondary text is `text-xs` (12px) minimum. There are no
all-caps eyebrow labels anywhere - the theme forbids them and they were the main reason the
marketing pages felt like walls of text.

## No scenario page

There is no `/app/scenario`. The scenario bar is global and already covers the presets and the
custom g / O2 / pressure editor, so a second page was a copy of the same component. Both
`/scenario` and `/app/scenario` redirect to `/app`. Do not re-add a page for this unless the bar
loses the custom editor first.

## Local dev gotcha

A stale Vite server from another checkout (`C:\dev\Ignis-Labs`) can squat port 5173. Playwright
reuses an existing server, so tests will silently run against that old app. If the shell looks
wrong but the code is right, check the port owner before debugging anything else.
