# Mini Dissonance Engine

Mini Dissonance Engine is a backend-only Node.js + TypeScript project focused on the first two stages of a behavioral dissonance pipeline:

1. load mock user events
2. normalize each event into a numeric representation

Anomaly detection is intentionally not implemented yet.

## Install

```bash
npm install
```

## Run

```bash
npm start
```

## Type Check

```bash
npm run typecheck
```

## Build

```bash
npm run build
```

## Structure

```text
src/
  config/    Fixed score mappings for normalization
  data/      Mock event dataset
  models/    Strict domain types
  services/  Normalization service and anomaly-engine stub
  utils/     Shared math helpers
  index.ts   Entry point that loads, normalizes, and prints events
```

## Current Scope

- Mock data is static and deterministic.
- Normalization covers stimulus, modality, category, response, and time.
- Anomaly detection is a TODO stub for future work.
