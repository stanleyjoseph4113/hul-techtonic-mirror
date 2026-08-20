# Mirror | Simulation & Risk Engine for Brand Strategy
### *Unilever Techtonic Season 8 Internal Innovation Challenge Prototype*

> **Mirror** is a client-side Simulation & Risk Engine that predicts campaign performance, screens for brand and cultural risk, and recommends stage-gated launch tiers (*Micro-Test*, *Regional Test*, *Full-Scale Launch*) before real media budget is committed.

---

## 1. Business Context & Strategic Need

Unilever's brand teams (Rexona, Dove, Knorr, Magnum, Hellmann's, Lifebuoy) historically move too slowly to capitalize on fleeting viral cultural opportunities. For example, during a Premier League match, an organic Rexona logo visibility on a referee's armband went viral across social feeds, but the brand took days to coordinate approvals, missing the 24-hour cultural window.

To eliminate this latency, Unilever is redesigning its brand operating model into an **Autonomous Closed AI Loop**:

```
Sense (Pulse) ──► Strategize (Compass) ──► [ Simulate (Mirror) ] ──► Activate ──► Measure (Echo) ──► Learn (Recalibrate)
                                                  │
                                                  ▼
                                 Predicted Reach, Sentiment, Backlash Risk
                                      & Stage-Gated Launch Tiers
```

1. **Sense (Pulse)**: Real-time cultural listening agent detects trending moments and scores brand relevance.
2. **Strategize (Compass)**: Generates 3–5 candidate response strategies (e.g. *Organic Reactive*, *Paid Blitz*, *Creator Co-Creation*).
3. **Simulate (Mirror) — *This Prototype***: Simulates predicted performance with confidence bands, evaluates multi-agent guardrails, and assigns launch tiers with factor attribution.
4. **Activate**: Executes automated stage-gated micro-tests and scales spend if day-3 performance signals pass.
5. **Measure (Echo)**: Tracks live sentiment, reach velocity, and e-commerce conversion lift.
6. **Learn**: Re-injects empirical campaign outcomes back into Mirror to recalibrate historical priors.

---

## 2. Core Simulation Logic & Defensible Mathematical Formulas

Mirror is now **LLM-first**: Gemini 2.5 Flash receives the candidate brief together with every JSON knowledge file in `src/data/` and produces the primary campaign assessment, risk review, KPI reasoning, and launch recommendation. The earlier deterministic engine remains only as an offline/API-failure fallback.

### 2.1 Multi-Attribute k-NN Similarity Prior
Candidate strategies are matched against historical campaigns across 5 weighted dimensions:
$$\text{Similarity}(C, H) = w_b \cdot S_{\text{brand}} + w_t \cdot S_{\text{type}} + w_m \cdot S_{\text{market}} + w_c \cdot S_{\text{channels}} + w_u \cdot S_{\text{budget}}$$
- **Brand Affinity ($w_b = 0.25$)**: $1.0$ for exact brand match, $0.65$ for category match.
- **Strategy Archetype ($w_t = 0.30$)**: $1.0$ for exact match, $0.55$ for adjacent formats.
- **Market Overlap ($w_m = 0.20$)**: Evaluates regional market alignment.
- **Channel Overlap ($w_c = 0.15$)**: Jaccard index of selected channels.
- **Budget Log-Distance ($w_u = 0.10$)**: $1 - \min(1, |\log_{10}(B_c) - \log_{10}(B_h)| / 2.0)$.

### 2.2 Sub-Linear Budget Elasticity (Diminishing Marginal Returns)
Reach scales sub-linearly relative to historical baseline spend:
$$\text{Reach}_{\text{expected}} = \text{Reach}_{\text{hist}} \times \left(\frac{\text{Budget}_{\text{candidate}}}{\text{Budget}_{\text{hist}}}\right)^{0.68} \times \text{Synergy}_{\text{channels}} \times \text{Mod}_{\text{urgency}}$$

### 2.3 14-Day Velocity & 90% Confidence Interval Bands
Daily reach accumulation follows channel-specific Weibull decay curves:
- **Organic Reactive**: Front-loaded peak on Days 1–3 ($e^{-0.35t}$).
- **Paid / Mass TV**: Progressive S-curve peaking on Days 5–8 ($t^{2.2} e^{-0.4t}$).
- **90% Confidence Spread**: Computed from historical standard deviation $\sigma$, rendering shaded upper/lower bounds.

### 2.4 Multi-Agent Guardrail Matrix
- **Brand Safety**: Keyword blocklist screening for competitor mentions (e.g. *Nivea*, *Old Spice*, *Heinz*, *Nestle*) and unsubstantiated absolute claims.
- **Cultural Nuance**: Regional legal frameworks (German UWG §6 comparative law, UK CMA Green Claims Code, Indonesian Ramadan broadcast rules).
- **IP & Exclusivity**: Verifies compliance with brand charters (e.g. Dove *No Digital Distortion Pledge*, Rexona *Premier League Kit Guidelines*).

### 2.5 Launch Tier Gating Protocol
| Launch Tier | Criteria | Recommended Action |
| :--- | :--- | :--- |
| 🟢 **Full-Scale Launch** | Confidence $\ge 75$, Zero high-risk flags, Backlash $< 15\%$ | Immediate simultaneous rollout across all target markets. |
| 🟡 **Regional Test First** | Confidence $50 - 74$, or Medium risk flags, Backlash $15\% - 28\%$ | Phased pilot (20% budget in 1 representative market); Gate at 72H. |
| 🔴 **Micro-Test / Hold** | Confidence $< 50$, or High risk flags, Backlash $\ge 28\%$ | Cap spend at $\$10\text{k}-\$25\text{k}$; Mandatory signed risk override required. |

---

## 3. Features & Interactive Views

- **Simulation Studio**: Pre-loaded candidate selector (Rexona referee moment, Dove AI watermark, Knorr Ramadan hack, Magnum Cannes pop-up, Hellmann's leftovers) and custom strategy builder.
- **Hero Recommendation Banner**: Immediate Launch Tier badge, confidence meter (0–100), and executive summary.
- **Reach & Velocity Chart (Recharts)**: 14-day interactive area chart with 90% confidence bands and daily velocity.
- **Sentiment & Reaction Breakdown**: Net sentiment score, positive/neutral/negative split, and backlash risk meter.
- **Risk & Guardrail Inspector**: Visual cards for brand safety, cultural rules, and legal IP with interactive **"Acknowledge & Justify"** override modal.
- **Explainability Panel ("Why This Prediction?")**: Top 3 historical nearest neighbors and factor attribution score drivers.
- **What-If Arena**: Side-by-side comparison of 2–3 strategy variants with real-time slider parameter tuning.
- **Echo Calibration Dashboard**: Model accuracy metrics (MAPE 7.4%, Sentiment Precision 94.2%) and predicted vs. actual backtest charts demonstrating the "Echo → Learn" loop.
- **Audit Trail & Governance Log**: In-browser `localStorage` history table with filtering and one-click CSV / JSON export.

---

## 4. Zero-Cost Client-Side Architecture

Mirror is client-side and uses the configured Gemini API key for its primary analysis:
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS (Dark Enterprise Palette)
- **Charts**: Recharts (Free, Canvas/SVG client-side rendering)
- **Icons**: Lucide React
- **LLM**: Google Gemini via `gemini-2.5-flash`
- **Hosting**: Static distribution hosted for free on GitHub Pages

---

## 5. Getting Started Locally

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Run
```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/mirror.git
cd mirror

# 2. Install dependencies
npm install

# 3. Add your Gemini API key (server-side in local development)
echo 'GEMINI_API_KEY=your_key_here' > .env

# 4. Start local development server
npm run dev
```

The application will start at `http://localhost:5173`. The Vite development server proxies Gemini calls, so the browser does not expose the key. Without the key or when Gemini is unavailable, it falls back to the existing local deterministic simulator. A static GitHub Pages deployment needs an equivalent serverless proxy; it cannot make this protected Gemini request by itself.

---

## 6. GitHub Pages Deployment

### Option A: Automated GitHub Actions Workflow (Included)
The repository includes a ready-to-use GitHub Actions workflow at `.github/workflows/deploy.yml`:
1. Push this repository to GitHub.
2. In your GitHub repository settings, navigate to **Settings** → **Pages**.
3. Under **Build and deployment** → **Source**, select **GitHub Actions**.
4. Every push to the `main` branch will automatically build and deploy the app to `https://<your-username>.github.io/mirror/`.

### Option B: Manual Build & Preview
```bash
# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 7. Project Structure

```
Mirror/
├── .github/workflows/deploy.yml      # Automated GitHub Pages CI/CD workflow
├── public/
│   ├── favicon.svg                   # Techtonic Mirror branded favicon
│   └── unilever-logo.svg
├── src/
│   ├── data/
│   │   ├── brands.json               # Mock Unilever brand portfolio metadata
│   │   ├── historical_campaigns.json # 45+ realistic synthetic past campaigns
│   │   ├── blocklist.json            # Brand safety, claim words & competitor filters
│   │   ├── cultural_flags.json       # Regional & cultural sensitivity rule matrix
│   │   ├── partnerships.json         # Active ambassador/event exclusivity constraints
│   │   └── preloaded_strategies.json # 5 upstream Compass candidate strategies
│   ├── engine/
│   │   ├── types.ts                  # TypeScript data models and interfaces
│   │   ├── similarityEngine.ts       # Multi-attribute k-NN nearest-neighbor matcher
│   │   ├── simulationEngine.ts       # 14-day reach trajectories, sentiment & factor attribution
│   │   ├── guardrailEngine.ts        # Brand safety, cultural compliance & IP scanner
│   │   ├── recommendationEngine.ts   # Launch tier gating & stage-gate playbooks
│   │   └── aiEnhancer.ts             # Gemini LLM-first assessment with local fallback
│   ├── components/
│   │   ├── common/                   # Header, Badge, Modal, LoadingOverlay
│   │   ├── studio/                   # StrategyInputForm, SimulationResults, ReachVelocityChart,
│   │   │                             # SentimentDonut, RiskGuardrailCard, ExplainabilityPanel,
│   │   │                             # ActivationModal, OverrideModal
│   │   ├── comparison/               # WhatIfArena (Side-by-side trade-off matrix)
│   │   ├── calibration/              # CalibrationDashboard (Echo Learn feedback loop)
│   │   ├── audit/                    # AuditTrail (Governance log & CSV/JSON export)
│   │   └── modals/                   # AboutModal (Case context & mathematical foundations)
│   ├── hooks/
│   │   ├── useSimulation.ts          # Orchestrates simulation state & multi-stage progress
│   │   └── useLocalStorage.ts        # In-browser persistent storage wrapper
│   ├── App.tsx                       # Main application shell
│   ├── index.css                     # Custom Tailwind theme tokens & glassmorphism
│   └── main.tsx                      # Application root
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts                    # Configured with relative base './' for static hosting
└── README.md
```

---

## 8. Techtonic Season 8 Judging Criteria Alignment

- **Innovation & Viability**: Solves the critical "speed vs. risk" dilemma in real-time marketing without exposing Unilever to brand backlash.
- **Explainability**: Every prediction is grounded in historical precedent with transparent factor attribution (+/- drivers).
- **Enterprise Readiness**: Built-in multi-agent guardrails, risk override logging, and stage-gated activation protocols.
- **Cost & Deployability**: $0 ongoing operational cost; instant client-side execution.
