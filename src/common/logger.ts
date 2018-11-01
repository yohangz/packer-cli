import chalk from 'chalk';
import { args } from '../tasks/util';
import { LogLevel } from '../model/log-level';

export class Logger {
  private readonly level: LogLevel;

  public constructor() {
    if (args.includes('--info')) {
      this.level = LogLevel.INFO;
    } else if (args.includes('--error')) {
      this.level = LogLevel.ERROR;
    } else if (args.includes('--warn')) {
      this.level = LogLevel.WARN;
    } else if (args.includes('--trace')) {
      this.level = LogLevel.TRACE;
    } else if (args.includes('--silent')) {
      this.level = LogLevel.SILENT;
    } else {
      this.level = LogLevel.ERROR;
    }
  }

  public error(message?: any, ...optionalParams: any[]): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(chalk.red(message), ...optionalParams);
    }
  }

  public warn(message?: any, ...optionalParams: any[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(chalk.yellow(message), ...optionalParams);
    }
  }

  public info(message?: any, ...optionalParams: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.info(chalk.blue(message), ...optionalParams);
    }
  }

  public trace(message?: any, ...optionalParams: any[]): void {
    if (this.level <= LogLevel.TRACE) {
      console.info(chalk.gray(message), ...optionalParams);
    }
  }
}

export default new Logger();
