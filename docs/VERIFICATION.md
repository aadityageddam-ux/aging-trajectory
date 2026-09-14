# Verification record

Checks completed on September 13, 2026, from the cleanup branch using Node.js 22.17.1.

## Results

| Check | Result |
| --- | --- |
| `npm ci --cache .npm-cache` | Passed; lockfile installed 434 packages from a clean dependency tree |
| `npm audit --cache .npm-cache` | Passed; 0 known vulnerabilities reported by the npm audit service |
| `npm test` | Passed; 2 files and 9 tests |
| BioAge reference fixtures | Passed for lower-risk and higher-risk fixed inputs to 10 decimal places |
| `npm run type-check` | Passed |
| `npm run lint` | Passed |
| `npm run build` | Passed with Next.js 16.3.5; `/` and `/_not-found` prerendered as static pages |
| `npm run test:e2e` | Passed in Chromium at 1440 × 1000 and 390 × 844 |

The browser check covers complete-input validation, editing a future year, persistence after shortening and restoring the horizon, the reset control, the accessible chart-data table, horizontal overflow, 200% text enlargement, and uncaught runtime errors. Screenshots are generated locally in the ignored `test-results` directory.

## Scientific boundary

The checks verify implementation behavior against published equations and an independent open-source reproduction. They do not validate Phenotypic Age for a new population, reproduce the original cohort analysis, or establish a clinical use.
