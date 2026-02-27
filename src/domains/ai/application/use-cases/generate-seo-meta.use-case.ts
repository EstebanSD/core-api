import { Inject, Injectable } from '@nestjs/common';
import { AI_PROVIDER } from '../../domain/ai.tokens';
import type { AIProvider } from '../../domain/ai-provider.interface';

@Injectable()
export class GenerateSeoMetaUseCase {
  constructor(
    @Inject(AI_PROVIDER)
    private readonly provider: AIProvider,
  ) {}

  async execute(content: string) {
    return this.provider.generateText({
      task: 'seo-meta',
      content: `
        Generate SEO metadata for the following content.

        Return:
        - Meta title (max 60 characters)
        - Meta description (max 160 characters)
        - 5 SEO keywords

        ${content}
      `,
      maxTokens: 200,
    });
  }
}
