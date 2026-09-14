'use client'

import { useState } from 'react'
import { BiomarkerEditor } from '@/components/BiomarkerEditor'
import { ClockReadout } from '@/components/ClockReadout'
import { HorizonControl, PatternSelector, YearScrubber } from '@/components/Controls'
import { MethodologyPanel } from '@/components/MethodologyPanel'
import { TrajectoryChart } from '@/components/TrajectoryChart'
import { DEFAULT_PATTERN_ID, getInputPattern, INPUT_PATTERNS } from '@/lib/simulation/presets'
import { applyOverride, generateTrajectory, resizeTrajectory } from '@/lib/simulation/trajectory'

const DEFAULT_HORIZON = 10

export default function Page() {
  const [patternId, setPatternId] = useState(DEFAULT_PATTERN_ID)
  const [activeYear, setActiveYear] = useState(0)
  const [trajectory, setTrajectory] = useState(() => generateTrajectory(getInputPattern(DEFAULT_PATTERN_ID), DEFAULT_HORIZON))
  const pattern = getInputPattern(patternId)
  const baseline = trajectory.baseline[activeYear] ?? trajectory.baseline[0]!
  const edited = trajectory.edited[activeYear] ?? trajectory.edited[0]!

  return (
    <main className="mx-auto max-w-[1080px] space-y-5 px-4 py-8 sm:px-6 sm:py-12">
      <header className="max-w-3xl space-y-3">
        <p className="font-mono text-xs tracking-widest text-indigo-800 uppercase">Educational sensitivity analysis</p>
        <h1 className="font-serif text-4xl leading-tight text-zinc-950 sm:text-6xl">See how synthetic inputs move clinical Phenotypic Age</h1>
        <p className="text-base leading-7 text-zinc-600">Compare an unedited synthetic trajectory with the same trajectory after changing its biomarker values. The output demonstrates formula behavior; it does not forecast a person’s aging.</p>
        <p className="inline-flex rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-900 ring-1 ring-amber-200">Synthetic inputs · educational use · not medical guidance</p>
      </header>

      <PatternSelector
        patterns={INPUT_PATTERNS}
        activeId={patternId}
        onSelect={(id) => {
          const nextPattern = getInputPattern(id)
          setPatternId(id)
          setActiveYear(0)
          setTrajectory(generateTrajectory(nextPattern, trajectory.horizon))
        }}
      />
      <HorizonControl
        value={trajectory.horizon}
        onChange={(horizon) => {
          setActiveYear((year) => Math.min(year, horizon))
          setTrajectory((current) => resizeTrajectory(current, pattern, horizon))
        }}
      />
      <TrajectoryChart baseline={trajectory.baseline} edited={trajectory.edited} activeYear={activeYear} branchYear={trajectory.branchYear} onSelectYear={setActiveYear} />
      <YearScrubber value={activeYear} horizon={trajectory.horizon} onChange={setActiveYear} />
      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <ClockReadout baseline={baseline} edited={edited} />
        <BiomarkerEditor
          key={`${patternId}-${activeYear}-${Object.keys(trajectory.edits).length}`}
          checkpoint={edited}
          hasEdits={Object.keys(trajectory.edits).length > 0}
          onEdit={(edits) => setTrajectory((current) => applyOverride(current, pattern, activeYear, edits))}
          onReset={() => setTrajectory(generateTrajectory(pattern, trajectory.horizon))}
        />
      </div>
      <MethodologyPanel />
      <footer className="pb-4 pt-2 text-center text-xs leading-5 text-zinc-500">Clinical Phenotypic Age sensitivity simulator · content reviewed September 2026</footer>
    </main>
  )
}
