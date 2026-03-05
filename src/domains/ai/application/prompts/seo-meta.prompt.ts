import { Injectable } from '@nestjs/common';
import { PromptBuilder } from './prompt-builder.interface';

type SeoMetaPromptType = {
  content: string;
};

@Injectable()
export class SeoMetaPromptBuilder implements PromptBuilder<SeoMetaPromptType> {
  build({ content }: SeoMetaPromptType): string {
    return `Generate SEO metadata for the following content.
    Return:
        - Meta title (max 60 characters)
        - Meta description (max 160 characters)
        - 5 SEO keywords        
    
        ${content}
    `;
  }
}
