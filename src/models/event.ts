export type Stimulus = "question" | "challenge" | "vote";

export type Modality = "text" | "audio" | "video";

export type Category = "social" | "work" | "opinion" | "personal";

export interface EventInput {
  stimulus: Stimulus;
  modality: Modality;
  response: string | number;
  category: Category;
  timestamp: number;
}
