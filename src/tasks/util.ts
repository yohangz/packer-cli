import { spawn, SpawnOptions, StdioOptions } from 'child_process';
import fs from 'fs';
import path from 'path';

const isWindows = process.platform === 'win32';

export const args = process.argv.splice(2);

export const runShellCommand = (command: string, inputArguments: string[], dir: string) => {
  const cmd = isWindows ? `${command}.cmd` : command;
  const options: SpawnOptions = {
    cwd: dir,
    detached: false,
    stdio: 'inherit' as StdioOptions
  };

  return new Promise((resolve: () => void): void => {
    const childProcess = spawn(cmd, inputArguments, options);
    childProcess.on('close', () => {
      resolve();
    });
  });
};

export const makeRelativeDirPath = (...fragments: string[]): void => {
  let currentPath = process.cwd();
  for (const fragment of fragments) {
    currentPath = path.join(currentPath, fragment);
    if (!fs.existsSync(currentPath)) {
      fs.mkdirSync(currentPath);
    }
  }
};
