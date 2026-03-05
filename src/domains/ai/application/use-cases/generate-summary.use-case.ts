import { Inject, Injectable } from '@nestjs/common';
import { AI_PROVIDER } from '../../domain/ai.tokens';
import type { AIProvider } from '../../domain/ai-provider.interface';
import { AIProviderError } from '../../domain/errors/ai-provider.error';
import { AIUseCaseError } from '../errors/ai-use-case.error';
import { SummaryPromptBuilder } from '../prompts';

@Injectable()
export class GenerateSummaryUseCase {
  constructor(
    @Inject(AI_PROVIDER)
    private readonly provider: AIProvider,
    private readonly promptBuilder: SummaryPromptBuilder,
  ) {}

  async execute(content: string) {
    const prompt = this.promptBuilder.build({ content });

    try {
      return await this.provider.generateText({
        prompt,
        maxTokens: 300,
        temperature: 0.3,
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
