import { describe, it, expect } from 'vitest'
import {
  computeGrimAgeProxy,
  smokingTerm,
  inflammationTerm,
  sexTerm,
  PROXY_CONSTANTS,
} from '@/lib/simulation/grimage-proxy'

describe('GrimAge proxy (illustrative)', () => {
  it('reads ≈ chronological age for a healthy never-smoker female at reference CRP', () => {
    const r = computeGrimAgeProxy({ age: 50, sex: 'female', packYears: 0, crp: 1.0 })
    expect(r.proxyAge).toBeCloseTo(50, 1)
    expect(r.acceleration).toBeCloseTo(0, 1)
  })

  it('adds ~+10 years for 40 cumulative pack-years', () => {
    expect(smokingTerm(40)).toBeCloseTo(10, 1)
    const r = computeGrimAgeProxy({ age: 60, sex: 'female', packYears: 40, crp: 1.0 })
    expect(r.terms.smoking).toBeCloseTo(10, 1)
  })

  it('caps the smoking contribution', () => {
    expect(smokingTerm(1000)).toBe(PROXY_CONSTANTS.smokeCapYears)
  })

  it('applies a +2 year male sex offset', () => {
    expect(sexTerm('male')).toBe(2)
    expect(sexTerm('female')).toBe(0)
    const male = computeGrimAgeProxy({ age: 50, sex: 'male', packYears: 0, crp: 1.0 })
    expect(male.proxyAge).toBeCloseTo(52, 1)
  })

  it('flattens: constant pack-years give a constant smoking term (no decay after quitting)', () => {
    expect(smokingTerm(25)).toBe(smokingTerm(25))
    expect(smokingTerm(25)).toBeCloseTo(6.25, 2)
  })

  it('inflammation term is zero at reference CRP and rises with doubling', () => {
    expect(inflammationTerm(1.0)).toBeCloseTo(0, 2)
    expect(inflammationTerm(2.0)).toBeCloseTo(PROXY_CONSTANTS.yearsPerCrpDoubling, 2)
    expect(inflammationTerm(100)).toBe(PROXY_CONSTANTS.inflMaxYears) // clamped
  })
})
