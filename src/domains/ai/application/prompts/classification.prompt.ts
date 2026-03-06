import { Injectable } from '@nestjs/common';
import { PromptBuilder } from './prompt-builder.interface';

type ClassificationPromptType = {
  content: string;
  categories: string[];
};

@Injectable()
export class ClassificationPromptBuilder implements PromptBuilder<ClassificationPromptType> {
  build({ content, categories }: ClassificationPromptType): string {
    return `Categories: ${categories.join(', ')}
    Text: ${content}
    Category:`;
  }
}
