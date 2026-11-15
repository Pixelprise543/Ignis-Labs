import type { ExperimentQuery, Platform, SafetyTag } from '../api/types'
import { PLATFORMS, SAFETY_TAGS } from '../api/types'

export interface FilterBarProps {
  query: ExperimentQuery
  onChange: (next: ExperimentQuery) => void
}

const SORTS: NonNullable<ExperimentQuery['sort']>[] = ['relevance', 'year', 'title', 'id']

export function FilterBar({ query, onChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex-1 min-w-[14rem] text-xs text-slate-400">
        Search
        <input
          type="search"
          value={query.q ?? ''}
          onChange={(event) => onChange({ ...query, q: event.target.value || undefined })}
          placeholder="flame spread, PMMA, suppression…"
          className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-ember-500/60"
        />
      </label>

      <label className="text-xs text-slate-400">
        Platform
        <select
          value={query.platform ?? ''}
          onChange={(event) =>
            onChange({ ...query, platform: (event.target.value || undefined) as Platform | undefined })
          }
          className="mt-1 block rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100"
        >
          <option value="">All</option>
          {PLATFORMS.map((platform) => (
            <option key={platform} value={platform}>
              {platform}
            </option>
          ))}
        </select>
      </label>

      <label className="text-xs text-slate-400">
        Safety tag
        <select
          value={query.tag ?? ''}
          onChange={(event) =>
            onChange({ ...query, tag: (event.target.value || undefined) as SafetyTag | undefined })
          }
          className="mt-1 block rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100"
        >
          <option value="">All</option>
          {SAFETY_TAGS.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </label>

      <label className="text-xs text-slate-400">
        Sort
        <select
          value={query.sort ?? 'relevance'}
          onChange={(event) =>
            onChange({ ...query, sort: event.target.value as NonNullable<ExperimentQuery['sort']> })
          }
          className="mt-1 block rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100"
        >
          {SORTS.map((sort) => (
            <option key={sort} value={sort}>
              {sort}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
