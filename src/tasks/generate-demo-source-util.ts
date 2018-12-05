import * as path from 'path';
import gulp, { TaskFunction } from 'gulp';

import gulpHbsRuntime from '../plugins/gulp-hbs-runtime';
import { Logger } from '../common/logger';

import { BuildMode } from '../model/build-mode';
import { PackerOptions } from '../model/packer-options';

/**
 * Copy demo helper require.js script.
 * @param projectDir - Project root directory.
 * @param log - Logger reference.
 */
export const copyDemoHelperRequireJs = (projectDir: string, log: Logger): TaskFunction => {
  log.trace('copy demo helper require.min.js');
  const srcPath = path.join(__dirname, '../resources/dynamic/demo/helper/require.min.js');
  log.trace('require.min.js path: %s', srcPath);
  return () => {
    return gulp.src([
      srcPath
    ])
      .on('error', (e) => {
        log.error('missing helper file: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(gulp.dest(path.join(projectDir, 'demo/helper')));
  };
};

/**
 * Copy demo helper system.js script.
 * @param projectDir - Project root directory.
 * @param log - Logger reference.
 */
export const copyDemoHelperSystemJs = (projectDir: string, log: Logger): TaskFunction => {
  log.trace('copy demo helper system.min.js');
  const srcPath = path.join(__dirname, '../resources/dynamic/demo/helper/system.min.js');
  log.trace('require.min.js path: %s', srcPath);
  return () => {
    return gulp.src([
      srcPath
    ])
      .on('error', (e) => {
        log.error('missing helper file: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(gulp.dest(path.join(projectDir, 'demo/helper')));
  };
};

/**
 * Copy demo source.
 * HTML entry files if browser compliant, else javascript files.
 * @param packerOptions - Packer options object.
 * @param buildMode - Project build mode.
 * @param packageName - Target package name.
 * @param projectDir - Project root directory.
 * @param log - Logger reference.
 */
export const copyDemoSource = (packerOptions: PackerOptions, buildMode: BuildMode, packageName: string,
                               projectDir: string, log: Logger): TaskFunction => {
  log.trace('copy demo resources');
  const isAmd = packerOptions.bundleFormat === 'amd';
  const isIife = packerOptions.bundleFormat === 'umd' || packerOptions.bundleFormat === 'iife';
  const isSystem = packerOptions.bundleFormat === 'system';
  const templateGlob = buildMode === 'browser' ? '*.html.hbs' : '*.js.hbs';
  const demoTemplateGlob = path.join(__dirname, '../resources/dynamic/demo/**', templateGlob);
  log.trace('demo template glob: %s', demoTemplateGlob);

  const templateData = {
    projectName: packageName,
    includeStyles: packerOptions.styleSupport && packerOptions.bundleStyles,
    namespace: packerOptions.namespace,
    watchDir: '.tmp/watch',
    distDir: 'dist',
    require: isAmd,
    iife: isIife,
    system: isSystem,
    format: packerOptions.bundleFormat,
    amdModule: packerOptions.amdId,
    reactLib: packerOptions.reactLib
  };
  log.trace('template data: %o', templateData);

  return () => {
    return gulp.src([
      demoTemplateGlob
    ])
      .pipe(gulpHbsRuntime(templateData, {
        replaceExt: ''
      }))
      .pipe(gulp.dest(path.join(projectDir, 'demo')));
  };
};

/**
 * Get demo source generation gulp tasks.
 * @param packerOptions - Packer options object.
 * @param buildMode - Project build mode.
 * @param packageName - Package configuration object.
 * @param projectDir - Project root directory.
 * @param log - Logger reference.
 */
export const getDemoSourceGenerationTasks = (packerOptions: PackerOptions, buildMode: BuildMode, packageName: string,
                                             projectDir: string, log: Logger): TaskFunction[] => {
  const tasks: TaskFunction[] = [];

  if (buildMode !== 'node-cli') {
    tasks.push(copyDemoSource(packerOptions, buildMode, packageName, projectDir, log));
  }

  if (buildMode === 'browser') {
    if (packerOptions.bundleFormat === 'system') {
      tasks.push(copyDemoHelperSystemJs(projectDir, log));
    }

    if (packerOptions.bundleFormat === 'amd') {
      tasks.push(copyDemoHelperRequireJs(projectDir, log));
    }
  }

  return tasks;
};
