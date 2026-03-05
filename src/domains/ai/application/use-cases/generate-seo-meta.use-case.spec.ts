import { GenerateSeoMetaUseCase } from './generate-seo-meta.use-case';
import type { AIProvider } from '../../domain/ai-provider.interface';
import { AIProviderError } from '../../domain/errors/ai-provider.error';
import { createMockAIProvider } from '../../testing/create-mock-ai-provider';
import { AIUseCaseError } from '../errors/ai-use-case.error';
import { SeoMetaPromptBuilder } from '../prompts';

describe('GenerateSeoMetaUseCase', () => {
  let useCase: GenerateSeoMetaUseCase;

  let mockGenerateText: jest.MockedFunction<AIProvider['generateText']>;
  let mockPromptBuilder: SeoMetaPromptBuilder;
  let mockBuild: jest.Mock;

  beforeEach(() => {
    const { provider, mockGenerateText: mock } = createMockAIProvider({
      text: 'Mocked SEO',
    });

    mockGenerateText = mock;
    mockBuild = jest.fn().mockReturnValue('Mocked prompt');

    mockPromptBuilder = {
      build: mockBuild,
    } as unknown as SeoMetaPromptBuilder;

    useCase = new GenerateSeoMetaUseCase(provider, mockPromptBuilder);
  });

  it('should build prompt and call provider', async () => {
    const content = 'This is an article about modern web development.';

    const result = await useCase.execute(content);

    expect(mockBuild).toHaveBeenCalledWith({ content });

    expect(mockGenerateText).toHaveBeenCalledTimes(1);

    const callArgs = mockGenerateText.mock.calls[0][0];

    expect(callArgs.prompt).toBe('Mocked prompt');

    expect(result).toEqual({
      text: 'Mocked SEO',
      provider: 'mock',
      model: 'mock-model',
    });
  });

  it('should propagate provider errors', async () => {
    const { provider, mockGenerateText } = createMockAIProvider();

    const error = new AIProviderError('Provider request failed', 'mock');
    mockGenerateText.mockRejectedValueOnce(error);

    const useCase = new GenerateSeoMetaUseCase(provider, mockPromptBuilder);

    await expect(useCase.execute('content')).rejects.toBeInstanceOf(AIProviderError);
  });

  it('should wrap unknown errors in AIUseCaseError', async () => {
    const { provider, mockGenerateText } = createMockAIProvider();

    const unknownError = new Error('Unexpected crash');
    mockGenerateText.mockRejectedValueOnce(unknownError);

    const useCase = new GenerateSeoMetaUseCase(provider, mockPromptBuilder);

    const execution = useCase.execute('content');

    await expect(execution).rejects.toBeInstanceOf(AIUseCaseError);

    await execution.catch((err: AIUseCaseError) => {
      expect(err.task).toBe('seo-meta');
      expect(err.cause).toBe(unknownError);
    });
  });
});
