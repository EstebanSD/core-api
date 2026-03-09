import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { AIProvider } from '../../domain/ai-provider.interface';
import { InMemoryAICacheService } from '../cache/in-memory-ai-cache.service';
import { AIMetricsService } from '../metrics/ai-metrics.service';
import type { AITextRequest } from '../../domain/prompt-input';
import type { AITextResponse } from '../../domain/ai-response';

@Injectable()
export class CacheAIProvider implements AIProvider {
  private static readonly DEFAULT_TTL = 60000;

  constructor(
    private readonly provider: AIProvider,
    private readonly cache: InMemoryAICacheService,
    private readonly metrics: AIMetricsService,
  ) {}

  async generateText(input: AITextRequest): Promise<AITextResponse> {
    const key = this.buildCacheKey(input);

    const cached = this.cache.get(key);

    if (cached) {
      this.metrics.recordCacheHit(input.metadata?.operation ?? 'unknown');
      return cached;
    }

    const result = await this.provider.generateText(input);

    this.cache.set(key, result, CacheAIProvider.DEFAULT_TTL);

    return result;
  }

  streamText(input: AITextRequest) {
    if (!this.provider.streamText) {
      throw new Error('Provider does not support streaming');
    }

    return this.provider.streamText(input);
  }

  private buildCacheKey(input: AITextRequest): string {
    const raw = [
      input.metadata?.operation ?? 'unknown',
      input.prompt.slice(0, 2000),
      input.maxTokens ?? '',
      input.temperature ?? '',
    ].join('|');

    return createHash('sha256').update(raw).digest('hex');
  }
}
