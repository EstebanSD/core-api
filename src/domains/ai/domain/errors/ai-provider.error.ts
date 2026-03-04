export class AIProviderError extends Error {
  public readonly task: string;
  public readonly provider: string;

  constructor(message: string, task: string, provider: string, cause?: unknown) {
    super(message, { cause });

    this.name = 'AIProviderError';
    this.task = task;
    this.provider = provider;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
