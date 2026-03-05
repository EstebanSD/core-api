import { ExtractKeywordsUseCase } from './extract-keywords.use-case';
import type { AIProvider } from '../../domain/ai-provider.interface';
import { AIProviderError } from '../../domain/errors/ai-provider.error';
import { createMockAIProvider } from '../../testing/create-mock-ai-provider';
import { AIUseCaseError } from '../errors/ai-use-case.error';
import { KeywordsPromptBuilder } from '../prompts';

describe('ExtractKeywordsUseCase', () => {
  let useCase: ExtractKeywordsUseCase;

  let mockGenerateText: jest.MockedFunction<AIProvider['generateText']>;
  let mockPromptBuilder: KeywordsPromptBuilder;
  let mockBuild: jest.Mock;

  beforeEach(() => {
    const { provider, mockGenerateText: mock } = createMockAIProvider({
      text: 'Mocked Extract',
    });

    mockGenerateText = mock;
    mockBuild = jest.fn().mockReturnValue('Mocked prompt');

    mockPromptBuilder = {
      build: mockBuild,
    } as unknown as KeywordsPromptBuilder;

    useCase = new ExtractKeywordsUseCase(provider, mockPromptBuilder);
  });

  it('should call provider with correct prompt using default limit', async () => {
    const content = 'Artificial intelligence and automation are transforming industries.';

    const result = await useCase.execute(content);

    expect(mockBuild).toHaveBeenCalledWith({ content, limit: 10 });

    expect(mockGenerateText).toHaveBeenCalledTimes(1);

    const callArgs = mockGenerateText.mock.calls[0][0];

    expect(callArgs.prompt).toBe('Mocked prompt');
    expect(callArgs.maxTokens).toBe(150);

    expect(result).toEqual({
      text: 'Mocked Extract',
      provider: 'mock',
      model: 'mock-model',
    });
  });

  it('should use custom limit when provided', async () => {
    const content = 'Cloud computing and distributed systems.';
    const limit = 5;

    await useCase.execute(content, limit);

    expect(mockBuild).toHaveBeenCalledWith({ content, limit });
    expect(mockGenerateText).toHaveBeenCalled();
  });

  it('should include provided limit even if zero', async () => {
    await useCase.execute('content', 0);

    expect(mockBuild).toHaveBeenCalledWith({ content: 'content', limit: 0 });
  });

  it('should propagate provider errors', async () => {
    const { provider, mockGenerateText } = createMockAIProvider();

    const error = new AIProviderError('Provider request failed', 'mock');
    mockGenerateText.mockRejectedValueOnce(error);

    const useCase = new ExtractKeywordsUseCase(provider, mockPromptBuilder);

    await expect(useCase.execute('content')).rejects.toBeInstanceOf(AIProviderError);
  });

  it('should wrap unknown errors in AIUseCaseError', async () => {
    const { provider, mockGenerateText } = createMockAIProvider();

    const unknownError = new Error('Unexpected crash');
    mockGenerateText.mockRejectedValueOnce(unknownError);

    const useCase = new ExtractKeywordsUseCase(provider, mockPromptBuilder);

    const execution = useCase.execute('content');

    await expect(execution).rejects.toBeInstanceOf(AIUseCaseError);

    await execution.catch((err: AIUseCaseError) => {
      expect(err.task).toBe('keywords');
      expect(err.cause).toBe(unknownError);
    });
  });
});
