import { describe, expect, it } from 'vitest'
import { computeClinicalPhenoAge, PHENOAGE_PARAMETERS, validateClinicalPhenoAgeInput } from '@/lib/computation/phenoage'
import type { ClinicalPhenoAgeInput } from '@/types/biomarkers'

const reference: ClinicalPhenoAgeInput = {
  age: 50, albumin: 4.2, creatinine: 0.9, glucose: 95, crp: 1,
  lymphocytePct: 30, mcv: 90, rdw: 13, alp: 65, wbc: 6.5,
}

describe('clinical Phenotypic Age equation', () => {
  it('uses the source age-scale constant rather than the transposed value', () => {
    expect(PHENOAGE_PARAMETERS.ageScale).toBe(0.090165)
  })

  it.each([
    { input: reference, expectedAge: 43.70363251372635, expectedRisk: 0.026413247114066674 },
    {
      input: { ...reference, age: 70, albumin: 3.7, creatinine: 1.2, glucose: 130, crp: 5, lymphocytePct: 22, mcv: 94, rdw: 15, alp: 95, wbc: 8.5 },
      expectedAge: 83.53337985334832,
      expectedRisk: 0.6213483241375148,
    },
  ])('matches an independently calculated BioAge reference case', ({ input, expectedAge, expectedRisk }) => {
    const result = computeClinicalPhenoAge(input)
    expect(result.phenotypicAge).toBeCloseTo(expectedAge, 10)
    expect(result.tenYearMortalityRisk).toBeCloseTo(expectedRisk, 10)
  })

  it('rejects missing, nonfinite, zero-CRP, and out-of-range inputs', () => {
    expect(validateClinicalPhenoAgeInput({ ...reference, crp: 0 })).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'crp' })]))
    expect(validateClinicalPhenoAgeInput({ ...reference, glucose: Number.NaN })).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'glucose' })]))
    expect(() => computeClinicalPhenoAge({ ...reference, albumin: undefined } as unknown as ClinicalPhenoAgeInput)).toThrow(RangeError)
  })
})
