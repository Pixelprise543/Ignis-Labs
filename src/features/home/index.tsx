import {
  ArrowRight,
  BookOpen,
  Compass,
  FileText,
  LayoutGrid,
  ListOrdered,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { Experiment, Severity } from "@/contracts/types";
import { Link } from "react-router-dom";
import { getExperiments, getInsights, useIgnis } from "@/app/data";
import { Badge, BookmarkButton, Stat, Term } from "@/design-system";
import { InsightCard } from "@/features/insights/InsightCard";
import { FlameOrb } from "./Orb";
import { OnboardingGuide } from "./StartHereGuide";

const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  high: 1,
  caution: 2,
  info: 3,
};

const REGIME_LABEL: Record<Experiment["regime"], string> = {
  microgravity: "Microgravity",
  "partial-g": "Partial gravity",
  "normal-g": "Normal gravity",
};

const ENTRY_POINTS = [
  {
    to: "/explore",
    icon: Compass,
    title: "Explore the library",
    text: "Search experiments by fuel, facility, gravity regime and oxygen band.",
  },
  {
    to: "/rankings",
    icon: ListOrdered,
    title: "Rank for this scenario",
    text: "Adjust hazard, exploration, evidence and recency weights, then read the breakdown.",
  },
  {
    to: "/materials",
    icon: LayoutGrid,
    title: "Material risk matrix",
    text: "See which cabin materials carry the most risk at this gravity and oxygen level.",
  },
  {
    to: "/simulator",
    icon: SlidersHorizontal,
    title: "Run a what-if",
    text: "Change gravity, oxygen, pressure and flow to see the explained risk drivers.",
  },
  {
    to: "/playbook",
    icon: BookOpen,
    title: "Crew playbook",
    text: "Detect, isolate, suppress, ventilate, recover, with evidence behind each step.",
  },
  {
    to: "/brief",
    icon: FileText,
    title: "Mission safety brief",
    text: "Export a cited Markdown brief, copy it, or print it to PDF for the crew.",
  },
];

export function HomePage() {
  const { scenario, setDrawerOpen, bookmarks, toggleBookmark } = useIgnis();
  const experiments = getExperiments();
  const insights = useMemo(() => getInsights(scenario), [scenario]);
  const [pendingId, setPendingId] = useState("");

  const savedExperiments = experiments.filter((experiment) => bookmarks.includes(experiment.id));
  const unsavedExperiments = experiments.filter((experiment) => !bookmarks.includes(experiment.id));
  const pending = unsavedExperiments.find((experiment) => experiment.id === pendingId) ?? unsavedExperiments[0];

  function savePending(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) toggleBookmark(pending.id);
  }

  const topInsights = useMemo(
    () =>
      [...insights]
        .sort(
          (a, b) =>
            SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || b.confidence - a.confidence,
        )
        .slice(0, 3),
    [insights],
  );

  const verified = experiments.filter((experiment) => experiment.confidence === "verified").length;
  const evidenceLinks = new Set(insights.flatMap((insight) => insight.evidenceIds)).size;
  const sourceCount = experiments.reduce((total, experiment) => total + experiment.sources.length, 0);

  return (
    <div className="space-y-6">
      <OnboardingGuide scenarioLabel={scenario.label} onAsk={() => setDrawerOpen(true)} />

      <section className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <div className="flex flex-col justify-between rounded-panel border border-ig-line bg-ig-hull p-5 lg:p-6">
          <div>
            <p className="text-xs text-ig-muted">Mission overview</p>
            <h1 className="mt-1 max-w-xl text-2xl font-semibold leading-tight text-ig-frost sm:text-3xl">
              Fire behaves differently when nothing falls.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ig-muted">
              Ignis turns decades of <Term id="microgravity" /> combustion research into fire-safety
              answers for the Moon and Mars. Pick a scenario once and every ranking, risk, playbook
              and brief follows it.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge tone="gold">{scenario.label}</Badge>
              <span className="ig-num text-xs text-ig-muted">
                {scenario.gravityG.toFixed(2)}g · {scenario.o2Percent ?? "—"}% O2 ·{" "}
                {scenario.pressureKPa ? scenario.pressureKPa.toFixed(1) : "—"} kPa
              </span>
              {scenario.assumption ? (
                <span className="text-xs text-ig-amber">Assumed values, verify before use</span>
              ) : null}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              to="/explore"
              className="inline-flex h-10 items-center gap-2 rounded-control bg-ig-flame-blue px-4 text-sm font-medium text-ig-on-accent hover:bg-ig-amber"
            >
              Explore the evidence
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
            <Link
              to="/rankings"
              className="inline-flex h-10 items-center gap-2 rounded-control border border-ig-line px-4 text-sm font-medium text-ig-frost hover:bg-ig-raised"
            >
              See scenario rankings
            </Link>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-control px-3 text-sm font-medium text-ig-flame-blue hover:bg-ig-raised"
            >
              <Sparkles size={15} aria-hidden="true" />
              Ask Ignis
            </button>
          </div>
        </div>

        <FlameOrb gravityG={scenario.gravityG} scenarioLabel={scenario.label} />
      </section>

      <section aria-label="Dataset at a glance" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Experiments in library"
          value={experiments.length}
          hint="Records with sources attached"
        />
        <Stat
          label="Verified records"
          value={verified}
          hint="Retrieved from a cited NASA source"
        />
        <Stat
          label="Insights for this scenario"
          value={insights.length}
          hint="Each links to experiment evidence"
        />
        <Stat
          label="Evidence links"
          value={evidenceLinks}
          unit={`/ ${sourceCount} sources`}
          hint="Traceable, not invented"
        />
      </section>

      <section aria-labelledby="top-insights">
        <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="top-insights" className="text-base font-semibold text-ig-frost">
              Top insights for {scenario.label}
            </h2>
            <p className="mt-0.5 text-xs text-ig-muted">
              Sorted by severity, then confidence. The scenario bar reshuffles this list.
            </p>
          </div>
          <Link
            to="/insights"
            className="inline-flex items-center gap-1 text-xs text-ig-flame-blue hover:underline"
          >
            All insights <ArrowRight size={12} aria-hidden="true" />
          </Link>
        </div>

        {topInsights.length === 0 ? (
          <p className="rounded-panel border border-ig-line bg-ig-hull px-4 py-6 text-sm text-ig-muted">
            No insight is linked to this scenario yet. Check Coverage for the evidence gaps rather than
            assuming the scenario is safe.
          </p>
        ) : (
          <div className="grid gap-3 lg:grid-cols-3">
            {topInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} compact showActions={false} />
            ))}
          </div>
        )}
      </section>

      <section
        aria-labelledby="saved-experiments"
        className="rounded-panel border border-ig-line bg-ig-hull"
      >
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-ig-line px-4 py-3">
          <div className="min-w-0">
            <h2 id="saved-experiments" className="text-sm font-semibold text-ig-frost">
              Saved experiments
            </h2>
            <p className="mt-1 text-xs leading-5 text-ig-muted">
              Keep records you want to revisit or discuss with the crew. Saved items stay in this
              browser.
            </p>
          </div>
          <span className="ig-num text-xs text-ig-muted">{savedExperiments.length} saved</span>
        </header>

        <div className="space-y-3 p-4">
          {savedExperiments.length === 0 ? (
            <p className="text-sm leading-6 text-ig-muted">
              Nothing saved yet. Add an experiment below, or use the star beside a record in
              Explore to keep it here.
            </p>
          ) : (
            <ul className="divide-y divide-ig-line">
              {savedExperiments.map((experiment) => (
                <li
                  key={experiment.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-2 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ig-frost">
                      {experiment.acronym}{" "}
                      <span className="font-normal text-ig-muted">· {experiment.name}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-ig-muted">
                      {experiment.fuel} · {experiment.years[0]}
                      {experiment.years[1] ? `–${experiment.years[1]}` : ""} ·{" "}
                      {REGIME_LABEL[experiment.regime]}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/explore?selected=${experiment.id}`}
                      className="text-xs text-ig-flame-blue hover:underline"
                    >
                      Open
                    </Link>
                    <BookmarkButton
                      experimentId={experiment.id}
                      name={`${experiment.acronym} ${experiment.name}`}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}

          <form
            onSubmit={savePending}
            className="flex flex-wrap items-end gap-2 border-t border-ig-line pt-3"
          >
            <label className="min-w-0 flex-1">
              <span className="block text-xs text-ig-muted">Add an experiment</span>
              <select
                value={pending?.id ?? ""}
                onChange={(event) => setPendingId(event.target.value)}
                disabled={unsavedExperiments.length === 0}
                className="mt-1 h-9 w-full rounded-control border border-ig-line bg-ig-hull px-2 text-sm text-ig-frost disabled:opacity-50"
              >
                {unsavedExperiments.map((experiment) => (
                  <option key={experiment.id} value={experiment.id}>
                    {experiment.acronym} · {experiment.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              disabled={!pending}
              className="inline-flex h-9 items-center rounded-control bg-ig-flame-blue px-3 text-sm font-medium text-ig-on-accent hover:bg-ig-amber disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save experiment
            </button>
          </form>
        </div>
      </section>

      <section aria-labelledby="entry-points">
        <h2 id="entry-points" className="text-base font-semibold text-ig-frost">
          Go deeper
        </h2>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {ENTRY_POINTS.map((entry) => {
            const Icon = entry.icon;
            return (
              <Link
                key={entry.to}
                to={entry.to}
                className="group flex gap-3 rounded-panel border border-ig-line bg-ig-hull p-3 hover:bg-ig-raised"
              >
                <span className="mt-0.5 inline-flex text-ig-flame-blue" aria-hidden="true">
                  <Icon size={18} />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1 text-sm font-medium text-ig-frost">
                    {entry.title}
                    <ArrowRight
                      size={12}
                      aria-hidden="true"
                      className="text-ig-muted transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                  <span className="mt-0.5 block text-xs leading-5 text-ig-muted">{entry.text}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
