import gulp from 'gulp';
import isEmail from 'validator/lib/isEmail';
import isUrl from 'validator/lib/isURL';
import npmValidate from 'validate-npm-package-name';
import inquirer, { Questions } from 'inquirer';
import path from 'path';
import mergeStream from 'merge-stream';

import { args } from './util';
import logger from '../common/logger';

import { parseStylePreprocessorExtension } from './parser';
import {
  assetCopy,
  babelConfigCopy,
  configCopy, copyGitIgnore, copyPackerAssets,
  demoCopy,
  demoHelperScriptCopy,
  getPackageConfig,
  getPackerConfig,
  licenseCopy,
  readmeCopy,
  sourceCopy,
  styleCopy,
  templateCopy
} from './generate-util';
import { LicenseType } from '../model/license-type';
import { PackerOptions } from '../model/packer-options';
import chalk from 'chalk';

gulp.task('generate', async (done) => {
  const log = logger.create('[generate]');
  try {
    log.trace('start');
    const questions: Questions = [
      {
        message: 'Give us a small description about the library (optional)?',
        name: 'description',
        type: 'input'
      },
      {
        message: 'Give us a set of comma separated package keywords (optional)?',
        name: 'keywords',
        type: 'input'
      },
      {
        message: 'Author\'s name (optional)?',
        name: 'author',
        type: 'input'
      },
      {
        message: 'Author\'s email address (optional)?',
        name: 'email',
        type: 'input',
        validate: (value) => {
          return !value || isEmail(value) ? true : 'Value must be a valid email address';
        }
      },
      {
        message: 'Author\'s github username (optional)?',
        name: 'githubUsername',
        type: 'input',
        validate: (value) => {
          return true; // todo: add GH username validation here
        }
      },
      {
        message: 'Library homepage link (optional)?',
        name: 'website',
        type: 'input',
        validate: (value) => {
          return !value || isUrl(value) ? true : 'Value must be a valid URL';
        }
      },
      {
        choices: [
          'none',
          'typescript'
        ],
        default: 0,
        message: 'What\'s the script pre processor you want to use?',
        name: 'scriptPreprocessor',
        type: 'list'
      },
      {
        default: true,
        message: 'Do you want style sheet support?',
        name: 'styleSupport',
        type: 'confirm'
      },
      {
        choices: [
          'scss',
          'sass',
          'less',
          'stylus',
          'none'
        ],
        default: 0,
        message: 'What\'s the style pre processor you want to use?',
        name: 'stylePreprocessor',
        type: 'list',
        when: (answers) => {
          return answers.styleSupport;
        }
      },
      {
        default: false,
        message: 'Do you want to inline bundle styles within script?',
        name: 'bundleStyles',
        type: 'confirm',
        when: (answers) => {
          return answers.styleSupport;
        }
      },
      {
        default: true,
        message: 'Are you building a browser compliant library?',
        name: 'browserCompliant',
        type: 'confirm'
      },
      {
        default: false,
        message: 'Are you building a node CLI project?',
        name: 'cliProject',
        type: 'confirm',
        when: (answers) => {
          return !answers.browserCompliant;
        }
      },
      {
        choices: [
          'umd',
          'amd',
          'iife',
          'system'
        ],
        default: 0,
        message: 'What\'s the build bundle format you want to use?',
        name: 'bundleFormat',
        type: 'list',
        validate: (value) => {
          return !!value || 'Bundle format is required';
        },
        when: (answers) => {
          return answers.browserCompliant;
        }
      },
      {
        default: 'my-lib',
        message: 'What\'s the AMD id you want to use?',
        name: 'amdId',
        type: 'input',
        validate: (value) => {
          const matches = value.match(/^(?:[a-z]\d*(?:-[a-z])?)*$/i);
          return !!matches || 'AMD id should only contain alphabetic characters, i.e: \'my-bundle\'';
        },
        when: (answers) => {
          return answers.bundleFormat === 'umd' || answers.bundleFormat === 'amd';
        }
      },
      {
        message: 'What\'s the library namespace you want to use?',
        name: 'namespace',
        type: 'input',
        validate: (value) => {
          const matches = value.match(/^(?:[a-z]\d*(?:\.[a-z])?)+$/i);
          return !!matches || 'Namespace should be an object path, i.e: \'ys.nml.lib\'';
        },
        when: (answers) => {
          return answers.bundleFormat === 'umd'
            || answers.bundleFormat === 'iife'
            || answers.bundleFormat === 'system';
        }
      },
      {
        choices: [
          'jasmine',
          'mocha'
        ],
        default: 0,
        message: 'Which unit test framework do you want to use?',
        name: 'testFramework',
        type: 'list'
      },
      {
        default: (new Date()).getFullYear(),
        message: 'What\'s the library copyright year (optional)?',
        name: 'year',
        type: 'input'
      },
      {
        choices: [
          LicenseType.MIT,
          LicenseType.APACHE_2,
          LicenseType.MPL_2,
          LicenseType.BSD_2,
          LicenseType.BSD_3,
          LicenseType.ISC,
          LicenseType.LGPL_3,
          LicenseType.GLP_3,
          LicenseType.UNLICENSE
        ],
        default: 0,
        message: 'What\'s the license you want to use?',
        name: 'license',
        type: 'list',
        validate: (value) => {
          return !!value || 'License is required';
        }
      },
      {
        default: false,
        message: 'Do you want to use yarn as package manager?',
        name: 'isYarn',
        type: 'confirm'
      }
    ];

    if (args.length < 2) {
      log.error('Please provide a library name to generate the project\n%s',
        chalk.blue('npx packer-cli generate my-library'));
      done();
      return;
    }

    const packageName = args[1];
    const packageNameValidity = npmValidate(packageName);
    if (!packageNameValidity.validForNewPackages) {
      log.error(packageNameValidity.errors.join('\n'));
      done();
      return;
    }

    const options: PackerOptions = await inquirer.prompt<PackerOptions>(questions);
    const packerConfig = getPackerConfig(options);
    const packageConfig = getPackageConfig(options, packageName);
    const projectDir = path.join(process.cwd(), packageName);
    const styleExt = parseStylePreprocessorExtension(packerConfig.compiler.stylePreprocessor);

    const merged = mergeStream(assetCopy(projectDir, log), templateCopy(projectDir, log));

    if (packerConfig.compiler.styleSupport) {
      merged.add(styleCopy(styleExt, projectDir, log));
    }

    if (packerConfig.compiler.buildMode !== 'node-cli') {
      merged.add(demoCopy(packerConfig, packageName, projectDir, log));
      merged.add(demoHelperScriptCopy(projectDir, log));
    }

    merged.add([
      sourceCopy(packerConfig, styleExt, projectDir, log),
      licenseCopy(options, packerConfig, projectDir, log),
      readmeCopy(packageConfig, projectDir, log),
      babelConfigCopy(packerConfig, projectDir, log),
      copyGitIgnore(projectDir, log),
      copyPackerAssets(projectDir, log),
      configCopy(packageConfig, packerConfig, options.isYarn, projectDir, log)
    ]);

    merged.on('finish', () => {
      done();
    });
  } catch (e) {
    log.error('task failure\n%s', e.stack || e.message);
  }
});
