import gulp from 'gulp';
import clean from 'gulp-clean';
import path from 'path';

import { readConfig } from './meta';
import logger from '../common/logger';

gulp.task('tmp:clean', async () => {
  try {
    logger.trace('[tmp:clean] start');
    const config = readConfig();
    return gulp.src([path.join(process.cwd(), config.tmp)], {
        allowEmpty: true,
        read: false
      })
      .pipe(clean())
      .on('end', () => {
        logger.trace('[tmp:clean] end');
      });
  } catch (e) {
    logger.error('[tmp:clean] task failure:\n', e.stack || e.message);
  }
});

gulp.task('build:clean', async () => {
  try {
    logger.trace('[build:clean] start');
    const config = readConfig();
    return gulp.src([path.join(process.cwd(), config.dist)], {
        allowEmpty: true,
        read: false
      })
      .pipe(clean())
      .on('end', () => {
        logger.trace('[build:clean] end');
      });
  } catch (e) {
    logger.error('[tmp:clean] task failure:\n', e.message, e.stack);
  }
});

gulp.task('clean', gulp.series('tmp:clean', 'build:clean'));
