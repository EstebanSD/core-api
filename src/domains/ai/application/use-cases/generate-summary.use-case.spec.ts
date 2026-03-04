import { GenerateSummaryUseCase } from './generate-summary.use-case';
import type { AIProvider } from '../../domain/ai-provider.interface';
import { AIProviderError } from '../../domain/errors/ai-provider.error';
import { createMockAIProvider } from '../../testing/create-mock-ai-provider';
import { AIUseCaseError } from '../errors/ai-use-case.error';

describe('GenerateSummaryUseCase', () => {
  let useCase: GenerateSummaryUseCase;
  let mockGenerateText: jest.MockedFunction<AIProvider['generateText']>;

  beforeEach(() => {
    const { provider, mockGenerateText: mock } = createMockAIProvider({
      text: 'Mocked Summary',
    });

    mockGenerateText = mock;
    useCase = new GenerateSummaryUseCase(provider);
  });

  it('should call provider with correct prompt', async () => {
    const inputContent = 'Some content';

    const result = await useCase.execute(inputContent);

    expect(mockGenerateText).toHaveBeenCalledTimes(1);

    expect(mockGenerateText).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.stringContaining(inputContent) as string,
        maxTokens: 300,
      }),
    );

    expect(result.text).toBe('Mocked Summary');
  });

  it('should propagate provider errors', async () => {
    const { provider, mockGenerateText } = createMockAIProvider();
    const error = new AIProviderError('Provider request failed', 'mock');
    mockGenerateText.mockRejectedValueOnce(error);

    const useCase = new GenerateSummaryUseCase(provider);

    await expect(useCase.execute('content')).rejects.toBeInstanceOf(AIProviderError);
    await useCase.execute('content').catch((err: AIProviderError) => {
      expect(err.message).toBe('Provider request failed');
      expect(err.provider).toBe('mock');
      expect(err.cause).toBeDefined();
    });
  });

  it('should wrap unknown errors in AIUseCaseError', async () => {
    const { provider, mockGenerateText } = createMockAIProvider();

    const unknownError = new Error('Unexpected crash');
    mockGenerateText.mockRejectedValueOnce(unknownError);

    const useCase = new GenerateSummaryUseCase(provider);

    const execution = useCase.execute('content');

    await expect(execution).rejects.toBeInstanceOf(AIUseCaseError);

    await execution.catch((err: AIUseCaseError) => {
      expect(err.task).toBe('summary');
      expect(err.cause).toBe(unknownError);
    });
  });
});
