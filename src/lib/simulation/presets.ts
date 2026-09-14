import { INPUT_LIMITS, type BiomarkerKey, type ClinicalPhenoAgeInput } from '@/types/biomarkers'

export interface InputPattern {
  id: string
  name: string
  summary: string
  initial: ClinicalPhenoAgeInput
  annualChanges: Partial<Record<BiomarkerKey, number>>
}

const referenceInput: ClinicalPhenoAgeInput = {
  age: 50,
  albumin: 4.2,
  creatinine: 0.9,
  glucose: 95,
  crp: 1,
  lymphocytePct: 30,
  mcv: 90,
  rdw: 13,
  alp: 65,
  wbc: 6.5,
}

export const INPUT_PATTERNS: InputPattern[] = [
  {
    id: 'fixed',
    name: 'Fixed biomarkers',
    summary: 'Only chronological age changes. Every biomarker remains fixed at its starting value.',
    initial: referenceInput,
    annualChanges: {},
  },
  {
    id: 'selected-increase',
    name: 'Selected values increase',
    summary: 'A deterministic example: glucose +2 mg/dL, CRP +0.15 mg/L, RDW +0.08 percentage points, and WBC +0.05 × 10³/µL each year.',
    initial: referenceInput,
    annualChanges: { glucose: 2, crp: 0.15, rdw: 0.08, wbc: 0.05 },
  },
  {
    id: 'selected-decrease',
    name: 'Selected values decrease',
    summary: 'A deterministic example: glucose −2 mg/dL, CRP −0.15 mg/L, RDW −0.08 percentage points, and WBC −0.05 × 10³/µL each year.',
    initial: {
      ...referenceInput,
      glucose: 125,
      crp: 4,
      rdw: 15,
      wbc: 8,
    },
    annualChanges: { glucose: -2, crp: -0.15, rdw: -0.08, wbc: -0.05 },
  },
]

export const DEFAULT_PATTERN_ID = 'fixed'

export function getInputPattern(id: string): InputPattern {
  return INPUT_PATTERNS.find((pattern) => pattern.id === id) ?? INPUT_PATTERNS[0]!
}

export function evolvePattern(
  previous: ClinicalPhenoAgeInput,
  pattern: InputPattern,
): ClinicalPhenoAgeInput {
  const next = { ...previous, age: previous.age + 1 }

  for (const [key, delta] of Object.entries(pattern.annualChanges) as [BiomarkerKey, number][]) {
    const limits = INPUT_LIMITS[key]
    next[key] = Math.min(limits.max, Math.max(limits.min, previous[key] + delta))
  }

  return next
}
