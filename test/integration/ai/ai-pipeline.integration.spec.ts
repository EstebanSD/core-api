import { CustomLoggerService } from 'src/common/logger/custom-logger.service';
import { AppConfigService } from 'src/config';
import { AIProvider } from 'src/domains/ai/domain/ai-provider.interface';
import { InMemoryAICacheService } from 'src/domains/ai/infrastructure/cache/in-memory-ai-cache.service';
import { AIMetricsService } from 'src/domains/ai/infrastructure/metrics/ai-metrics.service';
import { AIProviderFactory } from 'src/domains/ai/infrastructure/providers/ai-provider.factory';

jest.setTimeout(40000); // TODO .skip() in CI
describe('AI Provider pipeline (integration)', () => {
  let provider: AIProvider;

  beforeAll(() => {
    const config = {
      aiProvider: 'ollama',
      aiModel: 'llama3',
      aiApiKey: 'ollama',
      ollamaBaseUrl: 'http://localhost:11434/v1',
    } as unknown as AppConfigService;

    const logger = new CustomLoggerService();
    const metrics = new AIMetricsService();
    const cache = new InMemoryAICacheService();

    provider = AIProviderFactory.create(config, logger, metrics, cache);
  });

  // open handles warning
  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  it('should cache responses', async () => {
    const input = {
      prompt: 'Caching test example',
    };

    const first = await provider.generateText(input);
    const second = await provider.generateText(input);

    expect(second.text).toBe(first.text);
  });
});
