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
import { readSummary } from './tasks/meta';
import chalk from 'chalk';

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
    gulp.series('generate')(() => {
      // no implementation
    });
    break;
  case 'build':
    gulp.series('build')(() => {
      // no implementation
    });
    break;
  case 'watch':
    gulp.series('watch')(() => {
      // no implementation
    });
    break;
  case 'test':
    gulp.series('test')(() => {
      // no implementation
    });
    break;
  case 'clean':
    gulp.series('clean')(() => {
      // no implementation
    });
    break;
  case 'lint': {
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
  default:
    logger.error('Invalid task name argument\n%s%s', chalk.reset('try '), chalk.blue('packer --help'));
    break;
}

export default karmaPackerPlugin;
