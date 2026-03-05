import { Inject, Injectable } from '@nestjs/common';
import { AI_PROVIDER } from '../../domain/ai.tokens';
import type { AIProvider } from '../../domain/ai-provider.interface';
import { AIProviderError } from '../../domain/errors/ai-provider.error';
import { AIUseCaseError } from '../errors/ai-use-case.error';

@Injectable()
export class GenerateSummaryUseCase {
  constructor(
    @Inject(AI_PROVIDER)
    private readonly provider: AIProvider,
  ) {}

  async execute(content: string) {
    const prompt = `
      Summarize the following content in 5 concise bullet points:

      ${content}
      `;

    try {
      return await this.provider.generateText({
        prompt,
        maxTokens: 300,
        metadata: {
          operation: 'summary',
        },
      });
    } catch (error: unknown) {
      if (error instanceof AIProviderError) {
        throw error;
      }

      throw new AIUseCaseError('Generate summary use case failed', 'summary', error);
    }
  }
}
