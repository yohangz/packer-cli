import gulp from 'gulp';
import clean from 'gulp-clean';
import path from 'path';

import { readConfig } from './meta';
import logger from '../common/logger';

export default function init() {
  gulp.task('tmp:clean', async () => {
    const log = logger.create('[tmp:clean]');
    try {
      log.trace('start');
      const config = readConfig();
      return gulp.src([path.join(process.cwd(), config.tmp)], {
        allowEmpty: true,
        read: false
      })
        .pipe(clean());
    } catch (e) {
      log.error('task failure:\n', e.stack || e.message);
    }
  });

  gulp.task('build:clean', async () => {
    const log = logger.create('[build:clean]');
    try {
      log.trace('start');
      const config = readConfig();
      return gulp.src([path.join(process.cwd(), config.dist)], {
        allowEmpty: true,
        read: false
      })
        .pipe(clean());
    } catch (e) {
      log.error('task failure:\n', e.message, e.stack);
    }
  });

  gulp.task('clean', gulp.series('tmp:clean', 'build:clean'));
};
