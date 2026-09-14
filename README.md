# AgingTrajectory

An educational sensitivity simulator for the published clinical Phenotypic Age equation. It shows how explicitly synthetic biomarker sequences change the equation’s output over time.

The app compares two calculations:

- **Baseline:** the selected artificial input pattern.
- **Edited:** the same pattern after a user changes all biomarker values at one or more years.

Chronological age is shown as context. The trajectories do not predict a person’s future, estimate treatment effects, or model causal aging. No patient data is included or stored.

## Scientific scope

The implementation uses the original clinical Phenotypic Age equation reported by Levine et al. It requires chronological age and nine clinical biomarkers. User-facing US laboratory units are converted to the units required by the published coefficients.

This clinical measure was the intermediate phenotype used to train the paper’s DNA-methylation model. AgingTrajectory does **not** calculate DNAm PhenoAge or any other epigenetic clock.

The original repository used a hand-tuned “GrimAge proxy” and named lifestyle/drug scenarios. Those elements were removed because they were not validated models. The current patterns are neutral arithmetic examples, and every annual change is visible in the interface.

See [docs/SCIENTIFIC_AUDIT.md](docs/SCIENTIFIC_AUDIT.md) for the claim review and [docs/VERIFICATION.md](docs/VERIFICATION.md) for checks and limitations.

## Run locally

Requires Node.js 22 or newer.

```bash
npm ci
npm run dev
```

Then open <http://localhost:3000>.

## Verify

```bash
npm test
npm run type-check
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
```

## Method sources

- Levine ME, Lu AT, Quach A, et al. *An epigenetic biomarker of aging for lifespan and healthspan.* Aging. 2018. [doi:10.18632/aging.101414](https://doi.org/10.18632/aging.101414)
- [Levine et al. supplementary methods](https://www.aging-us.com/article/101414/supplementary/SD1/0/aging-v10i4-101414-supplementary-material-SD1.pdf)
- Kwon D, Belsky DW. *A toolkit for quantification of biological age from blood chemistry and organ function test data: BioAge.* GeroScience. 2021. [doi:10.1007/s11357-021-00480-5](https://doi.org/10.1007/s11357-021-00480-5)

## Known limits

- Synthetic inputs and deterministic arithmetic patterns only.
- Formula sensitivity is not longitudinal validation.
- “Edited minus baseline” is not residualized age acceleration and has no causal interpretation.
- Input limits are software guardrails, not clinical reference intervals.
- This repository does not currently include a license file. No license grant is implied.
