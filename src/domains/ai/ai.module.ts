import { Module } from '@nestjs/common';
import { AppConfigModule, AppConfigService } from 'src/config';
import { AI_PROVIDER } from './domain/ai.tokens';
import { aiProviderFactory } from './infrastructure/ai-provider.factory';
import {
  ClassifyContentUseCase,
  ExtractKeywordsUseCase,
  GenerateSeoMetaUseCase,
  GenerateSummaryUseCase,
} from './application/use-cases';

@Module({
  imports: [AppConfigModule],
  providers: [
    ClassifyContentUseCase,
    ExtractKeywordsUseCase,
    GenerateSeoMetaUseCase,
    GenerateSummaryUseCase,
    {
      provide: AI_PROVIDER,
      inject: [AppConfigService],
      useFactory: aiProviderFactory,
    },
  ],
  exports: [
    ClassifyContentUseCase,
    ExtractKeywordsUseCase,
    GenerateSeoMetaUseCase,
    GenerateSummaryUseCase,
  ],
})
export class AiModule {}
