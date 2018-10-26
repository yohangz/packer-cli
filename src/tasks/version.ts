import gulp from 'gulp';
import chalk from 'chalk';
import { readCLIPackageData } from './meta';

gulp.task('build:clean', (done: () => void) => {
  const config = readCLIPackageData();
  console.log(chalk.blue(`${config.name} version: `), chalk.red(config.version));
  done();
});
