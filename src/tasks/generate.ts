import gulp, { TaskFunction } from 'gulp';
import path from 'path';
import chalk from 'chalk';
import isEmail from 'validator/lib/isEmail';
import isUrl from 'validator/lib/isURL';
import npmValidate from 'validate-npm-package-name';
import inquirer, { QuestionCollection } from 'inquirer';

import { args, runShellCommand } from './util';
import logger from '../common/logger';

import { LicenseType } from '../model/license-type';
import { PackerOptions } from '../model/packer-options';

import {
  parseBuildMode,
  parseScriptPreprocessorExtension,
  parseStylePreprocessorExtension,
  parseTestEnvironment
} from './parser';
import { getConfigFileGenerateTasks } from './generate-config-util';
import { getTestSpecGeneratorTasks } from './generate-test-util';
import { getExampleSourceGenerationsTasks } from './generate-source-util';
import { getDemoSourceGenerationTasks } from './generate-demo-source-util';
import { buildPackageConfig } from './generate-package-config';

/**
 * Initialize project generation associated gulp tasks
 */
export default function init() {
  /**
   * Project generate gulp task.
   */
  gulp.task('generate', async () => {
    const log = logger.create('[generate]');
    try {
      log.trace('start');
      const questions: QuestionCollection<PackerOptions> = [
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
          message: "Author's name (optional)?",
          name: 'author',
          type: 'input'
        },
        {
          message: "Author's email address (optional)?",
          name: 'email',
          type: 'input',
          when: (answers: PackerOptions) => {
            return !!answers.author;
          },
          validate: (value: string) => {
            return !value || isEmail(value) ? true : 'Value must be a valid email address';
          }
        },
        {
          message: "Author's github username (optional)?",
          name: 'githubUsername',
          type: 'input',
          validate: () => {
            return true; // todo: add GH username validation here
          }
        },
        {
          message: 'Library homepage link (optional)?',
          name: 'website',
          type: 'input',
          validate: (value: string) => {
            return !value || isUrl(value) ? true : 'Value must be a valid URL';
          }
        },
        {
          choices: ['none', 'typescript'],
          default: 0,
          message: "What's the script pre processor you want to use?",
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
          choices: ['scss', 'sass', 'less', 'stylus', 'none'],
          default: 0,
          message: "What's the style pre processor you want to use?",
          name: 'stylePreprocessor',
          type: 'list',
          when: (answers: PackerOptions) => {
            return answers.styleSupport;
          }
        },
        {
          default: false,
          message: 'Do you want to inline bundle styles within script?',
          name: 'bundleStyles',
          type: 'confirm',
          when: (answers: PackerOptions) => {
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
          when: (answers: PackerOptions) => {
            return !answers.browserCompliant;
          }
        },
        {
          default: false,
          message: 'Are you building a react library?',
          name: 'reactLib',
          type: 'confirm',
          when: (answers: PackerOptions) => {
            return answers.browserCompliant;
          }
        },
        {
          choices: ['umd', 'amd', 'iife', 'system'],
          default: 0,
          message: "What's the build bundle format you want to use?",
          name: 'bundleFormat',
          type: 'list',
          when: (answers: PackerOptions) => {
            return answers.browserCompliant;
          }
        },
        {
          default: 'my-lib',
          message: "What's the AMD id you want to use?",
          name: 'amdId',
          type: 'input',
          validate: (value: string) => {
            const matches = value.match(/^(?:[a-z]\d*(?:-[a-z])?)*$/i);
            return !!matches || "AMD id should only contain alphabetic characters, i.e: 'my-bundle'";
          },
          when: (answers: PackerOptions) => {
            return answers.bundleFormat === 'umd' || answers.bundleFormat === 'amd';
          }
        },
        {
          default: 'com.lib',
          message: "What's the library namespace you want to use?",
          name: 'namespace',
          type: 'input',
          validate: (value: string) => {
            const matches = value.match(/^(?:[a-z]\d*(?:\.[a-z])?)+$/i);
            return !!matches || "Namespace should be an object path, i.e: 'ys.nml.lib'";
          },
          when: (answers: PackerOptions) => {
            return (
              answers.bundleFormat === 'umd' || answers.bundleFormat === 'iife' || answers.bundleFormat === 'system'
            );
          }
        },
        {
          choices: ['jest', 'mocha', 'jasmine'],
          default: 0,
          message: 'Which unit test framework do you want to use?',
          name: 'testFramework',
          type: 'list',
          when: (answers: PackerOptions) => {
            return answers.reactLib;
          }
        },
        {
          choices: ['mocha', 'jasmine', 'jest'],
          default: 0,
          message: 'Which unit test framework do you want to use?',
          name: 'testFramework',
          type: 'list',
          when: (answers: PackerOptions) => {
            return !answers.reactLib;
          }
        },
        {
          default: true,
          message: 'Do you want to use enzyme to test react components?',
          name: 'useEnzyme',
          type: 'confirm',
          when: (answers: PackerOptions) => {
            return answers.reactLib;
          }
        },
        {
          choices: ['jsdom', 'browser'],
          default: 0,
          message: 'Choose the test environment that will be used for testing?',
          name: 'testEnvironment',
          type: 'list',
          when: (answers: PackerOptions) => {
            return (
              answers.browserCompliant &&
              !answers.reactLib &&
              (answers.testFramework === 'jasmine' || answers.testFramework === 'mocha')
            );
          }
        },
        {
          default: new Date().getFullYear(),
          message: "What's the library copyright year (optional)?",
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
          message: "What's the license you want to use?",
          name: 'license',
          type: 'list'
        },
        {
          default: false,
          message: 'Do you want to use yarn as package manager?',
          name: 'isYarn',
          type: 'confirm'
        }
      ];

      if (args.length < 2) {
        log.error(
          'Please provide a library name to generate the project\n%s',
          chalk.blue('npx packer-cli generate my-library')
        );
        process.exit(1);
        return;
      }

      const packageName = args[1];
      const packageNameValidity = npmValidate(packageName);
      if (!packageNameValidity.validForNewPackages) {
        if (packageNameValidity.errors) {
          log.error('Package name error: %s', packageNameValidity.errors.join('\n'));
        } else if (packageNameValidity.warnings) {
          log.error('Package name error: %s', packageNameValidity.warnings.join('\n'));
        }

        process.exit(1);
        return;
      }

      const options: PackerOptions = await inquirer.prompt<PackerOptions>(questions);
      const testEnvironment = parseTestEnvironment(options);
      const packageConfig = buildPackageConfig(options, testEnvironment, packageName);
      const scriptExt = parseScriptPreprocessorExtension(options.scriptPreprocessor);
      const projectDir = path.join(process.cwd(), packageName);
      const styleExt = parseStylePreprocessorExtension(options.stylePreprocessor);
      const buildMode = parseBuildMode(options);

      const tasks: TaskFunction[] = [
        ...getExampleSourceGenerationsTasks(options, styleExt, scriptExt, buildMode, projectDir, log),
        ...getTestSpecGeneratorTasks(options, scriptExt, testEnvironment, projectDir, log),
        ...getDemoSourceGenerationTasks(options, buildMode, packageName, projectDir, log),
        ...getConfigFileGenerateTasks(options, packageConfig, buildMode, scriptExt, testEnvironment, projectDir, log)
      ];

      await gulp.series([
        gulp.parallel(tasks),
        async () => {
          if (!args.includes('--skipInstall') && !args.includes('-sk')) {
            await runShellCommand(options.isYarn ? 'yarn install' : 'npm install', projectDir, log);
          }

          log.info('📦 package generated 🚀');
        }
      ])(() => {
        // No implementation
      });
    } catch (e) {
      log.error('task failure\n%s', e.stack || e.message);
      process.exit(1);
    }
  });
}
