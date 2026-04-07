import type { Category, Modality } from "../models/event";
import type { AnalysisDebugInfo, AnalysisResult, AnalysisStatus } from "../models/analysisResult";
import type { ProcessedEvent } from "../models/normalization";
import { clamp } from "../utils/math";

interface HistoricalStats {
  averageModalityScore: number;
  averageResponseScore: number;
  dominantModality: Modality;
}

export class AnomalyEngine {
  private static readonly minimumHistoryForComparison = 2;
  private static readonly categoryWeights: Record<Category, number> = {
    work: 1.2,
    social: 0.85,
    opinion: 1,
    personal: 1,
  };

  public analyze(current: ProcessedEvent, relevantHistory: ProcessedEvent[]): AnalysisResult {
    if (relevantHistory.length < AnomalyEngine.minimumHistoryForComparison) {
      const debug = this.buildBaselineDebugInfo(current);

      return {
        processedEvent: current,
        baseScore: 0,
        weightedScore: 0,
        anomalyScore: debug.finalAnomalyScore,
        status: "baseline",
        explanation: this.buildBaselineExplanation(current),
        historyCount: relevantHistory.length,
        debug,
      };
    }

    const stats = this.buildHistoricalStats(relevantHistory);
    const modalityDeviation = Math.abs(
      current.normalized.modalityScore - stats.averageModalityScore,
    );
    const responseDeviation = Math.abs(
      current.normalized.responseScore - stats.averageResponseScore,
    );

    const dominantModalityPenalty =
      current.raw.modality !== stats.dominantModality ? 0.15 : 0;
    let baseScore = modalityDeviation * 0.8 + responseDeviation * 0.2;

    baseScore += dominantModalityPenalty;

    const categoryWeight = this.getCategoryWeight(current.raw.category);
    const weightedScore = clamp(baseScore * categoryWeight, 0, 1);
    const status = this.getStatus(weightedScore);
    const debug = this.buildDebugInfo(
      current,
      stats,
      modalityDeviation,
      responseDeviation,
      dominantModalityPenalty,
      categoryWeight,
      baseScore,
      weightedScore,
    );

    return {
      processedEvent: current,
      baseScore,
      weightedScore,
      anomalyScore: weightedScore,
      status,
      explanation: this.buildExplanation(current, stats.dominantModality, modalityDeviation, status),
      historyCount: relevantHistory.length,
      debug,
    };
  }

  private buildBaselineDebugInfo(current: ProcessedEvent): AnalysisDebugInfo {
    return {
      avgHistoricalModalityScore: 0,
      avgHistoricalResponseScore: 0,
      dominantHistoricalModality: "none",
      currentModalityScore: current.normalized.modalityScore,
      currentResponseScore: current.normalized.responseScore,
      modalityDeviation: 0,
      responseDeviation: 0,
      dominantModalityPenalty: 0,
      categoryWeight: this.getCategoryWeight(current.raw.category),
      baseScore: 0,
      finalAnomalyScore: 0,
    };
  }

  private buildHistoricalStats(history: ProcessedEvent[]): HistoricalStats {
    const totalModalityScore = history.reduce(
      (sum, event) => sum + event.normalized.modalityScore,
      0,
    );
    const totalResponseScore = history.reduce(
      (sum, event) => sum + event.normalized.responseScore,
      0,
    );

    return {
      averageModalityScore: totalModalityScore / history.length,
      averageResponseScore: totalResponseScore / history.length,
      dominantModality: this.getDominantModality(history),
    };
  }

  private buildDebugInfo(
    current: ProcessedEvent,
    stats: HistoricalStats,
    modalityDeviation: number,
    responseDeviation: number,
    dominantModalityPenalty: number,
    categoryWeight: number,
    baseScore: number,
    finalAnomalyScore: number,
  ): AnalysisDebugInfo {
    return {
      avgHistoricalModalityScore: stats.averageModalityScore,
      avgHistoricalResponseScore: stats.averageResponseScore,
      dominantHistoricalModality: stats.dominantModality,
      currentModalityScore: current.normalized.modalityScore,
      currentResponseScore: current.normalized.responseScore,
      modalityDeviation,
      responseDeviation,
      dominantModalityPenalty,
      categoryWeight,
      baseScore,
      finalAnomalyScore,
    };
  }

  private getCategoryWeight(category: Category): number {
    return AnomalyEngine.categoryWeights[category];
  }

  private getDominantModality(history: ProcessedEvent[]): Modality {
    const modalityCounts: Record<Modality, number> = {
      text: 0,
      audio: 0,
      video: 0,
    };

    history.forEach((event) => {
      modalityCounts[event.raw.modality] += 1;
    });

    return (Object.entries(modalityCounts) as Array<[Modality, number]>).reduce((dominant, entry) =>
      entry[1] > dominant[1] ? entry : dominant,
    )[0];
  }

  private getStatus(score: number): AnalysisStatus {
    return score < 0.3 ? "consistent" : "anomalous";
  }

  private buildBaselineExplanation(current: ProcessedEvent): string {
    return `Insufficient history for category '${current.raw.category}' and stimulus '${current.raw.stimulus}'; event treated as baseline.`;
  }

  private buildExplanation(
    current: ProcessedEvent,
    dominantModality: Modality,
    modalityDeviation: number,
    status: AnalysisStatus,
  ): string {
    const contextLabel = `'${current.raw.category}/${current.raw.stimulus}'`;
    const weightNote = this.getCategoryWeightNote(current.raw.category);

    if (status === "consistent") {
      return `Behavior is consistent with prior ${contextLabel} events; modality remains close to the historical ${dominantModality} pattern. ${weightNote}`;
    }

    if (current.raw.modality !== dominantModality) {
      return `User usually responds with ${dominantModality} in ${contextLabel} events, but the current event used ${current.raw.modality}, producing a modality deviation of ${modalityDeviation.toFixed(2)}. ${weightNote}`;
    }

    return `Behavior in ${contextLabel} deviates from prior history; response intensity shifted enough to push the event above the anomaly threshold despite the usual ${dominantModality} modality. ${weightNote}`;
  }

  private getCategoryWeightNote(category: Category): string {
    if (category === "work") {
      return "Score adjusted by category weight (work events are considered higher impact).";
    }

    if (category === "social") {
      return "Score adjusted by category weight (social events are treated as lower impact).";
    }

    return "Score adjusted by category weight.";
  }
}
