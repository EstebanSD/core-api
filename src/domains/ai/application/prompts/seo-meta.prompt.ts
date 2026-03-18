import { Injectable } from '@nestjs/common';
import { PromptBuilder } from './prompt-builder.interface';

type SeoMetaPromptType = {
  content: string;
};

@Injectable()
export class SeoMetaPromptBuilder implements PromptBuilder<SeoMetaPromptType> {
  build({ content }: SeoMetaPromptType): string {
    return `SEO metadata:
    - title (≤60)
    - description (≤160)
    - 5 keywords (comma-separated)

    Text: ${content}`;
  }
}
