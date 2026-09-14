import { describe, expect, it } from 'vitest'
import { getInputPattern } from '@/lib/simulation/presets'
import { applyOverride, generateTrajectory, resizeTrajectory } from '@/lib/simulation/trajectory'

const fixed = getInputPattern('fixed')

describe('synthetic trajectory', () => {
  it('generates one baseline and edited checkpoint per year', () => {
    const trajectory = generateTrajectory(fixed, 10)
    expect(trajectory.baseline).toHaveLength(11)
    expect(trajectory.edited).toHaveLength(11)
    expect(trajectory.edited.map((point) => point.phenotypicAge)).toEqual(trajectory.baseline.map((point) => point.phenotypicAge))
  })

  it('applies an edit at one year and propagates it without changing earlier years', () => {
    const original = generateTrajectory(fixed, 10)
    const edited = applyOverride(original, fixed, 5, { glucose: 150 })
    expect(edited.branchYear).toBe(5)
    expect(edited.edited[4]!.phenotypicAge).toBe(edited.baseline[4]!.phenotypicAge)
    expect(edited.edited[5]!.state.glucose).toBe(150)
    expect(edited.edited[8]!.state.glucose).toBe(150)
    expect(edited.edited[5]!.phenotypicAge).toBeGreaterThan(edited.baseline[5]!.phenotypicAge)
  })

  it('retains multiple edits and the earliest visible branch', () => {
    const first = applyOverride(generateTrajectory(fixed, 10), fixed, 6, { glucose: 140 })
    const second = applyOverride(first, fixed, 3, { crp: 8 })
    expect(second.branchYear).toBe(3)
    expect(second.edits[6]!.glucose).toBe(140)
    expect(second.edits[3]!.crp).toBe(8)
  })

  it('preserves edits when the horizon shrinks and expands', () => {
    const edited = applyOverride(generateTrajectory(fixed, 20), fixed, 15, { rdw: 18 })
    const shorter = resizeTrajectory(edited, fixed, 10)
    expect(shorter.branchYear).toBeNull()
    expect(shorter.edits[15]!.rdw).toBe(18)
    const restored = resizeTrajectory(shorter, fixed, 20)
    expect(restored.branchYear).toBe(15)
    expect(restored.edited[15]!.state.rdw).toBe(18)
  })

  it('rejects edits outside the visible trajectory', () => {
    expect(() => applyOverride(generateTrajectory(fixed, 10), fixed, 11, { glucose: 100 })).toThrow(RangeError)
  })
})
