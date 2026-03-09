export interface AITextRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  metadata?: {
    operation?: string;
  };
}
