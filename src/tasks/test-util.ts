import path from 'path';
import merge from 'lodash/merge';

import { ModuleFormat, rollup, RollupFileOptions, RollupWatchOptions, watch } from 'rollup';
import rollupProgress from 'rollup-plugin-progress';

import { PackerConfig } from '../model/packer-config';
import { Logger } from '../common/logger';
import { args, runShellCommand } from './util';
import { meta } from './meta';
import {
  buildPlugin,
  extractBundleExternals,
  getBanner,
  getBaseConfig,
  preBundlePlugins,
  resolvePlugins,
  rollupStyleBuildPlugin
} from './build-util';

const runNodeUnitTest = async (config: PackerConfig, log: Logger): Promise<void> => {
  try {
    const specBundlePath = path.join(config.tmp, 'test/index.bundled.spec.js');
    if (args.includes('--coverage') || args.includes('-C')) {
      switch (config.testFramework) {
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
      switch (config.testFramework) {
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
    console.log(e);
  }
};

export const buildUnitTestSource = async (config: PackerConfig, srcFile: string, log: Logger): Promise<void> => {
  const typescript = require('typescript');
  const packageJson = meta.readPackageData();
  const banner = getBanner(config, packageJson);
  const baseConfig = getBaseConfig(config, packageJson, banner, 'inline');

  const externals = extractBundleExternals(config);
  const rollupConfig: RollupFileOptions = merge({}, baseConfig, {
    input: srcFile,
    external: externals,
    output: {
      file: path.join(process.cwd(), config.tmp, 'test/index.bundled.spec.js'),
      format: 'cjs' as ModuleFormat,
      globals: config.bundle.globals,
      name: config.bundle.namespace
    },
    plugins: [
      ...rollupStyleBuildPlugin(config, packageJson, true, false, true, log),
      ...preBundlePlugins(config),
      ...resolvePlugins(config),
      ...buildPlugin('bundle', false, false, config, typescript),
      rollupProgress()
    ]
  });

  if (process.env.CI) {
    log.trace('rollup CI config:\n%o', rollupConfig);
    const bundle = await rollup(rollupConfig);
    await bundle.write(rollupConfig.output);
    await runNodeUnitTest(config, log);
  } else {
    const rollupWatchConfig: RollupWatchOptions = merge({}, rollupConfig, {
      watch: {
        exclude: ['node_modules/**']
      }
    });
    log.trace('rollup config:\n%o', rollupWatchConfig);

    const watcher = await watch([rollupWatchConfig]);
    watcher.on('event', async (event) => {
      switch (event.code) {
        case 'START':
          log.info('%s - %s', 'watch', 'bundling start');
          break;
        case 'END':
          log.info('%s - %s', 'watch', 'bundling end');
          await runNodeUnitTest(config, log);
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
