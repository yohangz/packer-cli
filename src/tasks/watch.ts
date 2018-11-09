import gulp from 'gulp';
import merge from 'lodash/merge';
import path from 'path';

import { RollupWatchOptions, watch } from 'rollup';
import rollupServe from 'rollup-plugin-serve';
import rollupLivereload from 'rollup-plugin-livereload';
import rollupProgress from 'rollup-plugin-progress';

import {
  buildPlugin,
  extractBundleExternals,
  getBanner,
  getBaseConfig,
  preBundlePlugins,
  resolvePlugins,
  rollupStyleBuildPlugin
} from './build-util';

import { meta } from './meta';
import { makeRelativeDirPath } from './util';
import logger from '../common/logger';

export default function init() {
  gulp.task('build:watch', async () => {
    const log = logger.create('[watch]');
    try {
      const typescript = require('typescript');
      const config = meta.readPackerConfig(log);
      const packageJson = meta.readPackageData();
      const banner = getBanner(config, packageJson);
      const baseConfig = getBaseConfig(config, packageJson, banner, 'inline');

      makeRelativeDirPath(config.tmp, 'watch');

      let rollupServePlugins = [];
      const additionalServeDir = config.watch.serveDir.map((dir: string) => path.join(process.cwd(), dir));
      if (config.watch.serve && config.output.format !== 'cjs') {
        log.trace('set serve plugins');
        rollupServePlugins = [
          rollupServe({
            contentBase: [
              path.join(process.cwd(), config.tmp, 'watch'),
              path.join(process.cwd(), config.watch.demoDir),
              path.join(process.cwd(), config.watch.helperDir),
              ...additionalServeDir
            ],
            open: config.watch.open,
            port: config.watch.port
          }),
          rollupLivereload({
            watch: [
              path.join(process.cwd(), config.tmp, 'watch'),
              path.join(process.cwd(), config.watch.demoDir)
            ]
          })
        ];
      }

      const externals = extractBundleExternals(config);
      const watchConfig: RollupWatchOptions = merge({}, baseConfig, {
        external: externals,
        output: {
          file: path.join(process.cwd(), config.tmp, 'watch', `${packageJson.name}.js`),
          format: config.output.format,
          globals: config.bundle.globals,
          name: config.output.namespace
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
      log.trace('rollup config:\n%o', watchConfig);

      const watcher = await watch([watchConfig]);
      watcher.on('event', (event) => {
        switch (event.code) {
          case 'START':
            log.info('%s - %s', 'watch', 'bundling start');
            break;
          case 'END':
            log.info('%s - %s', 'watch', 'bundling end');
            break;
          case 'ERROR':
            log.error('%s - %s\n%o', 'watch', 'bundling failure', event.error);
            break;
          case 'FATAL':
            log.error('%s - %s\n%o', 'watch', 'bundling crashed', event);
            break;
        }
      });
    } catch (e) {
      log.error('failure: %s\n', e.stack || e.message);
    }
  });

  gulp.task('watch', gulp.series('tmp:clean', 'build:watch'));
}
