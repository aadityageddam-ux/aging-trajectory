export interface ValidationIssue {
  field: string
  message: string
}

export interface ClinicalPhenoAgeResult {
  chronologicalAge: number
  phenotypicAge: number
  difference: number
  tenYearMortalityRisk: number
  linearPredictor: number
}
