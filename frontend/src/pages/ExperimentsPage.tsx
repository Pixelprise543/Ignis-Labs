import { useCallback, useState } from 'react'
import { client } from '../api/client'
import type { ExperimentQuery } from '../api/types'
import { ExperimentCard } from '../components/ExperimentCard'
import { FilterBar } from '../components/FilterBar'
import { O2VsScoreChart } from '../components/charts/O2VsScoreChart'
import { ScoreByPlatformChart } from '../components/charts/ScoreByPlatformChart'
import { ErrorState } from '../components/ui/ErrorState'
import { Loading } from '../components/ui/Loading'
import { useApi } from '../hooks/useApi'

export function ExperimentsPage() {
  const [query, setQuery] = useState<ExperimentQuery>({ sort: 'relevance' })
  const fetcher = useCallback(() => client.listExperiments(query), [query])
  const { data, error, loading, reload } = useApi(fetcher, [query])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-100">Experiments</h1>
        <p className="mt-1 text-sm text-slate-400">
          Search and filter NASA microgravity combustion research.
        </p>
      </header>

      <FilterBar query={query} onChange={setQuery} />

      {loading ? <Loading /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}

      {data ? (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <ScoreByPlatformChart records={data} />
            <O2VsScoreChart records={data} />
          </div>
          <p className="text-xs text-slate-500">{data.length} record(s)</p>
          <div className="grid gap-4 lg:grid-cols-2">
            {data.map((record) => (
              <ExperimentCard key={record.id} record={record} />
            ))}
          </div>
          {data.length === 0 ? (
            <p className="text-sm text-slate-400">
              No experiments match those filters. Try clearing the search.
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
