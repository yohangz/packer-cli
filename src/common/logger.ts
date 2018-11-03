import chalk from 'chalk';
import { args } from '../tasks/util';
import { LogLevel } from '../model/log-level';

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

export class Logger {
  public static readonly level: LogLevel = getLogLevel();
  public static create(taskName: string): Logger {
    return new Logger(taskName);
  }

  private readonly taskName: string;

  private constructor(taskName: string) {
    this.taskName = taskName ? `${chalk.green(taskName)} ` : '';
  }

  public error(message: string, ...optionalParams: any[]): void {
    if (Logger.level <= LogLevel.ERROR) {
      console.log(`${this.taskName}${chalk.red(message)}`, ...optionalParams);
    }
  }

  public warn(message: string, ...optionalParams: any[]): void {
    if (Logger.level <= LogLevel.WARN) {
      console.log(`${this.taskName}${chalk.yellow(message)}`, ...optionalParams);
    }
  }

  public info(message: string, ...optionalParams: any[]): void {
    if (Logger.level <= LogLevel.INFO) {
      console.log(`${this.taskName}${chalk.blue(message)}`, ...optionalParams);
    }
  }

  public trace(message: string, ...optionalParams: any[]): void {
    if (Logger.level <= LogLevel.TRACE) {
      console.log(`${this.taskName}${message}`, ...optionalParams);
    }
  }
}

export default Logger;
