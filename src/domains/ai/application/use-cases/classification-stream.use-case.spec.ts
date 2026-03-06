/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable require-yield */
import type { AIProvider } from '../../domain/ai-provider.interface';
import { AIProviderError } from '../../domain/errors/ai-provider.error';
import {
  collectStream,
  createMockAIStreamProvider,
} from '../../testing/create-mock-ai-stream-provider';
import { AIUseCaseError } from '../errors/ai-use-case.error';
import { ClassificationPromptBuilder } from '../prompts';
import { ClassificationStreamUseCase } from './classification-stream.use-case';

describe('ClassificationStreamUseCase', () => {
  let useCase: ClassificationStreamUseCase;

  let mockStreamText: jest.MockedFunction<NonNullable<AIProvider['streamText']>>;
  let mockPromptBuilder: jest.Mocked<ClassificationPromptBuilder>;
  let mockBuild: jest.Mock;

  beforeEach(() => {
    const { provider, mockStreamText: mock } = createMockAIStreamProvider([
      { delta: 'tech', done: false },
      { delta: '', done: true },
    ]);

    mockStreamText = mock;

    mockBuild = jest.fn().mockReturnValue('Mocked classification prompt');

    mockPromptBuilder = {
      build: mockBuild,
    } as unknown as jest.Mocked<ClassificationPromptBuilder>;

    useCase = new ClassificationStreamUseCase(provider, mockPromptBuilder);
  });

  it('should build prompt and call provider stream', async () => {
    const content = 'NestJS is a Node.js framework';
    const categories = ['tech', 'science'];

    const stream = useCase.execute(content, categories);

    const chunks = await collectStream(stream);

    expect(mockBuild).toHaveBeenCalledWith({
      content,
      categories,
    });

    expect(mockStreamText).toHaveBeenCalledTimes(1);

    expect(mockStreamText).toHaveBeenCalledWith({
      prompt: 'Mocked classification prompt',
      maxTokens: 50,
      temperature: 0,
      metadata: { operation: 'classification-stream' },
    });

    expect(chunks.length).toBe(2);
  });

  it('should propagate provider errors', async () => {
    const error = new AIProviderError('Provider request failed', 'mock');

    mockStreamText.mockImplementationOnce(async function* () {
      throw error;
    });

    const stream = useCase.execute('content', ['a', 'b']);

    await expect(collectStream(stream)).rejects.toBeInstanceOf(AIProviderError);
  });

  it('should wrap unknown errors in AIUseCaseError', async () => {
    const unknownError = new Error('Unexpected crash');

    mockStreamText.mockImplementationOnce(async function* () {
      throw unknownError;
    });

    const stream = useCase.execute('content', ['a', 'b']);

    await expect(collectStream(stream)).rejects.toBeInstanceOf(AIUseCaseError);

    await collectStream(stream).catch((err: AIUseCaseError) => {
      expect(err.task).toBe('classification-stream');
      expect(err.cause).toBe(unknownError);
    });
  });

  it('should throw if provider does not support streaming', () => {
    const provider: AIProvider = {
      generateText: jest.fn(),
    };

    const useCase = new ClassificationStreamUseCase(provider, mockPromptBuilder);

    expect(() => useCase.execute('content', ['a'])).toThrow(AIUseCaseError);
  });
});
