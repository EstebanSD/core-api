export type AITaskType = 'summary' | 'keywords' | 'classification' | 'seo-meta';

export interface PromptInput {
  task: AITaskType;
  content: string;

  language?: string;
  tone?: string;
  maxTokens?: number;

  metadata?: Record<string, unknown>;
}
