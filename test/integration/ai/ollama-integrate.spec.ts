import { AppConfigService } from 'src/config';
import { CustomLoggerService } from 'src/common/logger/custom-logger.service';
import { AIMetricsService } from 'src/domains/ai/infrastructure/metrics/ai-metrics.service';
import { OllamaProvider } from 'src/domains/ai/infrastructure/providers/ollama';
import type { PromptInput } from 'src/domains/ai/domain/prompt-input';

jest.setTimeout(30000);
describe('OllamaProvider (integration)', () => {
  let provider: OllamaProvider;

  beforeAll(() => {
    const config = {
      aiModel: 'llama3',
      aiApiKey: 'ollama',
      ollamaBaseUrl: 'http://localhost:11434/v1',
    } as unknown as AppConfigService;

    provider = new OllamaProvider(config, new CustomLoggerService(), new AIMetricsService());
  });

  beforeAll(async () => {
    await provider.generateText({
      task: 'summary',
      content: 'warmup',
    });
  });

  it('should generate text from Ollama', async () => {
    const response = await provider.generateText({
      task: 'summary',
      content: 'NestJS is a progressive Node.js framework.',
    });

    expect(response).toBeDefined();
    expect(response.result).toBeTruthy();
    expect(response.provider).toBe('ollama');
    expect(response.model).toBe('llama3');
  }, 20000);

  it('should use cache on second call', async () => {
    const input = {
      task: 'summary',
      content: 'Caching test example',
    } as PromptInput;

    const first = await provider.generateText(input);
    const second = await provider.generateText(input);

    expect(second.result).toBe(first.result);
  });
});
