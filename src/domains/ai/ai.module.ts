import { Module } from '@nestjs/common';
import { AppConfigModule, AppConfigService } from 'src/config';
import { CustomLoggerService } from 'src/common/logger/custom-logger.service';
import { AI_PROVIDER } from './domain/ai.tokens';
import { AIProviderFactory } from './infrastructure/ai-provider.factory';
import { AIMetricsService } from './infrastructure/metrics/ai-metrics.service';
import {
  ClassifyContentUseCase,
  ExtractKeywordsUseCase,
  GenerateSeoMetaUseCase,
  GenerateSummaryUseCase,
} from './application/use-cases';
import { AiTestController } from './ai.controller';

@Module({
  imports: [AppConfigModule],
  providers: [
    ClassifyContentUseCase,
    ExtractKeywordsUseCase,
    GenerateSeoMetaUseCase,
    GenerateSummaryUseCase,
    {
      provide: AI_PROVIDER,
      inject: [AppConfigService, CustomLoggerService, AIMetricsService],
      useFactory: (
        config: AppConfigService,
        logger: CustomLoggerService,
        metrics: AIMetricsService,
      ) => AIProviderFactory.create(config, logger, metrics),
    },
  ],
  controllers: [AiTestController],
  exports: [
    ClassifyContentUseCase,
    ExtractKeywordsUseCase,
    GenerateSeoMetaUseCase,
    GenerateSummaryUseCase,
  ],
})
export class AiModule {}
