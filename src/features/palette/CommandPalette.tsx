import { Command } from "cmdk";
import { HelpCircle, Sparkles, Star } from "lucide-react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SCENARIOS, getExperiments, useIgnis } from "@/app/data";
import { ROUTES } from "@/app/nav";
import { useDialogFocus } from "@/app/useDialogFocus";
import { showOnboarding } from "@/features/home/onboarding";

/**
 * Ctrl/Cmd+K palette. Reads the same route table as the rail so the two can
 * never disagree about what pages exist. Focus is trapped and restored by the
 * shared dialog hook, and saved experiments are reachable without opening the
 * Explore page.
 */
export function CommandPalette() {
  const { paletteOpen, setPaletteOpen, setScenario, setDrawerOpen, bookmarks, select } = useIgnis();
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const savedExperiments = getExperiments().filter((experiment) =>
    bookmarks.includes(experiment.id),
  );

  useDialogFocus(paletteOpen, close, dialogRef);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(!paletteOpen);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [paletteOpen, setPaletteOpen]);

  if (!paletteOpen) return null;

  function close() {
    setPaletteOpen(false);
  }

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-50 flex items-start justify-center px-3 pt-[10vh]"
    >
      <div aria-hidden="true" className="absolute inset-0 bg-ig-vacuum/80" onClick={close} />
      <Command
        label="Command palette"
        className="ig-cmd relative w-full max-w-[560px] overflow-hidden rounded-panel border border-ig-line bg-ig-hull"
      >
        <Command.Input
          placeholder="Jump to a view, switch scenario, or ask Ignis"
          className="h-11 w-full border-b border-ig-line bg-transparent px-3 text-sm text-ig-frost placeholder:text-ig-muted"
        />
        <Command.List className="max-h-[55vh] overflow-y-auto p-1.5">
          <Command.Empty className="px-3 py-6 text-center text-sm text-ig-muted">
            No match. Try “rankings”, “Mars” or “brief”.
          </Command.Empty>

          <Command.Group heading="Views">
            {ROUTES.map((route) => {
              const Icon = route.icon;
              return (
                <Command.Item
                  key={route.path}
                  value={`${route.label} ${route.path} view`}
                  onSelect={() => {
                    navigate(route.path);
                    close();
                  }}
                >
                  <Icon size={15} aria-hidden="true" />
                  <span>{route.label}</span>
                </Command.Item>
              );
            })}
          </Command.Group>

          <Command.Separator />

          <Command.Group heading="Scenario">
            {SCENARIOS.map((scenario) => (
              <Command.Item
                key={scenario.id}
                value={`${scenario.label} scenario gravity`}
                onSelect={() => {
                  setScenario(scenario);
                  close();
                }}
              >
                <span className="ig-num w-12 text-xs text-ig-muted">
                  {scenario.gravityG.toFixed(2)}g
                </span>
                <span>{scenario.label}</span>
              </Command.Item>
            ))}
          </Command.Group>

          {savedExperiments.length > 0 ? (
            <>
              <Command.Separator />
              <Command.Group heading="Saved experiments">
                {savedExperiments.map((experiment) => (
                  <Command.Item
                    key={experiment.id}
                    value={`saved ${experiment.acronym} ${experiment.name}`}
                    onSelect={() => {
                      select(experiment.id);
                      navigate(`/explore?selected=${experiment.id}`);
                      close();
                    }}
                  >
                    <Star
                      size={15}
                      aria-hidden="true"
                      className="text-ig-amber"
                      fill="currentColor"
                    />
                    <span>{experiment.acronym}</span>
                    <span className="truncate text-xs text-ig-muted">{experiment.name}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            </>
          ) : null}

          <Command.Separator />

          <Command.Group heading="Actions">
            <Command.Item
              value="ask ignis assistant question"
              onSelect={() => {
                close();
                setDrawerOpen(true);
              }}
            >
              <Sparkles size={15} aria-hidden="true" />
              <span>Ask Ignis</span>
            </Command.Item>
            <Command.Item
              value="show start here guide onboarding help"
              onSelect={() => {
                close();
                navigate("/");
                showOnboarding();
              }}
            >
              <HelpCircle size={15} aria-hidden="true" />
              <span>Show the start-here guide</span>
            </Command.Item>
          </Command.Group>
        </Command.List>
        <div className="flex items-center justify-between gap-2 border-t border-ig-line px-3 py-2 text-[11px] text-ig-muted">
          <span>Enter to open</span>
          <span className="inline-flex items-center gap-1">
            <kbd className="rounded-control border border-ig-line px-1">Esc</kbd> to close
          </span>
        </div>
      </Command>
    </div>
  );
}
