import type { EventInput } from "./event";

export interface NormalizedEvent {
  stimulusScore: number;
  modalityScore: number;
  responseScore: number;
  categoryScore: number;
  timeScore: number;
}

export interface ProcessedEvent {
  raw: EventInput;
  normalized: NormalizedEvent;
}

export interface NormalizationContext {
  minTimestamp: number;
  maxTimestamp: number;
}
