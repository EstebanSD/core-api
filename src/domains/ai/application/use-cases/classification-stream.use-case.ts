import { Inject, Injectable } from '@nestjs/common';
import { AI_PROVIDER } from '../../domain/ai.tokens';
import type { AIProvider } from '../../domain/ai-provider.interface';
import type { AIStreamChunk } from '../../domain/ai-response';
import { AIProviderError } from '../../domain/errors/ai-provider.error';
import { AIUseCaseError } from '../errors/ai-use-case.error';
import { ClassificationPromptBuilder } from '../prompts';
import { safeStream } from '../utils';

@Injectable()
export class ClassificationStreamUseCase {
  private readonly OPERATION = 'classification-stream';

  constructor(
    @Inject(AI_PROVIDER)
    private readonly provider: AIProvider,
    private readonly promptBuilder: ClassificationPromptBuilder,
  ) {}

  execute(content: string, categories: string[]): AsyncIterable<AIStreamChunk> {
    if (!this.provider.streamText) {
      throw new AIUseCaseError('Classifying not supported by provider', this.OPERATION);
    }

    const prompt = this.promptBuilder.build({ content, categories });

    const stream = this.provider.streamText({
      prompt,
      maxTokens: 50,
      temperature: 0,
      metadata: {
        operation: this.OPERATION,
      },
    });

    return safeStream(stream, (error) => {
      if (error instanceof AIProviderError) {
        return error;
      }

      return new AIUseCaseError('Classification Stream use case failed', this.OPERATION, error);
    });
  }
}
