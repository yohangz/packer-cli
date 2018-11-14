import gulp from 'gulp';
import path from 'path';

import { meta } from './meta';
import { runShellCommand } from './util';
import logger from '../common/logger';

export default function init() {
  gulp.task('lint:style', async () => {
    const log = logger.create('[lint:style]');
    try {
      const config = meta.readPackerConfig(log);

      if (config.compiler.style) {
        log.info('start');

        const src = path.join(config.source, '**/*.{styl,scss,sass,less,css}');
        log.trace('style source path: %s', src);

        await runShellCommand('stylelint', [src], process.cwd(), log);
        log.info('end');
      } else {
        log.trace('skip style lint');
      }
    } catch (e) {
      log.error('failure: %s\n', e.stack || e.message);
    }
  });

  gulp.task('lint:script:ts', async () => {
    const log = logger.create('[lint:script:ts]');
    try {
      const config = meta.readPackerConfig(log);

      if (config.compiler.script.preprocessor === 'typescript') {
        log.info('start');

        const src = path.join(config.source, '**/*.{ts,tsx}');
        log.trace('script source path: %s', src);

        await runShellCommand('tslint', [src], process.cwd(), log);
        log.info('end');
      } else {
        log.trace('skip script tslint');
      }
    } catch (e) {
      log.error('failure: %s\n', e.stack || e.message);
    }
  });

  gulp.task('lint:script:es', async () => {
    const log = logger.create('[lint:script:es]');
    try {
      const config = meta.readPackerConfig(log);

      if (config.compiler.script.preprocessor === 'none') {
        log.info('start');

        const src = path.join(config.source, '**/*.{js,mjs}');
        log.trace('script source path: %s', src);

        await runShellCommand('eslint', [src], process.cwd(), log);
        log.info('end');
      } else {
        log.trace('skip script eslint');
      }
    } catch (e) {
      log.error('failure: %s\n', e.stack || e.message);
    }
  });

  gulp.task('lint:script', gulp.series('lint:script:ts', 'lint:script:es'));

  gulp.task('lint', gulp.series('lint:style', 'lint:script'));
}
