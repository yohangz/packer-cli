import gulp from 'gulp';
import path from 'path';

import { meta } from './meta';
import logger from '../common/logger';
import { runNodeUnitTest } from './test-util';

/**
 * Initialize test associated gulp tasks.
 */
export default function init() {

  /**
   * Unit test execution gulp task.
   *
   */
  gulp.task('test', async () => {
    const log = logger.create('[test]');
    try {
      log.trace('start');
      const config = meta.readPackerConfig(log);
      /**
       * Use karma if browser build mode and not using jest, else use standalone test execution
       * depending on test framework.
       */
      if (config.test.environment === 'browser') {
        log.trace('start test suite execution via karma');
        const karma = require('karma');

        const server = new karma.Server({
          configFile: path.join(process.cwd(), 'karma.conf.js')
        }, (exitCode) => {
          log.info('Karma has exited with %d', exitCode);
          process.exit(exitCode);
        });

        server.start();
      } else {
        log.trace('start standalone test suite execution');
        await runNodeUnitTest(config, log);
      }
    } catch (e) {
      log.error('task failure: %s\n', e.stack || e.message);
      process.exit(1);
    }
  });
}
