import type { AIProvider } from '../domain/ai-provider.interface';
import type { AIStreamChunk } from '../domain/ai-response';

export function createMockAIStreamProvider(chunks: AIStreamChunk[] = []) {
  const mockStreamText: jest.MockedFunction<NonNullable<AIProvider['streamText']>> = jest
    .fn()
    .mockReturnValue(createMockStream(chunks));

  const provider: AIProvider = {
    generateText: jest.fn(),
    streamText: mockStreamText,
  };

  return {
    provider,
    mockStreamText,
  };
}

// eslint-disable-next-line @typescript-eslint/require-await
async function* createMockStream(chunks: AIStreamChunk[]): AsyncIterable<AIStreamChunk> {
  for (const chunk of chunks) {
    yield chunk;
  }
}

export async function collectStream<T>(stream: AsyncIterable<T>): Promise<T[]> {
  const chunks: T[] = [];

  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  return chunks;
}
