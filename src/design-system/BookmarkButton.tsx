import { clsx } from "clsx";
import { Star } from "lucide-react";
import { useIgnis } from "@/app/data";

export interface BookmarkButtonProps {
  experimentId: string;
  /** Human name used in the accessible label, e.g. "SAFFIRE-IV". */
  name?: string;
  className?: string;
}

/**
 * Star toggle for the saved-experiments list. It is a real toggle button
 * (`aria-pressed`) so screen readers announce the state, and the fill is paired
 * with the label rather than carrying the meaning on its own.
 */
export function BookmarkButton({ experimentId, name, className }: BookmarkButtonProps) {
  const { bookmarks, toggleBookmark } = useIgnis();
  const saved = bookmarks.includes(experimentId);
  const label = name ?? experimentId;

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={
        saved ? `Remove ${label} from saved experiments` : `Save ${label} to saved experiments`
      }
      title={saved ? "Remove from saved" : "Save experiment"}
      onClick={() => toggleBookmark(experimentId)}
      className={clsx(
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-control border transition-colors",
        saved
          ? "border-ig-amber bg-ig-raised text-ig-amber"
          : "border-ig-line text-ig-muted hover:bg-ig-raised hover:text-ig-frost",
        className,
      )}
    >
      <Star size={15} aria-hidden="true" fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
