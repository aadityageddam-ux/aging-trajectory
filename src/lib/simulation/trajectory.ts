import { computeClinicalPhenoAge } from '@/lib/computation/phenoage'
import type { BiomarkerKey, ClinicalPhenoAgeInput } from '@/types/biomarkers'
import { evolvePattern, type InputPattern } from './presets'

export type BiomarkerEdits = Partial<Record<BiomarkerKey, number>>

export interface Checkpoint {
  yearIndex: number
  state: ClinicalPhenoAgeInput
  chronologicalAge: number
  phenotypicAge: number
}

export interface Trajectory {
  patternId: string
  horizon: number
  baseline: Checkpoint[]
  edited: Checkpoint[]
  edits: Record<number, BiomarkerEdits>
  branchYear: number | null
}

function scoreState(state: ClinicalPhenoAgeInput, yearIndex: number): Checkpoint {
  const result = computeClinicalPhenoAge(state)
  return {
    yearIndex,
    state: { ...state },
    chronologicalAge: state.age,
    phenotypicAge: result.phenotypicAge,
  }
}

function applyEdits(state: ClinicalPhenoAgeInput, edits?: BiomarkerEdits) {
  return edits ? { ...state, ...edits } : state
}

export function generateTrajectory(
  pattern: InputPattern,
  horizon: number,
  edits: Record<number, BiomarkerEdits> = {},
): Trajectory {
  const baseline: Checkpoint[] = []
  const edited: Checkpoint[] = []
  let baselineState = { ...pattern.initial }
  let editedState = applyEdits({ ...pattern.initial }, edits[0])

  baseline.push(scoreState(baselineState, 0))
  edited.push(scoreState(editedState, 0))

  for (let year = 1; year <= horizon; year++) {
    baselineState = evolvePattern(baselineState, pattern)
    editedState = applyEdits(evolvePattern(editedState, pattern), edits[year])
    baseline.push(scoreState(baselineState, year))
    edited.push(scoreState(editedState, year))
  }

  const visibleEditYears = Object.keys(edits)
    .map(Number)
    .filter((year) => year <= horizon)

  return {
    patternId: pattern.id,
    horizon,
    baseline,
    edited,
    edits,
    branchYear: visibleEditYears.length ? Math.min(...visibleEditYears) : null,
  }
}

export function applyOverride(
  trajectory: Trajectory,
  pattern: InputPattern,
  yearIndex: number,
  values: BiomarkerEdits,
): Trajectory {
  if (!Number.isInteger(yearIndex) || yearIndex < 0 || yearIndex > trajectory.horizon) {
    throw new RangeError('Edited year is outside the visible trajectory.')
  }

  const edits = {
    ...trajectory.edits,
    [yearIndex]: { ...trajectory.edits[yearIndex], ...values },
  }
  return generateTrajectory(pattern, trajectory.horizon, edits)
}

export function resizeTrajectory(
  trajectory: Trajectory,
  pattern: InputPattern,
  horizon: number,
): Trajectory {
  return generateTrajectory(pattern, horizon, trajectory.edits)
}
