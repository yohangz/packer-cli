import gulp from 'gulp';
import merge from 'lodash/merge';
import path from 'path';

import { RollupWatcherEvent, RollupWatchOptions, watch } from 'rollup';
import rollupBrowserSync from 'rollup-plugin-browsersync';

import {
  getScriptBuildPlugin,
  extractBundleExternals,
  getBanner,
  getBaseConfig,
  getPreBundlePlugins,
  getDependencyResolvePlugins,
  getStyleBuildPlugins,
  customRollupPlugins
} from './build-util';

import { meta } from './meta';
import { makeRelativeDirPath, mergeDeep, requireDependency } from './util';
import logger from '../common/logger';

import * as TS from 'typescript';

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
      const typescript = requireDependency<typeof TS>('typescript', log);
      const packerConfig = meta.readPackerConfig(log);
      const packageConfig = meta.readPackageData();
      const babelConfig = meta.readBabelConfig();
      const banner = await getBanner(packerConfig, packageConfig);
      const baseConfig = getBaseConfig(packerConfig, packageConfig, banner, 'inline');

      makeRelativeDirPath(packerConfig.tmp, 'watch');

      let rollupServePlugins = [];
      if (packerConfig.serve && packerConfig.bundle.format !== 'cjs') {
        log.trace('build bundle with serve support');
        const additionalServeDir = packerConfig.serve.serveDir.map((dir: string) => path.join(process.cwd(), dir));

        rollupServePlugins = [
          rollupBrowserSync(
            mergeDeep(
              {
                server: [
                  path.join(process.cwd(), packerConfig.tmp, 'watch'),
                  path.join(process.cwd(), packerConfig.serve.demoDir),
                  path.join(process.cwd(), packerConfig.serve.helperDir),
                  ...additionalServeDir
                ],
                open: packerConfig.serve.open,
                ui: {
                  port: packerConfig.serve.port
                },
                files: [
                  path.join(process.cwd(), packerConfig.tmp, 'watch/**/*'),
                  path.join(process.cwd(), packerConfig.serve.demoDir, '**/*')
                ]
              },
              packerConfig.compiler.advanced.rollup.pluginOptions.browserSync
            )
          )
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

      const watcher = await watch([mergeDeep(watchConfig, packerConfig.compiler.advanced.rollup.watchOptions)]);
      watcher.on('event', (event: RollupWatcherEvent) => {
        switch (event.code) {
          case 'START':
            log.info('watch - bundling start');
            break;
          case 'BUNDLE_START':
            log.info('watch - bundle start');
            break;
          case 'BUNDLE_END':
            log.info('watch - bundle end (%d)', event.duration);
            break;
          case 'END':
            log.info('watch - bundling end');
            break;
          case 'ERROR':
            log.error('watch - bundling failure\n%o', event.error);
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
