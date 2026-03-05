import { AppConfigService } from 'src/config';
import { CustomLoggerService } from 'src/common/logger/custom-logger.service';
import type { AIProvider } from '../../domain/ai-provider.interface';
import { AIMetricsService } from '../metrics/ai-metrics.service';
import { InMemoryAICacheService } from '../cache/in-memory-ai-cache.service';
import { OllamaProvider } from './ollama.provider';
import { MockProvider } from './mock.provider';
import { AIProviderPipelineBuilder } from './ai-provider.pipeline';

export class AIProviderFactory {
  static create(
    config: AppConfigService,
    logger: CustomLoggerService,
    metrics: AIMetricsService,
    cache: InMemoryAICacheService,
  ): AIProvider {
    const providerType = config.aiProvider;
    let baseProvider: AIProvider;

    switch (providerType) {
      case 'ollama': {
        baseProvider = new OllamaProvider(config, logger);
        break;
      }

      case 'mock': {
        baseProvider = new MockProvider();
        break;
      }

      default:
        throw new Error(`Unsupported AI provider: ${providerType}`);
    }

    return new AIProviderPipelineBuilder(baseProvider)
      .withMetrics(metrics)
      .withCache(cache, metrics)
      .build();
  }
}
