import { AIProviderFactory } from './ai-provider.factory';
import { AppConfigService } from 'src/config';
import { CustomLoggerService } from 'src/common/logger/custom-logger.service';
import { AIMetricsService } from '../metrics/ai-metrics.service';
import { InMemoryAICacheService } from '../cache/in-memory-ai-cache.service';
import { OllamaProvider } from './ollama';
import { MockProvider } from './mock';

describe('AIProviderFactory', () => {
  let config: Partial<AppConfigService>;
  let logger: CustomLoggerService;
  let metrics: AIMetricsService;
  let cache: InMemoryAICacheService;

  beforeEach(() => {
    config = {
      aiProvider: 'ollama',
      aiModel: 'test-model',
      aiApiKey: 'test-key',
      ollamaBaseUrl: 'http://localhost:11434',
    };

    logger = {
      setContext: jest.fn(),
      error: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
    } as unknown as CustomLoggerService;

    metrics = new AIMetricsService();
    cache = new InMemoryAICacheService();
  });

  it('should create OllamaProvider when aiProvider is "ollama"', () => {
    Object.assign(config, { aiProvider: 'ollama' });

    const provider = AIProviderFactory.create(config as AppConfigService, logger, metrics, cache);

    expect(provider).toBeInstanceOf(OllamaProvider);
  });

  it('should create MockProvider when aiProvider is "mock"', () => {
    Object.assign(config, { aiProvider: 'mock' });

    const provider = AIProviderFactory.create(config as AppConfigService, logger, metrics, cache);

    expect(provider).toBeInstanceOf(MockProvider);
  });

  it('should throw error for unsupported provider', () => {
    Object.assign(config, { aiProvider: 'unsupported' });

    expect(() =>
      AIProviderFactory.create(config as AppConfigService, logger, metrics, cache),
    ).toThrow('Unsupported AI provider: unsupported');
  });
});
