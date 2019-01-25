import gulp from 'gulp';

import { meta } from './meta';
import { runShellCommand } from './util';
import logger from '../common/logger';

/**
 * Initialize lint gulp tasks.
 */
export default function init() {
  /**
   * Auto format source gulp task.
   * Execute prettier on source directory.
   */
  gulp.task('format', async () => {
    const log = logger.create('[format]');
    try {
      const config = meta.readPackerConfig(log);

      log.info('start');
      await runShellCommand(config.format.advanced.command, process.cwd(), log);
      log.info('end');
    } catch (e) {
      log.error('task failure: %s\n', e.stack || e.message);
      process.exit(1);
    }
  });
}
