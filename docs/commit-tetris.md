# Commit Tetris Engine Documentation

A custom, automated, data-driven contribution visualization engine that maps authentic GitHub contribution history into a falling Tetris matrix.

---

## 1. Concept & Overview

Rather than a generic snake animation, **Commit Tetris** converts your actual GitHub contribution calendar (53 weeks × 7 days = 371 cells) into a falling tetromino matrix.

- **Data Integrity**: Every block corresponds to a real day in your contribution history.
- **Visual Intensity**: Contribution counts are mapped to 5 distinct intensity levels (Level 0 through Level 4).
- **Zero-Dependency Vector Output**: Generates an optimized, standalone SVG (`generated/commit-tetris.svg`) under 80 KB.
- **GitHub README Compatibility**: Leverages standard CSS keyframe transforms and SMIL timing that render fluidly through GitHub's Camo image caching proxy.

---

## 2. Technical Architecture

```
GitHub GraphQL API (or local demo generator)
                  │
                  ▼
   [ fetch-contributions.mjs ]
                  │
                  ▼
     [ normalize-data.mjs ] ──► (Validates 53x7 grid, computes streaks & quartile stats)
                  │
                  ▼
       [ render-svg.mjs ]   ──► (Calculates staggered animation delays & renders SVG)
                  │
                  ▼
   [ generated/commit-tetris.svg ]
                  │
                  ▼
        [ Profile README.md ]
```

### Contribution Intensity Mapping
- **Level 0 (No Activity)**: `#101623` base slot.
- **Level 1 (Low Activity)**: `#064e3b` (Deep emerald).
- **Level 2 (Moderate Activity)**: `#0284c7` (Electric sky blue).
- **Level 3 (High Activity)**: `#4f46e5` (Cobalt pulse).
- **Level 4 (Hyper-Activity)**: `#00f2fe` (Neon line clear).

---

## 3. Local Development & Runbook

### Prerequisites
- Node.js v18 or higher (v20+ recommended).
- GitHub CLI (`gh`) authenticated locally for live querying without tokens, or a valid `GITHUB_TOKEN`.

### Available Commands

```bash
# Run unit validation test suite
npm test

# Generate visualization using synthetic demo data (offline, no network required)
npm run generate:tetris:demo

# Generate visualization using real GitHub contribution data
npm run generate:tetris
```

---

## 4. GitHub Actions Automation

The visualization automatically updates daily via `.github/workflows/generate-tetris.yml`:

- **Trigger Schedule**: Daily at `00:00 UTC` (`cron: '0 0 * * *'`).
- **Manual Trigger**: Supports on-demand execution via `workflow_dispatch`.
- **Permissions Required**:
  ```yaml
  permissions:
    contents: write
  ```
- **Secret Handling**: Uses the default `${{ secrets.GITHUB_TOKEN }}` provided by GitHub Actions runners. No personal access tokens (PAT) are stored or committed.
- **Defensive Error Handling**: If the GitHub GraphQL endpoint is unreachable or rate-limited, the workflow logs the warning and terminates without deleting or corrupting the existing `commit-tetris.svg`.

---

## 5. Customization Guide

### Changing Colors
Edit `PALETTE` in `scripts/lib/render-svg.mjs`:
```javascript
const PALETTE = {
  0: { fill: '#101623', stroke: '#1e293b' },
  1: { fill: '#064e3b', stroke: '#059669' },
  2: { fill: '#0284c7', stroke: '#38bdf8' },
  3: { fill: '#4f46e5', stroke: '#818cf8' },
  4: { fill: '#00f2fe', stroke: '#e0f2fe' }
};
```

### Changing Animation Speed & Loop Duration
Modify the `duration` parameter in `scripts/generate-tetris.mjs` or `animCycle` in `scripts/lib/render-svg.mjs`:
```javascript
const animCycle = options.duration || 10; // Defaults to a 10-second loop
```

### Changing Dimensions
The default SVG canvas is `920px × 275px` (`cellPitch = 15.2px`, `cellSize = 12px`), perfectly sized for desktop, tablet, and mobile viewports in GitHub READMEs. Adjust `cellPitch` and `svgWidth` in `scripts/lib/render-svg.mjs` if a narrower or wider board is desired.

---

## 6. Troubleshooting

- **Camo Cache Delays**: GitHub's image caching proxy may take up to a few minutes to invalidate cached SVGs after a new commit. The SVG updates automatically on the next load.
- **GraphQL Rate Limiting**: The GraphQL API query consumes only 1 point of rate-limit budget per day. In CI, `${{ secrets.GITHUB_TOKEN }}` has 1,000 requests/hour allowance.
