import path from 'path';
import gulp, { TaskFunction } from 'gulp';
import gulpAdd from 'gulp-add';

import { DependencyMap } from '../model/dependency-map';
import { BrowserBundleFormat } from '../model/browser-bundle-format';
import { NodeBundleFormat } from '../model/node-bundle-format';
import { BuildMode } from '../model/build-mode';
import { PackerOptions } from '../model/packer-options';
import { PackageConfig } from '../model/package-config';

import gulpHbsRuntime from '../plugins/gulp-hbs-runtime';
import { Logger } from '../common/logger';
import { parseLicenseType } from './parser';
import { TestEnvironment } from '../model/test-environment';

/**
 * Parse package dependency map mode.
 * @param packerOptions Packer options object.
 */
export const parseDependencyMapMode = (packerOptions: PackerOptions): DependencyMap => {
  if (packerOptions.cliProject) {
    return 'map-dependency';
  }

  return 'cross-map-peer-dependency';
};

/**
 * Parse package bundle format.
 * @param packerOptions Packer options object.
 */
export const parseBundleFormat = (packerOptions: PackerOptions): NodeBundleFormat | BrowserBundleFormat => {
  if (packerOptions.browserCompliant) {
    return packerOptions.bundleFormat || 'umd';
  }

  return 'cjs';
};

/**
 * Generate and copy packer configuration file.
 * @param packerOptions Packer options object.
 * @param scriptExt Script file extension.
 * @param buildMode Package build mode.
 * @param testEnvironment Test environment type.
 * @param projectDir Project root directory.
 */
export const copyPackerConfig = (
  packerOptions: PackerOptions,
  scriptExt: string,
  buildMode: BuildMode,
  testEnvironment: TestEnvironment,
  projectDir: string
): TaskFunction => {
  const entryFile = `index.${scriptExt}`;
  const mapMode = parseDependencyMapMode(packerOptions);
  const bundleFormat = parseBundleFormat(packerOptions);
  const packerTemplatePath = path.join(__dirname, '../resources/dynamic/.packerrc.js.hbs');

  return () => {
    return gulp
      .src([packerTemplatePath])
      .pipe(
        gulpHbsRuntime(
          {
            entry: entryFile,
            buildMode,
            scriptPreprocessor: packerOptions.scriptPreprocessor,
            styleSupport: packerOptions.styleSupport,
            inlineStyle: packerOptions.bundleStyles,
            stylePreprocessor: packerOptions.stylePreprocessor,
            isMocha: packerOptions.testFramework === 'mocha',
            isReactLib: packerOptions.reactLib,
            bundleFormat,
            namespace: packerOptions.namespace,
            amdId: packerOptions.amdId,
            testFramework: packerOptions.testFramework,
            testEnvironment,
            serveSupport: packerOptions.browserCompliant,
            dependencyMapMode: mapMode
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
 * Copy license file.
 * @param packerOptions Packer options object.
 * @param projectDir Project root directory.
 * @param log Logger reference.
 */
export const licenseCopy = (packerOptions: PackerOptions, projectDir: string, log: Logger): TaskFunction => {
  log.trace('copy license file');
  const license = parseLicenseType(packerOptions.license);
  const licenseFilePath = path.join(__dirname, '../resources/dynamic/license', `${license}.hbs`);
  log.trace('license file path: %s', licenseFilePath);

  const templateData = {
    year: packerOptions.year,
    author: packerOptions.author
  };
  log.trace('template data: %o', templateData);

  return () => {
    return gulp
      .src([licenseFilePath])
      .on('error', (e) => {
        log.error('missing license file template: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(
        gulpHbsRuntime(templateData, {
          rename: 'LICENSE'
        })
      )
      .pipe(gulp.dest(projectDir));
  };
};

/**
 * Copy readme.md file.
 * @param packageConfig Package configuration object.
 * @param projectDir Project root directory.
 * @param log Logger reference.
 */
export const copyReadme = (packageConfig: PackageConfig, projectDir: string, log: Logger): TaskFunction => {
  log.trace('copy base dynamic and static config');

  const templateData = {
    packageName: packageConfig.name,
    packageDescription: packageConfig.description
  };
  log.trace('template data: %o', templateData);

  return () => {
    return gulp
      .src([path.join(__dirname, '../resources/dynamic/README.md.hbs')])
      .on('error', (e) => {
        log.error('missing README.md template: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(
        gulpHbsRuntime(templateData, {
          replaceExt: ''
        })
      )
      .pipe(gulp.dest(projectDir));
  };
};

/**
 * Copy babel configuration.
 * @param packerOptions Packer options object.
 * @param buildMode Project build mode.
 * @param testEnvironment Test environment type.
 * @param projectDir Project root directory.
 * @param log Logger reference.
 */
export const copyBabelConfig = (
  packerOptions: PackerOptions,
  buildMode: BuildMode,
  testEnvironment: TestEnvironment,
  projectDir: string,
  log: Logger
): TaskFunction => {
  log.trace('copy babel config');
  const babelrc = path.join(__dirname, '../resources/dynamic/.babelrc.hbs');
  log.trace('babel config glob: %s', babelrc);

  const templateData = {
    browserCompliant: buildMode === 'browser',
    reactLib: packerOptions.reactLib,
    isBrowserEnvironment: testEnvironment === 'browser',
    cjsTestModule: packerOptions.testFramework === 'jasmine' || packerOptions.testFramework === 'mocha'
  };
  log.trace('template data: %o', templateData);

  return () => {
    return gulp
      .src([babelrc])
      .pipe(
        gulpHbsRuntime(templateData, {
          replaceExt: ''
        })
      )
      .pipe(gulp.dest(projectDir));
  };
};

/**
 * Copy gitignore file.
 * @param projectDir Project root directory.
 * @param log Logger reference.
 */
export const copyGitIgnore = (projectDir: string, log: Logger): TaskFunction => {
  log.trace('copy gitignore');
  const gitignore = path.join(__dirname, '../resources/dynamic/.gitignore.hbs');
  log.trace('.gitignore.hbs path: %s', gitignore);

  return () => {
    return gulp
      .src([gitignore])
      .on('error', (e) => {
        log.error('missing .gitignore template: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(
        gulpHbsRuntime(
          {},
          {
            replaceExt: ''
          }
        )
      )
      .pipe(gulp.dest(projectDir));
  };
};

/**
 * Copy packer asset (banner.hbs and bin.hbs) files.
 * @param projectDir Project root directory.
 * @param log Logger reference.
 */
export const copyPackerAssets = (projectDir: string, log: Logger): TaskFunction => {
  log.trace('copy packer assets');
  const banner = path.join(__dirname, '../resources/dynamic/packer/banner.hbs');
  log.trace('banner template path: %s', banner);

  const bin = path.join(__dirname, '../resources/dynamic/packer/bin.hbs');
  log.trace('bin template path: %s', bin);

  return () => {
    return gulp
      .src([banner, bin])
      .on('error', (e) => {
        log.error('missing packer asset: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(gulp.dest(path.join(projectDir, '.packer')));
  };
};

/**
 * Copy typescript configuration tsconfig.json and tslint.json files.
 * @param projectDir Project root directory.
 * @param log Logger reference.
 */
export const copyTypescriptConfig = (projectDir: string, log: Logger): TaskFunction => {
  const tsconfig = path.join(__dirname, '../resources/static/tsconfig.json');
  log.trace('tsconfig.json path: %s', tsconfig);

  const tslint = path.join(__dirname, '../resources/static/tslint.json');
  log.trace('tslint.json path: %s', tslint);

  return () => {
    return gulp
      .src([tsconfig, tslint])
      .on('error', (e) => {
        log.error('missing config file: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(gulp.dest(projectDir));
  };
};

/**
 * Copy postcss configuration file.
 * @param projectDir Project root directory.
 * @param log Logger reference.
 */
export const copyPostCssConfig = (projectDir: string, log: Logger): TaskFunction => {
  const postCss = path.join(__dirname, '../resources/static/postcss.config.js');
  log.trace('karma.conf.js path: %s', postCss);

  return () => {
    return gulp
      .src([postCss])
      .on('error', (e) => {
        log.error('missing config file: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(gulp.dest(projectDir));
  };
};

/**
 * Copy ESLint configuration file.
 * @param projectDir Project root directory.
 * @param log Logger reference.
 */
export const copyEsLintConfig = (projectDir: string, log: Logger): TaskFunction => {
  const eslintrc = path.join(__dirname, '../resources/static/.eslintrc.yml');
  log.trace('eslintrc.yml path: %s', eslintrc);

  return () => {
    return gulp
      .src([eslintrc])
      .on('error', (e) => {
        log.error('missing config file: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(gulp.dest(projectDir));
  };
};

/**
 * Copy style lint configuration file.
 * @param projectDir Project root directory.
 * @param log Logger reference.
 */
export const copyStyleLintConfig = (projectDir: string, log: Logger): TaskFunction => {
  const styleLintrc = path.join(__dirname, '../resources/static/.stylelintrc.json');
  log.trace('.stylelintrc.json path: %s', styleLintrc);

  return () => {
    return gulp
      .src([styleLintrc])
      .on('error', (e) => {
        log.error('missing config file: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(gulp.dest(projectDir));
  };
};

/**
 * Copy common configuration (package.json, .editorconfig and travis.yml) files
 * @param packageConfig Package configuration object.
 * @param projectDir Project root directory.
 * @param log Logger reference.
 */
export const copyCommonConfig = (packageConfig: PackageConfig, projectDir: string, log: Logger): TaskFunction => {
  log.trace('copy base dynamic and static config');
  const editorConfig = path.join(__dirname, '../resources/static/.editorconfig');
  log.trace('.editorconfig path: %s', editorConfig);

  const travis = path.join(__dirname, '../resources/static/.travis.yml');
  log.trace('.travis.yml path: %s', travis);

  return () => {
    return gulp
      .src([editorConfig, travis])
      .on('error', (e) => {
        log.error('missing config file: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(gulpAdd('package.json', JSON.stringify(packageConfig, null, 2)))
      .pipe(gulp.dest(projectDir));
  };
};

/**
 * Copy prettier configuration file.
 * @param projectDir Project root directory.
 * @param log Logger reference.
 */
export const copyPrettierConfig = (projectDir: string, log: Logger): TaskFunction => {
  const prettierrc = path.join(__dirname, '../resources/static/.prettierrc');
  const prettierignore = path.join(__dirname, '../resources/static/.prettierignore');
  log.trace('.prettierrc path: %s', prettierrc);
  log.trace('.prettierignore path: %s', prettierignore);

  return () => {
    return gulp
      .src([prettierrc, prettierignore])
      .on('error', (e) => {
        log.error('missing config file: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(gulp.dest(projectDir));
  };
};

/**
 * Get project configuration file generation gulp tasks.
 * @param packerOptions Packer configuration object.
 * @param packageConfig Package configuration object.
 * @param buildMode Project build mode.
 * @param scriptExt Script file extension.
 * @param testEnvironment Test environment type.
 * @param projectDir Project root directory.
 * @param log Logger reference.
 */
export const getConfigFileGenerateTasks = (
  packerOptions: PackerOptions,
  packageConfig: PackageConfig,
  buildMode: BuildMode,
  scriptExt: string,
  testEnvironment: TestEnvironment,
  projectDir: string,
  log: Logger
): TaskFunction[] => {
  const tasks: TaskFunction[] = [];

  if (packerOptions.scriptPreprocessor === 'typescript') {
    tasks.push(copyTypescriptConfig(projectDir, log));
  } else {
    tasks.push(copyEsLintConfig(projectDir, log));
  }

  if (packerOptions.styleSupport) {
    tasks.push(copyPostCssConfig(projectDir, log));
    tasks.push(copyStyleLintConfig(projectDir, log));
  }

  tasks.push(licenseCopy(packerOptions, projectDir, log));
  tasks.push(copyReadme(packageConfig, projectDir, log));
  tasks.push(copyBabelConfig(packerOptions, buildMode, testEnvironment, projectDir, log));
  tasks.push(copyGitIgnore(projectDir, log));
  tasks.push(copyPackerAssets(projectDir, log));
  tasks.push(copyCommonConfig(packageConfig, projectDir, log));
  tasks.push(copyPackerConfig(packerOptions, scriptExt, buildMode, testEnvironment, projectDir));
  tasks.push(copyPrettierConfig(projectDir, log));

  return tasks;
};
