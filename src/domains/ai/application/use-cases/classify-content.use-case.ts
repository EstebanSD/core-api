import { Inject, Injectable } from '@nestjs/common';
import { AI_PROVIDER } from '../../domain/ai.tokens';
import type { AIProvider } from '../../domain/ai-provider.interface';
import { AIProviderError } from '../../domain/errors/ai-provider.error';
import { AIUseCaseError } from '../errors/ai-use-case.error';
import { ClassificationPromptBuilder } from '../prompts';

@Injectable()
export class ClassifyContentUseCase {
  constructor(
    @Inject(AI_PROVIDER)
    private readonly provider: AIProvider,
    private readonly promptBuilder: ClassificationPromptBuilder,
  ) {}

  async execute(content: string, categories: string[]) {
    const prompt = this.promptBuilder.build({ content, categories });

    try {
      return await this.provider.generateText({
        prompt,
        maxTokens: 50,
        temperature: 0,
        metadata: {
          operation: 'classification',
        },
      });
    } catch (error: unknown) {
      if (error instanceof AIProviderError) {
        throw error;
      }

      throw new AIUseCaseError('Classification use case failed', 'classification', error);
    }
  }
}
