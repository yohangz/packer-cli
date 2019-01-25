import gulp from 'gulp';
import chalk from 'chalk';

import { name, version } from '../../package.json';
import logger from '../common/logger';

/**
 * Initialize version log associated gulp tasks.
 */
export default function init() {
  /**
   * Log packer version gulp task.
   */
  gulp.task('version', async () => {
    const log = logger.create('[version]');
    try {
      console.log(chalk.blue('%s version: %s'), name, chalk.red(version));
    } catch (e) {
      log.error('task failure:\n', e.stack || e.message);
      process.exit(1);
    }
  });
}
