import { Inject, Injectable } from '@nestjs/common';
import { AI_PROVIDER } from '../../domain/ai.tokens';
import type { AIProvider } from '../../domain/ai-provider.interface';
import type { PromptInput } from '../../domain/prompt-input';

@Injectable()
export class GenerateSummaryUseCase {
  constructor(
    @Inject(AI_PROVIDER)
    private readonly provider: AIProvider,
  ) {}

  async execute(content: string) {
    const prompt: PromptInput = {
      task: 'summary',
      content: `
        Summarize the following content in 5 concise bullet points:

        ${content}
      `,
      maxTokens: 300,
    };

    return this.provider.generateText(prompt);
  }
}
