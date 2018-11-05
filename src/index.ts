import gulp from 'gulp';
import chalk from 'chalk';

import initClean from './tasks/clean';
import initBuild from './tasks/build';
import initGenerate from './tasks/generate';
import initLint from './tasks/lint';
import initTest from './tasks/test';
import initWatch from './tasks/watch';
import initVersion from './tasks/version';
import { args } from './tasks/util';

import { isValidProject, readBanner, readSummary } from './tasks/meta';
import logger from './common/logger';

export const initPacker = () => {
  const log = logger.create('');
  try {
    initClean();
    initBuild();
    initGenerate();
    initLint();
    initTest();
    initWatch();
    initVersion();

    switch (args[0]) {
      case '--help':
        console.log(readSummary());
        break;
      case '--version':
        gulp.series('version')(() => {
          // no implementation
        });
        break;
      case 'generate':
        console.log(chalk.red(readBanner()));
        gulp.series('generate')(() => {
          // no implementation
        });
        break;
      case 'build':
        if (isValidProject(log)) {
          gulp.series('build')(() => {
            // no implementation
          });
        }
        break;
      case 'watch':
        if (isValidProject(log)) {
          gulp.series('watch')(() => {
            // no implementation
          });
        }
        break;
      case 'test':
        if (isValidProject(log)) {
          gulp.series('test')(() => {
            // no implementation
          });
        }
        break;
      case 'clean':
        gulp.series('clean')(() => {
          // no implementation
        });
        break;
      case 'lint': {
        if (isValidProject(log)) {
          if (args.includes('--style')) {
            gulp.series('lint:style')(() => {
              // no implementation
            });
            break;
          } else if (args.includes('--script')) {
            gulp.series('lint:script')(() => {
              // no implementation
            });
            break;
          } else {
            gulp.series('lint')(() => {
              // no implementation
            });
          }
          break;
        }
      }
      default:
        log.error('Invalid task name argument\n%s%s', chalk.reset('try '), chalk.blue('packer --help'));
    }
  } catch (e) {
    log.error('packer init failure: %s\n', e.stack || e.message);
  }
};

export { karmaPackerPlugin } from './plugins/karma-packer-plugin';
