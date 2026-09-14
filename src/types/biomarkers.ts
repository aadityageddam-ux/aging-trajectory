export const BIOMARKER_KEYS = [
  'albumin',
  'creatinine',
  'glucose',
  'crp',
  'lymphocytePct',
  'mcv',
  'rdw',
  'alp',
  'wbc',
] as const

export type BiomarkerKey = (typeof BIOMARKER_KEYS)[number]

export interface ClinicalPhenoAgeInput extends Record<BiomarkerKey, number> {
  age: number
}

export interface FieldDefinition {
  label: string
  unit: string
  min: number
  max: number
  step: number
}

/** Broad computational guardrails, not clinical reference intervals. */
export const INPUT_LIMITS: Record<'age' | BiomarkerKey, FieldDefinition> = {
  age: { label: 'Chronological age', unit: 'years', min: 20, max: 100, step: 1 },
  albumin: { label: 'Albumin', unit: 'g/dL', min: 1, max: 6, step: 0.1 },
  creatinine: { label: 'Creatinine', unit: 'mg/dL', min: 0.1, max: 15, step: 0.05 },
  glucose: { label: 'Glucose', unit: 'mg/dL', min: 40, max: 600, step: 1 },
  crp: { label: 'C-reactive protein', unit: 'mg/L', min: 0.01, max: 300, step: 0.1 },
  lymphocytePct: { label: 'Lymphocytes', unit: '%', min: 0, max: 100, step: 0.5 },
  mcv: { label: 'Mean corpuscular volume', unit: 'fL', min: 50, max: 130, step: 0.5 },
  rdw: { label: 'Red cell distribution width', unit: '%', min: 5, max: 40, step: 0.1 },
  alp: { label: 'Alkaline phosphatase', unit: 'U/L', min: 10, max: 1000, step: 1 },
  wbc: { label: 'White blood cell count', unit: '10³/µL', min: 1, max: 100, step: 0.1 },
}
