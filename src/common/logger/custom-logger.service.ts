import { ConsoleLogger, LogLevel } from '@nestjs/common';
import { format } from 'date-fns';
import * as chalk from 'chalk';

export class CustomLoggerService extends ConsoleLogger {
  constructor(context?: string) {
    super(context ?? 'Core-Api', {
      timestamp: false,
    });
  }

  static getLogLevels(env: string): LogLevel[] {
    return env === 'production'
      ? ['error', 'warn', 'log']
      : ['error', 'warn', 'log', 'debug', 'verbose'];
  }

  private formatLog(message: string, context?: string) {
    const ts = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const ctx = context ? chalk.cyan(`[${context}]`) : '';
    return `${chalk.gray(ts)} ${ctx} ${message}`;
  }

  log(message: string, context?: string) {
    super.log(this.formatLog(message, context));
  }
  error(message: string, trace?: string, context?: string) {
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
}
