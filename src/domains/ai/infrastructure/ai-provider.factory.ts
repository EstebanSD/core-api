import { AppConfigService } from 'src/config';
import { CustomLoggerService } from 'src/common/logger/custom-logger.service';
import type { AIProvider } from '../domain/ai-provider.interface';
import { AIMetricsService } from './metrics/ai-metrics.service';
import { OllamaProvider } from './providers/ollama';
import { MockProvider } from './providers/mock';

export class AIProviderFactory {
  static create(
    config: AppConfigService,
    logger: CustomLoggerService,
    metrics: AIMetricsService,
  ): AIProvider {
    const providerType = config.aiProvider;

    switch (providerType) {
      case 'ollama':
        return new OllamaProvider(logger, metrics);

      case 'mock':
        return new MockProvider();

      default:
        throw new Error(`Unsupported AI provider: ${providerType}`);
    }
  }
}
