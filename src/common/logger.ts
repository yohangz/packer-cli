import chalk from 'chalk';
import { args } from '../tasks/util';
import { LogLevel } from '../model/log-level';

/**
 * Get current context log level
 */
const getLogLevel = (): LogLevel => {
  let logLevel = LogLevel.INFO;
  if (args.includes('--info')) {
    logLevel = LogLevel.INFO;
  } else if (args.includes('--error')) {
    logLevel = LogLevel.ERROR;
  } else if (args.includes('--warn')) {
    logLevel = LogLevel.WARN;
  } else if (args.includes('--trace')) {
    logLevel = LogLevel.TRACE;
  } else if (args.includes('--silent')) {
    logLevel = LogLevel.SILENT;
  }

  return logLevel;
};

/**
 * Packer logger class.
 * Log messages depending on the log level.
 */
export class Logger {
  public static readonly level: LogLevel = getLogLevel();

  /**
   * Create logger instance with task name.
   * @param taskName
   */
  public static create(taskName: string): Logger {
    return new Logger(taskName);
  }

  public readonly taskName: string;

  private constructor(taskName: string) {
    this.taskName = taskName ? `${chalk.green(taskName)} ` : '';
  }

  /**
   * Get formatted current time.
   */
  public static get currentTime(): string {
    const d = new Date();
    const h = d.getHours();
    const m = d.getMinutes();
    const s = d.getSeconds();
    const ms = d.getMilliseconds();
    const time = `[${h}:${m}:${s}:${ms}]`;
    return chalk.gray(time);
  }

  /**
   * Log error message.
   * @param message - log message with console format expressions.
   * @param optionalParams - Optional arguments to message.
   */
  public error(message: string, ...optionalParams: any[]): void {
    if (Logger.level <= LogLevel.ERROR) {
      console.log(`${Logger.currentTime} ${this.taskName}${chalk.red(message)}`, ...optionalParams);
    }
  }

  /**
   * Log warning message.
   * @param message - log message with console format expressions.
   * @param optionalParams - Optional arguments to message.
   */
  public warn(message: string, ...optionalParams: any[]): void {
    if (Logger.level <= LogLevel.WARN) {
      console.log(`${Logger.currentTime} ${this.taskName}${chalk.yellow(message)}`, ...optionalParams);
    }
  }

  /**
   * Log info message.
   * @param message - log message with console format expressions.
   * @param optionalParams - Optional arguments to message.
   */
  public info(message: string, ...optionalParams: any[]): void {
    if (Logger.level <= LogLevel.INFO) {
      console.log(`${Logger.currentTime} ${this.taskName}${chalk.blue(message)}`, ...optionalParams);
    }
  }

  /**
   * Log trace message.
   * @param message - log message with console format expressions.
   * @param optionalParams - Optional arguments to message.
   */
  public trace(message: string, ...optionalParams: any[]): void {
    if (Logger.level <= LogLevel.TRACE) {
      console.log(`${Logger.currentTime} ${this.taskName}${message}`, ...optionalParams);
    }
  }
}

export default Logger;
