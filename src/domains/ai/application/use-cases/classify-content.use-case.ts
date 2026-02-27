import { Inject, Injectable } from '@nestjs/common';
import { AI_PROVIDER } from '../../domain/ai.tokens';
import type { AIProvider } from '../../domain/ai-provider.interface';

@Injectable()
export class ClassifyContentUseCase {
  constructor(
    @Inject(AI_PROVIDER)
    private readonly provider: AIProvider,
  ) {}

  async execute(content: string, categories: string[]) {
    return this.provider.generateText({
      task: 'classification',
      content: `
        Classify the following content into one of these categories:
        ${categories.join(', ')}

        Return only the category name.

        ${content}
      `,
      maxTokens: 50,
    });
  }
}
