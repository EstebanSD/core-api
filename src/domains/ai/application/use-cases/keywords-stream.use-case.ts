import { Inject, Injectable } from '@nestjs/common';
import { AI_PROVIDER } from '../../domain/ai.tokens';
import type { AIProvider } from '../../domain/ai-provider.interface';
import type { AIStreamChunk } from '../../domain/ai-response';
import { AIProviderError } from '../../domain/errors/ai-provider.error';
import { AIUseCaseError } from '../errors/ai-use-case.error';
import { KeywordsPromptBuilder } from '../prompts';
import { safeStream } from '../utils';

@Injectable()
export class KeywordsStreamUseCase {
  private readonly OPERATION = 'keywords-stream';

  constructor(
    @Inject(AI_PROVIDER)
    private readonly provider: AIProvider,
    private readonly promptBuilder: KeywordsPromptBuilder,
  ) {}

  execute(content: string, limit = 10): AsyncIterable<AIStreamChunk> {
    if (!this.provider.streamText) {
      throw new AIUseCaseError('Extracting keywords not supported by provider', this.OPERATION);
    }

    const prompt = this.promptBuilder.build({ content, limit });

    const stream = this.provider.streamText({
      prompt,
      maxTokens: 150,
      temperature: 0.2,
      metadata: {
        operation: this.OPERATION,
      },
    });

    return safeStream(stream, (error) => {
      if (error instanceof AIProviderError) {
        return error;
      }

      return new AIUseCaseError('Extract keywords stream use case failed', this.OPERATION, error);
    });
  }
}
