export interface PromptBuilder<T> {
  build(input: T): string;
}
