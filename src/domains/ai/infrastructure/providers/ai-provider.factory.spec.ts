/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { AIProviderFactory } from './ai-provider.factory';
import { AppConfigService } from 'src/config';
import { CustomLoggerService } from 'src/common/logger/custom-logger.service';
import { AIMetricsService } from '../metrics/ai-metrics.service';
import { InMemoryAICacheService } from '../cache/in-memory-ai-cache.service';
import { MetricsAIProvider } from './metrics.provider';
import { CacheAIProvider } from './cache.provider';
import { OllamaProvider } from './ollama.provider';
import { MockProvider } from './mock.provider';

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

  it('should create pipeline with OllamaProvider', () => {
    Object.assign(config, { aiProvider: 'ollama' });

    const provider = AIProviderFactory.create(config as AppConfigService, logger, metrics, cache);

    expect(provider).toBeInstanceOf(CacheAIProvider);

    const cacheProvider = (provider as any).provider;
    expect(cacheProvider).toBeInstanceOf(MetricsAIProvider);

    const baseProvider = cacheProvider.provider;
    expect(baseProvider).toBeInstanceOf(OllamaProvider);
  });

  it('should create pipeline with MockProvider', () => {
    Object.assign(config, { aiProvider: 'mock' });

    const provider = AIProviderFactory.create(config as AppConfigService, logger, metrics, cache);

    expect(provider).toBeInstanceOf(CacheAIProvider);

    const cacheProvider = (provider as any).provider;
    const baseProvider = cacheProvider.provider;

    expect(baseProvider).toBeInstanceOf(MockProvider);
  });

  it('should throw error for unsupported provider', () => {
    Object.assign(config, { aiProvider: 'unsupported' });

    expect(() =>
      AIProviderFactory.create(config as AppConfigService, logger, metrics, cache),
    ).toThrow('Unsupported AI provider: unsupported');
  });
});
