import type { Category, Modality, Stimulus } from "../models/event";

export const stimulusScores: Record<Stimulus, number> = {
  question: 0.3,
  vote: 0.5,
  challenge: 0.8,
};

export const modalityScores: Record<Modality, number> = {
  text: 0.2,
  audio: 0.6,
  video: 0.9,
};

export const categoryScores: Record<Category, number> = {
  work: 0.2,
  opinion: 0.5,
  social: 0.7,
  personal: 0.9,
};
