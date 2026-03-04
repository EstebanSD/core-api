import type { AITextRequest } from './prompt-input';
import type { AIResponse } from './ai-response';

export interface AIProvider {
  generateText(input: AITextRequest): Promise<AIResponse>;
}
