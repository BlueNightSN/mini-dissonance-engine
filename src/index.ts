import { mockEvents } from "./data/mockEvents";
import type { AnalysisResult } from "./models/analysisResult";
import type { ProcessedEvent } from "./models/normalization";
import { AnomalyEngine } from "./services/anomalyEngine";
import { ContextProfileService } from "./services/contextProfileService";
import { HistoryService } from "./services/historyService";
import { normalizeEvent } from "./services/normalizationService";

function getTimestampRange(timestamps: number[]): { minTimestamp: number; maxTimestamp: number } {
  return {
    minTimestamp: Math.min(...timestamps),
    maxTimestamp: Math.max(...timestamps),
  };
}

function buildFinalSummary(processedEvent: ProcessedEvent, analysis: AnalysisResult): string {
  const contextLabel = `${processedEvent.raw.category}/${processedEvent.raw.stimulus}`;
  const baselineSummary = `Not enough prior history for ${contextLabel}.`;
  const dominantModality = analysis.debug.dominantHistoricalModality;

  if (analysis.status === "baseline" || dominantModality === "none") {
    return baselineSummary;
  }

  if (analysis.status === "consistent") {
    return `Behavior matches the usual ${dominantModality}-based pattern for ${contextLabel}.`;
  }

  return `Behavior deviates from the usual ${dominantModality}-based pattern for ${contextLabel}.`;
}

function printCleanEventResult(
  index: number,
  processedEvent: ProcessedEvent,
  analysis: AnalysisResult,
): void {
  console.log(`Event #${index + 1} Final Output`);
  console.log(`- status: ${analysis.status}`);
  console.log(`- anomalyScore: ${analysis.anomalyScore.toFixed(2)}`);
  console.log(`- summary: ${buildFinalSummary(processedEvent, analysis)}`);
  console.log("");
}

function getContextKey(processedEvent: ProcessedEvent): string {
  return `${processedEvent.raw.category}:${processedEvent.raw.stimulus}`;
}

function printContextProfileSummary(
  processedEvents: ProcessedEvent[],
  contextWeights: Map<string, number>,
): void {
  const contextProfileService = new ContextProfileService();
  const summaries = contextProfileService.buildSummary(processedEvents);
  const categoryWeights: Array<[string, number]> = [
    ["work", 1.2],
    ["social", 0.8],
    ["opinion", 1],
    ["personal", 1],
  ];
  const categoryWeightLine = categoryWeights
    .map(([category, weight]) => `${category} = ${weight.toFixed(2)}`)
    .join(", ");

  console.log("==============================");
  console.log("Additional Analysis: Context Profiles");
  console.log("==============================");
  console.log("");
  console.log("Weights:");
  console.log(categoryWeightLine);
  console.log("This section provides additional insight into learned behavioral patterns per context.");
  console.log("");

  summaries.forEach((summary) => {
    const contextWeight = contextWeights.get(`${summary.category}:${summary.stimulus}`) ?? 1;

    console.log(`Context: ${summary.category} + ${summary.stimulus}`);
    console.log(`- total events: ${summary.totalEvents}`);
    console.log(`- dominant modality: ${summary.dominantModality}`);
    console.log(`- avg modalityScore: ${summary.averageModalityScore.toFixed(2)}`);
    console.log(`- category weight: ${contextWeight.toFixed(2)}`);
    console.log(`- fingerprint: ${summary.fingerprint}`);
    console.log("");
  });

  console.log(
    "The engine learns context-specific behavioral fingerprints and applies category-based weighting, demonstrating that the same user can exhibit different consistent patterns across contexts, and deviations are detected relative to those context-specific baselines.",
  );
}

function main(): void {
  const timestamps = mockEvents.map((event) => event.timestamp);
  const context = getTimestampRange(timestamps);
  const historyService = new HistoryService();
  const anomalyEngine = new AnomalyEngine();
  const processedEvents: ProcessedEvent[] = [];
  const contextWeights = new Map<string, number>();

  mockEvents.forEach((event, index) => {
    const processedEvent = normalizeEvent(event, context);
    const relevantHistory = historyService.getRelevantHistory(processedEvent);
    const analysis = anomalyEngine.analyze(processedEvent, relevantHistory);

    printCleanEventResult(index, processedEvent, analysis);
    processedEvents.push(processedEvent);
    contextWeights.set(getContextKey(processedEvent), analysis.debug.categoryWeight);
    historyService.add(processedEvent);
  });

  printContextProfileSummary(processedEvents, contextWeights);
}

main();
