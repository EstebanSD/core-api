import type { AIProvider } from '../domain/ai-provider.interface';
import type { AITextResponse } from '../domain/ai-response';

export function createMockAIProvider(response: Partial<AITextResponse> = {}) {
  const mockGenerateText: jest.MockedFunction<AIProvider['generateText']> = jest
    .fn()
    .mockResolvedValue({
      text: 'mock-text',
      provider: 'mock',
      model: 'mock-model',
      ...response,
    });

  const provider: AIProvider = {
    generateText: mockGenerateText,
  };

  return {
    provider,
    mockGenerateText,
  };
}
