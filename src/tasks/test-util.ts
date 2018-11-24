import path from 'path';
import merge from 'lodash/merge';

import { ModuleFormat, rollup, RollupFileOptions, RollupWatchOptions, watch } from 'rollup';

import { PackerConfig } from '../model/packer-config';
import { Logger } from '../common/logger';
import { args, mergeDeep, runShellCommand } from './util';
import { meta } from './meta';
import {
  getScriptBuildPlugin,
  extractBundleExternals,
  getBanner,
  getBaseConfig,
  getPreBundlePlugins,
  getDependencyResolvePlugins,
  getStyleBuildPlugins, customRollupPlugins
} from './build-util';

/**
 * Run unit test framework in node environment.
 * Support running test spec with coverage mode and normal mode.
 * @param packerConfig - Packer config object.
 * @param log - Logger reference.
 */
const runNodeUnitTest = async (packerConfig: PackerConfig, log: Logger): Promise<void> => {
  try {
    const specBundlePath = path.join(packerConfig.tmp, 'test/index.bundled.spec.js');
    if (args.includes('--coverage') || args.includes('-C')) {
      switch (packerConfig.testFramework) {
        case 'jasmine':
          await runShellCommand('nyc', ['jasmine', 'JASMINE_CONFIG_PATH=jasmine.json'], process.cwd(), log);
          break;
        case 'mocha':
          await runShellCommand('nyc', ['mocha', specBundlePath], process.cwd(), log);
          break;
        case 'jest':
          await runShellCommand('jest', ['--config=jest.config.js', '--coverage'], process.cwd(), log);
          break;
      }
    } else {
      switch (packerConfig.testFramework) {
        case 'jasmine':
          await runShellCommand('jasmine', ['JASMINE_CONFIG_PATH=jasmine.json'], process.cwd(), log);
          break;
        case 'mocha':
          await runShellCommand('mocha', [specBundlePath], process.cwd(), log);
          break;
        case 'jest':
          await runShellCommand('jest', ['--config=jest.config.js'], process.cwd(), log);
          break;
      }
    }
  } catch (e) {
    log.error('test execution failure\n%o', e);
  }
};

/**
 * Run rollup on watch mode and invoke test framework on source change.
 * @param packerConfig - Packer config object.
 * @param srcFile - Dynamic source spec file which include references to all project spec files.
 * @param log - Logger reference.
 */
export const buildUnitTestSource = async (packerConfig: PackerConfig, srcFile: string, log: Logger): Promise<void> => {
  const typescript = require('typescript');
  const packageConfig = meta.readPackageData();
  const banner = await getBanner(packerConfig, packageConfig);
  const baseConfig = getBaseConfig(packerConfig, packageConfig, banner, 'inline');

  const externals = extractBundleExternals(packerConfig);
  const rollupConfig: RollupFileOptions = merge({}, baseConfig, {
    input: srcFile,
    external: externals,
    output: {
      file: path.join(process.cwd(), packerConfig.tmp, 'test/index.bundled.spec.js'),
      format: 'cjs' as ModuleFormat,
      globals: packerConfig.bundle.globals,
      name: packerConfig.bundle.namespace
    },
    plugins: [
      ...getStyleBuildPlugins(packerConfig, packageConfig, true, true, log),
      ...getPreBundlePlugins(packerConfig),
      ...getDependencyResolvePlugins(packerConfig),
      ...getScriptBuildPlugin('bundle', false, false, packerConfig, typescript, log),
      ...customRollupPlugins(packerConfig, 'bundle')
    ]
  });

  // Run test spec only once if CI environment, else watch test source and execute spec on change.
  if (process.env.CI) {
    log.trace('rollup CI config:\n%o', rollupConfig);
    const bundle = await rollup(rollupConfig);
    await bundle.write(rollupConfig.output);
    await runNodeUnitTest(packerConfig, log);
  } else {
    const rollupWatchConfig: RollupWatchOptions = merge({}, rollupConfig, {
      watch: {
        exclude: ['node_modules/**']
      }
    });
    log.trace('rollup config:\n%o', rollupWatchConfig);

    const watcher = await watch([
      mergeDeep(rollupWatchConfig, packerConfig.compiler.advanced.rollup.watchOptions)
    ]);
    watcher.on('event', async (event) => {
      switch (event.code) {
        case 'START':
          log.info('%s - %s', 'watch', 'bundling start');
          break;
        case 'END':
          log.info('%s - %s', 'watch', 'bundling end');
          await runNodeUnitTest(packerConfig, log);
          break;
        case 'ERROR':
          log.error('%s - %s\n%o', 'watch', 'bundling failure', event.error);
          break;
        case 'FATAL':
          log.error('%s - %s\n%o', 'watch', 'bundling crashed', event);
          break;
      }
    });
  }
};
