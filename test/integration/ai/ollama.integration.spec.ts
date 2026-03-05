import { AppConfigService } from 'src/config';
import { CustomLoggerService } from 'src/common/logger/custom-logger.service';
import { OllamaProvider } from 'src/domains/ai/infrastructure/providers/ollama.provider';

jest.setTimeout(60000); // TODO .skip() in CI
describe('OllamaProvider (integration)', () => {
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
      prompt: 'Explain NestJS in one sentence.',
    });

    expect(response).toBeDefined();
    expect(response.text).toBeTruthy();
    expect(response.provider).toBe('ollama');
    expect(response.model).toBe('llama3');
  });
});
