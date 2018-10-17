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

const configResource = require('../../assets/resources/dynamic/.packerrc.json');
const packageResource = require('../../assets/resources/dynamic/package.json');

const getPackerConfig = (options) => {
  let packerConfig = configResource;

  packerConfig.browserCompliant = options.browserCompliant;
  if (!packerConfig.browserCompliant) {
    packerConfig.bundle.format = 'cjs';
  } else {
    packerConfig.bundle.format = options.bundleFormat;
  }

  packerConfig.bundle.inlineStyle = options.bundleStyles;
  packerConfig.bundle.amd.id = options.amdId;
  packerConfig.testFramework = options.testFramework.toLowerCase();
  packerConfig.typescript = options.typescript;
  packerConfig.namespace = options.namespace;
  packerConfig.stylePreprocessor = options.stylePreprocessor;
  packerConfig.cliProject = options.cliProject;
  packerConfig.entry = 'index' + (options.typescript ? '.ts' : '.js');
  packerConfig.styleSupport = options.styleSupport;

  return packerConfig;
};

const getPackageConfig = (options, packageName) => {
  const cliPackageData = readCLIPackageData();

  let packageJson = packageResource;
  packageJson.name = packageName;
  packageJson.description = options.description;
  packageJson.devDependencies[cliPackageData.name] = `^${cliPackageData.version}`;
  packageJson.homepage = options.homepage;
  packageJson.license = parseLicenseType(options.license);
  packageJson.keywords = String(options.keywords || '').split(',');

  if (options.cliProject) {
    packageJson.bin = {
      [packageJson.name]: path.join('bin', `${packageJson.name}.js`)
    };
  }

  if (options.author && options.email) {
    packageJson.author = `${options.author} <${options.email}>`;
  }

  if (options.githubUsername) {
    packageJson.repository = `https://github.com/${options.githubUsername}/${packageName}.git`;
  }

  return packageJson;
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
