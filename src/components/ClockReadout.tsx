import type { Checkpoint } from '@/lib/simulation/trajectory'

export function ClockReadout({ baseline, edited }: { baseline: Checkpoint; edited: Checkpoint }) {
  const delta = edited.phenotypicAge - baseline.phenotypicAge
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6" aria-labelledby="readout-heading">
      <h2 id="readout-heading" className="text-sm font-semibold text-zinc-950">At year {baseline.yearIndex}</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Metric label="Chronological age" value={baseline.chronologicalAge} color="text-zinc-600" />
        <Metric label="Baseline Phenotypic Age" value={baseline.phenotypicAge} color="text-indigo-800" />
        <Metric label="Edited Phenotypic Age" value={edited.phenotypicAge} color="text-emerald-800" />
      </div>
      <p className="mt-5 border-t border-zinc-100 pt-4 text-sm text-zinc-600">
        Edited minus baseline: <span className="font-mono font-semibold text-zinc-950">{delta >= 0 ? '+' : ''}{delta.toFixed(1)} years</span>
      </p>
      <p className="mt-1 text-xs leading-5 text-zinc-500">This difference is a formula response to synthetic inputs, not an individualized forecast or causal effect.</p>
    </section>
  )
}

function Metric({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <p className="min-h-9 text-xs leading-5 text-zinc-500">{label}</p>
      <p className={`font-serif text-3xl italic ${color}`}>{value.toFixed(1)}</p>
    </div>
  )
}
