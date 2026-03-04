import { GenerateSeoMetaUseCase } from './generate-seo-meta.use-case';
import type { AIProvider } from '../../domain/ai-provider.interface';
import { AIProviderError } from '../../domain/errors/ai-provider.error';
import { createMockAIProvider } from '../../testing/create-mock-ai-provider';
import { AIUseCaseError } from '../errors/ai-use-case.error';

describe('GenerateSeoMetaUseCase', () => {
  let useCase: GenerateSeoMetaUseCase;
  let mockGenerateText: jest.MockedFunction<AIProvider['generateText']>;

  beforeEach(() => {
    const { provider, mockGenerateText: mock } = createMockAIProvider({
      result: `Meta title: Example Title
        Meta description: Example description for SEO purposes.
        Keywords: seo, marketing, web, optimization, metadata`,
    });

    mockGenerateText = mock;
    useCase = new GenerateSeoMetaUseCase(provider);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should call provider with correct SEO prompt structure', async () => {
    const content = 'This is an article about modern web development.';

    const result = await useCase.execute(content);

    expect(mockGenerateText).toHaveBeenCalledTimes(1);

    expect(mockGenerateText).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining('Generate SEO metadata') as string,
        maxTokens: 200,
      }),
    );

    expect(mockGenerateText).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining('Meta title (max 60 characters)') as string,
      }),
    );

    expect(mockGenerateText).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining(content) as string,
      }),
    );

    expect(result.result).toContain('Meta title');
    expect(result.provider).toBe('mock');
    expect(result.model).toBe('mock-model');
  });

  it('should propagate provider errors', async () => {
    const { provider, mockGenerateText } = createMockAIProvider();
    const error = new AIProviderError('Provider request failed', 'seo-meta', 'mock');
    mockGenerateText.mockRejectedValueOnce(error);

    const useCase = new GenerateSeoMetaUseCase(provider);

    await expect(useCase.execute('content')).rejects.toBeInstanceOf(AIProviderError);
    await useCase.execute('content').catch((err: AIProviderError) => {
      expect(err.message).toBe('Provider request failed');
      expect(err.task).toBe('seo-meta');
      expect(err.cause).toBeDefined();
    });
  });

  it('should wrap unknown errors in AIUseCaseError', async () => {
    const { provider, mockGenerateText } = createMockAIProvider();

    const unknownError = new Error('Unexpected crash');
    mockGenerateText.mockRejectedValueOnce(unknownError);

    const useCase = new GenerateSeoMetaUseCase(provider);

    const execution = useCase.execute('content');

    await expect(execution).rejects.toBeInstanceOf(AIUseCaseError);

    await execution.catch((err: AIUseCaseError) => {
      expect(err.task).toBe('seo-meta');
      expect(err.cause).toBe(unknownError);
    });
  });
});
