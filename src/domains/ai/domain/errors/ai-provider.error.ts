export class AIProviderError extends Error {
  public readonly provider: string;

  constructor(message: string, provider: string, cause?: unknown) {
    super(message, { cause });

    this.name = 'AIProviderError';
    this.provider = provider;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
