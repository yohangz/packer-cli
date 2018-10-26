import gulp from 'gulp';
import chalk from 'chalk';
import { readCLIPackageData } from './meta';

gulp.task('version', (done: () => void) => {
  const config = readCLIPackageData();
  console.log(chalk.blue(`${config.name} version:`), chalk.red(config.version));
  done();
});
