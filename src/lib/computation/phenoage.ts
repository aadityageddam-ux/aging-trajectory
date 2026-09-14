import {
  BIOMARKER_KEYS,
  INPUT_LIMITS,
  type ClinicalPhenoAgeInput,
} from '@/types/biomarkers'
import type { ClinicalPhenoAgeResult, ValidationIssue } from '@/types/computation'

// Original clinical Phenotypic Age parameters reproduced by the BioAge package.
// Source: Levine et al. 2018 supplementary methods and Kwon & Belsky 2021.
export const PHENOAGE_PARAMETERS = {
  intercept: -19.90667,
  albumin: -0.03359355,
  creatinine: 0.009506491,
  glucose: 0.1953192,
  crpLn: 0.09536762,
  lymphocytePct: -0.01199984,
  mcv: 0.02676401,
  rdw: 0.3306156,
  alp: 0.001868778,
  wbc: 0.05542406,
  age: 0.08035356,
  gompertzNumerator: 1.51714,
  gompertzShape: 0.007692696,
  ageScale: 0.090165,
  ageMultiplier: 0.0055305,
  ageIntercept: 141.50225,
} as const

export function validateClinicalPhenoAgeInput(
  input: ClinicalPhenoAgeInput,
): ValidationIssue[] {
  const fields = ['age', ...BIOMARKER_KEYS] as const
  const issues: ValidationIssue[] = []

  for (const field of fields) {
    const value = input[field]
    const limits = INPUT_LIMITS[field]
    if (!Number.isFinite(value)) {
      issues.push({ field, message: `${limits.label} must be a number.` })
    } else if (value < limits.min || value > limits.max) {
      issues.push({
        field,
        message: `${limits.label} must be between ${limits.min} and ${limits.max} ${limits.unit}.`,
      })
    }
  }

  return issues
}

export function computeClinicalPhenoAge(
  input: ClinicalPhenoAgeInput,
): ClinicalPhenoAgeResult {
  const issues = validateClinicalPhenoAgeInput(input)
  if (issues.length > 0) {
    throw new RangeError(issues.map((issue) => issue.message).join(' '))
  }

  const p = PHENOAGE_PARAMETERS
  const linearPredictor =
    p.intercept +
    p.albumin * (input.albumin * 10) +
    p.creatinine * (input.creatinine * 88.4017) +
    p.glucose * (input.glucose * 0.0555) +
    p.crpLn * Math.log(input.crp * 0.1) +
    p.lymphocytePct * input.lymphocytePct +
    p.mcv * input.mcv +
    p.rdw * input.rdw +
    p.alp * input.alp +
    p.wbc * input.wbc +
    p.age * input.age

  // Direct cumulative-hazard calculation avoids precision loss near risks of 0 or 1.
  const cumulativeHazard =
    (p.gompertzNumerator * Math.exp(linearPredictor)) / p.gompertzShape
  const tenYearMortalityRisk = -Math.expm1(-cumulativeHazard)
  const phenotypicAge =
    p.ageIntercept + Math.log(p.ageMultiplier * cumulativeHazard) / p.ageScale

  return {
    chronologicalAge: input.age,
    phenotypicAge,
    difference: phenotypicAge - input.age,
    tenYearMortalityRisk,
    linearPredictor,
  }
}
