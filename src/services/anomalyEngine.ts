import type { ProcessedEvent } from "../models/normalization";

export class AnomalyEngine {
  public detect(_events: ProcessedEvent[]): void {
    // TODO: Compare normalized events against historical behavior.
    // TODO: Return anomaly signals once step 3 is implemented.
  }
}
