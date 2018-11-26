import path from 'path';
import gulp from 'gulp';
import gulpFile from 'gulp-file';
import chmod from 'gulp-chmod';
import merge from 'lodash/merge';
import { ModuleFormat, RollupFileOptions } from 'rollup';

import gulpHbsRuntime from '../plugins/gulp-hbs-runtime';

import { PackageConfig } from '../model/package-config';
import logger from '../common/logger';
import { meta } from './meta';
import {
  getScriptBuildPlugin,
  generateBundle, customRollupPlugins, getExternalFilter,
  extractBundleExternals, generateMinStyleSheet,
  getBanner,
  getBaseConfig,
  getPostBundlePlugins,
  getPreBundlePlugins,
  getDependencyResolvePlugins,
  getStyleBuildPlugins
} from './build-util';

/**
 * Initialize build associated gulp tasks.
 */
export default function init() {

  /**
   * Copy build essentials gulp task.
   * This task will copy dynamically generated package.json file and packer config specified copy globs.
   */
  gulp.task('build:copy:essentials', () => {
    const log = logger.create('[build:copy:essentials]');
    try {
      log.trace('start');
      const packageJson = meta.readPackageData();
      const config = meta.readPackerConfig(log);

      const targetPackage: PackageConfig = {};

      // only copy needed properties from project's package json
      config.compiler.packageFieldsToCopy.forEach((field: string) => {
        targetPackage[field] = packageJson[field];
      });

      if (config.compiler.buildMode === 'node-cli') {
        targetPackage.bin = packageJson.bin;
      }

      if (config.compiler.build.bundleMin) {
        targetPackage.main = path.join('bundle', `${packageJson.name}.${config.bundle.format}.min.js`);
      } else {
        targetPackage.main = path.join('bundle', `${packageJson.name}.${config.bundle.format}.js`);
      }

      if (config.compiler.script.preprocessor === 'typescript') {
        targetPackage.typings =
          config.compiler.script.tsd ? path.join(config.compiler.script.tsd, 'index.d.ts') : 'index.d.ts';
      }

      if (config.compiler.build.es5Min) {
        const esm5MinPath = path.join('fesm5', `${packageJson.name}.esm.min.js`);
        targetPackage.module = esm5MinPath;
        targetPackage.fesm5 = esm5MinPath;
      } else if (config.compiler.build.es5) {
        const fesm5Path = path.join('fesm5', `${packageJson.name}.esm.js`);
        targetPackage.module = fesm5Path;
        targetPackage.fesm5 = fesm5Path;
      }

      if (config.compiler.build.esnextMin) {
        const esmNextMinPath = path.join('fesmnext', `${packageJson.name}.esm.min.js`);
        targetPackage.esnext = esmNextMinPath;
        targetPackage.fesmnext = esmNextMinPath;
        targetPackage['jsnext:main'] = esmNextMinPath;
      } else if (config.compiler.build.esnext) {
        const esmNextPath = path.join('fesmnext', `${packageJson.name}.esm.js`);
        targetPackage.esnext = esmNextPath;
        targetPackage.fesmnext = esmNextPath;
        targetPackage['jsnext:main'] = esmNextPath;
      }

      // Map dependencies to target package file
      switch (config.compiler.dependencyMapMode) {
        case 'cross-map-peer-dependency':
          targetPackage.peerDependencies = packageJson.dependencies;
          break;
        case 'cross-map-dependency':
          targetPackage.dependencies = packageJson.peerDependencies;
          break;
        case 'map-dependency':
          targetPackage.dependencies = packageJson.dependencies;
          break;
        case 'map-peer-dependency':
          targetPackage.peerDependencies = packageJson.peerDependencies;
          break;
        case 'all':
          targetPackage.peerDependencies = packageJson.peerDependencies;
          targetPackage.dependencies = packageJson.dependencies;
          break;
      }

      // copy the needed additional files in the 'dist' folder
      if (config.copy.length > 0) {
        log.trace('copy static files and package.json');
        return gulp.src(config.copy.map((copyFile: string) => {
          return path.join(process.cwd(), copyFile);
        }))
          .on('error', (e) => {
            log.error('copy source missing: %s\n', e.stack || e.message);
            process.exit(1);
          })
          .pipe(gulpFile('package.json', JSON.stringify(targetPackage, null, 2)))
          .pipe(gulp.dest(path.join(process.cwd(), config.dist)))
          .on('finish', () => {
            log.trace('end');
          });
      } else {
        log.trace('copy package.json');
        return gulpFile('package.json', JSON.stringify(targetPackage, null, 2))
          .pipe(gulp.dest(path.join(process.cwd(), config.dist)))
          .on('finish', () => {
            log.trace('end');
          });
      }

    } catch (e) {
      log.error('task failure: %s\n', e.stack || e.message);
      process.exit(1);
    }
  });

  /**
   * Copy bin artifacts gulp task.
   * This task will copy bin artifact only when build mode is node-cli
   */
  gulp.task('build:copy:bin', () => {
    const log = logger.create('[build:copy:bin]');
    try {
      log.trace('start');
      const packageJson = meta.readPackageData();
      const config = meta.readPackerConfig(log);

      if (config.compiler.buildMode !== 'node-cli') {
        log.trace('not a cli project: bin copy abort');
        log.trace('start');
        return;
      }

      return gulp.src([path.join(process.cwd(), '.packer/bin.hbs')])
        .on('error', (e) => {
          log.error('bin source missing: %s\n', e.stack || e.message);
          process.exit(1);
        })
        .pipe(gulpHbsRuntime({
          packageName: packageJson.name,
          format: config.bundle.format
        }, {
          rename: `${packageJson.name}.js`
        }))
        .pipe(chmod({
          group: {
            execute: true,
            read: true
          },
          others: {
            execute: true,
            read: true
          },
          owner: {
            execute: true,
            read: true,
            write: true
          }
        })) // Grant read and execute permission.
        .pipe(gulp.dest(path.join(process.cwd(), config.dist, 'bin')))
        .on('finish', () => {
          log.trace('end');
        });
    } catch (e) {
      log.error('task failure: %s\n', e.stack || e.message);
      process.exit(1);
    }
  });

  /**
   * Copy build artifacts gulp task.
   * Run copy essentials and bin on parallel mode.
   */
  gulp.task('build:copy', gulp.parallel('build:copy:essentials', 'build:copy:bin'));

  /**
   * Build distribution bundles gulp task.
   * This task contains the core logic to build scripts and styles via rollup.
   */
  gulp.task('build:bundle', async () => {
    const log = logger.create('[build:bundle]');
    try {
      log.trace(' start');
      const typescript = require('typescript');
      const packerConfig = meta.readPackerConfig(log);
      const packageConfig = meta.readPackageData();
      const babelConfig = meta.readBabelConfig();
      const banner = await getBanner(packerConfig, packageConfig);
      const baseConfig = getBaseConfig(packerConfig, packageConfig, banner);
      const externals = extractBundleExternals(packerConfig);
      const buildTasks: Array<Promise<void>> = [];
      const bundleFileName = `${packageConfig.name}.${packerConfig.bundle.format}.js`;

      // flat bundle.
      const flatConfig: RollupFileOptions = merge({}, baseConfig, {
        external: externals,
        output: {
          amd: packerConfig.bundle.amd,
          file: path.join(process.cwd(), packerConfig.dist, 'bundle', bundleFileName),
          format: packerConfig.bundle.format,
          globals: packerConfig.bundle.globals,
          name: packerConfig.bundle.namespace
        },
        plugins: [
          ...getStyleBuildPlugins(packerConfig, packageConfig, false, true, log),
          ...getPreBundlePlugins(packerConfig),
          ...getDependencyResolvePlugins(packerConfig),
          ...getScriptBuildPlugin('bundle', true, true, packerConfig, babelConfig, typescript, log),
          ...getPostBundlePlugins(packerConfig, '[build:bundle]', 'bundle'),
          ...customRollupPlugins(packerConfig, 'bundle')
        ]
      });

      log.trace('flat bundle rollup config:\n%o', flatConfig);
      buildTasks.push(
        generateBundle(packerConfig, packageConfig, flatConfig, 'bundle', packerConfig.compiler.build.bundleMin, log));

      if (packerConfig.compiler.build.es5) {
        // FESM+ES5 flat module bundle.
        const es5config: RollupFileOptions = merge({}, baseConfig, {
          external: getExternalFilter(packerConfig),
          output: {
            file: path.join(process.cwd(), packerConfig.dist, 'fesm5', `${packageConfig.name}.esm.js`),
            format: 'esm' as ModuleFormat
          },
          plugins: [
            ...getStyleBuildPlugins(packerConfig, packageConfig, false, false, log),
            ...getPreBundlePlugins(packerConfig),
            ...getDependencyResolvePlugins(packerConfig),
            ...getScriptBuildPlugin('es5', false, true, packerConfig, babelConfig, typescript, log),
            ...getPostBundlePlugins(packerConfig, '[build:bundle]', 'es5'),
            ...customRollupPlugins(packerConfig, 'es5')
          ]
        });

        log.trace('es5 bundle rollup config:\n%o', es5config);
        buildTasks.push(
          generateBundle(packerConfig,  packageConfig, es5config, 'es5', packerConfig.compiler.build.es5Min, log));
      }

      if (packerConfig.compiler.build.esnext) {
        // FESM+ESNEXT flat module bundle.
        const esnextConfig: RollupFileOptions = merge({}, baseConfig, {
          external: getExternalFilter(packerConfig),
          output: {
            file: path.join(process.cwd(), packerConfig.dist, 'fesmnext', `${packageConfig.name}.esm.js`),
            format: 'esm' as ModuleFormat
          },
          plugins: [
            ...getStyleBuildPlugins(packerConfig, packageConfig, false, false, log),
            ...getPreBundlePlugins(packerConfig),
            ...getDependencyResolvePlugins(packerConfig),
            ...getScriptBuildPlugin('esnext', false, true, packerConfig, babelConfig, typescript, log),
            ...getPostBundlePlugins(packerConfig, '[build:bundle]', 'esnext'),
            ...customRollupPlugins(packerConfig, 'esnext')
          ]
        });

        log.trace('esnext bundle rollup config:\n%o', esnextConfig);
        buildTasks.push(
          generateBundle(packerConfig,  packageConfig, esnextConfig, 'esnext',
            packerConfig.compiler.build.esnextMin, log));
      }

      if (packerConfig.compiler.concurrentBuild) {
        await Promise.all(buildTasks);
      } else {
        for (const task of buildTasks) {
          await task;
        }
      }

      await generateMinStyleSheet(packerConfig, packageConfig, log);

      log.trace('end');
    } catch (e) {
      log.error('task failure:\n%s', e.stack || e.message);
      process.exit(1);
    }
  });

  /**
   * Library build gulp task.
   * Clean distribution directory and run build copy and bundle tasks on parallel mode.
   */
  gulp.task('build', gulp.series('build:clean', gulp.parallel('build:copy', 'build:bundle')));
}
