import { ConsoleLogger, LogLevel } from '@nestjs/common';
import { format } from 'date-fns';
import * as chalk from 'chalk';

export class CustomLoggerService extends ConsoleLogger {
  constructor(context?: string) {
    super(context ?? 'Core-Api', {
      timestamp: false,
    });
  }

  setContext(context: string) {
    this.context = context;
  }

  static getLogLevels(env: string): LogLevel[] {
    return env === 'production'
      ? ['error', 'warn', 'log']
      : ['error', 'warn', 'log', 'debug', 'verbose'];
  }

  log(message: string, traceOrError?: unknown, context?: string) {
    super.log(this.composeMessage(message, traceOrError, context));
  }

  error(message: string, traceOrError?: unknown, context?: string) {
    let trace: string | undefined;

    if (typeof traceOrError === 'string') {
      trace = traceOrError;
    } else if (this.isErrorWithStack(traceOrError)) {
      trace = traceOrError.stack;
    }

    super.error(this.formatLog(message, context), trace);
  }

  warn(message: string, traceOrError?: unknown, context?: string) {
    super.warn(this.composeMessage(message, traceOrError, context));
  }

  debug(message: string, traceOrError?: unknown, context?: string) {
    super.debug(this.composeMessage(message, traceOrError, context));
  }

  verbose(message: string, traceOrError?: unknown, context?: string) {
    super.verbose(this.composeMessage(message, traceOrError, context));
  }

  private composeMessage(message: string, traceOrError?: unknown, context?: string) {
    let trace = '';

    if (typeof traceOrError === 'string') {
      trace = `\n${traceOrError}`;
    } else if (this.isErrorWithStack(traceOrError)) {
      trace = `\n${traceOrError.stack}`;
    }

    return this.formatLog(message, context) + trace;
  }

  private formatLog(message: string, context?: string) {
    const ts = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const ctx = chalk.cyan(`[${context ?? this.context}]`);
    return `${chalk.gray(ts)} ${ctx} ${message}`;
  }

  private isErrorWithStack(error: unknown): error is { stack: string } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'stack' in error &&
      typeof (error as Record<'stack', unknown>).stack === 'string'
    );
  }
}
