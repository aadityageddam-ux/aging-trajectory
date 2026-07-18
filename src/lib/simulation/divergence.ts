/**
 * Divergence annotation: find where PhenoAge and the GrimAge proxy disagree most and
 * auto-generate a short note explaining which input(s) are driving the split.
 */

import type { Checkpoint } from './trajectory'
import { PROXY_LABEL } from './grimage-proxy'

/** Minimum gap (years) between the two clocks before we bother annotating. */
const ANNOTATE_THRESHOLD = 4.0

export interface DivergenceAnnotation {
  /** Year index of maximum |PhenoAge − proxy| gap */
  peakYear: number
  /** The gap in years at the peak */
  peakGap: number
  /** Inclusive band of years where the gap stays within 40% of the peak */
  bandStart: number
  bandEnd: number
  /** True if the proxy reads older than PhenoAge at the peak */
  grimHigher: boolean
  /** Human-readable driver note */
  note: string
}

export function annotateDivergence(checkpoints: Checkpoint[]): DivergenceAnnotation | null {
  if (checkpoints.length < 2) return null

  const gaps = checkpoints.map((c) => c.grimProxyAge - c.phenoAge)
  let peakYear = 0
  let peakSigned = 0
  for (let i = 0; i < checkpoints.length; i++) {
    if (Math.abs(gaps[i]!) > Math.abs(peakSigned)) {
      peakSigned = gaps[i]!
      peakYear = checkpoints[i]!.yearIndex
    }
  }

  const peakGap = Math.abs(peakSigned)
  if (peakGap < ANNOTATE_THRESHOLD) return null

  const grimHigher = peakSigned > 0

  // Band: contiguous years around the peak where the gap stays ≥ 60% of peak.
  const bandFloor = peakGap * 0.6
  const peakIdx = checkpoints.findIndex((c) => c.yearIndex === peakYear)
  let lo = peakIdx
  let hi = peakIdx
  while (lo > 0 && Math.abs(gaps[lo - 1]!) >= bandFloor) lo--
  while (hi < checkpoints.length - 1 && Math.abs(gaps[hi + 1]!) >= bandFloor) hi++

  const first = checkpoints[0]!
  const peak = checkpoints[peakIdx]!

  const packYearGrowth = peak.state.packYears - first.state.packYears
  const phenoAccel = peak.phenoAge - peak.chronologicalAge
  const smoke = peak.grim.terms.smoking
  const infl = peak.grim.terms.inflammation

  const round = (n: number) => Math.round(n * 10) / 10

  let note: string
  if (grimHigher) {
    // Attribute from the proxy's actual term breakdown so the note never claims a
    // driver (e.g. smoking or inflammation) that isn't really elevated.
    let driver: string | null
    if (smoke >= 1 && packYearGrowth > 0.5) {
      driver = `accumulated smoking (${round(peak.state.packYears)} pack-years by year ${peakYear})`
    } else if (smoke >= 1) {
      driver = `its smoking history (${round(peak.state.packYears)} pack-years)`
    } else if (infl >= 1) {
      driver = `elevated inflammation (CRP)`
    } else {
      driver = null
    }

    note = driver
      ? `Around year ${peakYear} the ${PROXY_LABEL} reads ~${round(peakGap)} years older than ` +
        `PhenoAge. The proxy is driven up by ${driver}, while PhenoAge stays lower because the ` +
        `metabolic and structural blood markers it reads haven't moved as much.`
      : `Around year ${peakYear} the ${PROXY_LABEL} reads ~${round(peakGap)} years older than ` +
        `PhenoAge — here PhenoAge has dropped below chronological age ` +
        `(acceleration ~${round(phenoAccel)} yr) while the proxy has stayed closer to it.`
  } else {
    note =
      `Around year ${peakYear} PhenoAge reads ~${round(peakGap)} years older than the ${PROXY_LABEL} ` +
      `(PhenoAge acceleration ~${round(phenoAccel)} yr). Clinical markers — glucose, RDW, alkaline ` +
      `phosphatase, and others — have drifted into aging territory, while the proxy, which mostly ` +
      `responds to smoking and inflammation (neither elevated here), stays closer to chronological age.`
  }

  return {
    peakYear,
    peakGap: round(peakGap),
    bandStart: checkpoints[lo]!.yearIndex,
    bandEnd: checkpoints[hi]!.yearIndex,
    grimHigher,
    note,
  }
}
