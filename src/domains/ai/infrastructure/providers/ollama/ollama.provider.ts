import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { AppConfigService } from 'src/config';
import { CustomLoggerService } from 'src/common/logger/custom-logger.service';
import { AIProvider } from 'src/domains/ai/domain/ai-provider.interface';
import type { AITextRequest } from 'src/domains/ai/domain/prompt-input';
import type { AIResponse } from 'src/domains/ai/domain/ai-response';
import { AIProviderError } from 'src/domains/ai/domain/errors/ai-provider.error';
import { AIMetricsService } from '../../metrics/ai-metrics.service';
import { InMemoryAICacheService } from '../../cache/in-memory-ai-cache.service';

@Injectable()
export class OllamaProvider implements AIProvider {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(
    private readonly configService: AppConfigService,
    private readonly logger: CustomLoggerService,
    private readonly metrics: AIMetricsService,
    private readonly cache: InMemoryAICacheService,
  ) {
    this.logger.setContext('OllamaProvider');

    this.model = this.configService.aiModel;

    this.client = new OpenAI({
      apiKey: this.configService.aiApiKey,
      baseURL: this.configService.ollamaBaseUrl,
    });
  }

  async generateText(input: AITextRequest): Promise<AIResponse> {
    const cacheKey = this.buildCacheKey(input);
    const cached = this.cache.get(cacheKey);

    if (cached) {
      this.metrics.recordCacheHit('ollama-request');
      return cached;
    }

    this.metrics.recordRequest('ollama-request');

    const start = performance.now();

    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: input.prompt }],
        max_tokens: input.maxTokens ?? 256,
      });

      const latencyMs = performance.now() - start;

      const result: AIResponse = {
        text: completion.choices[0].message.content ?? '',
        provider: 'ollama',
        model: this.model,
        usage: {
          inputTokens: completion.usage?.prompt_tokens || 0,
          outputTokens: completion.usage?.completion_tokens || 0,
          totalTokens: completion.usage?.total_tokens || 0,
        },
      };

      this.cache.set(cacheKey, result, 60_000);

      this.metrics.recordLatency('ollama-request', latencyMs);

      return result;
    } catch (error: unknown) {
      this.logger.error('AI request generate text failed', error);
      this.metrics.recordError('ollama-request');

      throw new AIProviderError('Failed to generate text', 'ollama', error);
    }
  }

  private buildCacheKey(input: AITextRequest): string {
    return JSON.stringify({
      content: input.prompt,
      maxTokens: input.maxTokens,
      model: this.model,
    });
  }
}
