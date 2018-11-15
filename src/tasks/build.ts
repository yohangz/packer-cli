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
  buildPlugin,
  bundleBuild, externalFilter,
  extractBundleExternals,
  getBanner,
  getBaseConfig,
  postBundlePlugins,
  preBundlePlugins,
  resolvePlugins,
  rollupStyleBuildPlugin
} from './build-util';

export default function init() {
  gulp.task('build:copy:essentials', () => {
    const log = logger.create('[build:copy:essentials]');
    try {
      log.trace('start');
      const packageJson = meta.readPackageData();
      const config = meta.readPackerConfig(log);

      const targetPackage: PackageConfig = {};
      const fieldsToCopy = [
        'name',
        'version',
        'description',
        'keywords',
        'author',
        'repository',
        'license',
        'bugs',
        'homepage'
      ];

      // only copy needed properties from project's package json
      fieldsToCopy.forEach((field: string) => {
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
        targetPackage.typings = 'index.d.ts';
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

  gulp.task('build:copy', gulp.parallel('build:copy:essentials', 'build:copy:bin'));

  gulp.task('build:bundle', async () => {
    const log = logger.create('[build:bundle]');
    try {
      log.trace(' start');
      const typescript = require('typescript');
      const config = meta.readPackerConfig(log);
      const packageJson = meta.readPackageData();
      const banner = getBanner(config, packageJson);
      const baseConfig = getBaseConfig(config, packageJson, banner);
      const externals = extractBundleExternals(config);
      const buildTasks: Array<Promise<void>> = [];
      // flat bundle.
      const flatConfig: RollupFileOptions = merge({}, baseConfig, {
        external: externals,
        output: {
          amd: config.bundle.amd,
          file: path.join(process.cwd(), config.dist, 'bundle', `${packageJson.name}.${config.bundle.format}.js`),
          format: config.bundle.format,
          globals: config.bundle.globals,
          name: config.bundle.namespace
        },
        plugins: [
          ...rollupStyleBuildPlugin(config, packageJson, false, false, true, log),
          ...preBundlePlugins(config),
          ...resolvePlugins(config),
          ...buildPlugin('bundle', true, true, config, typescript),
          ...postBundlePlugins('[build:bundle]', 'flat')
        ]
      });

      log.trace('flat bundle rollup config:\n%o', flatConfig);
      buildTasks.push(
        bundleBuild(config, packageJson, flatConfig, 'flat', config.compiler.build.bundleMin, log));

      if (config.compiler.build.es5) {
        // FESM+ES5 flat module bundle.
        const es5config: RollupFileOptions = merge({}, baseConfig, {
          external: externalFilter(config),
          output: {
            file: path.join(process.cwd(), config.dist, 'fesm5', `${packageJson.name}.esm.js`),
            format: 'esm' as ModuleFormat
          },
          plugins: [
            ...rollupStyleBuildPlugin(config, packageJson, false, true, false, log),
            ...preBundlePlugins(config),
            ...resolvePlugins(config),
            ...buildPlugin('es5', false, true, config, typescript),
            ...postBundlePlugins('[build:bundle]', 'es5')
          ]
        });

        log.trace('es5 bundle rollup config:\n%o', es5config);
        buildTasks.push(
          bundleBuild(config,  packageJson, es5config, 'es5', config.compiler.build.es5Min, log));
      }

      if (config.compiler.build.esnext) {
        // FESM+ESNEXT flat module bundle.
        const esnextConfig: RollupFileOptions = merge({}, baseConfig, {
          external: externalFilter(config),
          output: {
            file: path.join(process.cwd(), config.dist, 'fesmnext', `${packageJson.name}.esm.js`),
            format: 'esm' as ModuleFormat
          },
          plugins: [
            ...rollupStyleBuildPlugin(config, packageJson, false, true, false, log),
            ...preBundlePlugins(config),
            ...resolvePlugins(config),
            ...buildPlugin('esnext', false, true, config, typescript),
            ...postBundlePlugins('[build:bundle]', 'esnext')
          ]
        });

        log.trace('esnext bundle rollup config:\n%o', esnextConfig);
        buildTasks.push(
          bundleBuild(config,  packageJson, esnextConfig, 'esnext', config.compiler.build.esnextMin, log));
      }

      if (config.compiler.concurrentBuild) {
        await Promise.all(buildTasks);
      } else {
        for (const task of buildTasks) {
          await task;
        }
      }
      log.trace('end');
    } catch (e) {
      log.error('task failure: %s\n', e.stack || e.message);
      process.exit(1);
    }
  });

  gulp.task('build', gulp.series('build:clean', gulp.parallel('build:copy', 'build:bundle')));
}
