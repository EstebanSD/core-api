import { Module } from '@nestjs/common';
import { AppConfigModule, AppConfigService } from 'src/config';
import { CustomLoggerService } from 'src/common/logger/custom-logger.service';
import { AI_PROVIDER } from './domain/ai.tokens';
import { MockProvider } from './infrastructure/providers/mock';
import { OllamaProvider } from './infrastructure/providers/ollama';
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
      inject: [AppConfigService, CustomLoggerService],
      useFactory: (config: AppConfigService, logger: CustomLoggerService) => {
        switch (config.aiProvider) {
          case 'ollama':
            return new OllamaProvider(logger);

          case 'mock':
            return new MockProvider();

          default:
            throw new Error('Unsupported AI provider');
        }
      },
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
