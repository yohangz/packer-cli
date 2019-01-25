import * as path from 'path';
import gulp, { TaskFunction } from 'gulp';

import gulpHbsRuntime from '../plugins/gulp-hbs-runtime';

import { Logger } from '../common/logger';

import { PackerOptions } from '../model/packer-options';
import { BuildMode } from '../model/build-mode';

/**
 * Copy example style sheets.
 * @param styleExt Style sheet extension.
 * @param projectDir Project root directory.
 * @param log Logger reference.
 */
export const copyExampleStyleSheets = (styleExt: string, projectDir: string, log: Logger): TaskFunction => {
  log.trace('copy styles');

  const styleGlob = path.join(__dirname, '../resources/dynamic/example/common/style', `**/*.${styleExt}`);
  log.trace('style glob: %s', styleGlob);

  return () => {
    return gulp.src([styleGlob]).pipe(gulp.dest(path.join(projectDir, 'src/style')));
  };
};

/**
 * Copy example handlebars templates.
 * @param project DirProject root directory.
 * @param log Logger reference.
 */
export const copyExampleTemplates = (projectDir: string, log: Logger): TaskFunction => {
  log.trace('copy templates');

  const templatePath = path.join(__dirname, '../resources/dynamic/example/common/templates/**/*');
  log.trace('template path: %s', templatePath);

  return () => {
    return gulp.src([templatePath]).pipe(gulp.dest(path.join(projectDir, 'src/templates')));
  };
};

/**
 * Copy example assets.
 * @param projectDir Project root directory.
 * @param log Logger reference.
 */
export const copyExampleAsset = (projectDir: string, log: Logger): TaskFunction => {
  log.trace('copy assets');

  const assetsPath = path.join(__dirname, '../resources/dynamic/example/common/assets/**/*');
  log.trace('assets path: %s', assetsPath);

  return () => {
    return gulp.src([assetsPath]).pipe(gulp.dest(path.join(projectDir, 'src/assets')));
  };
};

/**
 * Copy example source.
 * @param packerOptions Packer options object.
 * @param buildMode Package build mode.
 * @param scriptExt Script file extension.
 * @param styleExt Style sheet extension.
 * @param projectDir Project root directory.
 * @param log Logger reference.
 */
export const copyExampleSource = (
  packerOptions: PackerOptions,
  buildMode: BuildMode,
  scriptExt: string,
  styleExt: string,
  projectDir: string,
  log: Logger
): TaskFunction => {
  log.trace('copy source');

  const fileExtensions = [scriptExt, 'hbs'];
  if (packerOptions.reactLib) {
    fileExtensions.push(`${scriptExt}x`);
  }

  const exampleGlob = path.join(
    __dirname,
    '../resources/dynamic/example',
    scriptExt,
    `**/*.{${fileExtensions.join(',')}}`
  );
  log.trace('example glob: %s', exampleGlob);

  const templateData = {
    styleExt,
    styleSupport: packerOptions.styleSupport,
    cliProject: buildMode === 'node-cli',
    reactLib: packerOptions.reactLib,
    jasmineEnzyme: packerOptions.useEnzyme && packerOptions.testFramework === 'jasmine'
  };
  log.trace('template data: %o', templateData);

  return () => {
    return gulp
      .src([exampleGlob])
      .pipe(
        gulpHbsRuntime(templateData, {
          replaceExt: ''
        })
      )
      .pipe(gulp.dest(path.join(projectDir, 'src')));
  };
};

/**
 * Get example source generation gulp tasks.
 * @param packerOptions Packer options object.
 * @param styleExt Style sheet file extension.
 * @param scriptExt Script file extension.
 * @param buildMode Project build mode.
 * @param projectDir Project root directory.
 * @param log Logger reference.
 */
export const getExampleSourceGenerationsTasks = (
  packerOptions: PackerOptions,
  styleExt: string,
  scriptExt: string,
  buildMode: BuildMode,
  projectDir: string,
  log: Logger
): TaskFunction[] => {
  const tasks: TaskFunction[] = [
    copyExampleAsset(projectDir, log),
    copyExampleSource(packerOptions, buildMode, scriptExt, styleExt, projectDir, log)
  ];

  if (!packerOptions.reactLib) {
    tasks.push(copyExampleTemplates(projectDir, log));
  }

  if (packerOptions.styleSupport) {
    tasks.push(copyExampleStyleSheets(styleExt, projectDir, log));
  }

  return tasks;
};
