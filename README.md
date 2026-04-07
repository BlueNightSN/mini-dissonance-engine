# Mini Dissonance Engine

Mini Dissonance Engine is a backend-only Node.js + TypeScript project that simulates a small behavioral analysis pipeline over a deterministic mock dataset.

It currently:

1. loads mock user events
2. normalizes each event into numeric features
3. compares each event against relevant historical context
4. assigns an anomaly status and score
5. prints final event output plus a context profile summary

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

You can also run:

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

## What The Program Prints

Running the project prints:

- a `Final Output` block for each event
- the event `status` (`baseline`, `consistent`, or `anomalous`)
- the computed `anomalyScore`
- a short human-readable summary for that event
- an `Additional Analysis: Context Profiles` section at the end

## Project Structure

```text
src/
  config/    Fixed score mappings used during normalization
  data/      Mock event dataset
  models/    Domain types for events, normalization, and analysis
  services/  Normalization, history, anomaly, and context profile services
  utils/     Shared math helpers
  index.ts   Entry point that runs the pipeline and prints output
```

## Current Scope

- Mock data is static and deterministic.
- Normalization covers stimulus, modality, category, response, and time.
- History is scoped by matching category and stimulus.
- Anomaly scoring is context-aware and category-weighted.
- Context profile summaries describe dominant modality patterns per context.

## Notes

- This project is intentionally small and console-based.
- Output is designed to be easy to inspect from the terminal.
