import { ArrowRight, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  dismissOnboarding,
  isOnboardingDismissed,
  onShowOnboarding,
} from "./onboarding";

export interface OnboardingGuideProps {
  scenarioLabel: string;
  onAsk: () => void;
}

const STEPS = [
  {
    title: "Pick a scenario",
    text: "Use the scenario bar above. Gravity, oxygen and pressure drive every ranking, risk and answer.",
  },
  {
    title: "Read the evidence",
    text: "Insights name the experiments behind them. Open a chip to see the record.",
  },
] as const;

/**
 * Three sequential first-run steps. Numbering is allowed here because the order
 * matters, and the panel is dismissible so a returning visitor is not slowed
 * down. It never blocks the page and has no motion.
 */
export function OnboardingGuide({ scenarioLabel, onAsk }: OnboardingGuideProps) {
  const [visible, setVisible] = useState(() => !isOnboardingDismissed());

  useEffect(() => onShowOnboarding(() => setVisible(true)), []);

  if (!visible) return null;

  function dismiss() {
    dismissOnboarding();
    setVisible(false);
  }

  return (
    <section
      aria-labelledby="start-here"
      className="rounded-panel border border-ig-line bg-ig-hull"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ig-line px-4 py-3">
        <div className="min-w-0">
          <h2 id="start-here" className="text-sm font-semibold text-ig-frost">
            Start here
          </h2>
          <p className="mt-1 text-xs leading-5 text-ig-muted">
            Three steps from a scenario to a cited fire-safety answer. This guide hides once you
            dismiss it; reopen it from the command palette.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="inline-flex h-8 items-center gap-1 rounded-control px-2 text-xs text-ig-muted hover:bg-ig-raised hover:text-ig-frost"
        >
          <X size={14} aria-hidden="true" />
          Dismiss guide
        </button>
      </div>

      <ol className="grid gap-3 p-4 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex gap-2.5">
            <span
              aria-hidden="true"
              className="ig-num mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-ig-line text-xs text-ig-flame-blue"
            >
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-ig-frost">{step.title}</p>
              <p className="mt-0.5 text-xs leading-5 text-ig-muted">{step.text}</p>
            </div>
          </li>
        ))}

        <li className="flex gap-2.5">
          <span
            aria-hidden="true"
            className="ig-num mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-ig-line text-xs text-ig-flame-blue"
          >
            3
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-ig-frost">Ask about {scenarioLabel}</p>
            <p className="mt-0.5 text-xs leading-5 text-ig-muted">
              Ignis answers only from this dataset and cites the records it used.
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onAsk}
                className="inline-flex items-center gap-1 text-xs text-ig-flame-blue hover:underline"
              >
                <Sparkles size={12} aria-hidden="true" />
                Ask Ignis
              </button>
              <Link
                to="/insights"
                className="inline-flex items-center gap-1 text-xs text-ig-flame-blue hover:underline"
              >
                Browse insights <ArrowRight size={12} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </li>
      </ol>
    </section>
  );
}
