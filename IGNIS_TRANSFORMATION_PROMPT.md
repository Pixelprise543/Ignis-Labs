# Ignis Labs — Full Corporate Website Transformation

**Comprehensive implementation instructions for OpenCode agents.**

You are a senior full-stack engineer, enterprise SaaS architect, UI/UX designer, and aerospace technology product strategist. Your assignment is to transform the existing Ignis Labs website into a polished, business-oriented aerospace technology company website.

This is a **restructuring and redesign** project, not a replacement project. The current repository already contains NASA combustion research content, scientific analysis tools, datasets, interactive components, and a functioning AI assistant. Preserve all of them. Do not assume the features named here are the entire site — you have direct repository access, so inspect it thoroughly before changing anything.

---

## 0. Read this before anything else — repository ground truth

This section corrects assumptions so you do not "preserve" things that aren't live or break the project's frozen contract.

**0.1 — Honor the frozen contract (`AGENTS.md`).** The repo ships a frozen spec. You must NOT edit, and must build in conformance with:
- `AGENTS.md`, `src/contracts/**` (frozen TypeScript types), `data/**`, the scoring/simulator/insights/materials logic in `src/lib/**`, and the Ask Ignis API/grounding/fallback code.
- The **"Ember Professional" theme** in `src/design-system/theme.css`: dark-only, warm palette, and the **FLAT rules — no gradients, glows, blurs, or shadows anywhere.** Depth comes only from 1px borders and the vacuum/hull/raised background steps. Build every new corporate page from these existing tokens. Do not introduce a gradient hero or neon glow, even on marketing pages.

**0.2 — Only six routes are currently live.** `src/app/nav.ts` + `src/app/routes.tsx` wire exactly: `/`, `/scenario`, `/explore`, `/simulator`, `/insights`, `/brief`. The folders for **compare, rankings, materials, coverage, timeline, playbook, glossary, method** exist under `src/features/` but are **not in the `ROUTES` table**, so they currently resolve to the "Page not found" fallback. Treat them as *built-but-unrouted* or *stub*, not shipped. The Ask Ignis assistant **is** live (`AskIgnisDrawer` is mounted in `src/app/AppShell.tsx`).

**0.3 — Three-state audit (replaces a naive "preserve everything").** During the audit, classify every feature as **live**, **built-but-unrouted**, or **stub**. Preserve and wire real content; surface real status for stubs; never fabricate science to fill a placeholder.

**0.4 — GitHub Pages deep links currently 404.** The app uses `BrowserRouter` with `basename={BASE_URL}` and there is no `public/404.html` SPA fallback. Deep-link refresh (e.g. `/explore`) will 404 on GitHub Pages today. Fixing this is a **required deliverable**, not an aspiration (see Section 15).

---

## 1. Company Identity

- **Company:** Ignis Labs
- **Flagship product:** Ignis
- **Existing interactive application:** Ignis Research Platform
- **Industry:** Aerospace research technology and scientific intelligence software
- **Origin:** NASA International Space Apps Challenge 2026 — "Flame in Freefall: SI-Powered Fire Safety Insights from Microgravity Combustion Data"

**Vision.** Ignis Labs develops scientific intelligence software that helps researchers, engineers, and organizations explore complex experimental research, identify meaningful relationships, and generate evidence-grounded insights. Our first product, Ignis, focuses on NASA's microgravity combustion research and its relevance to fire safety in space exploration. Our long-term ambition is to expand into additional aerospace and engineering research applications. The website must communicate a serious commercial vision while accurately representing the capabilities that currently exist.

**Brand structure.** "Ignis Labs" = the company. "Ignis" = the flagship product. "Ignis Research Platform" = the existing interactive application. The public website introduces the company; the platform demonstrates the technology; both should feel like one integrated ecosystem. Use **Ignis Research Platform** as the proper noun for the app throughout.

---

## 2. Non-negotiable: preserve everything

Do not delete existing information or functionality. The current site answers the NASA Space Apps challenge and must remain accessible. You must not remove: existing pages, experiments or datasets, citations, charts/visualizations, scientific explanations, the experiment library, comparisons, rankings/scoring, the simulator, safety insights, material analysis, timelines, coverage information, mission-planning tools, playbooks, report generation, methodology docs, glossary content, the AI assistant — **or any other feature discovered during inspection.** This list is not exhaustive.

Do not replace detailed scientific content with generic marketing copy, do not summarize technical content in a way that loses meaning, and do not change scientific calculations, datasets, or findings as part of this redesign. Do not silently remove unfinished features — preserve them and identify their status (per the three-state audit in 0.3).

**Required preservation audit (before editing code):** inspect the whole repo and inventory every route, page, major component, dataset, citation, interactive feature, export function, chatbot integration, state store, and any hidden/conditional/scenario-specific content. Produce the Section 17 matrix with a **current-status** column. If a page needs a new location, re-route it without deleting content. If a component is cluttered, reorganize its presentation rather than removing information. The objective is better information architecture, not less information.

**Hard do-not-edit list (from 0.1):** `AGENTS.md`, `src/contracts/**`, `data/**`, scoring/simulator/insights/materials logic, and the Ask Ignis API/grounding/fallback code.

---

## 3. New website structure

Two distinct but connected experiences.

**A. Corporate website** — exactly six primary navigation pages plus a prominent **Launch Platform** button:

| Route | Page |
|---|---|
| `/` | Home |
| `/product` | Product |
| `/solutions` | Solutions |
| `/technology` | Technology |
| `/pricing` | Pricing |
| `/about` | About |
| `/app/*` | Ignis Research Platform |

The six corporate pages are the primary marketing navigation, not a cap on the number of application pages. Adapt route implementation to the actual router and hosting environment.

**B. Ignis Research Platform** — the existing application lives under a dedicated `/app` area. All existing research pages/tools remain accessible. **Because `/` is currently the dashboard, moving it to marketing Home is a move, not an addition:** add **redirects** from every old path to its new `/app/...` location (e.g. `/explore` → `/app/explore`) so existing deep links and scenario query params keep working. Preserve old links wherever practical.

---

## 4. Home page

Must look like the homepage of a legitimate aerospace technology company — it should introduce the company, explain the product, establish credibility, and guide visitors toward using Ignis. It must not open directly into a scientific dashboard. Build from existing theme tokens under the FLAT rules.

1. **Hero** — headline e.g. "Scientific intelligence for the next frontier." Supporting line (keep short; trim the suggested copy on implementation): "Ignis Labs develops intelligent research software that turns complex scientific data into accessible, evidence-grounded insights." Primary button: *Explore Ignis*. Secondary: *How It Works*. Include a polished preview of the **actual** platform (real components or screenshots from the functioning app) — never fabricated results.
2. **The Problem** — "Complex research deserves clearer answers." Research is spread across publications, experiments, datasets, and reports; comparing findings and finding useful evidence is slow.
3. **Our Solution** — "From experimental data to scientific understanding." Three capabilities: **Discover** (explore/search research), **Analyze** (compare experiments, evaluate scenarios, investigate relationships), **Interpret** (evidence-grounded explanations and insights).
4. **Introducing Ignis** — showcase the real platform with interactive previews of the strongest *actual* features (experiment exploration, AI research assistant, comparison, scenario analysis, risk estimation, mission briefs). No fabricated demos.
5. **How It Works** — select a research question/scenario → explore relevant experiments and evidence → use analysis tools to interpret → review citations, limitations, and generated outputs.
6. **Solutions preview** — aerospace research, spacecraft fire-safety research, academic research, engineering R&D, scientific data interpretation. Clearly separate existing functionality from potential future applications.
7. **Technology preview** — evidence-grounded architecture, real research sources, scientific transparency, the existing AI assistant.
8. **Pricing preview** — Explorer / Research Pro / Enterprise tiers. Do not imply unreleased commercial services exist.
9. **Final CTA** — "Explore a new approach to scientific research." Buttons: *Launch Ignis*, *Discover Our Technology*.
10. **Footer** — Ignis Labs branding, nav links, product link, NASA Space Apps attribution, contact only if configured, relevant disclaimers. Do not invent addresses or legal registrations.

---

## 5. Product page

Explain the complete Ignis platform. The current repo contains more than is described here, so organize the page by **actual capability categories** discovered in the audit, not a fixed list. Suggested categories: Research Discovery; Scientific Analysis; AI Research Intelligence (Ask Ignis + any other AI-assisted features); Engineering Decision Support (materials, risk, insights, scenario interpretation); Research Reporting (briefs, exports, summaries); Additional Capabilities.

For every major feature: name, what it does, who it helps, why it matters, a real platform preview, and a link to the functioning feature. Preserve all underlying functionality — this page is a commercial explanation of the existing platform, not a replacement for it.

---

## 6. Solutions page

Professional page explaining the research problems Ignis addresses. Suggested sections: Aerospace Research; Spacecraft Fire-Safety Research; Academic Research; Engineering R&D; Scientific Knowledge Management. Each section states the problem, how Ignis addresses it, which **actual** platform features support it, and what limitations remain. Do not claim that NASA, aerospace contractors, or research institutions currently use Ignis unless evidence exists.

---

## 7. Technology page

Establish scientific/technical credibility and link to the existing detailed methodology. Organize into: Research Data Architecture; Scientific Intelligence; AI Assistant (Ask Ignis, described from its actual architecture); Scenario Analysis; Ranking & Risk Methodology (implemented calculations and their limits); Scientific Transparency (citations, uncertainty, evidence quality, confidence labels); Technical Architecture (the real software stack); Limitations (what the system does not validate or predict). Do not invent AI models, backend services, integrations, or scientific capabilities. Keep links to the deeper technical explanations in the platform's Method page.

---

## 8. Pricing page

A professional SaaS pricing page that communicates a plausible future business model without pretending paid subscriptions exist. Three tiers:

- **Explorer — Free.** For students, educators, independent researchers. Include only features that currently exist and are accessible. Button: *Launch Platform*.
- **Research Pro — Coming Soon.** For researchers wanting advanced workflows. Clearly label planned features (saved workspaces, expanded exports, advanced analysis, more integrations, collaboration). Do not invent a price.
- **Enterprise — Future availability.** For organizations with specialized needs (custom datasets, integrations, deployments, team access, custom workflows). Do not create a fake checkout or billing system. If no contact method is configured, do not create a nonfunctional "Contact Sales" button.

Include a feature comparison table that clearly distinguishes **available now / planned / not available.** Look like a serious SaaS product while staying accurate.

---

## 9. About page

1. **Mission** — "Making complex scientific research easier to understand and apply." Explain purpose and direction.
2. **Our Story** — began through NASA Space Apps Challenge 2026; the microgravity-combustion focus inspired the broader scientific-intelligence vision. Do not invent milestones, partnerships, awards, funding, or customers.
3. **Vision** — ambition to develop research tools across additional aerospace/engineering domains.
4. **Leadership & Team** — exactly six professional CxO **role placeholders** (not a student-club roster): CEO, CTO, CSO, COO, CPO, CBO, each with a short responsibility description. Each card: neutral avatar placeholder (not an AI portrait of a fictional executive), role title, name placeholder, responsibility description, optional future bio field, optional profile link. Responsive grid: 3 columns desktop / 2 tablet / 1 mobile, consistent sizing. **These are organizational role placeholders, not claims the positions are filled** — mark them as placeholders, invent no names/credentials, and keep team data in a **centralized, easily editable config** for later replacement.
5. **NASA Space Apps origins** — describe the competition origin and state that participation does not imply NASA endorsement.
6. **Future direction** — long-term ambitions.

---

## 10. Research Platform reorganization

The existing platform must stay fully functional; reorganize its layout for clarity without losing information. It should read as professional enterprise research software, not a set of disconnected pages.

**Navigation.** Inspect the actual routes (per 0.2) and group them. Suggested groups: **Overview** (Dashboard); **Research** (Experiment Library, Comparison, Timeline, Evidence Coverage); **Analysis** (Rankings, Materials, Simulator, Scientific Insights); **Mission Tools** (Safety Playbook, Mission Brief); **Resources** (Glossary, Methodology). Wire the built-but-unrouted features rather than leaving them on the 404 fallback. Include any additional existing pages in appropriate groups.

**Layout.** Consistent sidebar, clear page headings, persistent scenario controls, consistent cards, unified charts, responsive tables, accessible controls, clear hierarchy, functional Ask Ignis access.

**Information preservation.** Do not trim scientific text to shorten cards. Use expandable sections, detail drawers, tabs, accordions, contextual panels, linked methodology, and progressive disclosure. Never hide critical limitations or uncertainty disclosures behind inaccessible interactions.

**Dashboard overview.** Reorganize into a clear hierarchy: active research scenario → most important findings → dataset summary → quick access to tools → featured experiments → additional existing content. Preserve all existing data.

---

## 11. AI chatbot preservation

The existing Ask Ignis chatbot works. **Do not rewrite or replace it.** Preserve response behavior, API integrations, dataset grounding, citation handling, conversation state, scenario awareness, fallback behavior, and error handling. You may improve its **visual** integration into the new design only. After the redesign, test it with multiple research questions and confirm it behaves as before.

---

## 12. Visual design direction

Premium aerospace technology company: modern, professional, cohesive, organized. Principles: clear hierarchy, consistent spacing, strong typography, professional layouts, restrained color, clean navigation, readable scientific data, consistent components, purposeful animation, accessible interactions.

**Reuse the existing brand.** Start from the existing color system and `src/design-system/theme.css` tokens — do not replace the palette. Obey the project's FLAT rules on every page, marketing included: **no gradients, no glows, no blurs, no drop shadows.**

- **Corporate site:** spacious layouts, strong hero, clear CTAs, real product previews, organized feature explanations, attractive pricing cards, cohesive team section, well-structured footer.
- **Platform:** information-rich, organized, technically credible, easy to navigate, consistent across pages. Do not make it less useful to look more minimal.

**Avoid:** generic AI landing-page layouts, excessive gradients, neon glows, unnecessary animation, random decorative graphics, excessive card nesting, inconsistent margins, cluttered navigation, repetitive content, misleading statistics, placeholder features presented as operational.

---

## 13. Responsive design

Test at **375 / 768 / 1024 / 1440 px.** Ensure: corporate nav works on mobile; application nav stays accessible; pricing cards stack; team cards resize (3/2/1); scientific tables stay usable; charts don't overflow; Ask Ignis stays accessible; buttons and forms stay functional.

---

## 14. Technical implementation plan

**Before coding:** inspect the repo; map all routes; inventory all functionality (three-state); identify the design system, shared components, scientific data modules, the chatbot implementation, state management, and deployment config; establish a baseline build and test result.

**Stages.** 1 — Architecture (corporate vs. `/app` split; existing routes still resolve, with redirects). 2 — Corporate pages (Home, Product, Solutions, Technology, Pricing, About). 3 — Application UI (reorganize navigation and layouts; preserve all information). 4 — Integration (connect site ↔ platform; scenario state flows correctly). 5 — Validation (every original feature accessible and functional).

---

## 15. GitHub Pages compatibility (required deliverable)

Deployment is GitHub Pages via `.github/workflows/deploy-pages.yml`. The current `BrowserRouter` + `basename` setup has **no SPA fallback**, so nested-route refresh 404s today. You must fix this: add `public/404.html` that redirects into the SPA (or switch to `HashRouter`), keep the base path correct, and verify direct links, nested-route refresh, scenario query params, and browser back/forward all work. Preserve existing deep links. Introduce no server-side requirement GitHub Pages cannot support.

---

## 16. Testing requirements

**Corporate:** all six pages load; nav links work; product CTAs open the correct pages; pricing shows accurate availability; six leadership placeholders appear; responsive layouts work.

**Platform:** every original route resolves (no accidental 404); every dataset and citation remains available; search, comparisons, rankings, simulator, AI assistant, mission briefs/exports, and scenario switching all work; no research content disappeared.

**Engineering:** run the production build, lint, unit tests, and relevant e2e; check for runtime errors; check mobile responsiveness; verify GitHub Pages routing. **Do not claim a test passed unless it was executed.**

---

## 17. Feature preservation matrix

Before finishing, produce a table with: **Original Feature | Original Route | Current Status (live / built-but-unrouted / stub) | New Route | Preserved? | Tested?** Include every feature from the initial audit. No feature may be silently omitted. If a feature cannot be preserved, explain the technical reason before any destructive change.

---

## 18. Final deliverable

Implement directly in the repository. Provide: new-architecture summary; list of corporate pages created; description of the redesigned application; the feature preservation matrix; files modified; test results; remaining limitations; deployment instructions. Do not stop at mockups. Do not change scientific calculations, datasets, or chatbot logic.

**Final objective.** Preserve the substantial existing research and functionality while presenting it as a coherent commercial software product. A visitor should immediately understand what the company does, what problem it solves, what product it offers, who benefits, how the technology works, how to access the platform, and what future offerings are planned. The six corporate pages establish the company; the existing application demonstrates the technology. Do not sacrifice scientific depth for commercial appearance, do not sacrifice existing functionality for visual simplicity, and do not turn the company website into another research dashboard.

---

## 19. Parallel execution — 30 subagents

Divide this work across **30 subagents** running in **four waves**. A wave may not start until the prior wave's shared foundations are merged. Each agent owns a **disjoint set of files** — never edit outside your assignment. Commit small to your own branch; the integration agent (30) performs merges. Note: 30 is deliberately granular — some app areas are thin or unrouted, so a few agents have light scopes; wire and preserve real status rather than inventing content.

**Wave 0 — Foundation (complete and merge first)**
1. **Audit & Inventory** (read-only). Map every route, feature folder, dataset, citation, export, and assistant integration; classify each as *live / built-but-unrouted / stub*; produce the Section 17 matrix. Blocks all others.
2. **Routing Architecture.** Corporate vs. `/app` split; redirects from old paths; GitHub Pages `public/404.html` SPA fallback; correct base path. Owns router + app entry.
3. **Marketing Design Layer.** `MarketingShell` plus shared hero/section/card primitives built from existing `theme.css` tokens under the FLAT rules. Owns the new marketing component directory only.

**Wave 1 — Corporate pages (one agent each)**
4. Home · 5. Product · 6. Solutions · 7. Technology · 8. Pricing · 9. About (+ centralized editable `team` config, six CxO placeholders).

**Wave 1b — Corporate shared chrome**
10. Corporate nav + "Launch Platform" button + mobile nav.
11. Footer, disclaimers, NASA Space Apps attribution.
12. Pricing cards + comparison table (available / planned / not available).
13. Real platform-preview components (screenshots/embeds of the live app — no fabricated results).

**Wave 2 — Research Platform reorganization (one agent per area; preserve all content via drawers/tabs/accordions)**
14. App sidebar + layout grouping (Overview / Research / Analysis / Mission Tools / Resources).
15. Dashboard/Overview reorg · 16. Explore (library) · 17. Compare · 18. Rankings · 19. Materials · 20. Coverage · 21. Timeline · 22. Simulator · 23. Insights · 24. Playbook · 25. Brief + exports · 26. Glossary + inline term tooltips · 27. Methodology.
28. Scenario-bar persistence across the platform + scenario state carried from marketing → app.
29. Ask Ignis **visual integration only** (do **not** touch response logic, grounding, citations, API, or fallback) + command palette.

**Wave 3 — Integration & QA**
30. Merge all branches; run build + lint + unit + relevant e2e; verify responsive at 375/768/1024/1440; verify GitHub Pages deep-link routing and scenario query params; validate the preservation matrix end-to-end; report runtime errors. Claims no test passed that was not executed.

Agents assigned to *stub / built-but-unrouted* routes must **wire and preserve**, not fabricate science — surface real status rather than inventing content.
