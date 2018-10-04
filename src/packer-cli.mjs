import gulp from 'gulp';
import gulpFile from 'gulp-file';
import clean from 'gulp-clean';
import gulpFilter from 'gulp-filter';

import {rollup, watch} from 'rollup';
import rollupTypescript from 'rollup-plugin-typescript2';
import rollupResolve from 'rollup-plugin-node-resolve';
import rollupCommonjs from 'rollup-plugin-commonjs';
import rollupReplace from 'rollup-plugin-re'
import rollupIgnore from 'rollup-plugin-ignore';
import {uglify} from 'rollup-plugin-uglify';
import rollupLivereload from 'rollup-plugin-livereload';
import rollupServe from 'rollup-plugin-serve';
import rollupImage from 'rollup-plugin-img';
import rollupHandlebars from 'rollup-plugin-hbs';
import rollupFilesize from 'rollup-plugin-filesize';
import rollupProgress from 'rollup-plugin-progress';
import rollupIgnoreImport from 'rollup-plugin-ignore-import';
import rollupBabel from 'rollup-plugin-babel';
import rollupPostCss from 'rollup-plugin-postcss';

import {Server} from 'karma';

import inquirer from 'inquirer';
import npmValidate from 'validate-npm-package-name';
import isUrl from 'validator/lib/isURL';
import isEmail from 'validator/lib/isEmail';

import postCssAutoPrefix from 'autoprefixer';
import postCssImageInline from 'postcss-image-inliner';

import typescript from 'typescript';
import merge from 'lodash/merge';
import path from 'path';
import fs from 'fs';
import {spawn} from 'child_process';
import chalk from 'chalk';

const args = process.argv.splice(2);

const configResource = require('../resources/dynamic/.packerrc.json');
const packageResource = require('../resources/dynamic/package.json');

const isWindows = process.platform === 'win32';

// Build utils

const readConfig = () => {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), '.packerrc.json'), 'utf8'));
};

const readPackageData = () => {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
};

const readCLIPackageData = () => {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
};


const runShellCommand = (command, args, dir) => {
  const cmd = isWindows ? `${command}.cmd` : command;
  const options = {
    detached: true,
    stdio: 'inherit',
    cwd: dir
  };

  return new Promise((resolve) => {
    const childProcess = spawn(cmd, [args], options);
    childProcess.on('close', () => {
      resolve();
    });
  });
};

const parseLicense = (license) => {
  let licenseFileName = '';

  switch (license) {
    case 'MIT License':
      licenseFileName = 'MIT';
      break;
    case 'Apache 2 License':
      licenseFileName = 'Apache-2.0';
      break;
    case 'Mozilla Public License 2.0':
      licenseFileName = 'MPL-2.0';
      break;
    case 'BSD 2-Clause (FreeBSD) License':
      licenseFileName = 'BSD-2-Clause-FreeBSD';
      break;
    case 'BSD 3-Clause (NewBSD) License':
      licenseFileName = 'BSD-3-Clause';
      break;
    case 'Internet Systems Consortium (ISC) License':
      licenseFileName = 'ISC';
      break;
    case 'GNU LGPL 3.0 License':
      licenseFileName = 'LGPL-3.0';
      break;
    case 'GNU GPL 3.0 License':
      licenseFileName = 'GPL-3.0';
      break;
    case 'Unlicense':
      licenseFileName = 'unlicense';
      break;
    case 'No License':
      licenseFileName = 'UNLICENSED';
      break;
  }

  return licenseFileName;
};

const getLicenseFile = (license, year, author) => {
  let licenseContent = fs.readFileSync(path.join(__dirname, '../resources/license', `${license}.tmpl`), 'utf8');

  if (year) {
    licenseContent = licenseContent.replace(/\<\%\- year \%\>/g, year);
  }

  if (author) {
    licenseContent = licenseContent.replace(/\<\%\- author \%\>/g, author);
  }

  return licenseContent;
};

const getBuildDemoFile = (projectName, namespace) => {
  let buildDemo = fs.readFileSync(path.join(__dirname, '../resources/dynamic/demo/build', `index.html`), 'utf8');

  buildDemo = buildDemo.replace(/\<\%\- projectName \%\>/g, projectName);
  buildDemo = buildDemo.replace(/\<\%\- namespace \%\>/g, namespace);

  return buildDemo;
};

const getWatchDemoFile = (projectName, namespace) => {
  let watchDemo = fs.readFileSync(path.join(__dirname, '../resources/dynamic/demo/watch', `index.html`), 'utf8');

  watchDemo = watchDemo.replace(/\<\%\- projectName \%\>/g, projectName);
  watchDemo = watchDemo.replace(/\<\%\- namespace \%\>/g, namespace);

  return watchDemo;
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
  if (!fs.existsSync(name)) {
    fs.mkdirSync(name);
  }
};

const rollupStyleBuildPlugin = (config, packageJson, watch, minify) => {
  return rollupPostCss({
    plugins: [
      postCssImageInline({
        maxFileSize: config.imageInlineLimit,
        assetPaths: config.assetPaths
      }),
      postCssAutoPrefix
    ],
    sourceMap: true,
    minimize: minify,
    extract: path.join(process.cwd(), watch ? config.watch.script : config.dist.out, config.dist.styles, packageJson.name + (minify ? '.min.css' : '.css'))
  });
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
      buildConf.tsconfigOverride = {
        compilerOptions: {
          declaration: true,
          declarationDir: `${process.cwd()}/${config.dist.out}`
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
      render: function (options, size, gzippedSize) {
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
  return gulp.src([`${process.cwd()}/.rpt2_cache`, `${process.cwd()}/${config.dist.out}`], {
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

// Lint tasks

gulp.task('lint:style', (done) => {
  console.log(chalk.blue('[Style Lint]'));
  const config = readConfig();
  runShellCommand('stylelint', [path.join(config.source, '**/*.{styl,scss,sass,less,css}')], process.cwd()).then(() => {
    done();
  });
});

gulp.task('lint:script:ts', (done) => {
  const config = readConfig();

  if (config.tsProject) {
    console.log(chalk.blue('[TS Lint]'));
    runShellCommand('tslint', [path.join(config.source, '**/*.{ts,tsx}')], process.cwd()).then(() => {
      done();
    });
  }
});

gulp.task('lint:script:es', (done) => {
  const config = readConfig();

  if (!config.tsProject) {
    console.log(chalk.blue('[ES Lint]'));
    runShellCommand('eslint', [path.join(config.source, '**/*.{js,mjs}')], process.cwd()).then(() => {
      done();
    });
  }
});

gulp.task('lint:script', gulp.series('lint:script:ts', 'lint:script:es'));

gulp.task('lint', gulp.series('lint:style', 'lint:script:ts', 'lint:script:es'));

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
    .pipe(gulp.dest(path.join(process.cwd(), config.dist.out)));
});

gulp.task('build:bundle', async () => {
  const config = readConfig();
  const packageJson = readPackageData();
  const baseConfig = getBaseConfig(config, packageJson);

  try {
    // flat bundle.
    const flatConfig = merge({}, baseConfig, {
      output: {
        name: config.namespace,
        format: config.bundleFormat,
        file: path.join(process.cwd(), config.dist.out, 'bundles', `${packageJson.name}.${config.bundleFormat}.js`),
        globals: config.flatGlobals
      },
      external: Object.keys(config.flatGlobals),
      plugins: [
        rollupStyleBuildPlugin(config, packageJson, false, false),
        ignoreImportPlugin,
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
        file: path.join(process.cwd(), config.dist.out, 'bundles', `${packageJson.name}.${config.bundleFormat}.min.js`),
        globals: config.flatGlobals
      },
      external: Object.keys(config.flatGlobals),
      plugins: [
        rollupStyleBuildPlugin(config, packageJson, false, true),
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
        file: path.join(process.cwd(), config.dist.out, 'fesm5', `${packageJson.name}.es5.js`),
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
        file: path.join(process.cwd(), config.dist.out, 'fesm2015', `${packageJson.name}.js`),
      },

      plugins: [
        ignoreImportPlugin,
        ...preBundlePlugins(config),
        buildPlugin('es2015', false, false, config),
        ...postBundlePlugins()
      ],
      external: config.esmExternals
    });

    await bundleBuild(flatConfig, 'FLAT');
    await bundleBuild(minifiedFlatConfig, 'FLAT MIN');
    await bundleBuild(fesm5config, 'FESM5');
    await bundleBuild(fesm2015config, 'FESM2015');
  } catch (e) {
    console.log(chalk.red('[build:bundle] failure'));
    console.error(e);
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

  let rollupServePlugins = [];
  if (config.watch.serve) {
    rollupServePlugins = [
      rollupServe({
        contentBase: [`${process.cwd()}/${config.watch.script}`, `${process.cwd()}/${config.watch.demo}`],
        port: config.watch.port,
        open: config.watch.open,
      }),
      rollupLivereload({
        watch: [`${process.cwd()}/${config.watch.script}`, `${process.cwd()}/${config.watch.demo}`]
      })
    ]
  }

  const watchConfig = merge({}, baseConfig, {
    output: {
      name: config.namespace,
      format: config.bundleFormat,
      file: path.join(process.cwd(), config.watch.script, `${packageJson.name}.${config.bundleFormat}.js`),
      globals: config.flatGlobals
    },
    external: Object.keys(config.flatGlobals),
    plugins: [
      rollupStyleBuildPlugin(config, packageJson, true, false),
      ignoreImportPlugin,
      ...preBundlePlugins(config),
      ...resolvePlugins(config),
      buildPlugin('es5', false, true, config),
      ...rollupServePlugins,
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
  } catch (error) {
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
      name: 'description',
      message: 'Give us a small description about the library (optional)?'
    },
    {
      type: 'input',
      name: 'author',
      message: 'Author\'s name (optional)?'
    },
    {
      type: 'input',
      name: 'email',
      message: 'Author\'s email address (optional)?',
      validate: (value) => {
        return !value || isEmail(value) ? true : 'Value must be a valid email address';
      }
    },
    {
      type: 'input',
      name: 'website',
      message: 'Library homepage link (optional)?',
      validate: (value) => {
        return !value || isUrl(value) ? true : 'Value must be a valid URL';
      }
    },
    {
      type: 'confirm',
      message: 'Do you want to use typescript?',
      name: 'tsProject'
    },
    {
      type: 'list',
      message: 'What\'s the style pre processor you want to use?',
      name: 'stylePreprocessor',
      default: 0,
      choices: [
        'SCSS',
        'SASS',
        'LESS',
        'Stylus',
        'None',
      ]
    },
    {
      type: 'confirm',
      message: 'Do you want to inline bundle styles within script?',
      name: 'bundleStyles'
    },
    {
      type: 'list',
      message: 'What\'s the build bundle format you want to use?',
      name: 'bundleFormat',
      default: 0,
      choices: [
        'umd',
        'amd',
        'iife',
        'system',
        'esm',
        'cjs'
      ],
      validate: (value) => {
        return !!value || 'Bundle format is required';
      }
    },
    {
      type: 'confirm',
      message: 'Browser compliant module?',
      name: 'browseCompliant'
    },
    {
      type: 'list',
      message: 'Which test framework do you want to use?',
      name: 'testFramework',
      default: 0,
      choices: [
        'Jasmine',
        'Mocha'
      ],
      when: (answers) => {
        return !answers.browseCompliant;
      },
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
    },
    {
      type: 'input',
      name: 'year',
      message: 'What is the library copyright year (optional)?',
      default: (new Date()).getFullYear(),
    },
    {
      type: 'list',
      message: 'What\'s the license you want to use?',
      name: 'license',
      default: 0,
      choices: [
        'MIT License',
        'Apache 2 License',
        'Mozilla Public License 2.0',
        'BSD 2-Clause (FreeBSD) License',
        'BSD 3-Clause (NewBSD) License',
        'Internet Systems Consortium (ISC) License',
        'GNU LGPL 3.0 License',
        'GNU GPL 3.0 License',
        'Unlicense',
        'No License'
      ],
      validate: (value) => {
        return !!value || 'License is required';
      }
    },
    {
      type: 'confirm',
      message: 'Do you want to use yarn as package manager?',
      name: 'isYarn',
      default: false
    },
  ];

  if (args.length !== 2) {
    console.log('Please provide a library name to generate the project');
    console.log('npx packer-cli generate my-library');
    done();
    return;
  }

  const packageName = args[1];
  const packageNameValidity = npmValidate(packageName);
  if (!packageNameValidity.validForNewPackages) {
    console.log(state.errors.join('\n'));
    done();
    return;
  }

  inquirer.prompt(questions).then(options => {
    let packageConfig = configResource;
    packageConfig.bundleStyle = options.bundleStyles;
    packageConfig.bundleFormat = options.bundleFormat;
    packageConfig.tsProject = options.tsProject;
    packageConfig.namespace = options.namespace;

    let packageJson = packageResource;
    packageJson.name = packageName;
    packageJson.description = options.description;
    packageJson.devDependencies[cliPackageData.name] = `^${cliPackageData.version}`;
    packageJson.homepage = options.homepage;
    packageJson.license = parseLicense(options.license);

    if (options.author && options.email) {
      packageJson.author = `${options.author} <${options.email}>`;
      packageJson.repository = `https://github.com/${options.author}/${packageName}.git`;
    }

    const projectDir = path.join(process.cwd(), packageName);

    gulp.src([path.join(__dirname, '../resources/static/{.**,**}')])
      .pipe(gulpFile('.packerrc.json', JSON.stringify(packageConfig, null, 2)))
      .pipe(gulpFile('package.json', JSON.stringify(packageJson, null, 2)))
      .pipe(gulpFile('LICENSE', getLicenseFile(packageJson.license, options.year, options.author)))
      .pipe(gulp.dest(projectDir))
      .pipe(gulpFilter('*'))
      .pipe(gulpFile('index.html', getWatchDemoFile(packageName)))
      .pipe(gulp.dest(path.join(projectDir, 'demo/watch')))
      .pipe(gulpFilter('*'))
      .pipe(gulpFile('index.html', getBuildDemoFile(packageName)))
      .pipe(gulp.dest(path.join(projectDir, 'demo/build')))
      .on('end', () => {
        runShellCommand(options.isYarn ? 'yarn' : 'npm', ['install'], projectDir).then(() => {
          done();
        })
      });
  });
});

switch (args[0]) {
  case 'generate':
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
  case 'lint': {
    if (args.length > 1) {
      switch (args[1]) {
        case '--style':
          gulp.series('lint:style')();
          break;
        case '--script':
          gulp.series('lint:script')();
          break;
        default:
          console.log(chalk.red('Invalid lint task argument'));
      }
    } else {
      gulp.series('lint')();
    }

    break;
  }
  default:
    console.log(chalk.red('Invalid task name argument'));
    break;
}
