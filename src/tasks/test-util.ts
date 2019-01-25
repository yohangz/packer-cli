import { PackerConfig } from '../model/packer-config';

import { Logger } from '../common/logger';
import { args, runShellCommand, watchSource } from './util';
import { parseScriptPreprocessorExtensionGlob } from './parser';

/**
 * Run unit test framework in node environment.
 * Support running test spec with coverage mode and normal mode.
 * @param packerConfig Packer config object.
 * @param log Logger reference.
 */
export const runNodeUnitTest = async (packerConfig: PackerConfig, log: Logger): Promise<void> => {
  try {
    process.env.BABEL_ENV = process.env.BABEL_ENV || 'test';

    const globScriptExtensions = parseScriptPreprocessorExtensionGlob(packerConfig.compiler.script.preprocessor);
    const watchGlob = `**/*.${globScriptExtensions}`;

    const watchMode = args.includes('--watch') || args.includes('-W');
    if (args.includes('--coverage') || args.includes('-C')) {
      switch (packerConfig.test.framework) {
        case 'jasmine':
          if (watchMode) {
            await watchSource(watchGlob, async () => {
              await runShellCommand(packerConfig.test.advanced.jasmine.coverageWatch, process.cwd(), log);
            });
          } else {
            await runShellCommand(packerConfig.test.advanced.jasmine.coverageDefault, process.cwd(), log);
          }
          break;
        case 'mocha':
          if (watchMode) {
            await runShellCommand(packerConfig.test.advanced.mocha.coverageWatch, process.cwd(), log);
          } else {
            await runShellCommand(packerConfig.test.advanced.mocha.coverageDefault, process.cwd(), log);
          }
          break;
        case 'jest':
          if (watchMode) {
            await runShellCommand(packerConfig.test.advanced.jest.coverageWatch, process.cwd(), log);
          } else {
            await runShellCommand(packerConfig.test.advanced.jest.coverageDefault, process.cwd(), log);
          }
          break;
      }
    } else {
      switch (packerConfig.test.framework) {
        case 'jasmine':
          if (watchMode) {
            await watchSource(watchGlob, async () => {
              await runShellCommand(packerConfig.test.advanced.jasmine.watch, process.cwd(), log);
            });
          } else {
            await runShellCommand(packerConfig.test.advanced.jasmine.default, process.cwd(), log);
          }
          break;
        case 'mocha':
          if (watchMode) {
            await runShellCommand(packerConfig.test.advanced.mocha.watch, process.cwd(), log);
          } else {
            await runShellCommand(packerConfig.test.advanced.mocha.default, process.cwd(), log);
          }
          break;
        case 'jest':
          if (watchMode) {
            await runShellCommand(packerConfig.test.advanced.jest.watch, process.cwd(), log);
          } else {
            await runShellCommand(packerConfig.test.advanced.jest.default, process.cwd(), log);
          }
          break;
      }
    }
  } catch (e) {
    log.error('test execution failure\n%o', e);
  }
};
