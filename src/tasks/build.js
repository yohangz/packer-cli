import gulp from 'gulp';
import path from 'path';
import chalk from 'chalk';
import gulpFile from 'gulp-file';
import merge from 'lodash/merge';
import rollupUglify from 'rollup-plugin-uglify-es';
import mergeStream from 'merge-stream';
import chmod from 'gulp-chmod';

import { readConfig, readPackageData } from './meta';
import {
  buildPlugin,
  bundleBuild,
  getBanner,
  getBaseConfig,
  postBundlePlugins,
  preBundlePlugins,
  resolvePlugins,
  rollupStyleBuildPlugin
} from './build-util';

import gulpHbsRuntime from '../plugins/gulp-hbs-runtime';

gulp.task('build:copy:essentials', () => {
  const packageJson = readPackageData();
  const config = readConfig();

  let targetPackage = {};
  let fieldsToCopy = ['name', 'version', 'description', 'keywords', 'author', 'repository', 'license', 'bugs', 'homepage'];

  // only copy needed properties from project's package json
  fieldsToCopy.forEach((field) => {
    targetPackage[field] = packageJson[field];
  });

  if (config.cliProject) {
    targetPackage.bin = packageJson.bin;
  }

  targetPackage.main = path.join('bundle', `${packageJson.name}.js`);

  if (config.typescript) {
    targetPackage.typings = 'index.d.ts';
  }

  if (config.dist.generateFESM5) {
    targetPackage.module = path.join('fesm5', `${packageJson.name}.js`);
    targetPackage.fesm5 = path.join('fesm5', `${packageJson.name}.js`);
  }

  if (config.dist.generateFESM2015) {
    targetPackage.es2015 = path.join('fesm2015', `${packageJson.name}.js`);
    targetPackage.fesm2015 = path.join('fesm2015', `${packageJson.name}.js`);
  }

  // Map dependencies to target package file
  switch (config.bundle.dependencyMapMode) {
    case 'crossMapPeerDependency':
      targetPackage.peerDependencies = packageJson.dependencies;
      break;
    case 'crossMapDependency':
      targetPackage.dependencies = packageJson.peerDependencies;
      break;
    case 'mapDependency':
      targetPackage.dependencies = packageJson.dependencies;
      break;
    case 'mapPeerDependency':
      targetPackage.peerDependencies = packageJson.peerDependencies;
      break;
    case 'all':
      targetPackage.peerDependencies = packageJson.peerDependencies;
      targetPackage.dependencies = packageJson.dependencies;
      break;
  }

  // copy the needed additional files in the 'dist' folder
  const packageFlatEssentials = gulp.src((config.copy || []).map((copyFile) => {
    return path.join(process.cwd(), copyFile);
  }), {
    allowEmpty: true
  })
    .pipe(gulpFile('package.json', JSON.stringify(targetPackage, null, 2)).on('error', (error) => {
      console.log(chalk.red(`Bundle build Failure`));
      console.error(error);
    }))
    .pipe(gulp.dest(path.join(process.cwd(), config.dist.outDir)));

  if (!config.cliProject) {
    return packageFlatEssentials;
  }

  const packageBin = gulp.src([ path.join(process.cwd(), 'templates/.bin.hbs') ])
    .pipe(gulpHbsRuntime({
      packageName: packageJson.name
    }, {
      rename: `${packageJson.name}.js`
    }))
    .pipe(chmod({
      owner: {
        read: true,
        write: true,
        execute: true
      },
      group: {
        read: true,
        execute: true
      },
      others: {
        read: true,
        execute: true
      }
    })) // Grand read and execute permission.
    .pipe(gulp.dest(path.join(process.cwd(), config.dist.outDir, 'bin')));

  return mergeStream(packageFlatEssentials, packageBin);
});

gulp.task('build:bundle', async () => {
  const config = readConfig();
  const packageJson = readPackageData();
  const banner = getBanner(config, packageJson);
  const baseConfig = getBaseConfig(config, packageJson, banner);

  try {
    const globalKeys = Object.keys(config.flatGlobals);
    const flatBundleExternals = globalKeys.length ? globalKeys : config.esmExternals;
    const flatBundleTarget = config.browserCompliant ? 'es5' : 'es2015';

    // flat bundle.
    const flatConfig = merge({}, baseConfig, {
      output: {
        name: config.namespace,
        format: config.bundle.format,
        file: path.join(process.cwd(), config.dist.outDir, 'bundle', `${packageJson.name}.js`),
        globals: config.flatGlobals,
        amd: config.bundle.amd
      },
      external: flatBundleExternals,
      plugins: [
        rollupStyleBuildPlugin(config, packageJson, false, false, true),
        ...preBundlePlugins(config),
        ...resolvePlugins(config),
        buildPlugin(flatBundleTarget, true, false, config),
        ...postBundlePlugins()
      ]
    });

    await bundleBuild(flatConfig, 'FLAT');

    if (config.dist.generateMin) {
      // minified flat bundle.
      const minifiedFlatConfig = merge({}, baseConfig, {
        output: {
          name: config.namespace,
          format: config.bundle.format,
          file: path.join(process.cwd(), config.dist.outDir, 'bundle', `${packageJson.name}.min.js`),
          globals: config.flatGlobals,
          amd: config.bundle.amd
        },
        external: flatBundleExternals,
        plugins: [
          rollupStyleBuildPlugin(config, packageJson, false, true, true),
          ...preBundlePlugins(config),
          ...resolvePlugins(config),
          buildPlugin(flatBundleTarget, false, false, config),
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

    if (config.dist.generateFESM5) {
      // FESM+ES5 flat module bundle.
      const fesm5config = merge({}, baseConfig, {
        output: {
          format: 'es',
          file: path.join(process.cwd(), config.dist.outDir, 'fesm5', `${packageJson.name}.js`)
        },
        plugins: [
          rollupStyleBuildPlugin(config, packageJson, false, true, false),
          ...preBundlePlugins(config),
          buildPlugin('es5', false, false, config),
          ...postBundlePlugins()
        ],
        external: config.esmExternals
      });

      await bundleBuild(fesm5config, 'FESM5');
    }

    if (config.dist.generateFESM2015) {
      // FESM+ES2015 flat module bundle.
      const fesm2015config = merge({}, baseConfig, {
        output: {
          format: 'es',
          file: path.join(process.cwd(), config.dist.outDir, 'fesm2015', `${packageJson.name}.js`)
        },

        plugins: [
          rollupStyleBuildPlugin(config, packageJson, false, true, false),
          ...preBundlePlugins(config),
          buildPlugin('es2015', false, false, config),
          ...postBundlePlugins()
        ],
        external: config.esmExternals
      });

      await bundleBuild(fesm2015config, 'FESM2015');
    }
  } catch (e) {
    console.log(chalk.red('[build:bundle] failure'));
    console.error(e);
    return null;
  }
});

gulp.task('build', gulp.series('build:clean', 'build:copy:essentials', 'build:bundle'));
