import { useCallback, useState } from 'react'
import { X, Sparkles, MessageSquare, Copy, Flame } from 'lucide-react'
import { client } from '../../../api/client'
import type { InsightResponse } from '../../../api/types'
import { useApi } from '../../../hooks/useApi'
import { CitationChip } from '../../../design-system/components/data-display/CitationChip'
import { ErrorState } from '../../../design-system/components/ui/ErrorState'
import { Loading } from '../../../design-system/components/ui/Loading'

interface AskIgnisDrawerProps {
  open: boolean
  onClose: () => void
}

export function AskIgnisDrawer({ open, onClose }: AskIgnisDrawerProps) {
  const [question, setQuestion] = useState('')
  const [conversation, setConversation] = useState<{
    id: string
    question: string
    answer: InsightResponse
    timestamp: number
  }[]>([])
  const [selectedExperimentIds, setSelectedExperimentIds] = useState<string[]>([])

  const fetcher = useCallback(() => {
    if (!selectedExperimentIds.length || !question.trim()) return Promise.resolve(null)
    return client.insights({
      experiment_ids: selectedExperimentIds,
      question: question.trim(),
    })
  }, [selectedExperimentIds, question])

  const { error, loading, reload } = useApi(fetcher, [selectedExperimentIds, question])

  const toggleExperiment = (id: string) => {
    setSelectedExperimentIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )
  }

  const ask = async () => {
    if (!selectedExperimentIds.length || !question.trim()) return
    const result = await fetcher()
    if (result) {
      setConversation((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          question: question.trim(),
          answer: result,
          timestamp: Date.now(),
        },
      ])
      setQuestion('')
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-void-950 border-l border-white/10 shadow-2xl flex flex-col transform transition-transform duration-300 sm:translate-x-0 translate-x-full"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-white/10 bg-void-900/95 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-ember-500/10 flex items-center justify-center">
              <Sparkles size={16} className="text-ember-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ember-300">
                Ask Ignis
              </p>
              <p className="text-[10px] text-slate-500">
                Research assistant · {selectedExperimentIds.length} experiment(s) selected
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Close Ask Ignis"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Conversation messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {conversation.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <MessageSquare size={32} className="mx-auto mb-3 opacity-50" aria-hidden="true" />
              <p className="text-sm">No conversation yet.</p>
              <p className="text-xs mt-1 text-slate-600">
                Select experiments, then ask a question about them.
              </p>
            </div>
          )}

          {conversation.map((turn) => (
            <div key={turn.id} className="space-y-3">
              {/* User question */}
              <div className="flex flex-col gap-2">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  You
                </div>
                <div className="rounded-xl bg-void-800 p-4 border border-white/5">
                  <p className="text-sm text-slate-200 whitespace-pre-wrap">{turn.question}</p>
                </div>
              </div>

              {/* Ignis answer */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-ember-500/10 flex items-center justify-center shrink-0">
                    <Flame size={14} className="text-ember-400" aria-hidden="true" />
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-ember-300">
                    Ignis
                  </div>
                </div>
                <div className="rounded-xl bg-void-900 p-4 border border-white/5">
                  <p className="text-sm text-slate-200 whitespace-pre-wrap">
                    {turn.answer.insight}
                  </p>
                  {turn.answer.citations.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                        Citations
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {turn.answer.citations.map((citation) => (
                          <CitationChip key={citation} id={citation} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-1 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Evidence-grounded
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(turn.answer.insight)}
                      className="flex items-center gap-1 hover:text-slate-200 transition-colors"
                      title="Copy answer"
                    >
                      <Copy size={12} aria-hidden="true" />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 p-4 text-slate-400">
              <Loading label="Generating insight…" />
            </div>
          )}

          {error && <ErrorState message={error} onRetry={reload} />}
        </div>

        {/* Input area */}
        <div className="border-t border-white/10 bg-void-900 p-4 shrink-0">
          <div className="space-y-4">
            {/* Experiment selection chips */}
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Context
              </span>
              {selectedExperimentIds.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No experiments selected</p>
              ) : (
                selectedExperimentIds.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleExperiment(id)}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-medium text-slate-300 hover:bg-white/10 hover:border-ember-500/50 transition-colors"
                  >
                    <span className="font-mono">{id}</span>
                    <X size={10} aria-hidden="true" />
                  </button>
                ))
              )}
            </div>

            {/* Question input */}
            <form
              onSubmit={(event) => {
                event.preventDefault()
                ask()
              }}
              className="space-y-2"
            >
              <div className="relative">
                <textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Ask a question about the selected experiments…"
                  rows={3}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-ember-500/60 resize-none"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  Grounded: answers cite only the selected experiment IDs.
                </span>
                <button
                  type="submit"
                  disabled={loading || !selectedExperimentIds.length || !question.trim()}
                  className="rounded-lg bg-ember-500 px-4 py-2 text-sm font-semibold text-white hover:bg-ember-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Generating…' : 'Ask Ignis'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
