'use client'

import { useMemo, useState } from 'react'
import { BIOMARKER_KEYS, INPUT_LIMITS, type BiomarkerKey } from '@/types/biomarkers'
import type { BiomarkerEdits, Checkpoint } from '@/lib/simulation/trajectory'

type Draft = Record<BiomarkerKey, string>

function makeDraft(checkpoint: Checkpoint): Draft {
  return Object.fromEntries(
    BIOMARKER_KEYS.map((key) => [key, String(Math.round(checkpoint.state[key] * 100) / 100)]),
  ) as Draft
}

export function BiomarkerEditor({
  checkpoint,
  hasEdits,
  onEdit,
  onReset,
}: {
  checkpoint: Checkpoint
  hasEdits: boolean
  onEdit: (edits: BiomarkerEdits) => void
  onReset: () => void
}) {
  const [draft, setDraft] = useState<Draft>(() => makeDraft(checkpoint))
  const [submitted, setSubmitted] = useState(false)

  const errors = useMemo(() => {
    const result = {} as Partial<Record<BiomarkerKey, string>>
    for (const key of BIOMARKER_KEYS) {
      const limits = INPUT_LIMITS[key]
      const raw = draft[key].trim()
      const value = Number(raw)
      if (!raw || !Number.isFinite(value)) {
        result[key] = 'Enter a number.'
      } else if (value < limits.min || value > limits.max) {
        result[key] = `Use ${limits.min}–${limits.max} ${limits.unit}.`
      }
    }
    return result
  }, [draft])

  const dirty = BIOMARKER_KEYS.some(
    (key) => Number(draft[key]) !== Math.round(checkpoint.state[key] * 100) / 100,
  )

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6" aria-labelledby="editor-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="editor-heading" className="text-sm font-semibold text-zinc-950">Edit synthetic values at year {checkpoint.yearIndex}</h2>
        {hasEdits && (
          <button type="button" onClick={onReset} className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs text-zinc-700 hover:border-zinc-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700">
            Reset all edits
          </button>
        )}
      </div>
      <p className="mt-2 text-xs leading-5 text-zinc-500">Apply a complete valid set for this year. Later years continue from it using the selected artificial pattern.</p>

      <form
        className="mt-4"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          setSubmitted(true)
          if (Object.keys(errors).length > 0) return
          onEdit(Object.fromEntries(BIOMARKER_KEYS.map((key) => [key, Number(draft[key])])) as BiomarkerEdits)
          setSubmitted(false)
        }}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {BIOMARKER_KEYS.map((key) => {
            const field = INPUT_LIMITS[key]
            const errorId = `${key}-error`
            return (
              <label key={key} className="grid gap-1 text-xs text-zinc-700">
                <span>{field.label} <span className="text-zinc-500">({field.unit})</span></span>
                <input
                  type="number"
                  aria-label={`${field.label} (${field.unit})`}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={draft[key]}
                  aria-invalid={submitted && Boolean(errors[key])}
                  aria-describedby={submitted && errors[key] ? errorId : undefined}
                  onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))}
                  className="rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm text-zinc-950 outline-none focus:border-indigo-700 focus:ring-2 focus:ring-indigo-100"
                />
                {submitted && errors[key] && <span id={errorId} className="text-red-700">{errors[key]}</span>}
              </label>
            )
          })}
        </div>
        <button
          type="submit"
          disabled={!dirty}
          className="mt-4 rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700"
        >
          Apply values from year {checkpoint.yearIndex}
        </button>
      </form>
      <p className="mt-3 text-xs leading-5 text-zinc-500">Input limits are broad software guardrails, not laboratory reference intervals.</p>
    </section>
  )
}
