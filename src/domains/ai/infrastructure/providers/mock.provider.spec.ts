import type { AIStreamChunk } from '../../domain/ai-response';
import { MockProvider } from './mock.provider';

describe('MockProvider', () => {
  let provider: MockProvider;

  beforeEach(() => {
    provider = new MockProvider();
  });

  describe('generateText', () => {
    it('should return mock AI response', async () => {
      const response = await provider.generateText({
        prompt: 'Explain TypeScript in one sentence',
      });

      expect(response).toBeDefined();
      expect(response.text).toBeTruthy();
      expect(response.provider).toBe('mock');
      expect(response.model).toBeDefined();
    });
  });

  describe('streamText', () => {
    it('should stream chunks', async () => {
      const stream = provider.streamText({
        prompt: 'Explain streaming in one sentence',
      });

      const chunks: AIStreamChunk[] = [];

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      expect(chunks.length).toBeGreaterThan(0);

      const last = chunks[chunks.length - 1];

      expect(last.done).toBe(true);
    });
  });
});
