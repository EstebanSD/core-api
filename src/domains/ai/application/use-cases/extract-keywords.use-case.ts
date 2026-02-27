import { Inject, Injectable } from '@nestjs/common';
import { AI_PROVIDER } from '../../domain/ai.tokens';
import type { AIProvider } from '../../domain/ai-provider.interface';

@Injectable()
export class ExtractKeywordsUseCase {
  constructor(
    @Inject(AI_PROVIDER)
    private readonly provider: AIProvider,
  ) {}

  async execute(content: string, limit = 10) {
    return this.provider.generateText({
      task: 'keywords',
      content: `
        Extract the ${limit} most relevant keywords from the following text.
        Return them as a comma-separated list.

        ${content}
      `,
      maxTokens: 150,
    });
  }
}
