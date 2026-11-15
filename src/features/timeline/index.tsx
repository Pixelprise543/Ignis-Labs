import { getTimeline } from "@/lib/data";

export function TimelinePage() {
  const events = getTimeline();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-ig-frost">Research timeline</h2>
        <p className="text-sm text-ig-muted">
          Decades of microgravity combustion research, one event per start year.
          Milestone years open a new investigation family.
        </p>
      </div>

      <div className="relative ml-4 border-l border-ig-line/50">
        {events.map((event) => (
          <div key={event.year} className="relative mb-8 pl-8">
            <div className="absolute -left-[9px] top-2 w-3 h-3 rounded-full border border-ig-flame-blue bg-black/60" />
            {event.milestone && (
              <div className="absolute -left-[11px] top-0 w-7 h-7 rounded-full border-2 border-ig-amber bg-black flex items-center justify-center text-[10px] font-bold text-black">
                ★
              </div>
            )}
            <div className="flex items-start gap-3">
              <span className="text-xs font-mono text-ig-amber font-bold">{event.year}</span>
              <div className="ig-glass flex-1 border border-ig-line p-4">
                <h3 className="font-semibold text-ig-frost">{event.title}</h3>
                <p className="mt-1 text-sm text-ig-muted">{event.summary}</p>
                <div className="mt-3 flex gap-2 flex-wrap">
                  {event.experimentIds.map((id) => (
                    <span
                      key={id}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 border border-ig-line text-xs text-ig-muted"
                    >
                      {id}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
