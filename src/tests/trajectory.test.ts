import { describe, it, expect } from 'vitest'
import {
  generateTrajectory,
  applyOverride,
} from '@/lib/simulation/trajectory'
import { getPreset, QUIT_YEAR } from '@/lib/simulation/presets'
import { annotateDivergence } from '@/lib/simulation/divergence'

const sedentary = getPreset('sedentary-decline')
const smoking = getPreset('smoking-cessation')

describe('generateTrajectory', () => {
  it('produces horizon+1 annual checkpoints', () => {
    const t = generateTrajectory(sedentary, 10)
    expect(t.checkpoints).toHaveLength(11)
    expect(t.checkpoints[0]!.yearIndex).toBe(0)
    expect(t.checkpoints[10]!.yearIndex).toBe(10)
  })

  it('advances chronological age by exactly one year per checkpoint', () => {
    const t = generateTrajectory(sedentary, 12)
    for (let i = 1; i < t.checkpoints.length; i++) {
      expect(t.checkpoints[i]!.chronologicalAge).toBe(
        t.checkpoints[i - 1]!.chronologicalAge + 1,
      )
    }
  })

  it('is unbranched on generation', () => {
    const t = generateTrajectory(sedentary, 10)
    expect(t.branched).toBe(false)
    expect(t.branchYear).toBeNull()
  })
})

describe('smoking-cessation preset', () => {
  it('accumulates pack-years until the quit year, then flattens', () => {
    const t = generateTrajectory(smoking, 15)
    const pyAtQuit = t.checkpoints[QUIT_YEAR]!.state.packYears
    const pyLater = t.checkpoints[15]!.state.packYears
    expect(pyAtQuit).toBeGreaterThan(t.checkpoints[0]!.state.packYears)
    // no accumulation after quitting
    expect(pyLater).toBe(pyAtQuit)
  })

  it('drives a visible divergence the annotator picks up', () => {
    const t = generateTrajectory(smoking, 15)
    const ann = annotateDivergence(t.checkpoints)
    expect(ann).not.toBeNull()
    expect(ann!.grimHigher).toBe(true) // proxy older than PhenoAge
  })
})

describe('applyOverride (branching)', () => {
  it('flags the trajectory branched from the edited year and recomputes forward', () => {
    const base = generateTrajectory(sedentary, 10)
    const before = base.checkpoints[3]!.grimProxyAge
    const branched = applyOverride(base, sedentary, 5, { crp: 12 })

    expect(branched.branched).toBe(true)
    expect(branched.branchYear).toBe(5)
    // years before the edit are untouched
    expect(branched.checkpoints[3]!.grimProxyAge).toBe(before)
    expect(branched.checkpoints[3]!.branched).toBe(false)
    // edited value is reflected and inflates the proxy at the edit year
    expect(branched.checkpoints[5]!.state.crp).toBe(12)
    expect(branched.checkpoints[5]!.branched).toBe(true)
    // downstream still advances age by one per year
    expect(branched.checkpoints[6]!.chronologicalAge).toBe(
      branched.checkpoints[5]!.chronologicalAge + 1,
    )
  })

  it('keeps the earliest branch year across multiple edits', () => {
    const base = generateTrajectory(sedentary, 10)
    const b1 = applyOverride(base, sedentary, 6, { glucose: 150 })
    const b2 = applyOverride(b1, sedentary, 3, { glucose: 160 })
    expect(b2.branchYear).toBe(3)
  })
})
