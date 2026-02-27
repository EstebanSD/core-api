import { PromptInput } from 'src/domains/ai/domain/prompt-input';

export class OllamaPromptBuilder {
  build(input: PromptInput): string {
    switch (input.task) {
      case 'summary':
        return `Summarize the following content in 5 concise bullet points:\n\n${input.content}`;

      case 'keywords':
        return `Extract relevant keywords from the following text:\n\n${input.content}`;

      case 'classification': {
        const categories = (input.metadata?.categories as string[]) ?? [];

        return `Classify the following text into one of these categories: ${categories.join(
          ', ',
        )}\n\n${input.content}`;
      }

      case 'seo-meta':
        return `Generate an SEO title and meta description for the following content:\n\n${input.content}`;

      default:
        throw new Error(`Unsupported task: ${input.task as string}`);
    }
  }
}
