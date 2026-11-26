# Execution & Runbook: OKOLIMO-Joseph GitHub Profile

## Project Summary
This repository contains the official GitHub Profile README configuration and the automated **Commit Tetris** contribution matrix generator for Joseph Okolimo.

---

## Quick Commands

```bash
# 1. Run all unit tests
npm test

# 2. Test generation in demo mode (offline / mock data)
npm run generate:tetris:demo

# 3. Test generation with live GitHub contributions
npm run generate:tetris
```

---

## Verification Artifacts
- **Primary Asset**: `generated/commit-tetris.svg`
- **Workflow**: `.github/workflows/generate-tetris.yml`
- **Tests**: `tests/normalizer.test.mjs`, `tests/svg-validity.test.mjs`
