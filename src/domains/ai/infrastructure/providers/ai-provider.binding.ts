import { AppConfigService } from 'src/config';
import { CustomLoggerService } from 'src/common/logger/custom-logger.service';
import { AI_PROVIDER } from '../../domain/ai.tokens';
import { AIMetricsService } from '../metrics/ai-metrics.service';
import { InMemoryAICacheService } from '../cache/in-memory-ai-cache.service';
import { AIProviderFactory } from './ai-provider.factory';

export const AIProviderBinding = {
  provide: AI_PROVIDER,
  inject: [AppConfigService, CustomLoggerService, AIMetricsService, InMemoryAICacheService],
  useFactory: (
    config: AppConfigService,
    logger: CustomLoggerService,
    metrics: AIMetricsService,
    cache: InMemoryAICacheService,
  ) => AIProviderFactory.create(config, logger, metrics, cache),
};
