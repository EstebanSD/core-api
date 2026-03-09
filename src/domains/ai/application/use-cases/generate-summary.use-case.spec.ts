import { GenerateSummaryUseCase } from './generate-summary.use-case';
import type { AIProvider } from '../../domain/ai-provider.interface';
import { AIProviderError } from '../../domain/errors/ai-provider.error';
import { createMockAIProvider } from '../../testing/create-mock-ai-provider';
import { AIUseCaseError } from '../errors/ai-use-case.error';
import { SummaryPromptBuilder } from '../prompts';

describe('GenerateSummaryUseCase', () => {
  let useCase: GenerateSummaryUseCase;

  let mockGenerateText: jest.MockedFunction<AIProvider['generateText']>;
  let mockPromptBuilder: jest.Mocked<SummaryPromptBuilder>;
  let mockBuild: jest.Mock;

  beforeEach(() => {
    const { provider, mockGenerateText: mock } = createMockAIProvider({
      text: 'Mocked Summary',
    });

    mockGenerateText = mock;
    mockBuild = jest.fn().mockReturnValue('Mocked prompt');

    mockPromptBuilder = {
      build: mockBuild,
    } as unknown as jest.Mocked<SummaryPromptBuilder>;

    useCase = new GenerateSummaryUseCase(provider, mockPromptBuilder);
  });

  it('should build prompt and call provider', async () => {
    const content = 'Some content';

    const result = await useCase.execute(content);

    expect(mockBuild).toHaveBeenCalledWith({ content });

    expect(mockGenerateText).toHaveBeenCalledTimes(1);

    expect(mockGenerateText).toHaveBeenCalledWith({
      prompt: 'Mocked prompt',
      maxTokens: 300,
      temperature: 0.3,
      metadata: { operation: 'summary' },
    });

    expect(result.text).toBe('Mocked Summary');
  });

  it('should propagate provider errors', async () => {
    const error = new AIProviderError('Provider request failed', 'mock');
    mockGenerateText.mockRejectedValueOnce(error);

    await expect(useCase.execute('content')).rejects.toBeInstanceOf(AIProviderError);
  });

  it('should wrap unknown errors in AIUseCaseError', async () => {
    const unknownError = new Error('Unexpected crash');

    mockGenerateText.mockRejectedValueOnce(unknownError);

    const execution = useCase.execute('content');

    await expect(execution).rejects.toBeInstanceOf(AIUseCaseError);

    await execution.catch((err: AIUseCaseError) => {
      expect(err.task).toBe('summary');
      expect(err.cause).toBe(unknownError);
    });
  });
});
