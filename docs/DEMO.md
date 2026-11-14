# Demo script (90 seconds)

The demo must work with **no network and no API key**. The assistant runs the
deterministic offline fallback and labels itself.

## Before you start

```bash
npm ci
npm run build
npm run preview   # or: npm run dev
```

Open the app at 1440px wide. Have the browser console open: there should be no
errors.

## Script

1. **Home → Mars transit** (10s)
   - Choose *Mars transit* in the scenario bar.
   - Expected: the Flame Orb morphs from a round sphere to an amber teardrop;
     the URL gains `?scenario=mars`; the top-insight cards re-sort.
   - Say: "One scenario drives every view."

2. **Insights** (15s)
   - Open *Insights*. Point at the severity badges and confidence meters.
   - Expected: each card names the experiments behind it as evidence chips.
   - Say: "Every claim is traceable; confidence is a reading aid, not a
     probability of ignition."

3. **Rankings** (15s, PC2)
   - Open *Rankings*, drag the hazard/evidence weights.
   - Expected: rows re-order and the breakdown explains each score.
   - If the page is not merged yet, the shell shows an empty state. Skip to
     step 4 and mention that the ranking module is in integration.

4. **Simulator** (20s)
   - Open *Simulator*, click **34% O2 lunar cabin**.
   - Expected: risk score, discrete level, explained drivers with score shares,
     nearest supporting experiments, and caveats including "above 30% oxygen
     the dataset is thin".
   - Say: "This is decision support, not a physics simulation."

5. **Ask Ignis** (15s)
   - Open **Ask Ignis** and ask *"Is a 34% oxygen cabin riskier on the Moon?"*
   - Expected: a cited answer, the **Offline fallback** badge, and evidence
     chips that resolve to real experiments. No unresolved red chips.
   - Say: "Grounded only in the dataset; invalid citations are removed and
     counted."

6. **Brief** (15s)
   - Open *Brief*, click **Print / PDF** or **Copy Markdown**.
   - Expected: a cited brief with scenario values, top insights, ranked
     experiments, evidence gaps, crew response, sources and limitations. In
     print preview the rail, scenario bar and buttons disappear and the sheet
     goes light.

## Fallbacks

- **No network:** everything except a live model works; the assistant uses the
  offline fallback.
- **A teammate's page is missing:** lazy routes render the shell's empty state.
  Continue with the next step; never debug a missing page on stage.
- **Clipboard blocked:** select the preview text and copy manually; say so.
- **Dataset badge says illustrative:** stop and say it out loud. Never present
  placeholder data as a NASA result.

## Honest lines to keep

- "Scores and material risks are decision-support estimates, not measured
  ignition thresholds."
- "No partial-gravity flame-spread experiment exists in this dataset, so this
  habitat is an extrapolation."
- "Absence of a risk signal is not evidence of safety."
