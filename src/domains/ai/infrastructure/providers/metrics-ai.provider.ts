import { Injectable } from '@nestjs/common';
import { AIProvider } from '../../domain/ai-provider.interface';
import { AIMetricsService } from '../metrics/ai-metrics.service';
import type { AITextRequest } from '../../domain/prompt-input';
import type { AIResponse } from '../../domain/ai-response';

@Injectable()
export class MetricsAIProvider implements AIProvider {
  constructor(
    private readonly provider: AIProvider,
    private readonly metrics: AIMetricsService,
  ) {}

  async generateText(input: AITextRequest): Promise<AIResponse> {
    const operation = input.metadata?.operation ?? 'unknown';

    const start = performance.now();

    this.metrics.recordRequest(operation);

    try {
      const result = await this.provider.generateText(input);

      this.metrics.recordLatency(operation, performance.now() - start);

      return result;
    } catch (error) {
      this.metrics.recordError(operation);
      throw error;
    }
  }
}
