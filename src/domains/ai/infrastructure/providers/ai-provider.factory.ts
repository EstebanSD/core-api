import { AppConfigService } from 'src/config';
import { CustomLoggerService } from 'src/common/logger/custom-logger.service';
import type { AIProvider } from '../../domain/ai-provider.interface';
import { AIMetricsService } from '../metrics/ai-metrics.service';
import { OllamaProvider } from './ollama';
import { MockProvider } from './mock';
import { InMemoryAICacheService } from '../cache/in-memory-ai-cache.service';

export class AIProviderFactory {
  static create(
    config: AppConfigService,
    logger: CustomLoggerService,
    metrics: AIMetricsService,
    cache: InMemoryAICacheService,
  ): AIProvider {
    const providerType = config.aiProvider;

    switch (providerType) {
      case 'ollama':
        return new OllamaProvider(config, logger, metrics, cache);

      case 'mock':
        return new MockProvider();

      default:
        throw new Error(`Unsupported AI provider: ${providerType}`);
    }
  }
}
