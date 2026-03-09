import { AIProvider } from '../../domain/ai-provider.interface';
import { InMemoryAICacheService } from '../cache/in-memory-ai-cache.service';
import { AIMetricsService } from '../metrics/ai-metrics.service';
import { CacheAIProvider } from './cache.provider';
import { MetricsAIProvider } from './metrics.provider';

export class AIProviderPipelineBuilder {
  constructor(private provider: AIProvider) {}

  withMetrics(metrics: AIMetricsService) {
    this.provider = new MetricsAIProvider(this.provider, metrics);
    return this;
  }

  withCache(cache: InMemoryAICacheService, metrics: AIMetricsService) {
    this.provider = new CacheAIProvider(this.provider, cache, metrics);
    return this;
  }

  build(): AIProvider {
    return this.provider;
  }
}
