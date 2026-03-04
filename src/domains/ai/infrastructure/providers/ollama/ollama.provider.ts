import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { AppConfigService } from 'src/config';
import { CustomLoggerService } from 'src/common/logger/custom-logger.service';
import { AIProvider } from 'src/domains/ai/domain/ai-provider.interface';
import type { PromptInput } from 'src/domains/ai/domain/prompt-input';
import type { AIResponse } from 'src/domains/ai/domain/ai-response';
import { AIProviderError } from 'src/domains/ai/domain/errors/ai-provider.error';
import { AIMetricsService } from '../../metrics/ai-metrics.service';
import { OllamaPromptBuilder } from './ollama.prompt-builder';
import { InMemoryAICacheService } from '../../cache/in-memory-ai-cache.service';

@Injectable()
export class OllamaProvider implements AIProvider {
  private readonly client: OpenAI;
  private readonly model: string;
  private readonly promptBuilder = new OllamaPromptBuilder();

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

  async generateText(input: PromptInput): Promise<AIResponse> {
    const cacheKey = this.buildCacheKey(input);
    const cached = this.cache.get(cacheKey);

    if (cached) {
      this.metrics.recordCacheHit(input.task);
      return cached;
    }

    this.metrics.recordRequest(input.task);

    const prompt = this.promptBuilder.build(input);
    const start = performance.now();

    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: input.maxTokens ?? 256,
      });

      const latencyMs = performance.now() - start;

      const result: AIResponse = {
        result: completion.choices[0].message.content ?? '',
        provider: 'ollama',
        model: this.model,
        usage: completion.usage?.total_tokens,
        latencyMs,
      };

      this.cache.set(cacheKey, result, 60_000);

      this.metrics.recordLatency(input.task, latencyMs);

      return result;
    } catch (error: unknown) {
      this.logger.error(`AI request generate text failed | task=${input.task}`, error);
      this.metrics.recordError(input.task);

      throw new AIProviderError('Failed to generate text', input.task, 'ollama', error);
    }
  }

  private buildCacheKey(input: PromptInput): string {
    return JSON.stringify({
      task: input.task,
      content: input.content,
      maxTokens: input.maxTokens,
      metadata: input.metadata,
      model: this.model,
    });
  }
}
