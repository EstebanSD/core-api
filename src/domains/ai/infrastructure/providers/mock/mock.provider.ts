import { AIProvider } from 'src/domains/ai/domain/ai-provider.interface';
import { PromptInput } from 'src/domains/ai/domain/prompt-input';
import { AIResponse } from 'src/domains/ai/domain/ai-response';
import { MockPromptBuilder } from './mock.prompt-builder';

export class MockProvider implements AIProvider {
  private readonly promptBuilder = new MockPromptBuilder();

  // eslint-disable-next-line @typescript-eslint/require-await
  async generateText(input: PromptInput): Promise<AIResponse> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const prompt = this.promptBuilder.build(input);

    return {
      result: `Mock response for task "${input.task}"`,
      provider: 'mock',
      model: 'mock-model',
      usage: 42,
      latencyMs: 5,
    };
  }
}
