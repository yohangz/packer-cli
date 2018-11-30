import path from 'path';

import { PackerConfig } from '../model/packer-config';
import { Logger } from '../common/logger';
import { args, runShellCommand, watchSource } from './util';
import { parseScriptPreprocessorExtension } from './parser';

/**
 * Run unit test framework in node environment.
 * Support running test spec with coverage mode and normal mode.
 * @param packerConfig - Packer config object.
 * @param log - Logger reference.
 */
export const runNodeUnitTest = async (packerConfig: PackerConfig, log: Logger): Promise<void> => {
  try {
    process.env.BABEL_ENV = process.env.BABEL_ENV || 'test';

    const scriptExt = parseScriptPreprocessorExtension(packerConfig.compiler.script.preprocessor);
    const globScriptExtensions = `{${scriptExt},${scriptExt}x}`;
    const specBundlePath = path.join(packerConfig.source, `**/*.spec.${globScriptExtensions}`);

    const watchMode = args.includes('--watch') || args.includes('-W');
    if (args.includes('--coverage') || args.includes('-C')) {
      switch (packerConfig.test.framework) {
        case 'jasmine':
          const watchGlob = path.join(packerConfig.source, `**/*.${globScriptExtensions}`);
          if (watchMode) {
            await watchSource(watchGlob, async () => {
              await runShellCommand('nyc jasmine --config=jasmine.json', process.cwd(), log);
            });
          } else {
            await runShellCommand('nyc jasmine --config=jasmine.json', process.cwd(), log);
          }
          break;
        case 'mocha':
          if (watchMode) {
            await runShellCommand(`nyc mocha --opts mocha.opts --watch ${specBundlePath}`, process.cwd(), log);
          } else {
            await runShellCommand(`nyc mocha --opts mocha.opts ${specBundlePath}`, process.cwd(), log);
          }
          break;
        case 'jest':
          if (watchMode) {
            await runShellCommand('jest --config=jest.config.js --coverage --watch', process.cwd(), log);
          } else {
            await runShellCommand('jest --config=jest.config.js --coverage', process.cwd(), log);
          }
          break;
      }
    } else {
      switch (packerConfig.test.framework) {
        case 'jasmine':
          const watchGlob = path.join(packerConfig.source, `**/*.${globScriptExtensions}`);
          if (watchMode) {
            await watchSource(watchGlob, async () => {
              await runShellCommand('jasmine --config=jasmine.json', process.cwd(), log);
            });
          } else {
            await runShellCommand('jasmine --config=jasmine.json', process.cwd(), log);
          }
          break;
        case 'mocha':
          if (watchMode) {
            await runShellCommand(`mocha --opts mocha.opts --watch ${specBundlePath}`, process.cwd(), log);
          } else {
            await runShellCommand(`mocha --opts mocha.opts ${specBundlePath}`, process.cwd(), log);
          }
          break;
        case 'jest':
          if (watchMode) {
            await runShellCommand('jest --config=jest.config.js --watch', process.cwd(), log);
          } else {
            await runShellCommand('jest --config=jest.config.js', process.cwd(), log);
          }
          break;
      }
    }
  } catch (e) {
    log.error('test execution failure\n%o', e);
  }
};
