import gulp from 'gulp';
import path from 'path';
import glob from 'glob';

import { makeRelativeDirPath, writeFile } from './util';
import { meta } from './meta';
import { parseScriptPreprocessorExtension } from './parser';
import logger from '../common/logger';
import { buildUnitTestSource } from './test-util';

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
      if (config.compiler.buildMode === 'browser' && config.testFramework !== 'jest') {
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
        log.trace('start test suite execution node');
        makeRelativeDirPath(config.tmp, 'test');

        // Prepare dynamic spec file which imports all spec references.
        let masterSpecCode = '';
        const fileExtension = parseScriptPreprocessorExtension(config.compiler.script.preprocessor);
        const files = glob.sync(path.join(process.cwd(), config.source, `**/*.spec.${fileExtension}`));
        files.forEach((file) => {
          masterSpecCode += `import '${file}';\n`;
        });
        log.trace('combined test spec code:\n%s', masterSpecCode);

        const srcFile = path.join(process.cwd(), config.tmp, `test/index.spec.${fileExtension}`);
        log.trace('combined test spec file path:\n%s', srcFile);

        await writeFile(srcFile, masterSpecCode);

        await buildUnitTestSource(config, srcFile, log);
      }
    } catch (e) {
      log.error('task failure: %s\n', e.stack || e.message);
      process.exit(1);
    }
  });
}
