import { useState } from 'react'

export function AskPanel({
  onSubmit,
  disabled,
  placeholder = 'What does this imply for cabin fire response?',
}: {
  onSubmit: (question: string) => void
  disabled?: boolean
  placeholder?: string
}) {
  const [question, setQuestion] = useState('')

  return (
    <form
      className="card"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit(question)
      }}
    >
      <label className="block text-xs text-slate-400">
        Ask the data
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={placeholder}
          rows={3}
          className="mt-1 w-full resize-y rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-ember-500/60"
        />
      </label>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="submit"
          disabled={disabled}
          className="rounded-lg bg-ember-600 px-4 py-2 text-sm font-medium text-white hover:bg-ember-500 disabled:opacity-40"
        >
          Generate insight
        </button>
        <span className="text-xs text-slate-500">
          Grounded: answers cite only the selected experiment ids.
        </span>
      </div>
    </form>
  )
}
