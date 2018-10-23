import gulp from 'gulp';
import clean from 'gulp-clean';
import path from 'path';

import { readConfig } from './meta';

gulp.task('watch:clean', () => {
  const config = readConfig();
  return gulp.src([path.join(process.cwd(), '.rpt2_cache'), path.join(process.cwd(), config.watch.scriptDir)], {
    allowEmpty: true,
    read: false
  })
    .pipe(clean());
});

gulp.task('build:clean', () => {
  const config = readConfig();
  return gulp.src([ path.join(process.cwd(), '.rpt2_cache'), path.join(process.cwd(), config.dist) ], {
    allowEmpty: true,
    read: false
  })
    .pipe(clean());
});

gulp.task('clean', gulp.series('watch:clean', 'build:clean'));
