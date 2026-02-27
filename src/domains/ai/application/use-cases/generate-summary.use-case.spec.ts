import { GenerateSummaryUseCase } from './generate-summary.use-case';
import type { AIProvider } from '../../domain/ai-provider.interface';
import { createMockAIProvider } from '../../testing/create-mock-ai-provider';

describe('GenerateSummaryUseCase', () => {
  let useCase: GenerateSummaryUseCase;
  let mockGenerateText: jest.MockedFunction<AIProvider['generateText']>;

  beforeEach(() => {
    const { provider, mockGenerateText: mock } = createMockAIProvider({
      result: 'Mocked Summary',
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
        content: expect.stringContaining(inputContent) as string,
        maxTokens: 300,
      }),
    );

    expect(result.result).toBe('Mocked Summary');
  });
});
