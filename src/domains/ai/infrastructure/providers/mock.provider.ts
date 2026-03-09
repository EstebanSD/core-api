import { AIProvider } from 'src/domains/ai/domain/ai-provider.interface';
import type { AITextRequest } from 'src/domains/ai/domain/prompt-input';
import type { AIStreamChunk, AITextResponse } from 'src/domains/ai/domain/ai-response';

export class MockProvider implements AIProvider {
  // eslint-disable-next-line @typescript-eslint/require-await
  async generateText(input: AITextRequest): Promise<AITextResponse> {
    return {
      text: `Mock response for task "${input.prompt}"`,
      provider: 'mock',
      model: 'mock-model',
      usage: { inputTokens: 40, outputTokens: 40, totalTokens: 80 },
    };
  }

  async *streamText(input: AITextRequest): AsyncIterable<AIStreamChunk> {
    const tokens = input.prompt.split(' ');

    for (const token of tokens) {
      await new Promise((r) => setTimeout(r, 50));

      yield { delta: token + ' ' };
    }

    yield { delta: '', done: true };
  }
}
