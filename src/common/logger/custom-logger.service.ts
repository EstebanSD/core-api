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

  log(message: string, context?: string) {
    super.log(this.formatLog(message, context));
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
  warn(message: string, context?: string) {
    super.warn(this.formatLog(message, context));
  }
  debug(message: string, context?: string) {
    super.debug(this.formatLog(message, context));
  }
  verbose(message: string, context?: string) {
    super.verbose(this.formatLog(message, context));
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
