import { Module } from '@nestjs/common';
import { AppConfigModule } from 'src/config';
import { AIMetricsService } from './infrastructure/metrics/ai-metrics.service';
import { InMemoryAICacheService } from './infrastructure/cache/in-memory-ai-cache.service';
import { AIProviderBinding } from './infrastructure/providers/ai-provider.binding';
import {
  ClassifyContentUseCase,
  ExtractKeywordsUseCase,
  GenerateSeoMetaUseCase,
  GenerateSummaryUseCase,
} from './application/use-cases';
import { AiController } from './ai.controller';

@Module({
  imports: [AppConfigModule],
  providers: [
    // Infrastructure
    InMemoryAICacheService,
    AIMetricsService,

    // Application (Use Cases)
    ClassifyContentUseCase,
    ExtractKeywordsUseCase,
    GenerateSeoMetaUseCase,
    GenerateSummaryUseCase,

    // Provider binding
    AIProviderBinding,
  ],
  controllers: [AiController],
  exports: [
    ClassifyContentUseCase,
    ExtractKeywordsUseCase,
    GenerateSeoMetaUseCase,
    GenerateSummaryUseCase,
  ],
})
export class AiModule {}
