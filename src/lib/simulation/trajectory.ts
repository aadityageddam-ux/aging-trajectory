/**
 * Trajectory engine: evolve a synthetic patient's biomarkers year by year and score
 * PhenoAge + the illustrative GrimAge proxy at each annual checkpoint.
 */

import type { BiomarkerInput } from '@/types/biomarkers'
import { computePhenoAge } from '@/lib/computation/phenoage'
import { computeGrimAgeProxy, type GrimAgeProxyResult } from './grimage-proxy'

/** Full biomarker + demographic state at one checkpoint (all US units; all 9 markers present). */
export interface PatientState {
  age: number
  sex: 'male' | 'female'
  /** Cumulative smoking pack-years */
  packYears: number
  albumin: number
  creatinine: number
  glucose: number
  crp: number
  lymphocytePct: number
  mcv: number
  rdw: number
  alp: number
  wbc: number
}

/** The 9 editable biomarker keys plus pack-years (things the manual editor can change). */
export const EDITABLE_KEYS = [
  'albumin',
  'creatinine',
  'glucose',
  'crp',
  'lymphocytePct',
  'mcv',
  'rdw',
  'alp',
  'wbc',
  'packYears',
] as const
export type EditableKey = (typeof EDITABLE_KEYS)[number]

export interface Preset {
  id: string
  name: string
  /** One-line description shown in the selector */
  blurb: string
  /** Longer scenario description for the info area */
  detail: string
  /** Optional scientific caveat (e.g. rapamycin evidence is preliminary/contested) */
  caveat?: string
  /** Year-0 state */
  initial: PatientState
  /**
   * Evolve one year forward. Given the previous year's state and the absolute index
   * of the year being produced (1..horizon), return the next state. Deterministic.
   */
  step: (prev: PatientState, yearIndex: number) => PatientState
}

export interface Checkpoint {
  /** 0..horizon */
  yearIndex: number
  state: PatientState
  chronologicalAge: number
  phenoAge: number
  grimProxyAge: number
  grim: GrimAgeProxyResult
  /** True if this checkpoint lies at or after a user branch point */
  branched: boolean
}

export interface Trajectory {
  presetId: string
  horizon: number
  checkpoints: Checkpoint[]
  branched: boolean
  /** Earliest year the user edited, or null if unbranched */
  branchYear: number | null
}

const round1 = (n: number) => Math.round(n * 10) / 10

/** Convert a PatientState into the PhenoAge input shape. */
function toBiomarkerInput(s: PatientState): BiomarkerInput {
  return {
    age: s.age,
    sex: s.sex,
    albumin: s.albumin,
    creatinine: s.creatinine,
    glucose: s.glucose,
    crp: s.crp,
    lymphocytePct: s.lymphocytePct,
    mcv: s.mcv,
    rdw: s.rdw,
    alp: s.alp,
    wbc: s.wbc,
  }
}

/** Score both clocks for a given state. */
function scoreState(state: PatientState, yearIndex: number, branched: boolean): Checkpoint {
  const pheno = computePhenoAge(toBiomarkerInput(state))
  const grim = computeGrimAgeProxy({
    age: state.age,
    sex: state.sex,
    packYears: state.packYears,
    crp: state.crp,
  })
  return {
    yearIndex,
    state,
    chronologicalAge: state.age,
    phenoAge: round1(pheno.biologicalAge),
    grimProxyAge: grim.proxyAge,
    grim,
    branched,
  }
}

/**
 * Generate a full trajectory from a preset over `horizon` years (annual checkpoints,
 * years 0..horizon).
 */
export function generateTrajectory(preset: Preset, horizon: number): Trajectory {
  const checkpoints: Checkpoint[] = []
  let state = preset.initial
  checkpoints.push(scoreState(state, 0, false))

  for (let y = 1; y <= horizon; y++) {
    state = preset.step(state, y)
    checkpoints.push(scoreState(state, y, false))
  }

  return { presetId: preset.id, horizon, checkpoints, branched: false, branchYear: null }
}

/**
 * Apply a manual override at a checkpoint year: the edited values become the new
 * baseline at that year, and the preset's per-year evolution continues forward from
 * the edited state. Years before the edit are untouched. The trajectory is flagged
 * "branched" from the earliest edited year onward.
 */
export function applyOverride(
  trajectory: Trajectory,
  preset: Preset,
  yearIndex: number,
  edits: Partial<Record<EditableKey, number>>,
): Trajectory {
  if (yearIndex < 0 || yearIndex > trajectory.horizon) return trajectory

  const before = trajectory.checkpoints.slice(0, yearIndex)
  const branchYear =
    trajectory.branchYear === null ? yearIndex : Math.min(trajectory.branchYear, yearIndex)

  // Build the edited baseline state at yearIndex (age/sex preserved).
  const baseState = trajectory.checkpoints[yearIndex]!.state
  let state: PatientState = { ...baseState }
  for (const [k, v] of Object.entries(edits)) {
    if (v != null && isFinite(v)) {
      ;(state as unknown as Record<string, number>)[k] = v
    }
  }

  const checkpoints: Checkpoint[] = [...before, scoreState(state, yearIndex, true)]

  for (let y = yearIndex + 1; y <= trajectory.horizon; y++) {
    state = preset.step(state, y)
    checkpoints.push(scoreState(state, y, true))
  }

  return {
    ...trajectory,
    checkpoints,
    branched: true,
    branchYear,
  }
}
