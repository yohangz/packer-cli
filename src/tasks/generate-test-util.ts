import path from 'path';
import gulp, { TaskFunction } from 'gulp';

import gulpHbsRuntime from '../plugins/gulp-hbs-runtime';
import { Logger } from '../common/logger';

import { PackerOptions } from '../model/packer-options';

/**
 * Copy jasmine configuration file.
 * @param packerOptions - Packer options object.
 * @param projectDir - Project root directory.
 * @param log - Logger reference.
 */
export const copyJasmineConfig = (packerOptions: PackerOptions, projectDir: string, log: Logger): TaskFunction =>  {
  const jasmine = path.join(__dirname, '../resources/dynamic/jasmine.json.hbs');
  log.trace('jasmine.json path: %s', jasmine);

  return () => {
    return gulp.src([
      jasmine
    ])
      .on('error', (e) => {
        log.error('missing config file: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(gulpHbsRuntime({
        isTypescript: packerOptions.scriptPreprocessor === 'typescript',
        isReactLib: packerOptions.reactLib,
        useJsDom: packerOptions.testEnvironment
      }, {
        replaceExt: ''
      }))
      .pipe(gulp.dest(projectDir));
  };
};

/**
 * Copy jasmine helper script files.
 * @param projectDir - Project root directory.
 * @param log - Logger reference.
 */
export const copyJasmineHelpers = (projectDir: string, log: Logger): TaskFunction =>  {
  const helpersGlob = path.join(__dirname, '../resources/dynamic/example/test/jasmine/helpers/**/*');
  log.trace('jasmine helpers path glob: %s', helpersGlob);

  return () => {
    return gulp.src([
      helpersGlob
    ])
      .on('error', (e) => {
        log.error('missing config file: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(gulp.dest(path.join(projectDir, 'helpers')));
  };
};

/**
 * Copy jasmine test spec files.
 * @param scriptExt - Script file extension.
 * @param projectDir - Project root directory.
 * @param log - Logger reference.
 */
export const copyJasmineSpec = (scriptExt: string, projectDir: string, log: Logger): TaskFunction =>  {
  const specGlob = path.join(__dirname, '../resources/dynamic/example/test/jasmine', scriptExt, 'spec/**/*');
  log.trace('jasmine spec path glob: %s', specGlob);

  return () => {
    return gulp.src([
      specGlob
    ])
      .on('error', (e) => {
        log.error('missing config file: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(gulp.dest(path.join(projectDir, 'spec')));
  };
};

/**
 * Copy jasmine configuration file.
 * @param packerOptions - Packer options object.
 * @param projectDir - Project root directory.
 * @param log - Logger reference.
 */
export const copyMochaConfig = (packerOptions: PackerOptions, projectDir: string, log: Logger): TaskFunction =>  {
  const mocha = path.join(__dirname, '../resources/dynamic/mocha.opts.hbs');
  log.trace('mocha.opts path: %s', mocha);

  return () => {
    return gulp.src([
      mocha
    ])
      .on('error', (e) => {
        log.error('missing config file: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(gulpHbsRuntime({
        isTypescript: packerOptions.scriptPreprocessor === 'typescript',
        isReactLib: packerOptions.reactLib,
        useJsDom: packerOptions.testEnvironment
      }, {
        replaceExt: ''
      }))
      .pipe(gulp.dest(projectDir));
  };
};

/**
 * Copy mocha helper script files. Used as mocha require scripts.
 * @param projectDir - Project root directory.
 * @param log - Logger reference.
 */
export const copyMochaHelpers = (projectDir: string, log: Logger): TaskFunction =>  {
  const helpersGlob = path.join(__dirname, '../resources/dynamic/example/test/mocha/helpers/**/*');
  log.trace('mocha helpers path glob: %s', helpersGlob);

  return () => {
    return gulp.src([
      helpersGlob
    ])
      .on('error', (e) => {
        log.error('missing config file: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(gulp.dest(path.join(projectDir, 'helpers')));
  };
};

/**
 * Copy mocha test spec files.
 * @param scriptExt - Script file extension.
 * @param projectDir - Project root directory.
 * @param log - Logger reference.
 */
export const copyMochaTestSpec = (scriptExt: string, projectDir: string, log: Logger): TaskFunction =>  {
  const testGlob = path.join(__dirname, '../resources/dynamic/example/test/mocha', scriptExt, 'test/**/*');
  log.trace('mocha test spec path glob: %s', testGlob);

  return () => {
    return gulp.src([
      testGlob
    ])
      .on('error', (e) => {
        log.error('missing config file: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(gulp.dest(path.join(projectDir, 'test')));
  };
};

/**
 * Copy jest configuration file.
 * @param packerOptions - Packer options object.
 * @param projectDir - Project root directory.
 * @param log - Logger reference.
 */
export const copyJestConfig = (packerOptions: PackerOptions, projectDir: string, log: Logger): TaskFunction =>  {
  const jest = path.join(__dirname, '../resources/dynamic/jest.config.js.hbs');
  log.trace('jest.config.js path: %s', jest);

  return () => {
    return gulp.src([
      jest
    ])
      .on('error', (e) => {
        log.error('missing config file: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(gulpHbsRuntime({
        isTypescript: packerOptions.scriptPreprocessor === 'typescript',
        testEnvironment: packerOptions.testEnvironment
      }, {
        replaceExt: ''
      }))
      .pipe(gulp.dest(projectDir));
  };
};

/**
 * Copy jest mock scripts.
 * @param projectDir - Project root directory.
 * @param log - Logger reference.
 */
export const copyJestMockScripts = (projectDir: string, log: Logger): TaskFunction =>  {
  const mockScriptGlob = path.join(__dirname, '../resources/dynamic/example/test/jest/__mocks__/**/*');
  log.trace('mock script glob bath: %s', mockScriptGlob);

  return () => {
    return gulp.src([
      mockScriptGlob
    ])
      .on('error', (e) => {
        log.error('missing config file: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(gulp.dest(path.join(projectDir, '__mocks__')));
  };
};

/**
 * Copy jest test files.
 * @param scriptExt - Script file extension.
 * @param projectDir - Project root directory.
 * @param log - Logger reference.
 */
export const copyJestTests = (scriptExt: string, projectDir: string, log: Logger): TaskFunction =>  {
  const testsGlob = path.join(__dirname, '../resources/dynamic/example/test/jest', scriptExt, '__tests_/**/*');
  log.trace('mocha tests path glob: %s', testsGlob);

  return () => {
    return gulp.src([
      testsGlob
    ])
      .on('error', (e) => {
        log.error('missing config file: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(gulp.dest(path.join(projectDir, '__tests__')));
  };
};

/**
 * Copy karma helper script files. Used in spec files.
 * @param projectDir - Project root directory.
 * @param log - Logger reference.
 */
export const copyKarmaHelpers = (projectDir: string, log: Logger): TaskFunction =>  {
  const helpersGlob = path.join(__dirname, '../resources/dynamic/example/test/karma/helpers/**/*');
  log.trace('karma helpers path glob: %s', helpersGlob);

  return () => {
    return gulp.src([
      helpersGlob
    ])
      .on('error', (e) => {
        log.error('missing config file: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(gulp.dest(path.join(projectDir, 'helpers')));
  };
};

/**
 * Copy test typescript configuration (tsconfig.test.json) file.
 * @param projectDir - Project root directory.
 * @param log - Logger reference.
 */
export const copyTestTypescriptConfig = (projectDir: string, log: Logger): TaskFunction =>  {
  const tsconfig = path.join(__dirname, '../resources/static/tsconfig.test.json');
  log.trace('tsconfig.test.json path: %s', tsconfig);

  return () => {
    return gulp.src([
      tsconfig
    ])
      .on('error', (e) => {
        log.error('missing config file: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(gulp.dest(projectDir));
  };
};

/**
 * Copy karma configuration (karma.conf.js) file.
 * @param projectDir - Project root directory.
 * @param log - Logger reference.
 */
export const copyKarmaConfig = (projectDir: string, log: Logger): TaskFunction =>  {
  const karma = path.join(__dirname, '../resources/static/karma.conf.js');
  log.trace('karma.conf.js path: %s', karma);

  return () => {
    return gulp.src([
      karma
    ])
      .on('error', (e) => {
        log.error('missing config file: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(gulp.dest(projectDir));
  };
};

/**
 * Get test specification generator gulp task functions.
 * @param packerOptions - Packer options object.
 * @param scriptExt - Script file extension.
 * @param log - Logger reference.
 * @param projectDir - Project root directory.
 * @param log - Logger reference.
 */
export const getTestSpecGeneratorTasks = (packerOptions: PackerOptions, scriptExt: string, projectDir: string,
                                          log: Logger): TaskFunction[] => {
  const tasks: TaskFunction[] = [];

  if (packerOptions.testEnvironment === 'browser') {
    if (packerOptions.testFramework === 'jasmine' || packerOptions.testFramework === 'mocha') {
      tasks.push(copyKarmaConfig(projectDir, log));

      if (packerOptions.reactLib) {
        tasks.push(copyKarmaHelpers(projectDir, log));
      }
    }
  } else {
    if (packerOptions.testFramework === 'jasmine' || packerOptions.testFramework === 'mocha') {
      tasks.push(copyTestTypescriptConfig(projectDir, log));
    }

    if (packerOptions.testFramework === 'jasmine') {
      tasks.push(copyJasmineConfig(packerOptions, projectDir, log));
      tasks.push(copyJasmineHelpers(projectDir, log));
    }

    if (packerOptions.testFramework === 'mocha') {
      tasks.push(copyMochaConfig(packerOptions, projectDir, log));
      tasks.push(copyMochaHelpers(projectDir, log));
    }
  }

  if (packerOptions.testFramework === 'jasmine') {
    tasks.push(copyJasmineSpec(scriptExt, projectDir, log));
  }

  if (packerOptions.testFramework === 'mocha') {
    tasks.push(copyMochaTestSpec(scriptExt, projectDir, log));
  }

  if (packerOptions.testFramework === 'jest') {
    tasks.push(copyJestConfig(packerOptions, projectDir, log));
    tasks.push(copyJestMockScripts(projectDir, log));
    tasks.push(copyJestTests(scriptExt, projectDir, log));
  }

  return tasks;
};
