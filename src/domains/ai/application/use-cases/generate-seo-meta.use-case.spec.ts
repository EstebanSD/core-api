import { GenerateSeoMetaUseCase } from './generate-seo-meta.use-case';
import type { AIProvider } from '../../domain/ai-provider.interface';
import { createMockAIProvider } from '../../testing/create-mock-ai-provider';

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
});
