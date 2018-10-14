import gulp from "gulp";
import path from "path";
import clean from "gulp-clean";

import {readConfig} from "./meta";

gulp.task('watch:clean', () => {
  const config = readConfig();
  return gulp.src([ path.join(process.cwd(), '.rpt2_cache'), path.join(process.cwd(), config.watch.scriptDir)], {
    read: false,
    allowEmpty: true
  })
    .pipe(clean());
});

gulp.task('build:clean', () => {
  const config = readConfig();
  return gulp.src([ path.join(process.cwd(), '.rpt2_cache'), path.join(process.cwd(), config.dist.outDir) ], {
    read: false,
    allowEmpty: true
  })
    .pipe(clean());
});
