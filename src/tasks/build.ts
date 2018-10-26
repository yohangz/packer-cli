import gulp from 'gulp';
import path from 'path';
import chalk from 'chalk';
import gulpFile from 'gulp-file';
import merge from 'lodash/merge';
import rollupUglify from '../plugins/rollup-plugin-uglify-es';
import mergeStream from 'merge-stream';
import chmod from 'gulp-chmod';

import { readConfig, readPackageData } from './meta';
import {
  buildPlugin,
  bundleBuild,
  extractBundleExternals,
  getBanner,
  getBaseConfig,
  postBundlePlugins,
  preBundlePlugins,
  resolvePlugins,
  rollupStyleBuildPlugin
} from './build-util';

import gulpHbsRuntime from '../plugins/gulp-hbs-runtime';
import { PackageConfig } from '../model/package-config';
import { RollupFileOptions } from 'rollup';

gulp.task('build:copy:essentials', () => {
  try {
    const packageJson = readPackageData();
    const config = readConfig();

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

    targetPackage.main = path.join('bundle', `${packageJson.name}.js`);

    if (config.compiler.scriptPreprocessor === 'typescript') {
      targetPackage.typings = 'index.d.ts';
    }

    if (config.output.es5) {
      targetPackage.module = path.join('fesm5', `${packageJson.name}.js`);
      targetPackage.fesm5 = path.join('fesm5', `${packageJson.name}.js`);
    }

    if (config.output.esnext) {
      targetPackage.esnext = path.join('fesmnext', `${packageJson.name}.js`);
      targetPackage.fesmnext = path.join('fesmnext', `${packageJson.name}.js`);
    }

    // Map dependencies to target package file
    switch (config.output.dependencyMapMode) {
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
    const packageFlatEssentials = gulp.src((config.copy || []).map((copyFile: string) => {
      return path.join(process.cwd(), copyFile);
    }), {
      allowEmpty: true
    })
      .on('error', (e) => {
        console.error(e);
        throw Error('task failure');
      })
      .pipe(gulpFile('package.json', JSON.stringify(targetPackage, null, 2)))
      .pipe(gulp.dest(path.join(process.cwd(), config.dist)));

    if (config.compiler.buildMode !== 'node-cli') {
      return packageFlatEssentials;
    }

    const packageBin = gulp.src([path.join(process.cwd(), '.packer/bin.hbs')])
      .on('error', (e) => {
        console.error(e);
        throw Error('task failure');
      })
      .pipe(gulpHbsRuntime({
        packageName: packageJson.name
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
      })) // Grand read and execute permission.
      .pipe(gulp.dest(path.join(process.cwd(), config.dist, 'bin')));

    return mergeStream(packageFlatEssentials, packageBin);
  } catch (e) {
    console.error(e);
    throw Error('task failure');
  }
});

gulp.task('build:bundle', async () => {
  try {
    const typescript = require('typescript');
    const config = readConfig();
    const packageJson = readPackageData();
    const banner = getBanner(config, packageJson);
    const baseConfig = getBaseConfig(config, packageJson, banner);
    const externals = extractBundleExternals(config);

    // flat bundle.
    const flatConfig: RollupFileOptions = merge({}, baseConfig, {
      external: externals,
      output: {
        amd: config.output.amd,
        file: path.join(process.cwd(), config.dist, 'bundle', `${packageJson.name}.js`),
        format: config.output.format,
        globals: config.bundle.globals,
        name: config.output.namespace
      },
      plugins: [
        rollupStyleBuildPlugin(config, packageJson, false, false, true),
        ...preBundlePlugins(config),
        ...resolvePlugins(config),
        ...buildPlugin('bundle', true, true, config, typescript),
        ...postBundlePlugins()
      ]
    });

    await bundleBuild(flatConfig, 'FLAT');

    if (config.output.minBundle) {
      // minified flat bundle.
      const minifiedFlatConfig: RollupFileOptions = merge({}, baseConfig, {
        external: externals,
        output: {
          amd: config.output.amd,
          file: path.join(process.cwd(), config.dist, 'bundle', `${packageJson.name}.min.js`),
          format: config.output.format,
          globals: config.bundle.globals,
          name: config.output.namespace
        },
        plugins: [
          rollupStyleBuildPlugin(config, packageJson, false, true, true),
          ...preBundlePlugins(config),
          ...resolvePlugins(config),
          ...buildPlugin('bundle', false, true, config, typescript),
          rollupUglify({
            output: {
              comments: /@preserve|@license/
            }
          }),
          ...postBundlePlugins()
        ]
      });

      await bundleBuild(minifiedFlatConfig, 'FLAT MIN');
    }

    if (config.output.es5) {
      // FESM+ES5 flat module bundle.
      const es5config: RollupFileOptions = merge({}, baseConfig, {
        external: config.bundle.externals,
        output: {
          file: path.join(process.cwd(), config.dist, 'fesm5', `${packageJson.name}.js`),
          format: 'esm'
        },
        plugins: [
          rollupStyleBuildPlugin(config, packageJson, false, true, false),
          ...preBundlePlugins(config),
          ...buildPlugin('es5', false, true, config, typescript),
          ...postBundlePlugins()
        ]
      });

      await bundleBuild(es5config, 'ES5');
    }

    if (config.output.esnext) {
      // FESM+ESNEXT flat module bundle.
      const esnextConfig: RollupFileOptions = merge({}, baseConfig, {
        external: config.bundle.externals,
        output: {
          file: path.join(process.cwd(), config.dist, 'fesmnext', `${packageJson.name}.js`),
          format: 'esm'
        },
        plugins: [
          rollupStyleBuildPlugin(config, packageJson, false, true, false),
          ...preBundlePlugins(config),
          ...buildPlugin('esnext', false, true, config, typescript),
          ...postBundlePlugins()
        ]
      });

      await bundleBuild(esnextConfig, 'ESNEXT');
    }
  } catch (e) {
    console.log(chalk.red('[build:bundle] failure'));
    console.error(e);
    throw Error('task failure');
  }
});

gulp.task('build', gulp.series('build:clean', 'build:copy:essentials', 'build:bundle'));
