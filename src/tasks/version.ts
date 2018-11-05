import gulp from 'gulp';
import chalk from 'chalk';

import { readCLIPackageData } from './meta';
import logger from '../common/logger';

export default function init() {
  gulp.task('version', async () => {
    const log = logger.create('[version]');
    try {
      const config = readCLIPackageData();
      console.log(chalk.blue('%s version: %s'), config.name, chalk.red(config.version));
    } catch (e) {
      log.error('task failure:\n', e.stack || e.message);
    }
  });
}
