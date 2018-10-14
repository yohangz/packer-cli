import gulp from "gulp";
import chalk from "chalk";
import path from "path";

import {readConfig} from "./meta";
import {runShellCommand} from "./util";

gulp.task('lint:style', (done) => {
  console.log(chalk.blue('[Style Lint]'));
  const config = readConfig();
  runShellCommand('stylelint', [ path.join(config.source, '**/*.{styl,scss,sass,less,css}') ], process.cwd()).then(() => {
    done();
  });
});

gulp.task('lint:script:ts', (done) => {
  const config = readConfig();

  if (config.typescript) {
    console.log(chalk.blue('[TS Lint]'));
    runShellCommand('tslint', [path.join(config.source, '**/*.{ts,tsx}')], process.cwd()).then(() => {
      done();
    });
  }
});

gulp.task('lint:script:es', (done) => {
  const config = readConfig();

  if (!config.typescript) {
    console.log(chalk.blue('[ES Lint]'));
    runShellCommand('eslint', [path.join(config.source, '**/*.{js,mjs}')], process.cwd()).then(() => {
      done();
    });
  }
});

gulp.task('lint:script', gulp.series('lint:script:ts', 'lint:script:es'));

gulp.task('lint', gulp.series('lint:style', 'lint:script:ts', 'lint:script:es'));
