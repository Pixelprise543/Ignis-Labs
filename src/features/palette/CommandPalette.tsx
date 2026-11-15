import { useIgnis } from "@/store/useIgnis";
import { Button } from "@/design-system";

export function CommandPalette() {
  const { paletteOpen, setPaletteOpen } = useIgnis();

  if (!paletteOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setPaletteOpen(false)}
      />
      {/* Palette panel */}
      <div className="relative w-full max-w-md ig-glass p-6 border border-ig-line">
        <h2 className="text-lg font-semibold text-ig-frost mb-4">Command palette</h2>
        <p className="text-xs text-ig-muted mb-6">
          Press <kbd className="px-1.5 py-0.5 rounded border border-ig-line text-ig-frost">⌘K</kbd> or{" "}
          <kbd className="px-1.5 py-0.5 rounded border border-ig-line text-ig-frost">Ctrl+K</kbd> to open.
        </p>
        <div className="space-y-2">
          <Button variant="outline" size="sm" fullWidth onClick={() => setPaletteOpen(false)}>
            Explore experiments
          </Button>
          <Button variant="outline" size="sm" fullWidth onClick={() => setPaletteOpen(false)}>
            View rankings
          </Button>
          <Button variant="outline" size="sm" fullWidth onClick={() => setPaletteOpen(false)}>
            Open simulator
          </Button>
          <Button variant="outline" size="sm" fullWidth onClick={() => setPaletteOpen(false)}>
            Ask Ignis
          </Button>
          <Button variant="outline" size="sm" fullWidth onClick={() => setPaletteOpen(false)}>
            Generate brief
          </Button>
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => setPaletteOpen(false)}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
