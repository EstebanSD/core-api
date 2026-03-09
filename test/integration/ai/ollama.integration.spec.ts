import { AppConfigService } from 'src/config';
import { CustomLoggerService } from 'src/common/logger/custom-logger.service';
import { OllamaProvider } from 'src/domains/ai/infrastructure/providers/ollama.provider';
import { collectStream } from 'src/domains/ai/testing/create-mock-ai-stream-provider';

const RUN_TEST = process.env.RUN_AI_TESTS === 'true';

jest.setTimeout(60000);
(RUN_TEST ? describe : describe.skip)('OllamaProvider (integration)', () => {
  let provider: OllamaProvider;

  beforeAll(() => {
    const config = {
      aiModel: 'llama3',
      aiApiKey: 'ollama',
      ollamaBaseUrl: 'http://localhost:11434/v1',
    } as unknown as AppConfigService;

    const logger = new CustomLoggerService();

    provider = new OllamaProvider(config, logger);
  });

  // open handles warning
  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  it('should generate text from Ollama', async () => {
    const response = await provider.generateText({
      prompt: 'Explain NestJS in one short sentence.',
    });

    expect(response).toBeDefined();
    expect(response.text).toBeTruthy();
    expect(response.provider).toBe('ollama');
    expect(response.model).toBe('llama3');
  });

  it('should stream text from Ollama', async () => {
    const stream = provider.streamText?.({
      prompt: 'Explain NestJS in one short sentence.',
      maxTokens: 100,
    });

    expect(stream).toBeDefined();

    const chunks = await collectStream(stream);

    expect(chunks.length).toBeGreaterThan(0);

    const text = chunks.map((c) => c.delta).join('');

    expect(text).toBeTruthy();
    expect(chunks[chunks.length - 1].done).toBe(true);
  });
});
