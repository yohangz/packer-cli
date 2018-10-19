import chalk from 'chalk';
import gulp from 'gulp';

import './tasks/clean';
import './tasks/build';
import './tasks/generate';
import './tasks/lint';
import './tasks/test';
import './tasks/watch';

import { args } from './tasks/util';

import karmaPackerPlugin from './plugins/karma-packer-plugin';

switch (args[0]) {
  case 'generate':
    gulp.series('generate')(() => {
      console.log('generate complete');
    });
    break;
  case 'build':
    gulp.series('build')(() => {
      console.log('build complete');
    });
    break;
  case 'watch':
    gulp.series('watch')(() => {
      console.log('watch complete');
    });
    break;
  case 'test':
    gulp.series('test')(() => {
      console.log('test complete');
    });
    break;
  case 'clean':
    gulp.series('build:clean', 'watch:clean')(() => {
      console.log('clean complete');
    });
    break;
  case 'lint': {
    if (args.length > 1) {
      switch (args[1]) {
        case '--style':
          gulp.series('lint:style')(() => {
            console.log('style lint complete');
          });
          break;
        case '--script':
          gulp.series('lint:script')(() => {
            console.log('script lint complete');
          });
          break;
        default:
          console.log(chalk.red('Invalid lint task argument'));
      }
    } else {
      gulp.series('lint')(() => {
        console.log('lint complete');
      });
    }

    break;
  }
  default:
    console.log(chalk.red('Invalid task name argument'));
    break;
}

export default karmaPackerPlugin;
