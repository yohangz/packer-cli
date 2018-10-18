import gulp from 'gulp';
import isEmail from 'validator/lib/isEmail';
import isUrl from 'validator/lib/isURL';
import npmValidate from 'validate-npm-package-name';
import inquirer from 'inquirer';
import path from 'path';
import gulpFilter from 'gulp-filter';
import gulpFile from 'gulp-file';
import mergeStream from 'merge-stream';

import gulpHbsRuntime from '../plugins/gulp-hbs-runtime';
import { runShellCommand, args } from './util';
import { parseLicenseType, parseStylePreprocessorExtension } from './parser';
import { readCLIPackageData } from './meta';

const getPackerConfig = (options) => {
  const entry = 'index' + (options.typescript ? '.ts' : '.js');

  let bundleFormat = '';
  if (options.browserCompliant) {
    bundleFormat = String(options.bundleFormat || 'umd').toLowerCase();
  } else {
    bundleFormat = 'cjs';
  }

  let dependencyMapMode = 'crossMapPeerDependency';
  if (options.cliProject) {
    dependencyMapMode = 'mapDependency';
  }

  return {
    namespace: options.namespace,
    entry: entry,
    source: 'src',
    dist: {
      outDir: 'dist',
      stylesDir: 'styles',
      generateFESM5: true,
      generateFESM2015: true,
      generateMin: true
    },
    typescript: Boolean(options.typescript),
    stylePreprocessor: (options.stylePreprocessor || 'scss').toLowerCase(),
    cliProject: Boolean(options.cliProject),
    styleSupport: Boolean(options.styleSupport),
    browserCompliant: Boolean(options.browserCompliant),
    watch: {
      scriptDir: '.tmp',
      helperDir: 'demo/helper',
      demoDir: 'demo/watch',
      serve: true,
      port: 4000,
      open: true
    },
    copy: [
      'README.md',
      'LICENSE'
    ],
    flatGlobals: {},
    esmExternals: [
      'handlebars/runtime'
    ],
    pathReplacePatterns: [
      {
        test: './config/base-config',
        replace: './config/replace-config'
      }
    ],
    ignore: [],
    assetPaths: [
      'src/assets'
    ],
    testFramework: (options.testFramework || 'jasmine').toLowerCase(),
    bundle: {
      amd: {
        define: '',
        id: (options.amdId || '')
      },
      format: bundleFormat,
      imageInlineLimit: 1000000,
      inlineStyle: Boolean(options.bundleStyles),
      dependencyMapMode: dependencyMapMode
    },
    license: {
      banner: true,
      thirdParty: {
        includePrivate: false,
        fileName: 'dependencies.txt'
      }
    }
  };
};

const getPackageConfig = (options, packageName) => {
  const cliPackageData = readCLIPackageData();

  let author = '';
  if (options.author && options.email) {
    author = `${options.author} <${options.email}>`;
  }

  let projectUrl = '';
  let repository = '';
  if (options.githubUsername) {
    projectUrl = `https://github.com/${options.githubUsername}/${packageName}`;
    repository = `${projectUrl}.git`;
  }

  let packageConfig = {
    name: packageName,
    version: '1.0.0',
    description: options.description || '',
    keywords: String(options.keywords || '').split(','),
    scripts: {
      'lint': 'packer lint',
      'lint:style': 'packer lint --style',
      'lint:script': 'packer lint --script',
      'build': 'packer build',
      'watch': 'packer watch',
      'test': 'packer test',
      'test:ci': 'CI=true packer test',
      'preversion': 'npm run build',
      'postversion': 'git push && git push --tags',
      'prerelease': 'npm run build',
      'release': 'npm publish dist'
    },
    author: author,
    repository: repository,
    license: parseLicenseType(options.license),
    homepage: options.homepage || projectUrl,
    dependencies: {
      'handlebars': '^4.0.11',
      'tslib': '^1.9.3'
    },
    devDependencies: {
      '@babel/polyfill': '^7.0.0',
      '@babel/preset-env': '^7.1.0',
      '@babel/register': '^7.0.0',
      '@babel/runtime': '^7.1.0',
      '@babel/plugin-transform-runtime': '^7.1.0',
      '@types/assert': '^1.4.0',
      '@types/jasmine': '^2.8.8',
      '@types/mocha': '^5.2.5',
      'typescript': '^3.1.1',
      'assert': '^1.4.1',
      'eslint': '>=5.0.0',
      'eslint-config-standard': '*',
      'eslint-plugin-import': '>=2.13.0',
      'eslint-plugin-node': '>=7.0.0',
      'eslint-plugin-promise': '>=4.0.0',
      'eslint-plugin-standard': '>=4.0.0',
      'jasmine-core': '^3.1.0',
      'karma': '^3.0.0',
      'karma-chrome-launcher': '^2.2.0',
      'karma-coverage': '^1.1.2',
      'karma-jasmine': '^1.1.2',
      'karma-jasmine-html-reporter': '^1.1.0',
      'karma-mocha': '^1.3.0',
      'mocha': '^5.2.0',
      'puppeteer': '^1.5.0',
      'stylelint-config-standard': '^18.2.0',
      'uglify-es': '^3.3.9',
      [cliPackageData.name]: `^${cliPackageData.version}`
    },
    private: false
  };

  if (options.cliProject) {
    packageConfig.bin = {
      [packageName]: path.join('bin', `${packageConfig.name}.js`)
    };
  }

  return packageConfig;
};

const styleCopy = (styleExt, projectDir) => {
  return gulp.src([
    path.join(__dirname, '../resources/dynamic/example/common/style', `**/*.${styleExt}`)
  ])
    .pipe(gulp.dest(path.join(projectDir, 'src/style')));
};

const templateCopy = (projectDir) => {
  return gulp.src([
    path.join(__dirname, '../resources/dynamic/example/common/templates/**/*')
  ])
    .pipe(gulp.dest(path.join(projectDir, 'src/templates')));
};

const assetCopy = (projectDir) => {
  return gulp.src([
    path.join(__dirname, '../resources/dynamic/example/common/assets/**/*')
  ])
    .pipe(gulp.dest(path.join(projectDir, 'src/assets')));
};

const sourceCopy = (packerConfig, styleExt, projectDir) => {
  const isJasmine = packerConfig.testFramework === 'jasmine';

  return gulp.src([
    path.join(__dirname, '../resources/dynamic/example', packerConfig.typescript ? 'ts' : 'js', '**/*')
  ])
    .pipe(gulpHbsRuntime({
      styleExt: styleExt,
      isJasmine: isJasmine,
      styleSupport: packerConfig.styleSupport,
      cliProject: packerConfig.cliProject
    }, {
      replaceExt: ''
    }))
    .pipe(gulp.dest(path.join(projectDir, 'src')));
};

const licenseCopy = (packerConfig, packageConfig, projectDir) => {
  return gulp.src([
    path.join(__dirname, '../resources/dynamic/license', `${packageConfig.license}.hbs`)
  ])
    .pipe(gulpHbsRuntime({
      year: packerConfig.year,
      author: packerConfig.author
    }, {
      rename: 'LICENSE'
    }))
    .pipe(gulp.dest(projectDir));
};

const readmeCopy = (packageConfig, projectDir) => {
  return gulp.src([
    path.join(__dirname, '../resources/dynamic/README.md.hbs')
  ])
    .pipe(gulpHbsRuntime({
      packageName: packageConfig.name,
      packageDescription: packageConfig.description
    }, {
      replaceExt: ''
    }))
    .pipe(gulp.dest(projectDir));
};

const demoHelperScriptCopy = (projectDir) => {
  return gulp.src([
    path.join(__dirname, '../resources/dynamic/demo/helper/**/*')
  ])
    .pipe(gulp.dest(path.join(projectDir, 'demo/helper')));
};

const demoCopy = (packerConfig, packageName, projectDir) => {
  const isAmd = packerConfig.bundle.format === 'amd';
  const isIife = packerConfig.bundle.format === 'umd' || packerConfig.bundle.format === 'iife';
  const isSystem = packerConfig.bundle.format === 'system';

  return gulp.src([
    path.join(__dirname, '../resources/dynamic/demo/**/*.hbs')
  ])
    .pipe(gulpFilter('**/*' + (packerConfig.browserCompliant ? '.html.hbs' : '.js.hbs')))
    .pipe(gulpHbsRuntime({
      projectName: packageName,
      inlineStyle: packerConfig.bundle.inlineStyle,
      namespace: packerConfig.namespace,
      watchDir: packerConfig.watch.scriptDir,
      distDir: packerConfig.dist.outDir,
      require: isAmd,
      iife: isIife,
      system: isSystem,
      amdModule: packerConfig.bundle.amd.id
    }, {
      replaceExt: ''
    }))
    .pipe(gulp.dest(path.join(projectDir, 'demo')));
};

const configCopy = (packageConfig, packerConfig, projectDir) => {
  return gulp.src([
    path.join(__dirname, '../resources/static/**/{.*,*}')
  ])
    .pipe(gulpFile('.packerrc.json', JSON.stringify(packerConfig, null, 2)))
    .pipe(gulpFile('package.json', JSON.stringify(packageConfig, null, 2)))
    .on('end', () => {
      runShellCommand(packerConfig.isYarn ? 'yarn' : 'npm', ['install'], projectDir).then(() => {
        console.log('--done--');
      });
    })
    .pipe(gulp.dest(projectDir));
};

gulp.task('generate', (done) => {
  try {
    const questions = [
      {
        type: 'input',
        name: 'description',
        message: 'Give us a small description about the library (optional)?'
      },
      {
        type: 'input',
        name: 'keywords',
        message: 'Give us a set of comma separated package keywords (optional)?'
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
        name: 'githubUsername',
        message: 'Author\'s github username (optional)?',
        validate: (value) => {
          return true; // todo: add GH username validation here
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
        name: 'typescript',
        default: true
      },
      {
        type: 'confirm',
        message: 'Do you want style sheet support?',
        name: 'styleSupport',
        default: true
      },
      {
        type: 'list',
        message: 'What\'s the style pre processor you want to use?',
        name: 'stylePreprocessor',
        default: 0,
        choices: [
          'scss',
          'sass',
          'less',
          'stylus',
          'none'
        ],
        when: (answers) => {
          return answers.styleSupport;
        }
      },
      {
        type: 'confirm',
        message: 'Do you want to inline bundle styles within script?',
        name: 'bundleStyles',
        default: false,
        when: (answers) => {
          return answers.styleSupport;
        }
      },
      {
        type: 'confirm',
        message: 'Are you building a browser compliant library?',
        name: 'browserCompliant',
        default: true
      },
      {
        type: 'confirm',
        message: 'Are you building a node CLI project?',
        name: 'cliProject',
        default: false,
        when: (answers) => {
          return !answers.browserCompliant;
        }
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
          'system'
        ],
        when: (answers) => {
          return answers.browserCompliant;
        },
        validate: (value) => {
          return !!value || 'Bundle format is required';
        }
      },
      {
        type: 'input',
        name: 'amdId',
        message: 'What\'s the AMD id you want to use? (optional)',
        when: (answers) => {
          return answers.bundleFormat === 'umd' || answers.bundleFormat === 'amd';
        },
        validate: (value) => {
          const matches = value.match(/^(?:[a-z]\d*(?:-[a-z])?)*$/i);
          return value === '' || !!matches || 'AMD id should only contain alphabetic characters, i.e: \'my-bundle\'';
        }
      },
      {
        type: 'input',
        name: 'namespace',
        message: 'What\'s the library namespace you want to use?',
        when: (answers) => {
          return answers.bundleFormat === 'umd' || answers.bundleFormat === 'iife' || answers.bundleFormat === 'system';
        },
        validate: (value) => {
          const matches = value.match(/^(?:[a-z]\d*(?:\.[a-z])?)+$/i);
          return !!matches || 'Namespace should be an object path, i.e: \'ys.nml.lib\'';
        }
      },
      {
        type: 'list',
        message: 'Which unit test framework do you want to use?',
        name: 'testFramework',
        default: 0,
        choices: [
          'Jasmine',
          'Mocha'
        ]
      },
      {
        type: 'input',
        name: 'year',
        message: 'What is the library copyright year (optional)?',
        default: (new Date()).getFullYear()
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
      }
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
      console.log(packageNameValidity.errors.join('\n'));
      done();
      return;
    }

    inquirer.prompt(questions).then(options => {
      const packerConfig = getPackerConfig(options);
      const packageConfig = getPackageConfig(options, packageName);
      const projectDir = path.join(process.cwd(), packageName);
      const styleExt = parseStylePreprocessorExtension(packerConfig.stylePreprocessor);

      const merged = mergeStream(assetCopy(projectDir), templateCopy(projectDir));

      if (packerConfig.styleSupport) {
        merged.add(styleCopy(styleExt, projectDir));
      }

      if (!packerConfig.cliProject) {
        merged.add(demoCopy(packerConfig, packageName, projectDir));
        merged.add(demoHelperScriptCopy(projectDir));
      }

      merged.add([
        sourceCopy(packerConfig, styleExt, projectDir),
        licenseCopy(packerConfig, packageConfig, projectDir),
        readmeCopy(packageConfig, projectDir),
        configCopy(packageConfig, packerConfig, projectDir)
      ]);

      merged.on('end', () => {
        done();
      });
    });
  } catch (error) {
    console.log(error);
  }
});
