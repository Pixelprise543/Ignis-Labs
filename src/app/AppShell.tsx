import { Outlet } from "react-router-dom";
import { useIgnis } from "@/store/useIgnis";
import { Button } from "@/design-system";
import { Badge } from "@/design-system";
import { Drawer } from "@/design-system";
import { AskIgnisDrawer } from "@/features/assistant";
import { CommandPalette } from "@/features/palette";

export function AppShell() {
  const { scenario, setScenario, drawerOpen, setDrawerOpen, setPaletteOpen } = useIgnis();

  const SCENARIOS = [
    { id: "iss", label: "ISS 0g" },
    { id: "lunar", label: "Lunar 0.16g" },
    { id: "mars", label: "Mars 0.38g" },
    { id: "eva", label: "EVA suit" },
    { id: "custom", label: "Custom" },
  ];

  return (
    <div className="relative flex flex-col h-screen">
      <div className="ig-bg" />
      <header className="ig-glass z-20 flex items-center justify-between px-4 py-3 border-b border-ig-line">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-ig-frost tracking-tight">Ignis</span>
          <nav className="hidden md:flex items-center gap-6 text-sm text-ig-muted">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => setScenario(s.id as any)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  scenario.id === s.id
                    ? "bg-ig-raised text-ig-frost border border-ig-line"
                    : "hover:bg-ig-raised hover:text-ig-frost"
                }`}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="verified" size="sm">
            Scenario: {scenario.label}
          </Badge>
          <Button variant="ghost" size="sm" onClick={() => setDrawerOpen(true)}>
            Ask Ignis
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setPaletteOpen(true)}>
            Cmd+K
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        <Outlet context={{ scenario }} />
      </main>
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} side="right" title="Ask Ignis">
        <AskIgnisDrawer />
      </Drawer>
      <CommandPalette />
    </div>
  );
}
