import gulp from 'gulp';
import clean from 'gulp-clean';
import path from 'path';

import { readConfig } from './meta';

gulp.task('watch:clean', () => {
  try {
    const config = readConfig();
    return gulp.src([path.join(process.cwd(), '.rpt2_cache'), path.join(process.cwd(), config.watch.scriptDir)], {
      allowEmpty: true,
      read: false
    })
      .pipe(clean());
  } catch (e) {
    console.error(e);
    throw Error('task failure');
  }
});

gulp.task('build:clean', () => {
  try {
    const config = readConfig();
    return gulp.src([path.join(process.cwd(), '.rpt2_cache'), path.join(process.cwd(), config.dist)], {
      allowEmpty: true,
      read: false
    })
      .pipe(clean());
  } catch (e) {
    console.error(e);
    throw Error('task failure');
  }
});

gulp.task('clean', gulp.series('watch:clean', 'build:clean'));
