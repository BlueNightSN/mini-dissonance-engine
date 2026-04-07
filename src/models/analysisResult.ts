import type { ProcessedEvent } from "./normalization";
import type { Modality } from "./event";

export type AnalysisStatus = "baseline" | "consistent" | "anomalous";

export interface AnalysisDebugInfo {
  avgHistoricalModalityScore: number;
  avgHistoricalResponseScore: number;
  dominantHistoricalModality: Modality | "none";
  currentModalityScore: number;
  currentResponseScore: number;
  modalityDeviation: number;
  responseDeviation: number;
  dominantModalityPenalty: number;
  categoryWeight: number;
  baseScore: number;
  finalAnomalyScore: number;
}

export interface AnalysisResult {
  processedEvent: ProcessedEvent;
  baseScore: number;
  weightedScore: number;
  anomalyScore: number;
  status: AnalysisStatus;
  explanation: string;
  historyCount: number;
  debug: AnalysisDebugInfo;
}
