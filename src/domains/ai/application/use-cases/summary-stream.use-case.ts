import { Inject, Injectable } from '@nestjs/common';
import { AI_PROVIDER } from '../../domain/ai.tokens';
import { AIProviderError } from '../../domain/errors/ai-provider.error';
import type { AIProvider } from '../../domain/ai-provider.interface';
import type { AIStreamChunk } from '../../domain/ai-response';
import { AIUseCaseError } from '../errors/ai-use-case.error';
import { SummaryPromptBuilder } from '../prompts';
import { safeStream } from '../utils';

@Injectable()
export class SummaryStreamUseCase {
  private static readonly OPERATION = 'summary-stream';

  constructor(
    @Inject(AI_PROVIDER)
    private readonly provider: AIProvider,
    private readonly promptBuilder: SummaryPromptBuilder,
  ) {}

  execute(content: string): AsyncIterable<AIStreamChunk> {
    if (!this.provider.streamText) {
      throw new AIUseCaseError(
        'Streaming not supported by provider',
        SummaryStreamUseCase.OPERATION,
      );
    }

    const prompt = this.promptBuilder.build({ content });

    const stream = this.provider.streamText({
      prompt,
      maxTokens: 300,
      temperature: 0.3,
      metadata: {
        operation: SummaryStreamUseCase.OPERATION,
      },
    });

    return safeStream(stream, (error) => {
      if (error instanceof AIProviderError) {
        return error;
      }

      return new AIUseCaseError(
        'Summary Stream use case failed',
        SummaryStreamUseCase.OPERATION,
        error,
      );
    });
  }
}
