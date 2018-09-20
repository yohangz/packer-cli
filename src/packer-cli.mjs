import gulp from 'gulp';
import gulpFile from 'gulp-file';
import clean from 'gulp-clean';

import { rollup, watch } from 'rollup';
import rollupTypescript from 'rollup-plugin-typescript2';
import rollupResolve from 'rollup-plugin-node-resolve';
import rollupCommonjs from 'rollup-plugin-commonjs';
import rollupReplace from 'rollup-plugin-re'
import rollupIgnore from 'rollup-plugin-ignore';
import { uglify } from 'rollup-plugin-uglify';
import rollupTsLint from 'rollup-plugin-tslint';
import rollupSass from 'rollup-plugin-sass';
import rollupSassLint from 'rollup-plugin-sass-lint';
import rollupLivereload from 'rollup-plugin-livereload';
import rollupServe from 'rollup-plugin-serve';
import rollupImage from 'rollup-plugin-img';
import rollupHandlebars from 'rollup-plugin-hbs';
import rollupFilesize from 'rollup-plugin-filesize';
import rollupProgress from 'rollup-plugin-progress';
import rollupIgnoreImport from 'rollup-plugin-ignore-import';
import rollupBabel from 'rollup-plugin-babel';

import { Server } from 'karma';

import inquirer from 'inquirer';
import npmValidate from 'validate-npm-package-name';

import postCss from 'postcss';
import postCssAutoPrefix from 'autoprefixer';
import postCssImageInline from 'postcss-image-inliner';

import typescript from 'typescript';
import merge from 'lodash/merge';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';

const args = process.argv.splice(2);

const configResource = require('../resources/dynamic/config.json');
const packageResource = require('../resources/dynamic/package.json');

// Build utils

const readConfig = () => {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'config.json'), 'utf8'));
};

const readPackageData = () => {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
};

const readCLIPackageData = () => {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
};

const getBaseConfig = (config, packageJson) => {
 return {
   input: `${config.source}/${config.entry}`,
   output: {
     name: packageJson.name,
     sourcemap: true
   }
 };
};

const makeDir = (name) => {
  if (!fs.existsSync(name)){
    fs.mkdirSync(name);
  }
};

const rollupStyleBuildPlugin = (watch, config) => {
  return rollupSass({
    output: config.bundleStyle || function (styles, styleNodes) {
      const styleDist = `${watch? config.watch.script: config.out}/style`;
      makeDir(styleDist);

      styleNodes.reduce((acc, node) => {
        const baseName = path.basename(node.id);
        const currentNode = acc.find(accNode => accNode.name === baseName);
        if (currentNode) {
          currentNode.styles += node.content;
        } else {
          acc.push({
            name: baseName,
            styles: node.content
          });
        }

        return acc;
      }, []).forEach((node) => {
        fs.writeFileSync(`${process.cwd()}/${styleDist}/${node.name.slice(0, -4)}css`, node.styles);
      });
    },
    insert: config.bundleStyle,
    processor: (css) => {
      return postCss([
        postCssImageInline({
          maxFileSize: config.imageInlineLimit,
          assetPaths: config.assetPaths
        }),
        postCssAutoPrefix,
      ])
        .process(css, { from: undefined })
        .then(result => result.css)
    }
  })
};

const rollupReplacePlugin = (config) => {
  return rollupReplace({
    patterns: config.pathReplacePatterns
  });
};

const resolvePlugins = (config) => {
  return [
    rollupIgnore(config.ignore),
    rollupResolve({
      jsnext: true,
      main: true,
      browser: true,
      preferBuiltins: false
    }),
    rollupCommonjs({
      include: 'node_modules/**'
    })
  ];
};

const buildPlugin = (esVersion, generateDefinition, watch, config) => {
  if (config.tsProject) {
    let buildConf = {
      tsconfig: `tsconfig.${esVersion}.json`,
      typescript: typescript,
      check: !watch
    };

    if (generateDefinition) {
      buildConf.tsconfigOverride  = {
        compilerOptions: {
          declaration: true,
          declarationDir: `${process.cwd()}/${config.out}`
        }
      };

      buildConf.useTsconfigDeclarationDir = true;
    }

    return rollupTypescript(buildConf);
  }

  return rollupBabel({
    babelrc: false,
    exclude: 'node_modules/**',
    presets: [
      [
        '@babel/preset-env',
        {
          'targets': {
            'esmodules': esVersion === 'es2015'
          }
        }
      ]
    ]
  });
};

const lintPlugins = (config) => {
  return [
    rollupTsLint({
      include: [`${config.source}/**/*.ts`]
    }),
    rollupSassLint({
      include: 'src/**/*.scss',
    })
  ];
};

const preBundlePlugins = (config) => {
  return [
    rollupReplacePlugin(config),
    rollupHandlebars(),
    rollupImage({
      extensions: /\.(png|jpg|jpeg|gif|svg)$/,
      limit: config.imageInlineLimit,
      exclude: 'node_modules/**'
    })
  ];
};

const postBundlePlugins = () => {
  return [
    rollupProgress(),
    rollupFilesize({
      render : function (options, size, gzippedSize){
        return chalk.yellow(`Bundle size: ${chalk.red(size)}, Gzipped size: ${chalk.red(gzippedSize)}`);
      }
    })
  ];
};

const ignoreImportPlugin = rollupIgnoreImport({
  extensions: ['.scss']
});

const bundleBuild = async (config, type) => {
  try {
    console.log(chalk.blue(`${type} bundle build start`));
    const bundle = await rollup(config);
    await bundle.write(config.output);
    console.log(chalk.blue(`${type} bundle build end`));
  } catch (error) {
    console.log(chalk.red(`${type} bundle build Failure`));
    console.log(error);
    throw error;
  }
};

// Clean tasks

gulp.task('build:clean', () => {
  const config = readConfig();
  return gulp.src([`${process.cwd()}/.rpt2_cache`, `${process.cwd()}/${config.out}`], {
      read: false,
      allowEmpty: true
    })
    .pipe(clean());
});

gulp.task('watch:clean', () => {
  const config = readConfig();
  return gulp.src([`${process.cwd()}/.rpt2_cache`, `${process.cwd()}/${config.watch.script}`], {
    read: false,
    allowEmpty: true
  })
    .pipe(clean());
});

// Base build tasks

gulp.task('build:copy:essentials', () => {
  const packageJson = readPackageData();
  const config = readConfig();

  let fieldsToCopy = ['name', 'version', 'description', 'keywords', 'author', 'repository', 'license', 'bugs', 'homepage'];

  let targetPackage = {
    main: `bundles/${packageJson.name}.${config.bundleFormat}.js`,
    module: `fesm5/${packageJson.name}.js`,
    es2015: `fesm2015/${packageJson.name}.js`,
    fesm5: `fesm5/${packageJson.name}.js`,
    fesm2015: `fesm2015/${packageJson.name}.js`,
    typings: 'index.d.ts',
    peerDependencies: {}
  };

  //only copy needed properties from project's package json
  fieldsToCopy.forEach((field) => targetPackage[field] = packageJson[field]);

  // defines project's dependencies as 'peerDependencies' for final users
  Object.keys(packageJson.dependencies).forEach((dependency) => {
    targetPackage.peerDependencies[dependency] = `^${packageJson.dependencies[dependency].replace(/[\^~><=]/, '')}`;
  });

  // copy the needed additional files in the 'dist' folder
  return gulp.src((config.copy || []).map((copyFile) => {
      return `${process.cwd()}/${copyFile}`
    }))
    .pipe(gulpFile('package.json', JSON.stringify(targetPackage, null, 2)).on('error', (error) => {
      console.log(chalk.red(`${type} bundle build Failure`));
      console.error(error);
    }))
    .pipe(gulp.dest(`${process.cwd()}/${config.out}`));
});

gulp.task('build:bundle', async () => {
  const config = readConfig();
  const packageJson = readPackageData();
  const baseConfig = getBaseConfig(config, packageJson);

  // flat bundle.
  const flatConfig = merge({}, baseConfig, {
    output: {
      name: config.namespace,
      format: config.bundleFormat,
      file: path.join(process.cwd(), config.out, 'bundles', `${packageJson.name}.${config.bundleFormat}.js`),
      globals: config.flatGlobals
    },
    external: Object.keys(config.flatGlobals),
    plugins: [
      ...lintPlugins(config),
      rollupStyleBuildPlugin(false, config),
      ...preBundlePlugins(config),
      ...resolvePlugins(config),
      buildPlugin('es5', true, false, config),
      ...postBundlePlugins()
    ]
  });

  // minified flat bundle.
  const minifiedFlatConfig = merge({}, baseConfig, {
    output: {
      name: config.namespace,
      format: config.bundleFormat,
      file: path.join(process.cwd(), config.out, 'bundles', `${packageJson.name}.${config.bundleFormat}.min.js`),
      globals: config.flatGlobals
    },
    external: Object.keys(config.flatGlobals),
    plugins: [
      ignoreImportPlugin,
      ...preBundlePlugins(config),
      ...resolvePlugins(config),
      buildPlugin('es5', false, false, config),
      uglify(),
      ...postBundlePlugins()
    ]
  });

  // FESM+ES5 flat module bundle.
  const fesm5config = merge({}, baseConfig, {
    output: {
      format: 'es',
      file: path.join(process.cwd(), config.out, 'fesm5', `${packageJson.name}.es5.js`),
    },
    plugins: [
      ignoreImportPlugin,
      ...preBundlePlugins(config),
      buildPlugin('es5', false, false, config),
      ...postBundlePlugins()
    ],
    external: config.esmExternals
  });

  // FESM+ES2015 flat module bundle.
  const fesm2015config = merge({}, baseConfig, {
    output: {
      format: 'es',
      file: path.join(process.cwd(), config.out, 'fesm2015', `${packageJson.name}.js`),
    },

    plugins: [
      ignoreImportPlugin,
      ...preBundlePlugins(config),
      buildPlugin('es2015', false, false, config),
      ...postBundlePlugins()
    ],
    external: config.esmExternals
  });

  try {
    await bundleBuild(flatConfig, 'FLAT');
    await bundleBuild(minifiedFlatConfig, 'FLAT MIN');
    await bundleBuild(fesm5config, 'FESM5');
    await bundleBuild(fesm2015config, 'FESM2015');
  } catch(error) {
    return null;
  }
});

gulp.task('build', gulp.series('build:clean', 'build:copy:essentials', 'build:bundle'));

// Watch tasks

gulp.task('build:watch', async () => {
  const config = readConfig();
  const packageJson = readPackageData();
  const baseConfig = getBaseConfig(config, packageJson);

  makeDir(config.watch.script);

  const watchConfig = merge({}, baseConfig, {
    output: {
      name: config.namespace,
      format: config.bundleFormat,
      file: path.join(process.cwd(), config.watch.script, `${packageJson.name}.${config.bundleFormat}.js`),
      globals: config.flatGlobals
    },
    external: Object.keys(config.flatGlobals),
    plugins: [
      ...lintPlugins(config),
      rollupStyleBuildPlugin(true, config),
      ...preBundlePlugins(config),
      ...resolvePlugins(config),
      buildPlugin('es5', false, true, config),
      rollupServe({
        contentBase: [`${process.cwd()}/${config.watch.script}`, `${process.cwd()}/${config.watch.demo}`],
        port: config.watch.port,
        open: config.watch.open,
      }),
      rollupLivereload({
        watch: [`${process.cwd()}/${config.watch.script}`, `${process.cwd()}/${config.watch.demo}`]
      }),
      rollupProgress()
    ],
    watch: {
      exclude: ['node_modules/**']
    }
  });

  try {
    const watcher = await watch(watchConfig);
    watcher.on('event', event => {
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
  } catch(error) {
    console.log(chalk.blue('[WATCH] ') + chalk.red('watch task failure'));
  }
});

gulp.task('watch', gulp.series('watch:clean', 'build:watch'));

gulp.task('test', async (done) => {
  const server = new Server({
    configFile: `${process.cwd()}/karma.conf.js`,
    port: 9876
  }, (exitCode) => {
    console.log(chalk.blue(`Karma has exited with ${exitCode}`));
    process.exit(exitCode);
    done();
  });

  server.start()
});

gulp.task('generate', (done) => {
  const cliPackageData = readCLIPackageData();

  const questions = [
    {
      type: 'input',
      name: 'name',
      message: 'What would you name your library?',
      validate: (value) => {
        const state = npmValidate(value);
        return state.validForNewPackages || state.errors.join('\n');
      }
    },
    {
      type: 'input',
      name: 'description',
      message: 'Give us a small description about the library?'
    },
    {
      type: 'input',
      name: 'username',
      message: 'What is your git account username?'
    },
    {
      type: 'input',
      name: 'email',
      message: 'What is your git account email?'
    },
    {
      type: 'confirm',
      message: 'Do you want to use typescript?',
      name: 'tsProject'
    },
    {
      type: 'confirm',
      message: 'Do you want to inline bundle CSS styles in script?',
      name: 'bundleStyles'
    },
    {
      type: 'list',
      message: 'What\'s the build bundle format you want to use?',
      name: 'bundleFormat',
      choices: [
        'umd',
        'amd',
        'iife',
        'system',
        'esm',
        'cjs'
      ]
    },
    {
      type: 'input',
      name: 'namespace',
      message: 'What\'s the library namespace you want to use?',
      when: (answers) => {
        return answers.bundleFormat === 'umd' || answers.bundleFormat === 'iife' || answers.bundleFormat === 'system';
      },
      validate: (value) => {
        const matches = value.match(/^[a-zA-Z\.]+$/);
        return !!matches || 'Namespace should be an object path, i.e: \'ys.nml.lib\'';
      }
    }
  ];

  inquirer.prompt(questions).then(answers => {
    let packageConfig = configResource;
    packageConfig.bundleStyle = answers.bundleStyles;
    packageConfig.bundleFormat = answers.bundleFormat;
    packageConfig.tsProject = answers.tsProject;
    packageConfig.namespace = answers.namespace;

    let packageJson = packageResource;
    packageJson.name = answers.name;
    packageJson.description = answers.description;
    packageJson.devDependencies[cliPackageData.name] = `^${cliPackageData.version}`;

    if (answers.username && answers.email) {
      packageJson.author = `${answers.username} <${answers.email}>`;
      packageJson.repository = `https://github.com/${answers.username}/${answers.name}.git`;
    }

    gulp.src([ path.join(__dirname, '../resources/static/{.**,**}') ])
      .pipe(gulpFile('config.json', JSON.stringify(packageConfig, null, 2)))
      .pipe(gulpFile('package.json', JSON.stringify(packageJson, null, 2)))
      .pipe(gulp.dest(`${process.cwd()}/${answers.name}`))
      .on('end', () => {
        done()
      });
  });
});

switch (args[0]) {
  case 'new':
    gulp.series('generate')();
    break;
  case 'build':
    gulp.series('build')();
    break;
  case 'watch':
    gulp.series('watch')();
    break;
  case 'test':
    gulp.series('test')();
    break;
  case 'clean':
    gulp.series('build:clean', 'watch:clean')();
    break;
  default:
    gulp.series('build')();
    break;
}
