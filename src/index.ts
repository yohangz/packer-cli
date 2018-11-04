import gulp from 'gulp';

import './tasks/clean';
import './tasks/build';
import './tasks/generate';
import './tasks/lint';
import './tasks/test';
import './tasks/watch';
import './tasks/version';

import { args } from './tasks/util';
import logger from './common/logger';

import karmaPackerPlugin from './plugins/karma-packer-plugin';
import { isValidProject, readBanner, readSummary } from './tasks/meta';
import chalk from 'chalk';

const log = logger.create('');

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
    break;
}

export default karmaPackerPlugin;
