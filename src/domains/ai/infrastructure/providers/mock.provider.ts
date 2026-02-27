import { AIProvider } from '../../domain/ai-provider.interface';
import { PromptInput } from '../../domain/prompt-input';
import { AIResponse } from '../../domain/ai-response';

export class MockProvider implements AIProvider {
  // eslint-disable-next-line @typescript-eslint/require-await
  async generateText(input: PromptInput): Promise<AIResponse> {
    return {
      result: `Mock summary for: ${input.content.slice(0, 50)}`,
      provider: 'mock',
      model: 'mock-model',
      usage: 42,
      latencyMs: 5,
    };
  }
}
