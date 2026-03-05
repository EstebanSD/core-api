import { Injectable } from '@nestjs/common';
import { AIProvider } from '../../domain/ai-provider.interface';
import { InMemoryAICacheService } from '../cache/in-memory-ai-cache.service';
import { AIMetricsService } from '../metrics/ai-metrics.service';
import type { AITextRequest } from '../../domain/prompt-input';
import type { AIResponse } from '../../domain/ai-response';

@Injectable()
export class CacheAIProvider implements AIProvider {
  constructor(
    private readonly provider: AIProvider,
    private readonly cache: InMemoryAICacheService,
    private readonly metrics: AIMetricsService,
  ) {}

  async generateText(input: AITextRequest): Promise<AIResponse> {
    const key = JSON.stringify(input);

    const cached = this.cache.get(key);

    if (cached) {
      this.metrics.recordCacheHit(input.metadata?.operation ?? 'unknown');
      return cached;
    }

    const result = await this.provider.generateText(input);

    this.cache.set(key, result, 60000);

    return result;
  }
}
