import path from 'path';
import gulp, { TaskFunction } from 'gulp';

import gulpHbsRuntime from '../plugins/gulp-hbs-runtime';
import { Logger } from '../common/logger';

import { PackerOptions } from '../model/packer-options';
import { TestEnvironment } from '../model/test-environment';

/**
 * Parse script transpiler by preprocessor type and extract extension glob depending on enzyme support.
 * @param packerOptions Packer options object.
 * @param scriptExt Script file extension.
 */
export const parseSpecScriptExtension = (packerOptions: PackerOptions, scriptExt: string): string => {
  if (packerOptions.useEnzyme) {
    return `{${scriptExt},${scriptExt}x}`;
  } else {
    return scriptExt;
  }
};

/**
 * Copy jasmine configuration file.
 * @param packerOptions Packer options object.
 * @param testEnvironment Test environment type.
 * @param projectDir Project root directory.
 * @param log Logger reference.
 */
export const copyJasmineConfig = (
  packerOptions: PackerOptions,
  testEnvironment: TestEnvironment,
  projectDir: string,
  log: Logger
): TaskFunction => {
  const jasmine = path.join(__dirname, '../resources/dynamic/jasmine.json.hbs');
  log.trace('jasmine.json path: %s', jasmine);

  return () => {
    return gulp
      .src([jasmine])
      .on('error', (e) => {
        log.error('missing config file: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(
        gulpHbsRuntime(
          {
            isTypescript: packerOptions.scriptPreprocessor === 'typescript',
            useEnzyme: packerOptions.useEnzyme,
            useJsDom: testEnvironment === 'jsdom'
          },
          {
            replaceExt: ''
          }
        )
      )
      .pipe(gulp.dest(projectDir));
  };
};

/**
 * Copy jasmine helper script files.
 * @param projectDir Project root directory.
 * @param log Logger reference.
 */
export const copyJasmineHelpers = (projectDir: string, log: Logger): TaskFunction => {
  const helpersGlob = path.join(__dirname, '../resources/dynamic/example/test/jasmine/helpers/**/*');
  log.trace('jasmine helpers path glob: %s', helpersGlob);

  return () => {
    return gulp
      .src([helpersGlob])
      .on('error', (e) => {
        log.error('missing config file: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(gulp.dest(path.join(projectDir, 'helpers')));
  };
};

/**
 * Copy jasmine test spec files.
 * @param scriptGlob Script extension glob.
 * @param scriptExt Script file extension.
 * @param projectDir Project root directory.
 * @param log Logger reference.
 */
export const copyJasmineSpec = (
  scriptGlob: string,
  scriptExt: string,
  projectDir: string,
  log: Logger
): TaskFunction => {
  const specGlob = path.join(
    __dirname,
    '../resources/dynamic/example/test/jasmine',
    scriptExt,
    `spec/**/*.${scriptGlob}`
  );
  log.trace('jasmine spec path glob: %s', specGlob);

  return () => {
    return gulp
      .src([specGlob])
      .on('error', (e) => {
        log.error('missing config file: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(gulp.dest(path.join(projectDir, 'spec')));
  };
};

/**
 * Copy karma jasmine test spec files.
 * @param scriptGlob Script extension glob.
 * @param scriptExt Script file extension.
 * @param projectDir Project root directory.
 * @param log Logger reference.
 */
export const copyKarmaJasmineSpec = (
  scriptGlob: string,
  scriptExt: string,
  projectDir: string,
  log: Logger
): TaskFunction => {
  const specGlob = path.join(
    __dirname,
    '../resources/dynamic/example/test/karma/jasmine',
    scriptExt,
    `spec/**/*.${scriptGlob}`
  );
  log.trace('jasmine spec path glob: %s', specGlob);

  return () => {
    return gulp
      .src([specGlob])
      .on('error', (e) => {
        log.error('missing config file: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(gulp.dest(path.join(projectDir, 'spec')));
  };
};

/**
 * Copy jasmine configuration file.
 * @param packerOptions Packer options object.
 * @param testEnvironment Test environment type.
 * @param projectDir Project root directory.
 * @param log Logger reference.
 */
export const copyMochaConfig = (
  packerOptions: PackerOptions,
  testEnvironment: TestEnvironment,
  projectDir: string,
  log: Logger
): TaskFunction => {
  const mocha = path.join(__dirname, '../resources/dynamic/mocha.opts.hbs');
  log.trace('mocha.opts path: %s', mocha);

  return () => {
    return gulp
      .src([mocha])
      .on('error', (e) => {
        log.error('missing config file: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(
        gulpHbsRuntime(
          {
            isTypescript: packerOptions.scriptPreprocessor === 'typescript',
            useEnzyme: packerOptions.useEnzyme,
            useJsDom: testEnvironment === 'jsdom'
          },
          {
            replaceExt: ''
          }
        )
      )
      .pipe(gulp.dest(projectDir));
  };
};

/**
 * Copy mocha helper script files. Used as mocha require scripts.
 * @param projectDir Project root directory.
 * @param log Logger reference.
 */
export const copyMochaHelpers = (projectDir: string, log: Logger): TaskFunction => {
  const helpersGlob = path.join(__dirname, '../resources/dynamic/example/test/mocha/helpers/**/*');
  log.trace('mocha helpers path glob: %s', helpersGlob);

  return () => {
    return gulp
      .src([helpersGlob])
      .on('error', (e) => {
        log.error('missing config file: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(gulp.dest(path.join(projectDir, 'helpers')));
  };
};

/**
 * Copy mocha test spec files.
 * @param scriptGlob Script extension glob.
 * @param scriptExt Script file extension.
 * @param projectDir Project root directory.
 * @param log Logger reference.
 */
export const copyMochaTestSpec = (
  scriptGlob: string,
  scriptExt: string,
  projectDir: string,
  log: Logger
): TaskFunction => {
  const testGlob = path.join(
    __dirname,
    '../resources/dynamic/example/test/mocha',
    scriptExt,
    `test/**/*.${scriptGlob}`
  );
  log.trace('mocha test spec path glob: %s', testGlob);

  return () => {
    return gulp
      .src([testGlob])
      .on('error', (e) => {
        log.error('missing config file: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(gulp.dest(path.join(projectDir, 'test')));
  };
};

/**
 * Copy karma mocha test spec files.
 * @param scriptExt Script file extension.
 * @param projectDir Project root directory.
 * @param log Logger reference.
 */
export const copyKarmaMochaTestSpec = (scriptExt: string, projectDir: string, log: Logger): TaskFunction => {
  const testGlob = path.join(__dirname, '../resources/dynamic/example/test/karma/mocha', scriptExt, 'spec/**/*');
  log.trace('mocha test spec path glob: %s', testGlob);

  return () => {
    return gulp
      .src([testGlob])
      .on('error', (e) => {
        log.error('missing config file: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(gulp.dest(path.join(projectDir, 'test')));
  };
};

/**
 * Copy jest configuration file.
 * @param packerOptions Packer options object.
 * @param testEnvironment Test environment type.
 * @param projectDir Project root directory.
 * @param log Logger reference.
 */
export const copyJestConfig = (
  packerOptions: PackerOptions,
  testEnvironment: TestEnvironment,
  projectDir: string,
  log: Logger
): TaskFunction => {
  const jest = path.join(__dirname, '../resources/dynamic/jest.config.js.hbs');
  log.trace('jest.config.js path: %s', jest);

  return () => {
    return gulp
      .src([jest])
      .on('error', (e) => {
        log.error('missing config file: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(
        gulpHbsRuntime(
          {
            isTypescript: packerOptions.scriptPreprocessor === 'typescript',
            testEnvironment,
            useEnzyme: packerOptions.useEnzyme
          },
          {
            replaceExt: ''
          }
        )
      )
      .pipe(gulp.dest(projectDir));
  };
};

/**
 * Copy jest mock scripts.
 * @param projectDir Project root directory.
 * @param log Logger reference.
 */
export const copyJestMockScripts = (projectDir: string, log: Logger): TaskFunction => {
  const mockScriptGlob = path.join(__dirname, '../resources/dynamic/example/test/jest/__mocks__/**/*');
  log.trace('mock script glob bath: %s', mockScriptGlob);

  return () => {
    return gulp
      .src([mockScriptGlob])
      .on('error', (e) => {
        log.error('missing config file: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(gulp.dest(path.join(projectDir, '__mocks__')));
  };
};

/**
 * Copy jest test files.
 * @param scriptGlob Script extension glob.
 * @param scriptExt Script file extension.
 * @param projectDir Project root directory.
 * @param log Logger reference.
 */
export const copyJestTests = (scriptGlob: string, scriptExt: string, projectDir: string, log: Logger): TaskFunction => {
  const testsGlob = path.join(
    __dirname,
    '../resources/dynamic/example/test/jest',
    scriptExt,
    `__tests__/**/*.${scriptGlob}`
  );
  log.trace('jest tests path glob: %s', testsGlob);

  return () => {
    return gulp
      .src([testsGlob])
      .on('error', (e) => {
        log.error('missing config file: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(gulp.dest(path.join(projectDir, '__tests__')));
  };
};

/**
 * Copy test typescript configuration (tsconfig.test.json) file.
 * @param packerOptions Packer options object reference.
 * @param projectDir Project root directory.
 * @param log Logger reference.
 */
export const copyTestTypescriptConfig = (
  packerOptions: PackerOptions,
  projectDir: string,
  log: Logger
): TaskFunction => {
  const tsconfig = path.join(__dirname, '../resources/dynamic/tsconfig.test.json.hbs');
  log.trace('tsconfig.test.json.hbs path: %s', tsconfig);

  return () => {
    return gulp
      .src([tsconfig])
      .on('error', (e) => {
        log.error('missing config file: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(
        gulpHbsRuntime(
          {
            isJest: packerOptions.testFramework === 'jest'
          },
          {
            replaceExt: ''
          }
        )
      )
      .pipe(gulp.dest(projectDir));
  };
};

/**
 * Copy karma configuration (karma.conf.js) file.
 * @param projectDir Project root directory.
 * @param log Logger reference.
 */
export const copyKarmaConfig = (projectDir: string, log: Logger): TaskFunction => {
  const karma = path.join(__dirname, '../resources/static/karma.conf.js');
  log.trace('karma.conf.js path: %s', karma);

  return () => {
    return gulp
      .src([karma])
      .on('error', (e) => {
        log.error('missing config file: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(gulp.dest(projectDir));
  };
};

/**
 * Get test specification generator gulp task functions.
 * @param packerOptions Packer options object.
 * @param scriptExt Script file extension.
 * @param testEnvironment Test environment type.
 * @param projectDir Project root directory.
 * @param log Logger reference.
 */
export const getTestSpecGeneratorTasks = (
  packerOptions: PackerOptions,
  scriptExt: string,
  testEnvironment: TestEnvironment,
  projectDir: string,
  log: Logger
): TaskFunction[] => {
  const tasks: TaskFunction[] = [];
  const scriptGlob = parseSpecScriptExtension(packerOptions, scriptExt);

  if (packerOptions.testFramework === 'jest') {
    tasks.push(copyJestConfig(packerOptions, testEnvironment, projectDir, log));
    tasks.push(copyJestMockScripts(projectDir, log));
    tasks.push(copyJestTests(scriptGlob, scriptExt, projectDir, log));

    if (packerOptions.scriptPreprocessor === 'typescript') {
      tasks.push(copyTestTypescriptConfig(packerOptions, projectDir, log));
    }
  } else {
    if (testEnvironment === 'browser') {
      tasks.push(copyKarmaConfig(projectDir, log));

      if (packerOptions.testFramework === 'jasmine') {
        tasks.push(copyKarmaJasmineSpec(scriptGlob, scriptExt, projectDir, log));
      }

      if (packerOptions.testFramework === 'mocha') {
        tasks.push(copyKarmaMochaTestSpec(scriptExt, projectDir, log));
      }
    } else {
      if (packerOptions.scriptPreprocessor === 'typescript') {
        tasks.push(copyTestTypescriptConfig(packerOptions, projectDir, log));
      }

      if (packerOptions.testFramework === 'jasmine') {
        tasks.push(copyJasmineConfig(packerOptions, testEnvironment, projectDir, log));
        tasks.push(copyJasmineHelpers(projectDir, log));
        tasks.push(copyJasmineSpec(scriptGlob, scriptExt, projectDir, log));
      }

      if (packerOptions.testFramework === 'mocha') {
        tasks.push(copyMochaConfig(packerOptions, testEnvironment, projectDir, log));
        tasks.push(copyMochaHelpers(projectDir, log));
        tasks.push(copyMochaTestSpec(scriptGlob, scriptExt, projectDir, log));
      }
    }
  }

  return tasks;
};
