import { spawn, SpawnOptions, StdioOptions } from 'child_process';
import fs from 'fs';
import path from 'path';

import { Logger } from '../common/logger';

const isWindows = process.platform === 'win32';

export const args = process.argv.splice(2);

/**
 * Run shell command in node environment.
 * @param command - Shell command.
 * @param inputArguments - Input arguments to the command.
 * @param dir - Execution dir.
 * @param log - Logger reference.
 */
export const runShellCommand = (command: string, inputArguments: string[], dir: string, log: Logger) => {
  const cmd = isWindows ? `${command}.cmd` : command;
  const options: SpawnOptions = {
    cwd: dir,
    detached: false,
    stdio: 'inherit' as StdioOptions
  };

  log.trace('shell command execution options:\n%o', options);
  log.trace('shell command: %s %s', cmd, inputArguments.join(' '));

  return new Promise((resolve: () => void): void => {
    const childProcess = spawn(cmd, inputArguments, options);
    childProcess.on('close', () => {
      resolve();
    });
  });
};

/**
 * Make relative directory path by fragments.
 * Create none existing fragments and ignore existing.
 * @param fragments - Directory path fragments.
 */
export const makeRelativeDirPath = (...fragments: string[]): void => {
  let currentPath = process.cwd();
  for (const fragment of fragments) {
    currentPath = path.join(currentPath, fragment);
    if (!fs.existsSync(currentPath)) {
      fs.mkdirSync(currentPath);
    }
  }
};

/**
 * Write file async.
 * @param filePath - Path to write the file.
 * @param data - Data to include in the file being written.
 */
export const writeFile = (filePath: string, data: any): Promise<void> => {
  return new Promise<void>((resolve: () => void, reject: (e: Error) => void) => {
    fs.writeFile(filePath, data, (err: NodeJS.ErrnoException): void => {
      if (err) {
        reject(err);
      }

      resolve();
    });
  });
};

/**
 * Read file async.
 * @param filePath - Path to read the file from.
 */
export const readFile = (filePath: string): Promise<string> => {
  return new Promise<string>((resolve: (data: string) => void, reject: (e: Error) => void) => {
    fs.readFile(filePath, (err: NodeJS.ErrnoException, data: Buffer): void => {
      if (err) {
        reject(err);
      }

      resolve(data.toString('utf8'));
    });
  });
};
