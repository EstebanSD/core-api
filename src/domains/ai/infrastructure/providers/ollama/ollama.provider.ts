import { Injectable } from '@nestjs/common';
import { CustomLoggerService } from 'src/common/logger/custom-logger.service';
import { AIProvider } from 'src/domains/ai/domain/ai-provider.interface';
import type { PromptInput } from 'src/domains/ai/domain/prompt-input';
import type { AIResponse } from 'src/domains/ai/domain/ai-response';
import { AIMetricsService } from '../../metrics/ai-metrics.service';
import { OllamaPromptBuilder } from './ollama.prompt-builder';

interface CacheEntry {
  value: AIResponse;
  expiresAt: number;
}
interface OllamaGenerateResponse {
  response: string;
  eval_count?: number;
}

@Injectable()
export class OllamaProvider implements AIProvider {
  /** TODO
   * The cache does not have automatic cleanup.
   * It has no memory limit.
   * It is not distributed.
   * It is not decoupled as a service.
   */
  private readonly cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL_MS = 60_000; // 1 minute

  private readonly REQUEST_TIMEOUT_MS = 15_000;

  private readonly baseUrl = 'http://localhost:11434';
  private readonly model = 'llama3'; // TODO configurable
  private readonly promptBuilder = new OllamaPromptBuilder();

  constructor(
    private readonly logger: CustomLoggerService,
    private readonly metrics: AIMetricsService,
  ) {
    this.logger.setContext('OllamaProvider');
  }

  async generateText(input: PromptInput): Promise<AIResponse> {
    const cacheKey = this.buildCacheKey(input);
    const cached = this.cache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      this.logger.debug(`AI cache hit | task=${input.task}`);
      this.metrics.recordCacheHit(input.task);
      return cached.value;
    }
    this.logger.debug(`AI cache miss | task=${input.task}`);
    this.metrics.recordRequest(input.task);

    const prompt = this.promptBuilder.build(input);
    const start = performance.now();

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, this.REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          options: {
            num_predict: input.maxTokens ?? 256,
          },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Ollama HTTP ${response.status}: ${errorBody}`);
      }

      const latencyMs = performance.now() - start;

      const data = (await response.json()) as OllamaGenerateResponse;

      const result: AIResponse = {
        result: data.response,
        provider: 'ollama',
        model: this.model,
        usage: data.eval_count ?? undefined,
        latencyMs,
      };

      this.cache.set(cacheKey, {
        value: result,
        expiresAt: Date.now() + this.CACHE_TTL_MS,
      });

      this.logger.log(
        `AI request completed | task=${input.task} | latency=${latencyMs.toFixed(2)}ms`,
      );
      this.metrics.recordLatency(input.task, latencyMs);

      return result;
    } catch (error) {
      clearTimeout(timeout);

      if (error instanceof Error && error.name === 'AbortError') {
        this.logger.error(
          `AI request timeout | task=${input.task} | timeout=${this.REQUEST_TIMEOUT_MS}ms`,
        );
        this.metrics.recordError(input.task);

        throw new Error('AI request timed out');
      }

      this.logger.error(`AI request failed | task=${input.task}`, error);
      throw error;
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
