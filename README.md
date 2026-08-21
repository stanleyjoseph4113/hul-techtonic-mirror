git clone https://github.com/<your-username></your>/mirror.git

<!--
     Mirror — rewritten README
     Goal: single-file, comprehensive, and actionable project README describing
     what Mirror is, how it works, and how to run / extend it.
-->

# Mirror — Simulation & Risk Engine for Brand Strategy

One-line summary: Mirror is a client-side simulation and risk-assessment engine that predicts short-term campaign reach, sentiment, and backlash risk — then recommends a stage-gated launch plan (Micro-Test → Regional Test → Full-Scale Launch) before real media spend is committed.

Why this project exists

- Brands must act faster than traditional approval workflows allow. Mirror closes the loop between trend detection, strategy generation, simulation, and activation by providing a rapid, explainable decisioning layer that surfaces confidence, risk, and recommended next steps.

Table of contents

- Overview
- How Mirror works (architectural pipeline)
- Core algorithms & defensible formulas
- Data, guardrails, and explainability
- Project structure (what's in `src/` and `public/`)
- Development: setup, run, and configuration
- Deployment & security considerations
- Contributing, licensing, and acknowledgements

---

## Overview

Mirror is designed for fast, explainable decisions in culturally sensitive, time-bound moments (e.g., viral social moments, live events). It accepts a candidate strategy and returns:

- A predicted 14‑day reach trajectory with 90% confidence bands
- Daily reach velocity and cumulative reach estimates
- Sentiment breakdown and backlash probability
- Guardrail checks (brand safety, cultural/legal, IP/exclusivity)
- A recommended launch tier with gating rules and next-step playbook
- Top historical precedents and factor attribution for explainability

The prototype is intentionally client-side to enable low-cost distribution and rapid iteration; its default primary analysis path uses a hosted LLM (Gemini). A deterministic local simulator is available as a fallback where LLM access is restricted.

---

## How Mirror works — Pipeline

1. Input: user or upstream system provides a candidate strategy (brand, market, creative format, channels, budget, urgency).
2. Knowledge context: Mirror loads the JSON knowledge bundle from `src/data/` (brands, historical campaigns, blocklist, cultural flags, preloaded strategies) and uses these as priors.
3. Similarity matching: the candidate is matched against historical campaigns to find the nearest neighbors and form empirical priors.
4. LLM assessment (primary): the candidate brief plus JSON priors are sent to Gemini (`gemini-2.5-flash`) to produce a narrative assessment, KPI reasoning, and launch recommendation.
5. Deterministic simulation (fallback / ensemble): the simulation engine runs a 14‑day channelized reach model and computes confidence bands from historical variability.
6. Guardrails run in parallel: textual/keyword scans, cultural rule checks, and IP/exclusivity policies produce binary/graded flags.
7. Recommendation & gating: launch tier is determined via a ruleset that combines confidence, risk flags, and predicted backlash.
8. Output: UI shows the hero recommendation, time-series charts, explainability panel, guardrail inspector, and options to acknowledge/override (with audit trail).

---

## Core algorithms & defensible formulas

The codebase uses a mix of empirical—historical nearest-neighbor priors—and domain-driven formulas to keep predictions defensible and explainable.

- Similarity prior (multi-attribute weighted k-NN): a candidate C is scored against historical campaign H as a weighted sum of attribute similarities:

$$
ext{Similarity}(C, H) = w_b S_{brand} + w_t S_{type} + w_m S_{market} + w_c S_{channels} + w_u S_{budget}
$$

where weights are tuned from backtests (example defaults: $w_b=0.25, w_t=0.30, w_m=0.20, w_c=0.15, w_u=0.10$).

- Budget elasticity (sub-linear scaling): expected reach scales sub-linearly with budget to model diminishing marginal returns:

$$
ext{Reach}_{expected} = \text{Reach}_{hist} \left(\frac{Budget_{cand}}{Budget_{hist}}\right)^{\alpha}, \quad \alpha \approx 0.65-0.72
$$

- Velocity models: channel-specific temporal kernels (e.g., front-loaded organic kernels vs. delayed paid S-curves) generate daily shape; ensemble variance from historical repeats yields confidence bands.
- Guardrails: a matrix of rule checks implemented in `src/engine/guardrailEngine.ts` using:

  - keyword blocklists and regex rules
  - regional policy lookups from `cultural_flags.json`
  - IP/exclusivity checks using `partnerships.json`

---

## Data & explainability

- Key data files are in `src/data/`:

  - `brands.json` — brand metadata and portfolio mappings
  - `historical_campaigns.json` — synthetic/realized past campaigns used for k-NN priors
  - `blocklist.json` — keyword filters for brand safety
  - `cultural_flags.json` — country/region sensitivity rules
  - `preloaded_strategies.json` — example candidate briefs
- Explainability outputs include: nearest-neighbor examples, factor attribution scores for drivers (brand, channel mix, budget, urgency), and the LLM narrative that justifies the recommendation.

---

## Project structure (high-level)

See the `src/` folder for the working code. Primary folders:

- `src/engine/` — simulation, similarity, recommendation, guardrails, LLM enhancer
- `src/components/` — UI: studio, charts, guardrail inspector, modals
- `src/data/` — JSON knowledge files
- `src/hooks/` — reusable hooks (simulation orchestration, localStorage)

---

## Development: setup, run, and configuration

Prerequisites

- Node.js v18+ and npm v9+ recommended

Install & start

```bash
# 1. Install
npm install

# 2. Create a local .env with keys (see Security notes)
cp .env.example .env
# add GEMINI_API_KEY and any proxy secrets

# 3. Start dev server
npm run dev
```

Notes

- Development uses Vite. During local dev, the repo routes LLM calls through a proxy so secrets are not embedded in the browser bundle.
- If you do not provide a Gemini key or the LLM is unreachable, Mirror falls back to the deterministic local simulator in `src/engine/`.

Environment variables

- `GEMINI_API_KEY` — primary LLM key (required for full LLM-first behavior)
- `NVIDIA_API_KEY` / `VITE_NVIDIA_API_KEY` — optional GPU-backed inference keys if configured

Security

- Never commit API keys. Use the `.env` file locally and server-side secrets for any production proxy that calls Gemini.

---

## Deployment

Static hosting

- The app builds to a static bundle and can be hosted on GitHub Pages, Netlify, or any static host. If you rely on Gemini during runtime, you must deploy a small serverless proxy (e.g., a Netlify function or GitHub Actions-hosted server) that holds the key and forwards requests.

CI/CD

- The repository contains a sample GitHub Actions workflow for building and deploying to GitHub Pages. Adjust as required for your chosen host and secrets management.

---

## How we're doing what we're doing — design principles

- LLM-first but auditable: the LLM generates narratives and recommendations, while deterministic engines provide numbers and a verifiable fallback.
- Explainability & governance: every override, manual acknowledgement, or activation decision is stored in the audit trail to support post-hoc reviews.
- Minimal operational cost: client-side execution reduces infrastructure budgets; any required server component only holds API keys and proxies requests.
- Safety-by-design: multi-agent guardrails with region-aware policy files reduce legal and cultural risk.

---

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feat/some-change`.
3. Run tests and lints (if present).
4. Open a pull request with a clear description and screenshots where applicable.

Please respect the `src/data/` fixtures: if you add new historical campaigns for testing, include a short doc comment describing their provenance.

---

## License & acknowledgements

This prototype is for internal Techtonic usage and demonstration purposes. Check with your legal team before any external release. A permissive OSS license (MIT) is recommended for public forks — add a `LICENSE` file if you want to open-source the project.

Key acknowledgements

- Built as a Techtonic Season 8 prototype demonstrating an end-to-end, client-side simulation and risk engine.

---

If you'd like, I can:

- add a small `README` summary block to the top of `index.html` for quick context when viewing the static site;
- create `.env.example` with the expected variables;
- or generate a short CONTRIBUTING.md and SECURITY.md for secret handling guidance.

Updated file: [README.md](README.md)
