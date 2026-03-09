export class AIUseCaseError extends Error {
  public readonly task: string;

  constructor(message: string, task: string, cause?: unknown) {
    super(message, { cause });

    this.name = 'AIUseCaseError';
    this.task = task;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
