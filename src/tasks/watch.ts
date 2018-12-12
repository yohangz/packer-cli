import gulp from 'gulp';
import merge from 'lodash/merge';
import path from 'path';

import { RollupWatchOptions, watch } from 'rollup';
import rollupServe from 'rollup-plugin-serve';
import rollupLivereload from 'rollup-plugin-livereload';

import {
  getScriptBuildPlugin,
  extractBundleExternals,
  getBanner,
  getBaseConfig,
  getPreBundlePlugins,
  getDependencyResolvePlugins,
  getStyleBuildPlugins, customRollupPlugins
} from './build-util';

import { meta } from './meta';
import { makeRelativeDirPath, mergeDeep, requireDependency } from './util';
import logger from '../common/logger';

/**
 * Initialize source watch associated gulp tasks.
 */
export default function init() {

  /**
   * Watch and build source gulp task.
   * Watch source and realtime compile when source files change.
   * Serve and live reload demo page if bundle is browser compliant.
   */
  gulp.task('build:watch', async () => {
    const log = logger.create('[watch]');
    try {
      const typescript = requireDependency('typescript', log);
      const packerConfig = meta.readPackerConfig(log);
      const packageConfig = meta.readPackageData();
      const babelConfig = meta.readBabelConfig();
      const banner = await getBanner(packerConfig, packageConfig);
      const baseConfig = getBaseConfig(packerConfig, packageConfig, banner, 'inline');

      makeRelativeDirPath(packerConfig.tmp, 'watch');

      let rollupServePlugins = [];
      if (packerConfig.watch && packerConfig.bundle.format !== 'cjs') {
        log.trace('build bundle with serve support');
        const additionalServeDir = packerConfig.watch.serveDir.map((dir: string) => path.join(process.cwd(), dir));

        rollupServePlugins = [
          rollupServe(mergeDeep({
            contentBase: [
              path.join(process.cwd(), packerConfig.tmp, 'watch'),
              path.join(process.cwd(), packerConfig.watch.demoDir),
              path.join(process.cwd(), packerConfig.watch.helperDir),
              ...additionalServeDir
            ],
            open: packerConfig.watch.open,
            port: packerConfig.watch.port
          }, packerConfig.compiler.advanced.rollup.pluginOptions.serve)),
          rollupLivereload(mergeDeep({
            watch: [
              path.join(process.cwd(), packerConfig.tmp, 'watch'),
              path.join(process.cwd(), packerConfig.watch.demoDir)
            ]
          }, packerConfig.compiler.advanced.rollup.pluginOptions.liveReload))
        ];
      } else {
        log.trace('build serve disabled or not supported for bundle type');
      }

      const externals = extractBundleExternals(packerConfig);
      const targetFileName = `${packageConfig.name}.${packerConfig.bundle.format}.js`;
      const watchConfig: RollupWatchOptions = merge({}, baseConfig, {
        external: externals,
        output: {
          file: path.join(process.cwd(), packerConfig.tmp, 'watch', targetFileName),
          format: packerConfig.bundle.format,
          globals: packerConfig.bundle.globals,
          name: packerConfig.bundle.namespace
        },
        plugins: [
          ...getStyleBuildPlugins(packerConfig, packageConfig, true, true, log),
          ...getPreBundlePlugins(packerConfig),
          ...getDependencyResolvePlugins(packerConfig),
          ...getScriptBuildPlugin('bundle', false, false, packerConfig, babelConfig, typescript, log),
          ...rollupServePlugins,
          ...customRollupPlugins(packerConfig, 'bundle')
        ],
        watch: {
          exclude: ['node_modules/**']
        }
      });
      log.trace('rollup config:\n%o', watchConfig);

      const watcher = await watch([
        mergeDeep(watchConfig, packerConfig.compiler.advanced.rollup.watchOptions)
      ]);
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
      log.error('task failure: %s\n', e.stack || e.message);
      process.exit(1);
    }
  });

  /**
   * Watch source gulp task.
   * Clean watch temporary files and start watch build task in series.
   */
  gulp.task('watch', gulp.series('watch:tmp:clean', 'build:watch'));
}
