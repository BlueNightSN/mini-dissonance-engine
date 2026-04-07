import type { Category, Modality, Stimulus } from "../models/event";
import type { ProcessedEvent } from "../models/normalization";

export interface ContextProfileSummary {
  category: Category;
  stimulus: Stimulus;
  totalEvents: number;
  dominantModality: Modality;
  averageModalityScore: number;
  fingerprint: string;
}

interface ContextBucket {
  category: Category;
  stimulus: Stimulus;
  events: ProcessedEvent[];
}

export class ContextProfileService {
  public buildSummary(processedEvents: ProcessedEvent[]): ContextProfileSummary[] {
    const buckets = new Map<string, ContextBucket>();

    processedEvents.forEach((event) => {
      const key = this.getContextKey(event);
      const existingBucket = buckets.get(key);

      if (existingBucket) {
        existingBucket.events.push(event);
        return;
      }

      buckets.set(key, {
        category: event.raw.category,
        stimulus: event.raw.stimulus,
        events: [event],
      });
    });

    return Array.from(buckets.values()).map((bucket) => ({
      category: bucket.category,
      stimulus: bucket.stimulus,
      totalEvents: bucket.events.length,
      dominantModality: this.getDominantModality(bucket.events),
      averageModalityScore: this.getAverageModalityScore(bucket.events),
      fingerprint: this.getFingerprint(bucket.events),
    }));
  }

  private getContextKey(event: ProcessedEvent): string {
    return `${event.raw.category}:${event.raw.stimulus}`;
  }

  private getAverageModalityScore(events: ProcessedEvent[]): number {
    const total = events.reduce((sum, event) => sum + event.normalized.modalityScore, 0);

    return total / events.length;
  }

  private getDominantModality(events: ProcessedEvent[]): Modality {
    const counts: Record<Modality, number> = {
      text: 0,
      audio: 0,
      video: 0,
    };

    events.forEach((event) => {
      counts[event.raw.modality] += 1;
    });

    return (Object.entries(counts) as Array<[Modality, number]>).reduce((dominant, entry) =>
      entry[1] > dominant[1] ? entry : dominant,
    )[0];
  }

  private getFingerprint(events: ProcessedEvent[]): string {
    const dominantModality = this.getDominantModality(events);
    const averageModalityScore = this.getAverageModalityScore(events);

    if (dominantModality === "text") {
      if (averageModalityScore <= 0.3) {
        return "user is primarily text-based in this context, indicating lower-exposure / more structured behavior.";
      }

      return "user is primarily text-based in this context, indicating lower-exposure / more structured behavior, with occasional deviations when present.";
    }

    if (dominantModality === "audio") {
      if (averageModalityScore >= 0.6) {
        return "user is primarily audio-based in this context, indicating moderate exposure with some variability when present.";
      }

      return "user is primarily audio-based in this context, indicating moderate exposure with some variability when present.";
    }

    if (averageModalityScore >= 0.85) {
      return "user is primarily video-based in this context, indicating more expressive / higher-exposure behavior with very strong consistency.";
    }

    return "user is primarily video-based in this context, indicating more expressive / higher-exposure behavior.";
  }
}
