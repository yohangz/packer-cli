import gulp from 'gulp';
import path from 'path';

import { readConfig } from './meta';
import { runShellCommand } from './util';
import logger from '../common/logger';

gulp.task('lint:style', async (done) => {
  const log = logger.create('[lint:style]');
  try {
    const config = readConfig();

    if (config.compiler.styleSupport) {
      log.info('start');

      const src = path.join(config.source, '**/*.{styl,scss,sass,less,css}');
      log.trace('style source path: %s', src);

      await runShellCommand('stylelint', [src], process.cwd(), log);
      log.info('end');
      done();
    } else {
      log.trace('skip style lint');
      done();
    }
  } catch (e) {
    log.error('failure: %s\n', e.stack || e.message);
  }
});

gulp.task('lint:script:ts', async (done) => {
  const log = logger.create('[lint:script:ts]');
  try {
    const config = readConfig();

    if (config.compiler.scriptPreprocessor === 'typescript') {
      log.info('start');

      const src = path.join(config.source, '**/*.{ts,tsx}');
      log.trace('script source path: %s', src);

      await runShellCommand('tslint', [src], process.cwd(), log);
      log.info('end');
      done();
    } else {
      log.trace('skip script tslint');
      done();
    }
  } catch (e) {
    log.error('failure: %s\n', e.stack || e.message);
  }
});

gulp.task('lint:script:es', async (done) => {
  const log = logger.create('[lint:script:es]');
  try {
    const config = readConfig();

    if (config.compiler.scriptPreprocessor !== 'typescript') {
      log.info('start');

      const src = path.join(config.source, '**/*.{js,mjs}');
      log.trace('script source path: %s', src);

      await runShellCommand('eslint', [src], process.cwd(), log);
      log.info('end');
      done();
    } else {
      log.trace('skip script eslint');
      done();
    }
  } catch (e) {
    log.error('failure: %s\n', e.stack || e.message);
  }
});

gulp.task('lint:script', gulp.series('lint:script:ts', 'lint:script:es'));

gulp.task('lint', gulp.series('lint:style', 'lint:script'));
