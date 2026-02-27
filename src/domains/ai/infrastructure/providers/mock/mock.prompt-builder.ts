import type { PromptInput } from 'src/domains/ai/domain/prompt-input';

export class MockPromptBuilder {
  build(input: PromptInput): string {
    switch (input.task) {
      case 'summary':
        return `Summarize:\n${input.content}`;

      case 'keywords':
        return `Extract keywords:\n${input.content}`;

      case 'classification':
        return `Classify:\n${input.content}`;

      case 'seo-meta':
        return `Generate SEO meta:\n${input.content}`;

      default:
        throw new Error(`Unsupported task: ${input.task as string}`);
    }
  }
}
