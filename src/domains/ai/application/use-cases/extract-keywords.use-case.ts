import { Inject, Injectable } from '@nestjs/common';
import { AI_PROVIDER } from '../../domain/ai.tokens';
import type { AIProvider } from '../../domain/ai-provider.interface';
import { AIProviderError } from '../../domain/errors/ai-provider.error';
import { AIUseCaseError } from '../errors/ai-use-case.error';

@Injectable()
export class ExtractKeywordsUseCase {
  constructor(
    @Inject(AI_PROVIDER)
    private readonly provider: AIProvider,
  ) {}

  async execute(content: string, limit = 10) {
    try {
      return await this.provider.generateText({
        task: 'keywords',
        content: `
        Extract the ${limit} most relevant keywords from the following text.
        Return them as a comma-separated list.

        ${content}
      `,
        maxTokens: 150,
      });
    } catch (error: unknown) {
      if (error instanceof AIProviderError) {
        throw error;
      }

      throw new AIUseCaseError('Extraction keywords use case failed', 'keywords', error);
    }
  }
}
