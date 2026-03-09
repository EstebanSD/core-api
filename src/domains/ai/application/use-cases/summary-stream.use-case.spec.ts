/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable require-yield */
import type { AIProvider } from '../../domain/ai-provider.interface';
import { AIProviderError } from '../../domain/errors/ai-provider.error';
import {
  collectStream,
  createMockAIStreamProvider,
} from '../../testing/create-mock-ai-stream-provider';
import { AIUseCaseError } from '../errors/ai-use-case.error';
import { SummaryPromptBuilder } from '../prompts';
import { SummaryStreamUseCase } from './summary-stream.use-case';

describe('SummaryStreamUseCase', () => {
  let useCase: SummaryStreamUseCase;

  let mockStreamText: jest.MockedFunction<NonNullable<AIProvider['streamText']>>;
  let mockPromptBuilder: jest.Mocked<SummaryPromptBuilder>;
  let mockBuild: jest.Mock;

  beforeEach(() => {
    const { provider, mockStreamText: mock } = createMockAIStreamProvider([
      { delta: 'Mocked ', done: false },
      { delta: 'Summary', done: false },
      { delta: '', done: true },
    ]);

    mockStreamText = mock;

    mockBuild = jest.fn().mockReturnValue('Mocked prompt');

    mockPromptBuilder = {
      build: mockBuild,
    } as unknown as jest.Mocked<SummaryPromptBuilder>;

    useCase = new SummaryStreamUseCase(provider, mockPromptBuilder);
  });

  it('should build prompt and call provider stream', async () => {
    const content = 'Some content';

    const stream = useCase.execute(content);

    const chunks = await collectStream(stream);

    expect(mockBuild).toHaveBeenCalledWith({ content });

    expect(mockStreamText).toHaveBeenCalledTimes(1);

    expect(mockStreamText).toHaveBeenCalledWith({
      prompt: 'Mocked prompt',
      maxTokens: 300,
      temperature: 0.3,
      metadata: { operation: 'summary-stream' },
    });

    expect(chunks.length).toBe(3);
  });

  it('should propagate provider errors', async () => {
    const error = new AIProviderError('Provider request failed', 'mock');

    mockStreamText.mockImplementationOnce(async function* () {
      throw error;
    });

    const stream = useCase.execute('content');

    await expect(collectStream(stream)).rejects.toBeInstanceOf(AIProviderError);
  });

  it('should wrap unknown errors in AIUseCaseError', async () => {
    const unknownError = new Error('Unexpected crash');

    mockStreamText.mockImplementationOnce(async function* () {
      throw unknownError;
    });

    const stream = useCase.execute('content');

    await expect(collectStream(stream)).rejects.toBeInstanceOf(AIUseCaseError);

    await collectStream(stream).catch((err: AIUseCaseError) => {
      expect(err.task).toBe('summary-stream');
      expect(err.cause).toBe(unknownError);
    });
  });

  it('should throw if provider does not support streaming', () => {
    const provider: AIProvider = {
      generateText: jest.fn(),
    };

    const useCase = new SummaryStreamUseCase(provider, mockPromptBuilder);

    expect(() => useCase.execute('content')).toThrow(AIUseCaseError);
  });
});
