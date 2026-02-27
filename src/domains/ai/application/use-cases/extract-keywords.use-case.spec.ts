import { ExtractKeywordsUseCase } from './extract-keywords.use-case';
import type { AIProvider } from '../../domain/ai-provider.interface';
import { createMockAIProvider } from '../../testing/create-mock-ai-provider';

describe('ExtractKeywordsUseCase', () => {
  let useCase: ExtractKeywordsUseCase;
  let mockGenerateText: jest.MockedFunction<AIProvider['generateText']>;

  beforeEach(() => {
    const { provider, mockGenerateText: mock } = createMockAIProvider({
      result: 'Mocked Extract',
    });

    mockGenerateText = mock;
    useCase = new ExtractKeywordsUseCase(provider);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should call provider with correct prompt using default limit', async () => {
    const content = 'Artificial intelligence and automation are transforming industries.';

    const result = await useCase.execute(content);

    expect(mockGenerateText).toHaveBeenCalledTimes(1);

    expect(mockGenerateText).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining('Extract the 10 most relevant keywords') as string,
        maxTokens: 150,
      }),
    );

    expect(mockGenerateText).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining(content) as string,
      }),
    );

    expect(result).toEqual({
      result: 'Mocked Extract',
      provider: 'mock',
      model: 'mock-model',
    });
  });

  it('should use custom limit when provided', async () => {
    const content = 'Cloud computing and distributed systems.';
    const customLimit = 5;

    await useCase.execute(content, customLimit);

    expect(mockGenerateText).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining(
          `Extract the ${customLimit} most relevant keywords`,
        ) as string,
      }),
    );
  });

  it('should include provided limit even if zero', async () => {
    await useCase.execute('content', 0);

    const callArgs = mockGenerateText.mock.calls[0][0];

    expect(callArgs.content).toContain('Extract the 0 most relevant keywords');
  });
});
