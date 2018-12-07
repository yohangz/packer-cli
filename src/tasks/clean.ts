import gulp from 'gulp';
import clean from 'gulp-clean';
import path from 'path';

import { meta } from './meta';
import logger from '../common/logger';

/**
 * Initialize clean gulp tasks
 */
export default function init() {

  /**
   * Temporary file clean gulp task.
   * Clean tmp directory specified in packer config.
   */
  gulp.task('tmp:clean', () => {
    const log = logger.create('[tmp:clean]');
    try {
      log.trace('start');
      const config = meta.readPackerConfig(log);
      return gulp.src([path.join(process.cwd(), config.tmp)], {
        allowEmpty: true,
        read: false
      })
        .pipe(clean());
    } catch (e) {
      log.error('task failure:\n', e.stack || e.message);
      process.exit(1);
    }
  });

  /**
   * Watch build temporary file clean gulp task.
   * Clean tmp directory specified in packer config.
   */
  gulp.task('watch:tmp:clean', () => {
    const log = logger.create('[watch:tmp:clean]');
    try {
      log.trace('start');
      const config = meta.readPackerConfig(log);
      return gulp.src([path.join(process.cwd(), config.tmp, 'watch')], {
        allowEmpty: true,
        read: false
      })
        .pipe(clean());
    } catch (e) {
      log.error('task failure:\n', e.stack || e.message);
      process.exit(1);
    }
  });

  /**
   * Build distribution clean gulp task.
   * Clean dist directory specified in packer config.
   */
  gulp.task('build:clean',  () => {
    const log = logger.create('[build:clean]');
    try {
      log.trace('start');
      const config = meta.readPackerConfig(log);
      return gulp.src([path.join(process.cwd(), config.dist)], {
        allowEmpty: true,
        read: false
      })
        .pipe(clean());
    } catch (e) {
      log.error('task failure:\n', e.message, e.stack);
      process.exit(1);
    }
  });

  /**
   * Clean all temporary and distribution artifacts gulp task.
   * Clean temporary and build artifact directories on parallel mode.
   */
  gulp.task('clean', gulp.parallel('tmp:clean', 'build:clean'));
}
