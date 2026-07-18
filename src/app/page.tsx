'use client'

import { useState, useMemo, useEffect } from 'react'
import { PRESETS, DEFAULT_PRESET_ID, getPreset } from '@/lib/simulation/presets'
import {
  generateTrajectory,
  applyOverride,
  type Trajectory,
  type EditableKey,
} from '@/lib/simulation/trajectory'
import { annotateDivergence } from '@/lib/simulation/divergence'
import { TrajectoryChart } from '@/components/TrajectoryChart'
import { PresetSelector, HorizonControl, YearScrubber } from '@/components/Controls'
import { ClockReadout } from '@/components/ClockReadout'
import { BiomarkerEditor } from '@/components/BiomarkerEditor'
import { MethodologyPanel } from '@/components/MethodologyPanel'

const DEFAULT_HORIZON = 10

export default function Page() {
  const [presetId, setPresetId] = useState(DEFAULT_PRESET_ID)
  const [horizon, setHorizon] = useState(DEFAULT_HORIZON)
  const [activeYear, setActiveYear] = useState(0)
  const [trajectory, setTrajectory] = useState<Trajectory>(() =>
    generateTrajectory(getPreset(DEFAULT_PRESET_ID), DEFAULT_HORIZON),
  )

  const preset = getPreset(presetId)

  // Regenerate a fresh (unbranched) trajectory whenever the scenario or horizon changes.
  useEffect(() => {
    setTrajectory(generateTrajectory(getPreset(presetId), horizon))
  }, [presetId, horizon])

  // Keep the active year within the current horizon.
  useEffect(() => {
    setActiveYear((y) => Math.min(y, horizon))
  }, [horizon])

  const annotation = useMemo(
    () => annotateDivergence(trajectory.checkpoints),
    [trajectory],
  )

  const activeCheckpoint =
    trajectory.checkpoints[Math.min(activeYear, trajectory.checkpoints.length - 1)] ??
    trajectory.checkpoints[0]!

  const handleEdit = (edits: Partial<Record<EditableKey, number>>) =>
    setTrajectory((t) => applyOverride(t, preset, activeYear, edits))

  const handleReset = () => setTrajectory(generateTrajectory(preset, horizon))

  return (
    <main className="mx-auto max-w-[1000px] space-y-5 px-4 py-8 sm:px-6">
      <header className="space-y-2">
        <h1 className="font-serif text-4xl italic text-[#18181B] sm:text-5xl">
          AgingTrajectory
        </h1>
        <p className="max-w-[640px] text-sm leading-relaxed text-[#71717A]">
          Watch a synthetic patient age year by year and see how{' '}
          <span className="font-medium text-[#16A34A]">PhenoAge</span> and an{' '}
          <span className="font-medium text-[#6366F1]">illustrative GrimAge proxy</span> diverge from
          each other and from chronological age under different life scenarios.
        </p>
        <p className="inline-block rounded-full bg-[#FEF2F2] px-3 py-1 text-[0.7rem] font-medium text-[#991B1B]">
          Synthetic pedagogical simulator — not a diagnostic tool
        </p>
      </header>

      <PresetSelector presets={PRESETS} activeId={presetId} onSelect={setPresetId} />

      <div className="rounded-xl border border-[#E4E4E7] bg-white px-4 py-4 sm:px-6">
        <HorizonControl value={horizon} onChange={setHorizon} />
      </div>

      <TrajectoryChart
        checkpoints={trajectory.checkpoints}
        annotation={annotation}
        activeYear={activeYear}
        branchYear={trajectory.branchYear}
        onSelectYear={setActiveYear}
      />

      <div className="rounded-xl border border-[#E4E4E7] bg-white px-4 py-4 sm:px-6">
        <YearScrubber value={activeYear} horizon={horizon} onChange={setActiveYear} />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <ClockReadout checkpoint={activeCheckpoint} />
        <BiomarkerEditor
          checkpoint={activeCheckpoint}
          branched={trajectory.branched}
          onEdit={handleEdit}
          onReset={handleReset}
        />
      </div>

      <MethodologyPanel />

      <footer className="pt-2 pb-6 text-center text-xs text-[#A1A1AA]">
        Part of the longevity ecosystem · LabAge · HallmarksExplorer · AgingClockBench
      </footer>
    </main>
  )
}
