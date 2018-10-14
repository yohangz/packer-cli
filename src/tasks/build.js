import gulp from "gulp";
import path from "path";
import chalk from "chalk";
import gulpFile from "gulp-file";
import merge from "lodash/merge";
import {uglify} from "rollup-plugin-uglify";

import {readConfig, readPackageData} from "./meta";
import {
  buildPlugin,
  bundleBuild,
  getBanner,
  getBaseConfig,
  postBundlePlugins,
  preBundlePlugins,
  resolvePlugins,
  rollupStyleBuildPlugin
} from "./build-util";


gulp.task('build:copy:essentials', () => {
  const packageJson = readPackageData();
  const config = readConfig();

  let fieldsToCopy = ['name', 'version', 'description', 'keywords', 'author', 'repository', 'license', 'bugs', 'homepage'];

  let targetPackage = {
    main: path.join('bundles', `${packageJson.name}.${config.bundle.format}.js`),
    peerDependencies: {}
  };

  if (config.cliProject) {
    targetPackage.bin = packageJson.bin;
  }

  if (config.typescript) {
    targetPackage.typings = 'index.d.ts';
  }

  if (config.dist.generateFESM5) {
    targetPackage.module = path.join('fesm5',`${packageJson.name}.js`);
    targetPackage.fesm5 = path.join('fesm5',`${packageJson.name}.js`);
  }

  if (config.dist.generateFESM2015) {
    targetPackage.es2015 = path.join('fesm2015',`${packageJson.name}.js`);
    targetPackage.fesm2015 = path.join('fesm2015',`${packageJson.name}.js`);
  }

  //only copy needed properties from project's package json
  fieldsToCopy.forEach((field) => targetPackage[field] = packageJson[field]);

  // defines project's dependencies as 'peerDependencies' for final users
  Object.keys(packageJson.dependencies).forEach((dependency) => {
    targetPackage.peerDependencies[dependency] = `^${packageJson.dependencies[dependency].replace(/[\^~><=]/, '')}`;
  });

  // copy the needed additional files in the 'dist' folder
  return gulp.src((config.copy || []).map((copyFile) => {
    return path.join(process.cwd(), copyFile);
  }), {
    allowEmpty: true
  })
    .pipe(gulpFile('package.json', JSON.stringify(targetPackage, null, 2)).on('error', (error) => {
      console.log(chalk.red(`${type} bundle build Failure`));
      console.error(error);
    }))
    .pipe(gulp.dest(path.join(process.cwd(), config.dist.outDir)));
});

gulp.task('build:bundle', async () => {
  const config = readConfig();
  const packageJson = readPackageData();
  const banner = getBanner(config, packageJson);
  const baseConfig = getBaseConfig(config, packageJson, banner);

  try {
    // flat bundle.
    const flatConfig = merge({}, baseConfig, {
      output: {
        name: config.namespace,
        format: config.bundle.format,
        file: path.join(process.cwd(), config.dist.outDir, 'bundles', `${packageJson.name}.${config.bundle.format}.js`),
        globals: config.flatGlobals,
        amd: config.bundle.amd
      },
      external: Object.keys(config.flatGlobals),
      plugins: [
        rollupStyleBuildPlugin(config, packageJson, false, false, true),
        ...preBundlePlugins(config),
        ...resolvePlugins(config),
        buildPlugin('es5', true, false, config),
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
          file: path.join(process.cwd(), config.dist.outDir, 'bundles', `${packageJson.name}.${config.bundle.format}.min.js`),
          globals: config.flatGlobals,
          amd: config.bundle.amd
        },
        external: Object.keys(config.flatGlobals),
        plugins: [
          rollupStyleBuildPlugin(config, packageJson, false, true, true),
          ...preBundlePlugins(config),
          ...resolvePlugins(config),
          buildPlugin('es5', false, false, config),
          uglify({
            output: {
              comments: function(node, comment) {
                if (comment.type === "comment2") {
                  // multiline comment
                  return /@preserve|@license/i.test(comment.value);
                }
                return false;
              }
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
          file: path.join(process.cwd(), config.dist.outDir, 'fesm5', `${packageJson.name}.js`),
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
          file: path.join(process.cwd(), config.dist.outDir, 'fesm2015', `${packageJson.name}.js`),
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
