import { Injectable } from '@nestjs/common';
import { PromptBuilder } from './prompt-builder.interface';

type KeywordsPromptType = {
  content: string;
  limit: number;
};

@Injectable()
export class KeywordsPromptBuilder implements PromptBuilder<KeywordsPromptType> {
  build({ content, limit }: KeywordsPromptType): string {
    return `Extract ${limit} keywords.
    Text: ${content}
    Keywords (comma-separated):`;
  }
}
