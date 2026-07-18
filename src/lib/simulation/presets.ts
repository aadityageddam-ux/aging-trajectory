/**
 * Preset life-trajectory scenarios. Each ships a full year-0 biomarker vector (US units)
 * and a deterministic per-year `step` function. The MVP set is chosen to cover four
 * distinct directional stories about how PhenoAge and the GrimAge proxy (dis)agree:
 *
 *   1. sedentary-decline     → PhenoAge-led rise (clinical markers worsen; PhenoAge
 *                              becomes the OLDER clock while the proxy barely moves)
 *   2. smoking-cessation     → proxy-led rise that flattens at the quit year
 *   3. status-quo            → control; all three ≈ chronological age
 *   4. rapamycin-exercise    → improvement direction (acceleration falls); caveated
 *
 * Year-0 vectors are calibrated so PhenoAge starts within a year or two of chronological
 * age (verified empirically) — otherwise a static PhenoAge offset would swamp the
 * dynamic story each scenario is meant to tell. Non-smoking scenarios use a female
 * patient so the proxy's +2-year male offset doesn't sit the proxy artificially above
 * PhenoAge; the smoking scenario is male, where smoking dominates the proxy anyway.
 *
 * A fifth PRD scenario (chronic stress / poor sleep) is deferred — it overlaps the
 * sedentary case mechanistically through the now-shared CRP term.
 */

import type { PatientState, Preset } from './trajectory'

/** Plausible physiologic bounds used to clamp drift so values never wander absurd. */
const RANGE: Record<keyof Omit<PatientState, 'sex'>, [number, number]> = {
  age:           [18, 120],
  packYears:     [0, 120],
  albumin:       [3.0, 5.2],
  creatinine:    [0.5, 2.0],
  glucose:       [70, 300],
  crp:           [0.2, 30],
  lymphocytePct: [10, 50],
  mcv:           [78, 100],
  rdw:           [11.5, 20],
  alp:           [30, 160],
  wbc:           [3.0, 15],
}

const clampField = (key: keyof typeof RANGE, v: number) => {
  const [lo, hi] = RANGE[key]
  return Math.max(lo, Math.min(hi, v))
}

/**
 * Small deterministic wobble (no RNG, so branching/recompute stays reproducible and
 * tests are stable) — gives trajectories a slightly organic, non-ruler-straight feel.
 */
const wobble = (yearIndex: number, amp: number, phase: number) =>
  amp * Math.sin(yearIndex * 0.9 + phase)

/** Apply signed per-year deltas to a state, advancing age by 1, with clamping. */
function evolve(
  prev: PatientState,
  deltas: Partial<Record<keyof typeof RANGE, number>>,
): PatientState {
  const next: PatientState = { ...prev, age: prev.age + 1 }
  for (const [k, d] of Object.entries(deltas) as [keyof typeof RANGE, number][]) {
    if (k === 'age') continue
    next[k] = clampField(k, prev[k] + d)
  }
  return next
}

// ─── 1. Sedentary decline — PhenoAge-led ──────────────────────────────────────

const sedentaryDecline: Preset = {
  id: 'sedentary-decline',
  name: 'Sedentary decline',
  blurb: 'Metabolic and structural markers worsen; never smoked.',
  detail:
    'A middle-aged non-smoker whose glucose, RDW, alkaline phosphatase, and white-cell count ' +
    'climb while albumin drifts down — the clinical picture PhenoAge is built to read. Because ' +
    'pack-years stay at zero and CRP moves only mildly, the GrimAge proxy barely responds, so ' +
    'PhenoAge pulls ahead and becomes the older clock.',
  initial: {
    age: 45,
    sex: 'female',
    packYears: 0,
    albumin: 4.2,
    creatinine: 0.9,
    glucose: 98,
    crp: 1.5,
    lymphocytePct: 29,
    mcv: 90,
    rdw: 13.4,
    alp: 66,
    wbc: 6.6,
  },
  step: (prev, y) =>
    evolve(prev, {
      glucose: 2.6 + wobble(y, 0.8, 0),
      rdw: 0.13,
      albumin: -0.028,
      alp: 1.1,
      wbc: 0.13,
      lymphocytePct: -0.32,
      mcv: 0.16,
      creatinine: 0.011,
      // CRP drifts up only mildly, so the proxy (which shares CRP) stays comparatively flat.
      crp: 0.1,
    }),
}

// ─── 2. Smoking cessation mid-trajectory — proxy-led, then flattens ────────────

const QUIT_YEAR = 5 // stops accumulating pack-years after this year index

const smokingCessation: Preset = {
  id: 'smoking-cessation',
  name: 'Smoking cessation',
  blurb: 'Heavy smoking, then quits at year 5 — watch the proxy flatten.',
  detail:
    'A smoker with a modest history who smokes heavily (~2 pack-years/year) until quitting at ' +
    'year 5, after which pack-years stop accumulating. Smoking is the heaviest lever in the ' +
    'GrimAge proxy, so the proxy climbs steeply above chronological age and then visibly flattens ' +
    'at the quit year, while PhenoAge — reading stable blood chemistry — tracks chronological age. ' +
    'The clearest illustration of the two clocks telling different stories.',
  initial: {
    age: 40,
    sex: 'male',
    packYears: 6,
    albumin: 4.15,
    creatinine: 0.9,
    glucose: 100,
    crp: 1.6,
    lymphocytePct: 28,
    mcv: 89.5,
    rdw: 13.6,
    alp: 66,
    wbc: 6.8,
  },
  step: (prev, y) => {
    const stillSmoking = y <= QUIT_YEAR
    return evolve(prev, {
      // ~2 pack-years/year while smoking; flattens (no decay) after quitting.
      packYears: stillSmoking ? 2 : 0,
      // CRP ticks up modestly while smoking, then eases slightly after quitting.
      crp: stillSmoking ? 0.05 : -0.03,
      glucose: 0.4,
      rdw: 0.03,
      alp: 0.3,
      mcv: 0.05,
    })
  },
}

// ─── 3. Status quo / do nothing — control ─────────────────────────────────────

const statusQuo: Preset = {
  id: 'status-quo',
  name: 'Status quo',
  blurb: 'Healthy baseline drifting with population aging — the control.',
  detail:
    'A non-smoker whose markers barely move beyond ordinary population aging. All three lines ' +
    'track chronological age closely, giving a reference against which the other scenarios read as ' +
    'genuine divergence rather than artifacts of the model.',
  initial: {
    age: 50,
    sex: 'female',
    packYears: 0,
    albumin: 4.2,
    creatinine: 0.9,
    glucose: 98,
    crp: 1.3,
    lymphocytePct: 29,
    mcv: 90,
    rdw: 13.4,
    alp: 66,
    wbc: 6.6,
  },
  step: (prev, y) =>
    evolve(prev, {
      glucose: 0.35 + wobble(y, 0.4, 2),
      crp: 0.02,
      rdw: 0.02,
      alp: 0.2,
      creatinine: 0.006,
      albumin: -0.006,
    }),
}

// ─── 4. Rapamycin + exercise — improvement (caveated) ─────────────────────────

const rapamycinExercise: Preset = {
  id: 'rapamycin-exercise',
  name: 'Rapamycin + exercise',
  blurb: 'Inflammatory and metabolic markers improve; structure unchanged.',
  detail:
    'Someone starting biologically older than their years — elevated glucose, CRP, and RDW — who ' +
    'takes up exercise and a rapamycin (mTOR-inhibition) regimen. Inflammatory and metabolic ' +
    'markers improve toward healthy floors while structural markers hold steady, so PhenoAge ' +
    'acceleration falls sharply and the proxy bends down too. Both clocks improve relative to ' +
    'chronological age even as the calendar keeps moving.',
  caveat:
    'Human evidence that mTOR inhibitors like rapamycin slow biological aging is preliminary ' +
    'and contested — no long-term human outcome trials support these effects. The improving ' +
    'trajectory here is an illustrative "what if," not a validated result.',
  initial: {
    age: 55,
    sex: 'female',
    packYears: 0,
    albumin: 4.05,
    creatinine: 1.0,
    glucose: 112,
    crp: 3.2,
    lymphocytePct: 26,
    mcv: 91,
    rdw: 14.2,
    alp: 75,
    wbc: 7.4,
  },
  step: (prev) =>
    evolve(prev, {
      // Improve toward healthy floors; guards stop each marker once it reaches target.
      glucose: prev.glucose > 92 ? -2.0 : 0,
      crp: prev.crp > 1.0 ? -0.24 : 0,
      rdw: prev.rdw > 13.2 ? -0.07 : 0,
      alp: prev.alp > 62 ? -0.9 : 0,
      wbc: prev.wbc > 6.2 ? -0.07 : 0,
      lymphocytePct: prev.lymphocytePct < 31 ? 0.28 : 0,
      albumin: prev.albumin < 4.2 ? 0.012 : 0,
      // structural marker MCV unchanged
    }),
}

export const PRESETS: Preset[] = [
  sedentaryDecline,
  smokingCessation,
  statusQuo,
  rapamycinExercise,
]

export const DEFAULT_PRESET_ID = 'smoking-cessation'

export function getPreset(id: string): Preset {
  return PRESETS.find((p) => p.id === id) ?? PRESETS[0]!
}

export { QUIT_YEAR }
