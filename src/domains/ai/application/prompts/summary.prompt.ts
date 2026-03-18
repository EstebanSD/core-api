import { Injectable } from '@nestjs/common';
import type { PromptBuilder } from './prompt-builder.interface';

type SummaryPromptType = {
  content: string;
};

@Injectable()
export class SummaryPromptBuilder implements PromptBuilder<SummaryPromptType> {
  build({ content }: SummaryPromptType): string {
    return `Text: ${content}
    
    Summary (5 bullet points):`;
  }
}
