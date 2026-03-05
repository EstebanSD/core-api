import { Injectable } from '@nestjs/common';
import { PromptBuilder } from './prompt-builder.interface';

type ClassificationPromptType = {
  content: string;
  categories: string[];
};

@Injectable()
export class ClassificationPromptBuilder implements PromptBuilder<ClassificationPromptType> {
  build({ content, categories }: ClassificationPromptType): string {
    return `Classify the following content into one of these categories: ${categories.join(', ')}
    Return only the category name.
    ${content}
    `;
  }
}
