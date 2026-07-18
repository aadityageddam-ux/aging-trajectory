/**
 * GrimAge PROXY — an ILLUSTRATIVE APPROXIMATION. This is NOT the validated GrimAge.
 *
 * True GrimAge (Lu AT et al., "DNA methylation GrimAge strongly predicts lifespan
 * and healthspan," Aging 2019; PMID: 30669119) is a DNA-methylation clock built from
 * DNAm surrogates for seven plasma proteins (adrenomedullin, β2-microglobulin,
 * cystatin C, GDF15, leptin, PAI-1, TIMP-1) plus DNAm-estimated smoking pack-years,
 * combined with age and sex. NONE of those DNAm surrogates are derivable from the
 * manual biomarker entry this tool accepts.
 *
 * This proxy is a transparent, hand-tuned composite over the *concepts* GrimAge
 * weights most heavily — smoking pack-years, an inflammatory marker (CRP, shared with
 * PhenoAge), chronological age, and sex — scaled to move in the same DIRECTION and
 * rough MAGNITUDE as published GrimAge behavior. It exists to build directional
 * intuition, not to reproduce clinical GrimAge values. It must be labeled
 * "illustrative proxy" everywhere it is shown.
 */

/** Tuned constants — surfaced verbatim in the in-app methodology panel. */
export const PROXY_CONSTANTS = {
  /**
   * Years added per cumulative pack-year, before the cap. Tuned to 0.25 so the
   * smoking signal is clearly readable on a 10-year chart (≈ +10 yr at 40 pack-years),
   * in the upper part of the range published GrimAge shows for heavy smokers.
   */
  yearsPerPackYear: 0.25,
  /** Cap on the smoking contribution (years), so extreme pack-years stay plausible. */
  smokeCapYears: 14,
  /** Years added per doubling of CRP above the reference. */
  yearsPerCrpDoubling: 1.5,
  /** CRP reference (mg/L) at which the inflammation term is zero. */
  crpReferenceMgL: 1.0,
  /** Inflammation term is clamped to this [min, max] range (years). */
  inflMinYears: -1,
  inflMaxYears: 6,
  /** Constant offset added for males (years); females get 0. */
  maleOffsetYears: 2,
} as const

export const PROXY_LABEL = 'GrimAge (illustrative proxy)'

export const PROXY_DISCLAIMER =
  'This is an illustrative approximation, not the validated GrimAge algorithm. ' +
  'Real GrimAge is trained on DNA-methylation surrogates for seven plasma proteins ' +
  '(adrenomedullin, β2-microglobulin, cystatin C, GDF15, leptin, PAI-1, TIMP-1) plus ' +
  'DNAm pack-years — none of which are derivable from manually entered blood values. ' +
  'This proxy is a hand-tuned composite over smoking pack-years, CRP, age, and sex, ' +
  'scaled to move in the same direction and rough magnitude as published GrimAge. Treat ' +
  'it as a teaching aid for directional intuition only.'

export interface GrimAgeProxyInput {
  /** Chronological age in years */
  age: number
  /** Biological sex */
  sex: 'male' | 'female'
  /** Cumulative smoking pack-years at this checkpoint */
  packYears: number
  /** C-reactive protein in mg/L — the SAME value used by PhenoAge */
  crp: number
}

export interface GrimAgeProxyResult {
  /** The proxy age in years (comparable to chronological age / PhenoAge) */
  proxyAge: number
  /** proxyAge − chronologicalAge */
  acceleration: number
  /** Decomposed contributions (years) for tooltips / driver notes */
  terms: {
    smoking: number
    inflammation: number
    sex: number
  }
}

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x))
const round1 = (n: number) => Math.round(n * 10) / 10

/** Smoking contribution in years from cumulative pack-years. Flattens once pack-years stop growing. */
export function smokingTerm(packYears: number): number {
  const py = Math.max(0, packYears)
  return Math.min(PROXY_CONSTANTS.yearsPerPackYear * py, PROXY_CONSTANTS.smokeCapYears)
}

/** Inflammation contribution in years from CRP (mg/L), via log2 fold-change over reference. */
export function inflammationTerm(crpMgL: number): number {
  const crp = Math.max(crpMgL, 0.01)
  const fold = Math.log2(crp / PROXY_CONSTANTS.crpReferenceMgL)
  return clamp(
    PROXY_CONSTANTS.yearsPerCrpDoubling * fold,
    PROXY_CONSTANTS.inflMinYears,
    PROXY_CONSTANTS.inflMaxYears,
  )
}

/** Sex contribution in years. */
export function sexTerm(sex: 'male' | 'female'): number {
  return sex === 'male' ? PROXY_CONSTANTS.maleOffsetYears : 0
}

/**
 * Compute the illustrative GrimAge proxy.
 *
 * proxyAge = age + smokingTerm + inflammationTerm + sexTerm
 *
 * Anchored so a healthy never-smoker female (CRP ≈ reference) reads ≈ chronological age.
 */
export function computeGrimAgeProxy(input: GrimAgeProxyInput): GrimAgeProxyResult {
  const smoking = smokingTerm(input.packYears)
  const inflammation = inflammationTerm(input.crp)
  const sex = sexTerm(input.sex)

  const proxyAge = input.age + smoking + inflammation + sex

  return {
    proxyAge: round1(proxyAge),
    acceleration: round1(proxyAge - input.age),
    terms: {
      smoking: round1(smoking),
      inflammation: round1(inflammation),
      sex: round1(sex),
    },
  }
}
