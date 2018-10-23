import gulp from 'gulp';
import rollupServe from 'rollup-plugin-serve';
import path from 'path';
import rollupLivereload from 'rollup-plugin-livereload';
import merge from 'lodash/merge';
import rollupProgress from 'rollup-plugin-progress';
import { RollupWatchOptions, watch } from 'rollup';
import chalk from 'chalk';
import {
  buildPlugin,
  extractBundleExternals,
  getBanner,
  getBaseConfig,
  preBundlePlugins,
  resolvePlugins,
  rollupStyleBuildPlugin
} from './build-util';

import { readConfig, readPackageData } from './meta';
import { makeDir } from './util';

gulp.task('build:watch', async () => {
  try {
    const typescript = require('typescript');
    const config = readConfig();
    const packageJson = readPackageData();
    const banner = getBanner(config, packageJson);
    const baseConfig = getBaseConfig(config, packageJson, banner);

    makeDir(config.watch.scriptDir);

    let rollupServePlugins = [];
    if (config.watch.serve && config.output.format !== 'cjs') {
      rollupServePlugins = [
        rollupServe({
          contentBase: [
            path.join(process.cwd(), config.watch.scriptDir),
            path.join(process.cwd(), config.watch.demoDir),
            path.join(process.cwd(), config.watch.helperDir)
          ],
          open: config.watch.open,
          port: config.watch.port
        }),
        rollupLivereload({
          watch: [
            path.join(process.cwd(), config.watch.scriptDir),
            path.join(process.cwd(), config.watch.demoDir)
          ]
        })
      ];
    }

    const externals = extractBundleExternals(config);
    const watchConfig: RollupWatchOptions = merge({}, baseConfig, {
      external: externals,
      output: {
        file: path.join(process.cwd(), config.watch.scriptDir, `${packageJson.name}.js`),
        format: config.output.format,
        globals: config.bundle.globals,
        name: config.namespace
      },
      plugins: [
        rollupStyleBuildPlugin(config, packageJson, true, false, true),
        ...preBundlePlugins(config),
        ...resolvePlugins(config),
        ...buildPlugin('bundle', false, false, config, typescript),
        ...rollupServePlugins,
        rollupProgress()
      ],
      watch: {
        exclude: ['node_modules/**']
      }
    });

    const watcher = await watch([watchConfig]);
    watcher.on('event', (event) => {
      switch (event.code) {
        case 'START':
          console.log(chalk.blue('[WATCH] ') + chalk.yellow('bundling start'));
          break;
        case 'END':
          console.log(chalk.blue('[WATCH] ') + chalk.yellow('bundling end'));
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
  } catch (error) {
    console.log(chalk.blue('[WATCH] ') + chalk.red('watch task failure'));
    console.error(error);
  }
});

gulp.task('watch', gulp.series('watch:clean', 'build:watch'));
