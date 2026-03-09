import { Inject, Injectable } from '@nestjs/common';
import { AI_PROVIDER } from '../../domain/ai.tokens';
import { AIProviderError } from '../../domain/errors/ai-provider.error';
import type { AIProvider } from '../../domain/ai-provider.interface';
import type { AIStreamChunk } from '../../domain/ai-response';
import { AIUseCaseError } from '../errors/ai-use-case.error';
import { SeoMetaPromptBuilder } from '../prompts';
import { safeStream } from '../utils';

@Injectable()
export class SeoMetaStreamUseCase {
  private readonly OPERATION = 'seo-meta-stream';

  constructor(
    @Inject(AI_PROVIDER)
    private readonly provider: AIProvider,
    private readonly promptBuilder: SeoMetaPromptBuilder,
  ) {}

  execute(content: string): AsyncIterable<AIStreamChunk> {
    if (!this.provider.streamText) {
      throw new AIUseCaseError('SEO Meta not supported by provider', this.OPERATION);
    }

    const prompt = this.promptBuilder.build({ content });

    const stream = this.provider.streamText({
      prompt,
      maxTokens: 200,
      temperature: 0.6,
      metadata: {
        operation: this.OPERATION,
      },
    });

    return safeStream(stream, (error) => {
      if (error instanceof AIProviderError) {
        return error;
      }

      return new AIUseCaseError('SEO Meta Stream use case failed', this.OPERATION, error);
    });
  }
}
