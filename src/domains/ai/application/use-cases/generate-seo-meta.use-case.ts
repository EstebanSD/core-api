import { Inject, Injectable } from '@nestjs/common';
import { AI_PROVIDER } from '../../domain/ai.tokens';
import type { AIProvider } from '../../domain/ai-provider.interface';
import { AIProviderError } from '../../domain/errors/ai-provider.error';
import { AIUseCaseError } from '../errors/ai-use-case.error';

@Injectable()
export class GenerateSeoMetaUseCase {
  constructor(
    @Inject(AI_PROVIDER)
    private readonly provider: AIProvider,
  ) {}

  async execute(content: string) {
    const prompt = `
    Generate SEO metadata for the following content.
    Return:        
      - Meta title (max 60 characters)
      - Meta description (max 160 characters)
      - 5 SEO keywords        
      
      ${content}
      `;

    try {
      return await this.provider.generateText({
        prompt,
        maxTokens: 200,
        metadata: {
          operation: 'seo-meta',
        },
      });
    } catch (error: unknown) {
      if (error instanceof AIProviderError) {
        throw error;
      }

      throw new AIUseCaseError('Generate seo-meta use case failed', 'seo-meta', error);
    }
  }
}
