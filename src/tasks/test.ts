import gulp from 'gulp';
import path from 'path';
import chalk from 'chalk';
import merge from 'lodash/merge';
import fs from 'fs';
import glob from 'glob';
import { rollup, RollupFileOptions, RollupWatchOptions, watch } from 'rollup';
import rollupProgress from 'rollup-plugin-progress';

import { args, makeRelativeDirPath, runShellCommand } from './util';
import { readConfig, readPackageData } from './meta';
import { parseScriptPreprocessorExtension } from './parser';
import { PackerConfig } from '../model/packer-config';
import { Logger } from '../common/logger';
import {
  buildPlugin,
  extractBundleExternals,
  getBanner,
  getBaseConfig,
  preBundlePlugins, resolvePlugins,
  rollupStyleBuildPlugin
} from './build-util';
import logger from '../common/logger';

const runNodeUnitTest = async (config: PackerConfig, log: Logger): Promise<void> => {
  if (args.includes('--coverage')) {
    switch (config.testFramework) {
      case 'jasmine':
        await runShellCommand('nyc', ['jasmine', 'JASMINE_CONFIG_PATH=jasmine.json'], process.cwd(), log);
        break;
      case 'mocha':
        await runShellCommand('nyc', ['mocha', path.join(config.tmp, 'test/index.spec.js')], process.cwd(), log);
        break;
    }
  } else {
    switch (config.testFramework) {
      case 'jasmine':
        await runShellCommand('jasmine', ['JASMINE_CONFIG_PATH=jasmine.json'], process.cwd(), log);
        break;
      case 'mocha':
        await runShellCommand('mocha', [path.join(config.tmp, 'test/index.spec.js')], process.cwd(), log);
        break;
    }
  }
};

const buildUnitTestSource = async (config: PackerConfig, srcFile: string, log: Logger): Promise<void> => {
  const typescript = require('typescript');
  const packageJson = readPackageData();
  const banner = getBanner(config, packageJson);
  const baseConfig = getBaseConfig(config, packageJson, banner);

  const externals = extractBundleExternals(config);
  const rollupConfig: RollupFileOptions = merge({}, baseConfig, {
    input: srcFile,
    external: externals,
    output: {
      file: path.join(process.cwd(), config.tmp, 'test/index.spec.js'),
      format: 'cjs',
      globals: config.bundle.globals,
      name: config.output.namespace
    },
    plugins: [
      rollupStyleBuildPlugin(config, packageJson, true, false, true),
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

gulp.task('test', async () => {
  const log = logger.create('[test]');
  try {
    log.trace('start');
    const config = readConfig();
    if (config.compiler.buildMode === 'browser') {
      log.trace('start test suite execution via karma');
      const karma = require('karma');

      const server = new karma.Server({
        configFile: path.join(process.cwd(), 'karma.conf.js')
      }, (exitCode) => {
        log.info('Karma has exited with %n', exitCode);
        process.exit(exitCode);
      });

      server.start();
    } else {
      log.trace('start test suite execution node');
      makeRelativeDirPath(config.tmp, 'test');

      let masterSpecCode = '';
      const fileExtension = parseScriptPreprocessorExtension(config.compiler.scriptPreprocessor);
      const files = glob.sync(path.join(process.cwd(), config.source, `**/*.spec.${fileExtension}`));
      files.forEach((file) => {
        masterSpecCode += `import '${file}';\n`;
      });
      log.trace('combined test spec code:\n%s', masterSpecCode);

      const srcFile = path.join(process.cwd(), config.tmp, `test/index.spec.${fileExtension}`);
      log.trace('combined test spec file path:\n%s', srcFile);

      fs.writeFileSync(srcFile, masterSpecCode);

      await buildUnitTestSource(config, srcFile, log);
    }
  } catch (e) {
    log.error('failure: %s\n', e.stack || e.message);
  }
});
