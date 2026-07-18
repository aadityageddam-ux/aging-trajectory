'use client'

import { PROXY_CONSTANTS, PROXY_DISCLAIMER } from '@/lib/simulation/grimage-proxy'

const CITATIONS = [
  {
    label: 'PhenoAge',
    title: 'An epigenetic biomarker of aging for lifespan and healthspan',
    authors: 'Levine ME, Lu AT, Quach A, et al.',
    journal: 'Aging (Albany NY)',
    year: '2018',
    pmid: '29676998',
    url: 'https://doi.org/10.18632/aging.101414',
  },
  {
    label: 'GrimAge',
    title: 'DNA methylation GrimAge strongly predicts lifespan and healthspan',
    authors: 'Lu AT, Quach A, Wilson JG, et al.',
    journal: 'Aging (Albany NY)',
    year: '2019',
    pmid: '30669119',
    url: 'https://doi.org/10.18632/aging.101684',
  },
]

export function MethodologyPanel() {
  return (
    <details className="group rounded-xl border border-[#E4E4E7] bg-white p-4 sm:p-6">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-[#18181B]">
        Methodology &amp; scientific honesty
        <span className="text-[#A1A1AA] transition-transform group-open:rotate-180">▾</span>
      </summary>

      <div className="mt-4 space-y-4 text-xs leading-relaxed text-[#71717A]">
        <div className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[#991B1B]">
          <span className="font-semibold">This is a synthetic, pedagogical simulator — not a diagnostic instrument. </span>
          No real patient data is used, and nothing here is medical advice. Biomarker trajectories are
          invented to build intuition for how two aging clocks can disagree.
        </div>

        <div>
          <p className="mb-1 font-semibold text-[#18181B]">PhenoAge (Levine et al., 2018)</p>
          <p>
            Computed from the published clinical algorithm: a Gompertz mortality model over albumin,
            creatinine, glucose, CRP (log), lymphocyte %, MCV, RDW, alkaline phosphatase, WBC, and
            chronological age. Inputs are entered in US lab units and converted to the SI units the
            coefficients require. Coefficients were verified against the source paper (Table 1).
          </p>
        </div>

        <div>
          <p className="mb-1 font-semibold text-[#4338CA]">
            GrimAge — illustrative proxy (NOT the validated algorithm)
          </p>
          <p className="mb-2">{PROXY_DISCLAIMER}</p>
          <p className="mb-1 font-medium text-[#18181B]">Exact proxy formula used here:</p>
          <pre className="overflow-x-auto rounded-lg bg-[#F8F8F7] px-3 py-2 font-mono text-[0.7rem] text-[#3F3F46]">
{`proxyAge = age
  + min(${PROXY_CONSTANTS.yearsPerPackYear} × packYears, ${PROXY_CONSTANTS.smokeCapYears})           // smoking
  + clamp(${PROXY_CONSTANTS.yearsPerCrpDoubling} × log2(CRP / ${PROXY_CONSTANTS.crpReferenceMgL}), ${PROXY_CONSTANTS.inflMinYears}, ${PROXY_CONSTANTS.inflMaxYears})  // inflammation (shared CRP)
  + (male ? +${PROXY_CONSTANTS.maleOffsetYears} : 0)                    // sex`}
          </pre>
          <p className="mt-2">
            Tuned so a healthy never-smoker female reads ≈ chronological age. Smoking is the dominant
            lever, matching the direction (not the exact values) of published GrimAge behavior.
          </p>
        </div>

        <div>
          <p className="mb-1 font-semibold text-[#18181B]">Interventions</p>
          <p>
            Where a scenario asserts an intervention effect (e.g. rapamycin), treat it as a hypothetical.
            Human outcome evidence for mTOR-inhibition slowing aging is preliminary and contested.
          </p>
        </div>

        <div>
          <p className="mb-2 font-semibold text-[#18181B]">Citations</p>
          <ul className="space-y-2">
            {CITATIONS.map((c) => (
              <li key={c.pmid}>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#3F3F46] underline underline-offset-2 hover:text-[#18181B]"
                >
                  {c.title}
                </a>
                <span className="block text-[#71717A]">
                  {c.authors} · <span className="italic">{c.journal}</span> {c.year} · PMID:{' '}
                  <span className="font-mono">{c.pmid}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </details>
  )
}
