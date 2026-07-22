# AgingTrajectory — Watch Two Aging Clocks Diverge

A synthetic, pedagogical simulator that evolves a patient's biomarkers over years and plots **PhenoAge** against an **illustrative GrimAge proxy** and chronological age — to build intuition for how two clocks trained on different signals can tell different stories about the same person over time.

**[Try it live](https://aging-trajectory.vercel.app)** — no signup, no storage, entirely client-side.

> This is a synthetic pedagogical simulator, not a diagnostic instrument. No real patient data is used, and nothing here is medical advice.

---

## What It Does

Pick a life scenario — or edit any year's biomarkers by hand — and watch a synthetic patient age year by year:

- **PhenoAge** — computed from the published clinical algorithm (Levine et al., 2018): albumin, creatinine, glucose, CRP, lymphocyte %, MCV, RDW, alkaline phosphatase, WBC, and age.
- **GrimAge (illustrative proxy)** — **not** the validated GrimAge algorithm. True GrimAge is trained on DNA-methylation surrogates for seven plasma proteins plus DNAm pack-years, none of which are derivable from manually entered blood values. This tool instead uses a transparent, hand-tuned composite over smoking pack-years, CRP (shared with PhenoAge), age, and sex — scaled to move in the same direction and rough magnitude as published GrimAge. It is labeled "illustrative proxy" everywhere it appears.
- **Chronological age** — the reference line both clocks are compared against.

Where the two clocks disagree most, the chart shades the divergence and auto-generates a note explaining which input is driving the split (e.g. accumulated pack-years vs. flat metabolic markers).

### Scenarios

| Preset | Story |
|---|---|
| **Sedentary decline** | Glucose, RDW, ALP, and WBC worsen; never smoked → PhenoAge pulls ahead |
| **Smoking cessation** | Heavy smoking until year 5, then quits → the proxy climbs, then visibly flattens |
| **Status quo** | Healthy baseline drift — the control; all three track closely |
| **Rapamycin + exercise** | Inflammatory/metabolic markers improve; structural markers unchanged — evidence flagged as preliminary/contested |

Edit any checkpoint year's biomarkers directly and the trajectory **branches**: that year becomes the new baseline, and the preset's drift continues forward from your edited values.

---

## Tech Stack

- **Frontend**: Next.js 16.2.9 (App Router, TypeScript, React 19)
- **Styling**: Tailwind CSS v4 (`@theme` tokens in `globals.css` — no `tailwind.config.ts`)
- **Charts**: Recharts 3.8 (multi-line chart, reference areas, custom tooltips)
- **Animations**: Framer Motion 12
- **Icons**: Lucide React
- **Testing**: Vitest + jsdom

---

## Getting Started

### Prerequisites
- Node.js 18+

### Install & Run

```bash
git clone https://github.com/aadityageddam-ux/aging-trajectory.git
cd aging-trajectory
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port Next.js selects if 3000 is taken — this app runs on port 3002 alongside its sibling apps in local dev).

### Build for Production

```bash
npm run build
npm run start
```

### Run Tests

```bash
npm run test         # Single run
npm run test:watch   # Watch mode
```

---

## Project Structure

```
aging-trajectory/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Main page — all state lives here
│   │   ├── layout.tsx
│   │   └── globals.css                 # Tailwind v4 @theme tokens
│   ├── components/
│   │   ├── EcosystemNav.tsx            # Cross-links to sibling apps
│   │   ├── TrajectoryChart.tsx         # Recharts multi-line chart + divergence shading
│   │   ├── Controls.tsx                # Preset selector, horizon control, year scrubber
│   │   ├── ClockReadout.tsx            # Per-year numeric readout + proxy breakdown
│   │   ├── BiomarkerEditor.tsx         # Manual override editor (triggers branching)
│   │   └── MethodologyPanel.tsx        # Disclaimers, proxy formula, citations
│   ├── lib/
│   │   ├── computation/
│   │   │   ├── phenoage.ts             # PhenoAge algorithm (Levine 2018)
│   │   │   └── confidence.ts           # Confidence level from biomarker completeness
│   │   └── simulation/
│   │       ├── grimage-proxy.ts        # Illustrative GrimAge proxy — formula + disclaimer
│   │       ├── presets.ts              # The 4 life-trajectory scenarios
│   │       ├── trajectory.ts           # Year-by-year engine + branching/override logic
│   │       └── divergence.ts           # Auto-annotation heuristic
│   ├── types/
│   │   ├── biomarkers.ts               # BiomarkerInput interface (US lab units)
│   │   └── computation.ts              # PhenoAgeResult, ConfidenceLevel
│   └── tests/                          # Vitest unit tests
├── next.config.ts
├── tsconfig.json
├── vitest.config.ts
└── README.md (this file)
```

---

## Algorithms

### PhenoAge (Levine et al., 2018)

Implements the published clinical biomarker algorithm — a Gompertz mortality model over 9 blood biomarkers plus chronological age. Inputs are entered in US lab units (g/dL, mg/dL, mg/L, etc.) and converted internally to the SI units the coefficients require. Coefficients verified against the source paper (PMC5940111, Table 1).

### GrimAge — illustrative proxy (not the validated algorithm)

```
proxyAge = age
  + min(0.25 × packYears, 14)                       // smoking (dominant lever)
  + clamp(1.5 × log2(CRP / 1.0), -1, 6)              // inflammation (shares PhenoAge's CRP input)
  + (sex === 'male' ? +2 : 0)                        // sex offset
```

Tuned so a healthy never-smoker reads ≈ chronological age. This is a **teaching aid for directional intuition only** — see the in-app Methodology panel for the full disclaimer and exact constants.

---

## Design Tokens

| Series / Token | Hex | Use |
|---|---|---|
| `--at-chrono` | `#71717A` | Chronological age reference line (grey, dashed) |
| `--at-pheno` | `#16A34A` | PhenoAge line |
| `--at-proxy` | `#6366F1` | GrimAge (illustrative proxy) line |
| `--at-diverge` | `#FEF3C7` | Divergence band shading |
| `--at-bg` / `--at-surface` | `#FAFAFA` / `#FFFFFF` | Background / card surfaces |
| `--at-text` / `--at-muted` | `#18181B` / `#71717A` | Text |

**Fonts:** Instrument Serif (italic, clock readouts), Inter (body), JetBrains Mono (numeric values) — shared with the sibling apps below.

---

## Known Limitations

- **Not diagnostic** — synthetic biomarker trajectories, invented to build directional intuition, not real patient data.
- **GrimAge proxy, not GrimAge** — see the in-app Methodology panel; the proxy omits every DNAm surrogate the real algorithm uses.
- **No persistence** — all state is in-memory only, reset on reload.
- **4 of 5 PRD scenarios shipped** — "chronic stress / poor sleep" was deferred (it overlaps the sedentary-decline preset via the shared CRP term).

---

## Part of the Longevity Ecosystem

- **[LabAge](https://labage-orcvw1e0p-aadityageddam-3352s-projects.vercel.app)** — single-snapshot biological age calculator (PhenoAge)
- **[HallmarksExplorer](https://hallmarksexplorers.vercel.app)** — interactive reference for the 12 Hallmarks of Aging
- **[AgingClockBench](https://github.com/aadityageddam-ux/aging_clock_bench)** — open-source Python package for benchmarking aging clocks

---

## References

- **PhenoAge**: Levine ME, Lu AT, Quach A, et al. An epigenetic biomarker of aging for lifespan and healthspan. *Aging* (Albany NY). 2018;10(4):573–591. https://doi.org/10.18632/aging.101414
- **GrimAge**: Lu AT, Quach A, Wilson JG, et al. DNA methylation GrimAge strongly predicts lifespan and healthspan. *Aging* (Albany NY). 2019;11(2):303–327. https://doi.org/10.18632/aging.101684

---

## License

MIT

---

## Contact

- **Issues**: [GitHub Issues](https://github.com/aadityageddam-ux/aging-trajectory/issues)
- **Email**: aaditya.geddam@gmail.com

---

**Built by [Aaditya Geddam](https://github.com/aadityageddam-ux)**
