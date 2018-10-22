import gulp from 'gulp';
import chalk from 'chalk';
import path from 'path';

import { readConfig } from './meta';
import { runShellCommand } from './util';

gulp.task('lint:style', (done) => {
  try {
    const config = readConfig();

    if (config.styleSupport) {
      console.log(chalk.blue('[Style Lint]'));
      const src = path.join(config.source, '**/*.{styl,scss,sass,less,css}');
      runShellCommand('stylelint', [src], process.cwd())
        .then(() => {
          done();
        });
    } else {
      done();
    }
  } catch (e) {
    console.error(e);
  }
});

gulp.task('lint:script:ts', (done) => {
  try {
    const config = readConfig();

    if (config.typescript) {
      console.log(chalk.blue('[TS Lint]'));
      const src = path.join(config.source, '**/*.{ts,tsx}');
      runShellCommand('tslint', [src], process.cwd()).then(() => {
        done();
      });
    } else {
      done();
    }
  } catch (e) {
    console.error(e);
  }
});

gulp.task('lint:script:es', (done) => {
  try {
    const config = readConfig();

    if (!config.typescript) {
      console.log(chalk.blue('[ES Lint]'));
      const src = path.join(config.source, '**/*.{js,mjs}');
      runShellCommand('eslint', [src], process.cwd()).then(() => {
        done();
      });
    } else {
      done();
    }
  } catch (e) {
    console.error(e);
  }
});

gulp.task('lint:script', gulp.series('lint:script:ts', 'lint:script:es'));

gulp.task('lint', gulp.series('lint:style', 'lint:script'));
