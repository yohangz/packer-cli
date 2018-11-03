import gulp from 'gulp';
import chalk from 'chalk';

import { readCLIPackageData } from './meta';
import logger from '../common/logger';

gulp.task('version', async (done: () => void) => {
  const log = logger.create('[version]');
  try {
    const config = readCLIPackageData();
    console.log(chalk.blue('%s version: %s'), config.name, chalk.red(config.version));
    done();
  } catch (e) {
    log.error('task failure:\n', e.stack || e.message);
  }
});
