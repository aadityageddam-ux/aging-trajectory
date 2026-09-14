# Scientific claim audit

Reviewed September 2026.

## Retained and corrected

| Claim | Resolution | Evidence |
| --- | --- | --- |
| Nine biomarkers plus chronological age feed a Gompertz mortality model | Retained and named “clinical Phenotypic Age” | Levine et al. paper and supplementary methods |
| US-unit inputs require conversion before applying coefficients | Retained; conversions are explicit in code and documentation | Supplementary method units and BioAge reproduction |
| The age-scale denominator is 0.090165 | Corrected from 0.09165 | Levine supplement; BioAge source and correction history |
| The clinical score differs from DNAm PhenoAge | Made explicit | Levine et al. development sequence |

## Removed or reframed

| Previous element | Reason |
| --- | --- |
| Hand-tuned “GrimAge proxy” | It did not use the DNAm surrogates or trained GrimAge model and had no validated calibration. |
| Claim that the proxy matched published GrimAge direction and rough magnitude | No validation analysis supported this comparison. |
| Smoking-cessation and sedentary-decline stories | Their biomarker changes were invented and could be read as longitudinal predictions. |
| Rapamycin plus exercise scenario | Its hand-set response could be read as treatment efficacy despite a caveat. |
| Heuristic causal divergence notes | The code could not establish that an input caused the displayed difference. |
| Population-mean imputation and confidence labels | Input count did not calibrate scientific confidence, and the means lacked a defined target population. |
| “MIT” statement | No LICENSE file was present; the owner has not selected a license in this cleanup. |

## Numerical verification

Two fixed cases were calculated independently from the full-precision parameters in the BioAge R implementation and committed as regression fixtures. They cover a lower-risk and a higher-risk input set. Tests also lock the corrected 0.090165 denominator and reject missing, nonfinite, zero-CRP, and out-of-range inputs.

This is source and implementation verification, not replication of the original NHANES analysis or independent clinical validation.
