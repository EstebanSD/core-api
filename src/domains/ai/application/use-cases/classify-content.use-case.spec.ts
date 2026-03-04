import { ClassifyContentUseCase } from './classify-content.use-case';
import type { AIProvider } from '../../domain/ai-provider.interface';
import { createMockAIProvider } from '../../testing/create-mock-ai-provider';
import { AIProviderError } from '../../domain/errors/ai-provider.error';
import { AIUseCaseError } from '../errors/ai-use-case.error';

describe('ClassifyContentUseCase', () => {
  let useCase: ClassifyContentUseCase;
  let mockGenerateText: jest.MockedFunction<AIProvider['generateText']>;

  beforeEach(() => {
    const { provider, mockGenerateText: mock } = createMockAIProvider({
      result: 'Mocked Classify',
    });

    mockGenerateText = mock;
    useCase = new ClassifyContentUseCase(provider);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should call provider with correctly constructed classification prompt', async () => {
    const content = 'New advances in artificial intelligence.';
    const categories = ['sports', 'technology', 'finance'];

    const result = await useCase.execute(content, categories);

    expect(mockGenerateText).toHaveBeenCalledTimes(1);

    const callArgs = mockGenerateText.mock.calls[0][0];
    expect(callArgs.maxTokens).toBe(50);
    expect(callArgs.content).toContain('sports, technology, finance');
    expect(callArgs.content).toContain(content);

    expect(mockGenerateText).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining(content) as string,
      }),
    );

    expect(result).toEqual({
      result: 'Mocked Classify',
      provider: 'mock',
      model: 'mock-model',
    });
  });

  it('should still call provider if categories is empty', async () => {
    await useCase.execute('content', []);

    const callArgs = mockGenerateText.mock.calls[0][0];

    expect(callArgs.content).toContain('Classify the following content');
  });

  it('should propagate provider errors', async () => {
    const { provider, mockGenerateText } = createMockAIProvider();
    const error = new AIProviderError('Provider request failed', 'classification', 'mock');
    mockGenerateText.mockRejectedValueOnce(error);

    const useCase = new ClassifyContentUseCase(provider);

    await expect(useCase.execute('content', ['a'])).rejects.toBeInstanceOf(AIProviderError);
    await useCase.execute('content', ['a']).catch((err: AIProviderError) => {
      expect(err.message).toBe('Provider request failed');
      expect(err.task).toBe('classification');
      expect(err.cause).toBeDefined();
    });
  });

  it('should wrap unknown errors in AIUseCaseError', async () => {
    const { provider, mockGenerateText } = createMockAIProvider();

    const unknownError = new Error('Unexpected crash');
    mockGenerateText.mockRejectedValueOnce(unknownError);

    const useCase = new ClassifyContentUseCase(provider);

    const execution = useCase.execute('content', ['a']);

    await expect(execution).rejects.toBeInstanceOf(AIUseCaseError);

    await execution.catch((err: AIUseCaseError) => {
      expect(err.task).toBe('classification');
      expect(err.cause).toBe(unknownError);
    });
  });
});
