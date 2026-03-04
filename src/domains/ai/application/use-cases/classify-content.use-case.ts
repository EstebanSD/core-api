import { Inject, Injectable } from '@nestjs/common';
import { AI_PROVIDER } from '../../domain/ai.tokens';
import type { AIProvider } from '../../domain/ai-provider.interface';
import { AIProviderError } from '../../domain/errors/ai-provider.error';
import { AIUseCaseError } from '../errors/ai-use-case.error';

@Injectable()
export class ClassifyContentUseCase {
  constructor(
    @Inject(AI_PROVIDER)
    private readonly provider: AIProvider,
  ) {}

  async execute(content: string, categories: string[]) {
    try {
      return await this.provider.generateText({
        task: 'classification',
        content: `
        Classify the following content into one of these categories:
        ${categories.join(', ')}

        Return only the category name.

        ${content}
      `,
        maxTokens: 50,
      });
    } catch (error: unknown) {
      if (error instanceof AIProviderError) {
        throw error;
      }

      throw new AIUseCaseError('Classification use case failed', 'classification', error);
    }
  }
}
