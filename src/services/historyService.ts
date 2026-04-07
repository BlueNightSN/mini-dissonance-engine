import type { ProcessedEvent } from "../models/normalization";

export class HistoryService {
  private readonly events: ProcessedEvent[] = [];

  public getRelevantHistory(event: ProcessedEvent): ProcessedEvent[] {
    return this.events.filter(
      (historicalEvent) =>
        historicalEvent.raw.category === event.raw.category &&
        historicalEvent.raw.stimulus === event.raw.stimulus,
    );
  }

  public add(event: ProcessedEvent): void {
    this.events.push(event);
  }
}
