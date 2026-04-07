import { categoryScores, modalityScores, stimulusScores } from "../config/scoreMappings";
import type { EventInput } from "../models/event";
import type { NormalizationContext, NormalizedEvent, ProcessedEvent } from "../models/normalization";
import { clamp, normalizeRange } from "../utils/math";

function normalizeResponse(response: EventInput["response"]): number {
  const rawValue = typeof response === "number" ? response : response.length;

  return clamp(rawValue, 0, 100) / 100;
}

function normalizeTimestamp(timestamp: number, context: NormalizationContext): number {
  return normalizeRange(timestamp, context.minTimestamp, context.maxTimestamp);
}

function buildNormalizedEvent(event: EventInput, context: NormalizationContext): NormalizedEvent {
  return {
    stimulusScore: stimulusScores[event.stimulus],
    modalityScore: modalityScores[event.modality],
    responseScore: normalizeResponse(event.response),
    categoryScore: categoryScores[event.category],
    timeScore: normalizeTimestamp(event.timestamp, context),
  };
}

export function normalizeEvent(event: EventInput, context: NormalizationContext): ProcessedEvent {
  return {
    raw: event,
    normalized: buildNormalizedEvent(event, context),
  };
}
