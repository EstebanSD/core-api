import { Inject, Injectable } from '@nestjs/common';
import { AI_PROVIDER } from '../../domain/ai.tokens';
import type { AIProvider } from '../../domain/ai-provider.interface';
import type { AITextResponse } from '../../domain/ai-response';
import { AIProviderError } from '../../domain/errors/ai-provider.error';
import { AIUseCaseError } from '../errors/ai-use-case.error';
import { KeywordsPromptBuilder } from '../prompts';

@Injectable()
export class ExtractKeywordsUseCase {
  private static readonly OPERATION = 'keywords';

  constructor(
    @Inject(AI_PROVIDER)
    private readonly provider: AIProvider,
    private readonly promptBuilder: KeywordsPromptBuilder,
  ) {}

  async execute(content: string, limit = 10): Promise<AITextResponse> {
    const prompt = this.promptBuilder.build({ content, limit });

    try {
      return await this.provider.generateText({
        prompt,
        maxTokens: 150,
        temperature: 0.2,
        metadata: {
          operation: ExtractKeywordsUseCase.OPERATION,
        },
      });
    } catch (error: unknown) {
      if (error instanceof AIProviderError) {
        throw error;
      }

      throw new AIUseCaseError(
        'Extraction keywords use case failed',
        ExtractKeywordsUseCase.OPERATION,
        error,
      );
    }
  }
}
