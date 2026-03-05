import { ClassifyContentUseCase } from './classify-content.use-case';
import type { AIProvider } from '../../domain/ai-provider.interface';
import { createMockAIProvider } from '../../testing/create-mock-ai-provider';
import { AIProviderError } from '../../domain/errors/ai-provider.error';
import { AIUseCaseError } from '../errors/ai-use-case.error';
import { ClassificationPromptBuilder } from '../prompts';

describe('ClassifyContentUseCase', () => {
  let useCase: ClassifyContentUseCase;

  let mockGenerateText: jest.MockedFunction<AIProvider['generateText']>;
  let mockPromptBuilder: ClassificationPromptBuilder;
  let mockBuild: jest.Mock;

  beforeEach(() => {
    const { provider, mockGenerateText: mock } = createMockAIProvider({
      text: 'Mocked Classify',
    });

    mockGenerateText = mock;
    mockBuild = jest.fn().mockReturnValue('Mocked prompt');

    mockPromptBuilder = {
      build: mockBuild,
    } as unknown as ClassificationPromptBuilder;

    useCase = new ClassifyContentUseCase(provider, mockPromptBuilder);
  });

  it('should call provider with correctly constructed classification prompt', async () => {
    const content = 'New advances in artificial intelligence.';
    const categories = ['sports', 'technology', 'finance'];

    const result = await useCase.execute(content, categories);

    expect(mockBuild).toHaveBeenCalledWith({ content, categories });

    expect(mockGenerateText).toHaveBeenCalledTimes(1);

    const callArgs = mockGenerateText.mock.calls[0][0];
    expect(callArgs.maxTokens).toBe(50);
    expect(callArgs.prompt).toBe('Mocked prompt');

    expect(result).toEqual({
      text: 'Mocked Classify',
      provider: 'mock',
      model: 'mock-model',
    });
  });

  it('should still call provider if categories is empty', async () => {
    await useCase.execute('content', []);

    expect(mockBuild).toHaveBeenCalledWith({ content: 'content', categories: [] });
    expect(mockGenerateText).toHaveBeenCalled();
  });

  it('should propagate provider errors', async () => {
    const { provider, mockGenerateText } = createMockAIProvider();

    const error = new AIProviderError('Provider request failed', 'mock');
    mockGenerateText.mockRejectedValueOnce(error);

    const useCase = new ClassifyContentUseCase(provider, mockPromptBuilder);

    await expect(useCase.execute('content', ['a'])).rejects.toBeInstanceOf(AIProviderError);
  });

  it('should wrap unknown errors in AIUseCaseError', async () => {
    const { provider, mockGenerateText } = createMockAIProvider();

    const unknownError = new Error('Unexpected crash');
    mockGenerateText.mockRejectedValueOnce(unknownError);

    const useCase = new ClassifyContentUseCase(provider, mockPromptBuilder);

    const execution = useCase.execute('content', ['a']);

    await expect(execution).rejects.toBeInstanceOf(AIUseCaseError);

    await execution.catch((err: AIUseCaseError) => {
      expect(err.task).toBe('classification');
      expect(err.cause).toBe(unknownError);
    });
  });
});
