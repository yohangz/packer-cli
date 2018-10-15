import gulp from 'gulp';
import isEmail from 'validator/lib/isEmail';
import isUrl from 'validator/lib/isURL';
import npmValidate from 'validate-npm-package-name';
import inquirer from 'inquirer';
import path from 'path';
import gulpFilter from 'gulp-filter';
import gulpFile from 'gulp-file';
import mergeStream from 'merge-stream';

import gulpHbsRuntime from '../gulp-hbs-runtime';
import { runShellCommand, args } from './util';
import { parseLicenseType, parseStylePreprocessorExtension } from './parser';
import { readCLIPackageData } from './meta';

const configResource = require('../resources/dynamic/.packerrc.json');
const packageResource = require('../resources/dynamic/package.json');

gulp.task('generate', (done) => {
  try {
    const cliPackageData = readCLIPackageData();

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
        name: 'clientCompliant',
        default: true
      },
      {
        type: 'confirm',
        message: 'Are you building a node CLI project?',
        name: 'cliProject',
        default: false,
        when: (answers) => {
          return !answers.clientCompliant;
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
          return answers.clientCompliant;
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
      let packageConfig = configResource;

      if (!options.clientCompliant) {
        packageConfig.bundle.format = 'cjs';
      } else {
        packageConfig.bundle.format = options.bundleFormat;
      }

      packageConfig.bundle.inlineStyle = options.bundleStyles;
      packageConfig.bundle.amd.id = options.amdId;
      packageConfig.testFramework = options.testFramework.toLowerCase();
      packageConfig.typescript = options.typescript;
      packageConfig.namespace = options.namespace;
      packageConfig.stylePreprocessor = options.stylePreprocessor;
      packageConfig.cliProject = options.cliProject;
      packageConfig.entry = 'index' + (options.typescript ? '.ts' : '.js');
      packageConfig.styleSupport = options.styleSupport;

      let packageJson = packageResource;
      packageJson.name = packageName;
      packageJson.description = options.description;
      packageJson.devDependencies[cliPackageData.name] = `^${cliPackageData.version}`;
      packageJson.homepage = options.homepage;
      packageJson.license = parseLicenseType(options.license);
      packageJson.keywords = String(options.keywords || '').split(',');

      if (packageConfig.cliProject) {
        packageJson.bin = {
          [packageJson.name]: path.join(packageConfig.dist.outDir, 'bundles', `${packageJson.name}.${packageConfig.bundle.format}.js`)
        };
      }

      if (options.author && options.email) {
        packageJson.author = `${options.author} <${options.email}>`;
        packageJson.repository = `https://github.com/${options.author}/${packageName}.git`;
      }

      const projectDir = path.join(process.cwd(), packageName);
      const styleExt = parseStylePreprocessorExtension(packageConfig.stylePreprocessor);
      const isJasmine = packageConfig.testFramework === 'jasmine';

      const styleCopy = gulp.src([
        path.join(__dirname, '../resources/dynamic/example/common/style', `**/*.${styleExt}`)
      ])
        .pipe(gulp.dest(path.join(projectDir, 'src/style')));

      const templateCopy = gulp.src([
        path.join(__dirname, '../resources/dynamic/example/common/templates/**/*')
      ])
        .pipe(gulp.dest(path.join(projectDir, 'src/templates')));

      const assetCopy = gulp.src([
        path.join(__dirname, '../resources/dynamic/example/common/assets/**/*')
      ])
        .pipe(gulp.dest(path.join(projectDir, 'src/assets')));

      const sourceCopy = gulp.src([
        path.join(__dirname, '../resources/dynamic/example', packageConfig.typescript ? 'ts' : 'js', '{.**,**}')
      ])
        .pipe(gulpHbsRuntime({
          styleExt: styleExt,
          isJasmine: isJasmine,
          styleSupport: packageConfig.styleSupport,
          cliProject: options.cliProject
        }, {
          replaceExt: ''
        }))
        .pipe(gulp.dest(path.join(projectDir, 'src')));

      const licenseCopy = gulp.src([
        path.join(__dirname, '../resources/dynamic/license', `${packageJson.license}.hbs`)
      ])
        .pipe(gulpHbsRuntime({
          year: options.year,
          author: options.author
        }, {
          rename: 'LICENSE'
        }))
        .pipe(gulp.dest(projectDir));

      const readmeCopy = gulp.src([
        path.join(__dirname, '../resources/dynamic/README.md.hbs')
      ])
        .pipe(gulpHbsRuntime({
          packageName: packageJson.name,
          packageDescription: packageJson.description
        }, {
          replaceExt: ''
        }))
        .pipe(gulp.dest(projectDir));

      const isAmd = packageConfig.bundle.format === 'amd';
      const isIife = packageConfig.bundle.format === 'umd' || packageConfig.bundle.format === 'iife';
      const isSystem = packageConfig.bundle.format === 'system';

      const demoHelperScriptCopy = gulp.src([
        path.join(__dirname, '../resources/dynamic/demo/helper/**/*')
      ])
        .pipe(gulp.dest(path.join(projectDir, 'demo/helper')));

      const demoCopy = gulp.src([
        path.join(__dirname, '../resources/dynamic/demo/**/*.hbs')
      ])
        .pipe(gulpFilter('**/*' + (options.clientCompliant ? '.html.hbs' : '.js.hbs')))
        .pipe(gulpHbsRuntime({
          projectName: packageName,
          inlineStyle: packageConfig.bundle.inlineStyle,
          namespace: packageConfig.namespace,
          moduleFormat: packageConfig.bundle.format,
          watchDir: packageConfig.watch.scriptDir,
          distDir: packageConfig.dist.outDir,
          require: isAmd,
          iife: isIife,
          system: isSystem,
          amdModule: packageConfig.bundle.amd.id
        }, {
          replaceExt: ''
        }))
        .pipe(gulp.dest(path.join(projectDir, 'demo')));

      const configCopy = gulp.src([
        path.join(__dirname, '../resources/static/{.**,**}')
      ])
        .pipe(gulpFile('.packerrc.json', JSON.stringify(packageConfig, null, 2)))
        .pipe(gulpFile('package.json', JSON.stringify(packageJson, null, 2)))
        .on('end', () => {
          runShellCommand(options.isYarn ? 'yarn' : 'npm', ['install'], projectDir).then(() => {
            done();
          });
        })
        .pipe(gulp.dest(projectDir));

      const merged = mergeStream(assetCopy, templateCopy);

      if (packageConfig.styleSupport) {
        merged.add(styleCopy);
      }

      if (packageConfig.cliProject) {
        merged.add(demoCopy);
      }

      merged.add([sourceCopy, demoHelperScriptCopy, licenseCopy, readmeCopy, configCopy]);
    });
  } catch (error) {
    console.log(error);
  }
});
