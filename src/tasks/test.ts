import gulp from 'gulp';
import path from 'path';
import chalk from 'chalk';
import { rollup, RollupDirOptions, RollupFileOptions, RollupWatchOptions, watch } from 'rollup';
import rollupProgress from 'rollup-plugin-progress';
import merge from 'lodash/merge';
import fs from 'fs';
import glob from 'glob';
import { args, makeRelativeDirPath, runShellCommand } from './util';
import { readConfig, readPackageData } from './meta';
import { parseScriptPreprocessorExtension } from './parser';
import {
  buildPlugin,
  extractBundleExternals,
  getBanner,
  getBaseConfig,
  preBundlePlugins, resolvePlugins,
  rollupStyleBuildPlugin
} from './build-util';
import { PackerConfig } from '../model/packer-config';

const runNodeUnitTest = (config: PackerConfig): void => {
  if (args.includes('--coverage')) {
    switch (config.testFramework) {
      case 'jasmine':
        runShellCommand('nyc', ['jasmine', 'JASMINE_CONFIG_PATH=jasmine.json'], process.cwd());
        break;
      case 'mocha':
        runShellCommand('nyc', ['mocha', path.join(config.tmp, 'test/index.spec.js')], process.cwd());
        break;
    }
  } else {
    switch (config.testFramework) {
      case 'jasmine':
        runShellCommand('jasmine', ['JASMINE_CONFIG_PATH=jasmine.json'], process.cwd());
        break;
      case 'mocha':
        runShellCommand('mocha', [path.join(config.tmp, 'test/index.spec.js')], process.cwd());
        break;
    }
  }
};

const buildUnitTestSource = async (config: PackerConfig, srcFile: string): Promise<void> => {
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
    ],

  });

  if (process.env.CI) {
    const bundle = await rollup(rollupConfig);
    await bundle.write(rollupConfig.output);
    runNodeUnitTest(config);
  } else {
    const rollupWatchConfig: RollupWatchOptions = merge({}, rollupConfig, {
      watch: {
        exclude: ['node_modules/**']
      }
    });

    const watcher = await watch([rollupWatchConfig]);
    watcher.on('event', (event) => {
      switch (event.code) {
        case 'START':
          console.log(chalk.blue('[WATCH] ') + chalk.yellow('bundling start'));
          break;
        case 'END':
          console.log(chalk.blue('[WATCH] ') + chalk.yellow('bundling end'));
          runNodeUnitTest(config);
          break;
        case 'ERROR':
          console.log(chalk.blue('[WATCH] ') + chalk.red('bundling failure'));
          console.log(event.error);
          break;
        case 'FATAL':
          console.log(chalk.blue('[WATCH] ') + chalk.red('bundling crashed'));
          console.log(event);
          break;
      }
    });
  }
};

gulp.task('test', async () => {
  try {
    const config = readConfig();
    if (config.compiler.buildMode === 'browser') {
      const karma = require('karma');

      const server = new karma.Server({
        configFile: path.join(process.cwd(), 'karma.conf.js')
      }, (exitCode) => {
        console.log(chalk.blue(`Karma has exited with ${exitCode}`));
        process.exit(exitCode);
      });

      server.start();
    } else {
      makeRelativeDirPath(config.tmp, 'test');

      let masterSpecCode = '';
      const fileExtension = parseScriptPreprocessorExtension(config.compiler.scriptPreprocessor);
      const files = glob.sync(path.join(process.cwd(), config.source, `**/*.spec.${fileExtension}`));
      files.forEach((file) => {
        masterSpecCode += `import '${file}';\n`;
      });

      const srcFile = path.join(process.cwd(), config.tmp, `test/index.spec.${fileExtension}`);
      fs.writeFileSync(srcFile, masterSpecCode);

      await buildUnitTestSource(config, srcFile);
    }
  } catch (e) {
    console.error(e);
    throw Error('task failure');
  }
});
