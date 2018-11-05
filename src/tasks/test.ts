import gulp from 'gulp';
import path from 'path';
import fs from 'fs';
import glob from 'glob';

import { makeRelativeDirPath } from './util';
import { readConfig } from './meta';
import { parseScriptPreprocessorExtension } from './parser';
import logger from '../common/logger';
import { buildUnitTestSource } from './test-util';

export default function init() {
  gulp.task('test', async () => {
    const log = logger.create('[test]');
    try {
      log.trace('start');
      const config = readConfig(log);
      if (config.compiler.buildMode === 'browser') {
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

        let masterSpecCode = '';
        const fileExtension = parseScriptPreprocessorExtension(config.compiler.scriptPreprocessor);
        const files = glob.sync(path.join(process.cwd(), config.source, `**/*.spec.${fileExtension}`));
        files.forEach((file) => {
          masterSpecCode += `import '${file}';\n`;
        });
        log.trace('combined test spec code:\n%s', masterSpecCode);

        const srcFile = path.join(process.cwd(), config.tmp, `test/index.spec.${fileExtension}`);
        log.trace('combined test spec file path:\n%s', srcFile);

        fs.writeFileSync(srcFile, masterSpecCode);

        await buildUnitTestSource(config, srcFile, log);
      }
    } catch (e) {
      log.error('failure: %s\n', e.stack || e.message);
    }
  });
}
