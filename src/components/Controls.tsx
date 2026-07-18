'use client'

import type { Preset } from '@/lib/simulation/trajectory'

export function PresetSelector({
  presets,
  activeId,
  onSelect,
}: {
  presets: Preset[]
  activeId: string
  onSelect: (id: string) => void
}) {
  const active = presets.find((p) => p.id === activeId) ?? presets[0]!
  return (
    <div className="rounded-xl border border-[#E4E4E7] bg-white p-4 sm:p-6">
      <h2 className="mb-3 text-sm font-semibold text-[#18181B]">Scenario</h2>
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => {
          const isActive = p.id === activeId
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                isActive
                  ? 'border-[#6366F1] bg-[#EEF2FF] text-[#4338CA]'
                  : 'border-[#E4E4E7] bg-white text-[#71717A] hover:border-[#D4D4D8] hover:text-[#18181B]'
              }`}
            >
              {p.name}
            </button>
          )
        })}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-[#71717A]">{active.detail}</p>
      {active.caveat && (
        <p className="mt-2 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] px-3 py-2 text-xs leading-relaxed text-[#78350F]">
          <span className="font-semibold">Evidence caveat: </span>
          {active.caveat}
        </p>
      )}
    </div>
  )
}

export function HorizonControl({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-xs font-medium whitespace-nowrap text-[#71717A]">
        Horizon
      </label>
      <input
        type="range"
        min={5}
        max={30}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 flex-1 cursor-pointer accent-[#6366F1]"
        aria-label="Simulation horizon in years"
      />
      <span className="w-14 text-right font-mono text-xs text-[#18181B]">{value} yr</span>
    </div>
  )
}

export function YearScrubber({
  value,
  horizon,
  onChange,
}: {
  value: number
  horizon: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-xs font-medium whitespace-nowrap text-[#71717A]">
        Year
      </label>
      <input
        type="range"
        min={0}
        max={horizon}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 flex-1 cursor-pointer accent-[#18181B]"
        aria-label="Active checkpoint year"
      />
      <span className="w-14 text-right font-mono text-xs text-[#18181B]">yr {value}</span>
    </div>
  )
}
