import { Module } from '@nestjs/common';
import { AppConfigModule } from 'src/config';
import { AIMetricsService } from './infrastructure/metrics/ai-metrics.service';
import { InMemoryAICacheService } from './infrastructure/cache/in-memory-ai-cache.service';
import { AIProviderBinding } from './infrastructure/providers/ai-provider.binding';
import { AiController } from './interface/controllers/ai.controller';
import {
  ClassificationPromptBuilder,
  KeywordsPromptBuilder,
  SeoMetaPromptBuilder,
  SummaryPromptBuilder,
} from './application/prompts';
import {
  ClassifyContentUseCase,
  ExtractKeywordsUseCase,
  GenerateSeoMetaUseCase,
  GenerateSummaryUseCase,
  ClassificationStreamUseCase,
  KeywordsStreamUseCase,
  SeoMetaStreamUseCase,
  SummaryStreamUseCase,
} from './application/use-cases';

const USE_CASES = [
  ClassifyContentUseCase,
  ExtractKeywordsUseCase,
  GenerateSeoMetaUseCase,
  GenerateSummaryUseCase,
  ClassificationStreamUseCase,
  KeywordsStreamUseCase,
  SeoMetaStreamUseCase,
  SummaryStreamUseCase,
];
@Module({
  imports: [AppConfigModule],
  controllers: [AiController],
  providers: [
    // Infrastructure
    InMemoryAICacheService,
    AIMetricsService,

    // Prompt builders
    ClassificationPromptBuilder,
    KeywordsPromptBuilder,
    SeoMetaPromptBuilder,
    SummaryPromptBuilder,

    // Application (Use Cases)
    ...USE_CASES,

    // Provider binding
    AIProviderBinding,
  ],
  exports: [...USE_CASES],
})
export class AiModule {}
