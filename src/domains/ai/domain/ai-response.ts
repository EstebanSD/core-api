export interface AIUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export type AIFinishReason = 'stop' | 'length' | 'content_filter' | 'error' | 'unknown';

export interface AIResponse {
  text: string;
  provider: string;
  model: string;

  usage?: AIUsage;
  finishReason?: AIFinishReason;
  metadata?: Record<string, unknown>;
}
