import { PromptInput } from './prompt-input';
import { AIResponse } from './ai-response';

export interface AIProvider {
  generateText(input: PromptInput): Promise<AIResponse>;
}
