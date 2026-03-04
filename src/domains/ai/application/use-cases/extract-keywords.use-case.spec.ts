import { ExtractKeywordsUseCase } from './extract-keywords.use-case';
import type { AIProvider } from '../../domain/ai-provider.interface';
import { AIProviderError } from '../../domain/errors/ai-provider.error';
import { createMockAIProvider } from '../../testing/create-mock-ai-provider';
import { AIUseCaseError } from '../errors/ai-use-case.error';

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

  it('should propagate provider errors', async () => {
    const { provider, mockGenerateText } = createMockAIProvider();
    const error = new AIProviderError('Provider request failed', 'keywords', 'mock');
    mockGenerateText.mockRejectedValueOnce(error);

    const useCase = new ExtractKeywordsUseCase(provider);

    await expect(useCase.execute('content')).rejects.toBeInstanceOf(AIProviderError);
    await useCase.execute('content').catch((err: AIProviderError) => {
      expect(err.message).toBe('Provider request failed');
      expect(err.task).toBe('keywords');
      expect(err.cause).toBeDefined();
    });
  });

  it('should wrap unknown errors in AIUseCaseError', async () => {
    const { provider, mockGenerateText } = createMockAIProvider();

    const unknownError = new Error('Unexpected crash');
    mockGenerateText.mockRejectedValueOnce(unknownError);

    const useCase = new ExtractKeywordsUseCase(provider);

    const execution = useCase.execute('content');

    await expect(execution).rejects.toBeInstanceOf(AIUseCaseError);

    await execution.catch((err: AIUseCaseError) => {
      expect(err.task).toBe('keywords');
      expect(err.cause).toBe(unknownError);
    });
  });
});
