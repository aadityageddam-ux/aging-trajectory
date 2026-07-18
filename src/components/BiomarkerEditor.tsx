'use client'

import type { Checkpoint, EditableKey } from '@/lib/simulation/trajectory'

const FIELDS: { key: EditableKey; label: string; unit: string; step: number }[] = [
  { key: 'packYears', label: 'Pack-years', unit: 'pk-yr', step: 1 },
  { key: 'albumin', label: 'Albumin', unit: 'g/dL', step: 0.1 },
  { key: 'creatinine', label: 'Creatinine', unit: 'mg/dL', step: 0.05 },
  { key: 'glucose', label: 'Glucose', unit: 'mg/dL', step: 1 },
  { key: 'crp', label: 'CRP', unit: 'mg/L', step: 0.1 },
  { key: 'lymphocytePct', label: 'Lymphocyte', unit: '%', step: 0.5 },
  { key: 'mcv', label: 'MCV', unit: 'fL', step: 0.5 },
  { key: 'rdw', label: 'RDW', unit: '%', step: 0.1 },
  { key: 'alp', label: 'ALP', unit: 'U/L', step: 1 },
  { key: 'wbc', label: 'WBC', unit: 'K/µL', step: 0.1 },
]

export function BiomarkerEditor({
  checkpoint,
  branched,
  onEdit,
  onReset,
}: {
  checkpoint: Checkpoint
  branched: boolean
  onEdit: (edits: Partial<Record<EditableKey, number>>) => void
  onReset: () => void
}) {
  const s = checkpoint.state as unknown as Record<EditableKey, number>

  return (
    <div className="rounded-xl border border-[#E4E4E7] bg-white p-4 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-[#18181B]">
          Edit year {checkpoint.yearIndex}
        </h2>
        <div className="flex items-center gap-2">
          {branched && (
            <span className="rounded-full bg-[#E0F2FE] px-2.5 py-0.5 text-[0.7rem] font-medium text-[#0369A1]">
              branched
            </span>
          )}
          {branched && (
            <button
              onClick={onReset}
              className="rounded-full border border-[#E4E4E7] px-2.5 py-0.5 text-[0.7rem] text-[#71717A] transition-colors hover:text-[#18181B]"
            >
              reset to preset
            </button>
          )}
        </div>
      </div>

      <p className="mb-4 text-xs leading-relaxed text-[#71717A]">
        Change any value to branch the trajectory: this year becomes the new baseline and later
        years re-drift from it. Values are in US lab units.
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <label key={f.key} className="flex flex-col gap-1">
            <span className="text-[0.7rem] text-[#71717A]">
              {f.label} <span className="text-[#A1A1AA]">({f.unit})</span>
            </span>
            <input
              type="number"
              step={f.step}
              value={round(s[f.key])}
              onChange={(e) => {
                const v = Number(e.target.value)
                if (isFinite(v)) onEdit({ [f.key]: v })
              }}
              className="w-full rounded-md border border-[#E4E4E7] px-2.5 py-1.5 font-mono text-sm text-[#18181B] outline-none focus:border-[#6366F1]"
            />
          </label>
        ))}
      </div>
    </div>
  )
}

function round(n: number) {
  return Math.round(n * 100) / 100
}
