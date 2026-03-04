import { Inject, Injectable } from '@nestjs/common';
import { AI_PROVIDER } from '../../domain/ai.tokens';
import type { AIProvider } from '../../domain/ai-provider.interface';
import type { PromptInput } from '../../domain/prompt-input';
import { AIProviderError } from '../../domain/errors/ai-provider.error';
import { AIUseCaseError } from '../errors/ai-use-case.error';

@Injectable()
export class GenerateSummaryUseCase {
  constructor(
    @Inject(AI_PROVIDER)
    private readonly provider: AIProvider,
  ) {}

  async execute(content: string) {
    try {
      const prompt: PromptInput = {
        task: 'summary',
        content: `
        Summarize the following content in 5 concise bullet points:

        ${content}
      `,
        maxTokens: 300,
      };

      return await this.provider.generateText(prompt);
    } catch (error: unknown) {
      if (error instanceof AIProviderError) {
        throw error;
      }

      throw new AIUseCaseError('Generate summary use case failed', 'summary', error);
    }
  }
}
