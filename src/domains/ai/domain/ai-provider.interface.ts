import type { AITextRequest } from './prompt-input';
import type { AITextResponse, AIStreamChunk } from './ai-response';

export interface AIProvider {
  generateText(input: AITextRequest): Promise<AITextResponse>;

  streamText?(input: AITextRequest): AsyncIterable<AIStreamChunk>;
}
