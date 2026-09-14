import type { InputPattern } from '@/lib/simulation/presets'

export function PatternSelector({
  patterns,
  activeId,
  onSelect,
}: {
  patterns: InputPattern[]
  activeId: string
  onSelect: (id: string) => void
}) {
  const active = patterns.find((pattern) => pattern.id === activeId) ?? patterns[0]!
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6" aria-labelledby="pattern-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="pattern-heading" className="text-sm font-semibold text-zinc-950">Synthetic input pattern</h2>
        <span className="text-xs text-zinc-500">Changing patterns resets edits</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {patterns.map((pattern) => {
          const selected = pattern.id === activeId
          return (
            <button
              type="button"
              key={pattern.id}
              aria-pressed={selected}
              onClick={() => onSelect(pattern.id)}
              className={`rounded-full border px-3.5 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 ${selected ? 'border-indigo-700 bg-indigo-50 text-indigo-800' : 'border-zinc-300 text-zinc-700 hover:border-zinc-500'}`}
            >
              {pattern.name}
            </button>
          )
        })}
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">{active.summary}</p>
      <p className="mt-2 text-xs leading-5 text-zinc-500">These rules are deliberately artificial and are not estimated biological, lifestyle, or treatment effects.</p>
    </section>
  )
}

export function HorizonControl({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <label className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 rounded-2xl border border-zinc-200 bg-white px-4 py-4 sm:flex sm:px-6">
      <span className="text-sm font-medium text-zinc-700">Horizon</span>
      <input
        type="range"
        min={5}
        max={30}
        value={value}
        aria-label="Simulation horizon"
        onChange={(event) => onChange(Number(event.target.value))}
        className="col-span-2 h-2 w-full min-w-0 cursor-pointer accent-indigo-700 sm:col-span-1 sm:flex-1"
      />
      <span className="whitespace-nowrap text-right font-mono text-sm text-zinc-950 sm:w-16">{value} years</span>
    </label>
  )
}

export function YearScrubber({ value, horizon, onChange }: { value: number; horizon: number; onChange: (value: number) => void }) {
  return (
    <label className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 rounded-2xl border border-zinc-200 bg-white px-4 py-4 sm:flex sm:px-6">
      <span className="text-sm font-medium text-zinc-700">Inspect year</span>
      <input
        type="range"
        min={0}
        max={horizon}
        value={value}
        aria-label="Inspect year"
        onChange={(event) => onChange(Number(event.target.value))}
        className="col-span-2 h-2 w-full min-w-0 cursor-pointer accent-zinc-950 sm:col-span-1 sm:flex-1"
      />
      <span className="whitespace-nowrap text-right font-mono text-sm text-zinc-950 sm:w-12">{value}</span>
    </label>
  )
}
