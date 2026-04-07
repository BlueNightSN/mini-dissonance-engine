import { mockEvents } from "./data/mockEvents";
import type { ProcessedEvent } from "./models/normalization";
import { AnomalyEngine } from "./services/anomalyEngine";
import { normalizeEvent } from "./services/normalizationService";

function getTimestampRange(timestamps: number[]): { minTimestamp: number; maxTimestamp: number } {
  return {
    minTimestamp: Math.min(...timestamps),
    maxTimestamp: Math.max(...timestamps),
  };
}

function printProcessedEvents(processedEvents: ProcessedEvent[]): void {
  processedEvents.forEach((processedEvent, index) => {
    console.log(`Event ${index + 1}`);
    console.log(JSON.stringify(processedEvent, null, 2));
    console.log("");
  });
}

function main(): void {
  const timestamps = mockEvents.map((event) => event.timestamp);
  const context = getTimestampRange(timestamps);
  const processedEvents = mockEvents.map((event) => normalizeEvent(event, context));

  printProcessedEvents(processedEvents);

  // TODO: Integrate anomaly detection once historical comparison is implemented.
  void new AnomalyEngine();
}

main();
