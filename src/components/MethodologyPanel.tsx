export function MethodologyPanel() {
  return (
    <details className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6">
      <summary className="cursor-pointer text-sm font-semibold text-zinc-950">Method, units, and limitations</summary>
      <div className="mt-4 space-y-5 text-sm leading-6 text-zinc-600">
        <section>
          <h3 className="font-semibold text-zinc-950">What is calculated</h3>
          <p className="mt-1">The app implements the original clinical Phenotypic Age equation reported by Levine and colleagues: nine clinical biomarkers and chronological age feed a Gompertz mortality model, whose 10-year risk is mapped back to an age scale.</p>
          <p className="mt-2">This clinical measure was used as the target for the paper’s later DNA-methylation model. This app does not calculate DNAm PhenoAge or any epigenetic clock.</p>
        </section>
        <section>
          <h3 className="font-semibold text-zinc-950">Required units and transformations</h3>
          <p className="mt-1">The interface accepts albumin in g/dL, creatinine and glucose in mg/dL, and CRP in mg/L. It converts albumin to g/L, creatinine to µmol/L, glucose to mmol/L, and CRP to mg/dL before taking the natural logarithm. All nine biomarkers are required; no values are imputed.</p>
        </section>
        <section>
          <h3 className="font-semibold text-zinc-950">What the trajectories mean</h3>
          <p className="mt-1">Every trajectory is synthetic. Input patterns are fixed arithmetic rules, not models fitted to longitudinal people or interventions. An edited-minus-baseline difference shows the equation’s sensitivity to those inputs. It does not estimate a personal future, treatment effect, or causal aging rate.</p>
        </section>
        <section>
          <h3 className="font-semibold text-zinc-950">Sources</h3>
          <ul className="mt-2 space-y-3">
            <li><a className="font-medium text-indigo-800 underline underline-offset-2" href="https://doi.org/10.18632/aging.101414" target="_blank" rel="noreferrer">Levine et al. (2018), An epigenetic biomarker of aging for lifespan and healthspan</a><span className="block text-xs text-zinc-500">Primary paper · PMID 29676998</span></li>
            <li><a className="font-medium text-indigo-800 underline underline-offset-2" href="https://www.aging-us.com/article/101414/supplementary/SD1/0/aging-v10i4-101414-supplementary-material-SD1.pdf" target="_blank" rel="noreferrer">Levine et al. supplementary methods</a><span className="block text-xs text-zinc-500">Equation, parameters, development cohorts, and derivation</span></li>
            <li><a className="font-medium text-indigo-800 underline underline-offset-2" href="https://doi.org/10.1007/s11357-021-00480-5" target="_blank" rel="noreferrer">Kwon and Belsky (2021), BioAge toolkit</a><span className="block text-xs text-zinc-500">Independent open-source reproduction used for parameter cross-checking</span></li>
          </ul>
        </section>
      </div>
    </details>
  )
}
