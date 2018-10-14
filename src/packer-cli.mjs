import gulp from 'gulp';
import chalk from 'chalk';

import './tasks/clean';
import './tasks/build';
import './tasks/generate';
import './tasks/lint';
import './tasks/test';
import './tasks/watch';

import {args} from './tasks/util';

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
