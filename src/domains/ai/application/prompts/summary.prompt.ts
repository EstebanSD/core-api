import { Injectable } from '@nestjs/common';
import type { PromptBuilder } from './prompt-builder.interface';

type SummaryPromptType = {
  content: string;
};

@Injectable()
export class SummaryPromptBuilder implements PromptBuilder<SummaryPromptType> {
  build({ content }: SummaryPromptType): string {
    return `Summarize the following content in 5 concise bullet points:
    ${content}
    `;
  }
}
