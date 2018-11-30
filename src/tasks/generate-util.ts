import { meta } from './meta';
import path from 'path';
import gulp from 'gulp';
import gulpFile from 'gulp-file';
import { TaskFunction } from 'undertaker';

import { DependencyMap } from '../model/dependency-map';
import { BrowserBundleFormat } from '../model/browser-bundle-format';
import { NodeBundleFormat } from '../model/node-bundle-format';
import { BuildMode } from '../model/build-mode';
import { PackerOptions } from '../model/packer-options';
import { PackageConfig } from '../model/package-config';

import gulpHbsRuntime from '../plugins/gulp-hbs-runtime';
import { Logger } from '../common/logger';
import {
  parseScriptPreprocessorExtension,
  parseLicenseType,
  parseStylePreprocessorExtension
} from './parser';

/**
 * Parse package dependency map mode.
 * @param packerOptions - Packer options object.
 */
export const parseDependencyMapMode = (packerOptions: PackerOptions): DependencyMap => {
  if (packerOptions.cliProject) {
    return 'map-dependency';
  }

  return 'cross-map-peer-dependency';
};

/**
 * Parse package build mode.
 * @param packerOptions - Packer options object.
 */
export const parseBuildMode = (packerOptions: PackerOptions): BuildMode => {
  if (packerOptions.browserCompliant) {
    return 'browser';
  } else if (packerOptions.cliProject) {
    return 'node-cli';
  }

  return 'node';
};

/**
 * Parse package bundle format.
 * @param packerOptions - Packer options object.
 */
export const parseBundleFormat = (packerOptions: PackerOptions): NodeBundleFormat | BrowserBundleFormat => {
  if (packerOptions.browserCompliant) {
    return packerOptions.bundleFormat || 'umd';
  }

  return 'cjs';
};

/**
 * Get package.json configuration.
 * @param packerOptions - Packer options object.
 * @param packageName - Package name.
 */
export const getPackageConfig = (packerOptions: PackerOptions, packageName: string): PackageConfig => {
  const cliPackageData = meta.readCLIPackageData();

  let projectAuthor = '';
  if (packerOptions.author) {
    projectAuthor = packerOptions.author;

    if (packerOptions.email) {
      projectAuthor += ` <${packerOptions.email}>`;
    }
  }

  let projectUrl = '';
  let projectRepository = '';
  if (packerOptions.githubUsername) {
    projectUrl = `https://github.com/${packerOptions.githubUsername}/${packageName}`;
    projectRepository = `${projectUrl}.git`;
  }

  const packageConfig: PackageConfig = {
    name: packageName,
    version: '1.0.0',
    description: packerOptions.description || '',
    keywords: String(packerOptions.keywords || '').split(','),
    scripts: {
      'build': 'packer build',
      'watch': 'packer watch',
      'start': 'npm run watch',
      'test': 'packer test --watch',
      'test:coverage': 'packer test --coverage --watch',
      'test:ci': 'packer test',
      'test:coverage:ci': 'packer test --coverage',
      'clean': 'packer clean',
      'preversion': 'npm run build',
      'postversion': 'git push && git push --tags',
      'prerelease': 'npm run build',
      'release': 'npm publish dist',
      'lint': 'packer lint',
      'lint:script': 'packer lint --script'
    },
    author: projectAuthor,
    repository: projectRepository,
    license: parseLicenseType(packerOptions.license),
    homepage: packerOptions.website || projectUrl,
    dependencies: {},
    devDependencies: {},
    private: false
  };

  let dependencies = {
    '@babel/runtime-corejs2': '^7.1.5'
  };

  let devDependencies = {};

  devDependencies = Object.assign({
    '@babel/polyfill': '^7.0.0',
    '@babel/preset-env': '^7.1.0',
    '@babel/register': '^7.0.0',
    '@babel/plugin-transform-runtime': '^7.1.0'
  }, devDependencies);

  if (packerOptions.reactLib) {
    devDependencies = Object.assign({
      '@babel/preset-react': '^7.0.0'
    }, devDependencies);

    dependencies =  Object.assign({
      'react': '^16.6.3',
      'react-dom': '^16.6.3'
    }, dependencies);
  } else {
    dependencies =  Object.assign({
      handlebars: '^4.0.12'
    }, dependencies);
  }

  if (packerOptions.scriptPreprocessor === 'typescript') {
    dependencies =  Object.assign({
      tslib: '^1.9.3'
    }, dependencies);

    devDependencies = Object.assign({
      typescript: '^3.1.6',
      tslint: '^5.11.0'
    }, devDependencies);

    if (packerOptions.reactLib) {
      devDependencies = Object.assign({
        '@types/react': '^16.7.6',
        '@types/react-dom': '^16.0.9',
      }, devDependencies);
    }
  } else {
    devDependencies = Object.assign({
      'eslint': '^5.9.0',
      'eslint-config-standard': '^12.0.0',
      'eslint-plugin-import': '^2.10.0',
      'eslint-plugin-node': '^8.0.0',
      'eslint-plugin-promise': '^4.0.1',
      'eslint-plugin-standard': '^4.0.0'
    }, devDependencies);
  }

  if (packerOptions.testFramework === 'jest') {
    devDependencies = Object.assign({
      jest: '^23.6.0'
    }, devDependencies);

    if (packerOptions.scriptPreprocessor === 'typescript') {
      devDependencies = Object.assign({
        '@types/jest': '^23.3.9',
        'ts-jest': '^23.10.5'
      }, devDependencies);
    } else if (packerOptions.scriptPreprocessor === 'none') {
      devDependencies = Object.assign({
        'babel-jest': '^23.6.0'
      }, devDependencies);
    }
  }

  if (packerOptions.testFramework === 'jasmine') {
    if (packerOptions.scriptPreprocessor === 'typescript') {
      devDependencies = Object.assign({
        '@types/jasmine': '^3.3.0'
      }, devDependencies);

      if (packerOptions.testEnvironment !== 'browser') {
        devDependencies = Object.assign({
          'ts-node': '^7.0.1'
        }, devDependencies);
      }
    }

    if (packerOptions.testEnvironment === 'browser') {
      devDependencies = Object.assign({
        'puppeteer': '^1.10.0',
        'karma': '^3.1.1',
        'karma-chrome-launcher': '^2.2.0',
        'karma-coverage': '^1.1.2',
        'jasmine-core': '^3.3.0',
        'karma-jasmine': '^2.0.1',
        'karma-jasmine-html-reporter': '^1.4.0'
      }, devDependencies);
    } else {
      packageConfig.nyc = {
        'reporter': [
          'lcov',
          'text-summary',
          'html'
        ],
        'temp-dir': '.tmp/nyc_output'
      };

      devDependencies = Object.assign({
        'jasmine': '^3.3.0',
        'nyc': '^13.1.0',
        'ignore-styles': '^5.0.1',
      }, devDependencies);

      if (packerOptions.testEnvironment === 'jsdom') {
        devDependencies = Object.assign({
          jsdom: '^13.0.0',
        }, devDependencies);
      }
    }
  }

  if (packerOptions.testFramework === 'mocha') {
    if (packerOptions.scriptPreprocessor === 'typescript') {
      devDependencies = Object.assign({
        '@types/chai': '^4.1.7',
        '@types/mocha': '^5.2.5'
      }, devDependencies);

      if (packerOptions.testEnvironment !== 'browser') {
        devDependencies = Object.assign({
          'ts-node': '^7.0.1'
        }, devDependencies);
      }
    }

    if (packerOptions.testEnvironment === 'browser') {
      devDependencies = Object.assign({
        'puppeteer': '^1.10.0',
        'karma': '^3.1.1',
        'karma-chrome-launcher': '^2.2.0',
        'karma-coverage': '^1.1.2',
        'karma-mocha': '^1.3.0',
        'mocha': '^5.2.0',
        'chai': '^4.2.0',
      }, devDependencies);
    } else {
      packageConfig.nyc = {
        'reporter': [
          'lcov',
          'text-summary',
          'html'
        ],
        'temp-dir': '.tmp/nyc_output'
      };

      devDependencies = Object.assign({
        'mocha': '^5.2.0',
        'chai': '^4.2.0',
        'nyc': '^13.1.0',
        'ignore-styles': '^5.0.1'
      }, devDependencies);

      if (packerOptions.testEnvironment === 'jsdom') {
        devDependencies = Object.assign({
          jsdom: '^13.0.0',
        }, devDependencies);
      }

      if (packerOptions.reactLib) {
        devDependencies = Object.assign({
          'enzyme': '^3.7.0', // todo: add version
          'chai-enzyme': '^1.0.0-beta.1',
          'enzyme-adapter-react-16': '^7.0.1'
        }, devDependencies);
      }
    }
  }

  if (packerOptions.styleSupport) {
    packageConfig.scripts['lint:style'] = 'packer lint --style';

    devDependencies = Object.assign({
      'stylelint': '^9.8.0',
      'stylelint-config-standard': '^18.2.0',
      'autoprefixer': '^8.6.3',
      'postcss-url': '^8.0.0',
      'cssnano': '^4.1.7'
    }, devDependencies);

    if (packerOptions.stylePreprocessor === 'scss' || packerOptions.stylePreprocessor === 'sass') {
      devDependencies = Object.assign({
        'node-sass': '^4.9.3'
      }, devDependencies);
    }

    if (packerOptions.stylePreprocessor === 'less') {
      devDependencies = Object.assign({
        less: '^3.8.1'
      }, devDependencies);
    }

    if (packerOptions.stylePreprocessor === 'stylus') {
      devDependencies = Object.assign({
        stylus: '^0.54.5'
      }, devDependencies);
    }
  }

  devDependencies[cliPackageData.name] = `^${cliPackageData.version}`;

  packageConfig.dependencies = dependencies;
  packageConfig.devDependencies = devDependencies;
  if (packerOptions.cliProject) {
    packageConfig.bin = {
      [packageName]: path.join('bin', `${packageConfig.name}.js`)
    };
  }

  return packageConfig;
};

/**
 * Generate and copy packer configuration file.
 * @param packerOptions - Packer options object.
 * @param buildMode - Package build mode.
 * @param projectDir - Project root directory.
 */
export const copyPackerConfig = (packerOptions: PackerOptions, buildMode: BuildMode,
                                 projectDir: string): TaskFunction => {
  const entryFile = 'index.' + parseScriptPreprocessorExtension(packerOptions.scriptPreprocessor);
  const mapMode = parseDependencyMapMode(packerOptions);
  const bundleFormat = parseBundleFormat(packerOptions);
  const packerTemplatePath = path.join(__dirname, '../resources/dynamic/.packerrc.js.hbs');

  return () => {
    return gulp.src([
      packerTemplatePath
    ])
      .pipe(gulpHbsRuntime({
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
        testEnvironment: packerOptions.testEnvironment || 'node',
        serveSupport: packerOptions.browserCompliant,
        dependencyMapMode: mapMode
      }, {
        replaceExt: ''
      }))
      .pipe(gulp.dest(projectDir));
  };
};

/**
 * Copy example style sheets.
 * @param styleExt - Style sheet extension.
 * @param projectDir - Project root directory.
 * @param log - Logger reference.
 */
export const copyExampleStyleSheets = (styleExt: string, projectDir: string, log: Logger): TaskFunction => {
  log.trace('copy styles');

  const styleGlob = path.join(__dirname, '../resources/dynamic/example/common/style', `**/*.${styleExt}`);
  log.trace('style glob: %s', styleGlob);

  return () => {
    return gulp.src([
      styleGlob
    ])
      .pipe(gulp.dest(path.join(projectDir, 'src/style')));
  };
};

/**
 * Copy example handlebars templates.
 * @param projectDir - Project root directory.
 * @param log -  Logger reference.
 */
export const copyExampleTemplates = (projectDir: string, log: Logger): TaskFunction => {
  log.trace('copy templates');

  const templatePath = path.join(__dirname, '../resources/dynamic/example/common/templates/**/*');
  log.trace('template path: %s', templatePath);

  return () => {
    return gulp.src([
      templatePath
    ])
      .pipe(gulp.dest(path.join(projectDir, 'src/templates')));
  };
};

/**
 * Copy example assets.
 * @param projectDir - Project root directory.
 * @param log - Logger reference.
 */
export const copyExampleAsset = (projectDir: string, log: Logger): TaskFunction => {
  log.trace('copy assets');

  const assetsPath  = path.join(__dirname, '../resources/dynamic/example/common/assets/**/*');
  log.trace('assets path: %s', assetsPath);

  return () => {
    return gulp.src([
      assetsPath
    ])
      .pipe(gulp.dest(path.join(projectDir, 'src/assets')));
  };
};

/**
 * Copy example source.
 * @param packerOptions - Packer options object.
 * @param buildMode - Package build mode.
 * @param styleExt - Style sheet extension.
 * @param projectDir - Project root directory.
 * @param log - Logger reference.
 */
export const copyExampleSource = (packerOptions: PackerOptions, buildMode: BuildMode, styleExt: string,
                                  projectDir: string, log: Logger): TaskFunction => {
  log.trace('copy source');
  const jasmine = packerOptions.testFramework === 'jasmine';
  const mocha = packerOptions.testFramework === 'mocha';
  const jest = packerOptions.testFramework === 'jest';
  const scriptExtension = parseScriptPreprocessorExtension(packerOptions.scriptPreprocessor);
  const styleExtension = parseStylePreprocessorExtension(packerOptions.stylePreprocessor);

  log.trace('script extension: "%s"\nstyle extension:\n "%s"', scriptExtension, styleExtension);

  const fileExtensions = [ scriptExtension, 'hbs' ];
  if (packerOptions.reactLib) {
    fileExtensions.push(`,${scriptExtension}x`);
  }

  const exampleGlob = path.join(__dirname, '../resources/dynamic/example', scriptExtension,
    `**/*.{${fileExtensions.join(',')}}`);
  log.trace('example glob: %s', exampleGlob);

  const templateData = {
    styleExt: styleExtension,
    isJasmine: jasmine,
    isMocha: mocha,
    isJest: jest,
    styleSupport: packerOptions.styleSupport,
    cliProject: buildMode === 'node-cli',
    reactLib: packerOptions.reactLib
  };
  log.trace('template data: %o', templateData);

  return () => {
    return gulp.src([
      exampleGlob
    ])
      .pipe(gulpHbsRuntime(templateData, {
        replaceExt: ''
      }))
      .pipe(gulp.dest(path.join(projectDir, 'src')));
  };
};

/**
 * Copy license file.
 * @param packerOptions - Packer options object.
 * @param projectDir - Project root directory.
 * @param log - Logger reference.
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
    return gulp.src([
      licenseFilePath
    ])
      .on('error', (e) => {
        log.error('missing license file template: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(gulpHbsRuntime(templateData, {
        rename: 'LICENSE'
      }))
      .pipe(gulp.dest(projectDir));
  };
};

/**
 * Copy readme.md file.
 * @param packageConfig - Package configuration object.
 * @param projectDir - Project root directory.
 * @param log - Logger reference.
 */
export const copyReadme = (packageConfig: PackageConfig, projectDir: string, log: Logger): TaskFunction => {
  log.trace('copy base dynamic and static config');

  const templateData = {
    packageName: packageConfig.name,
    packageDescription: packageConfig.description
  };
  log.trace('template data: %o', templateData);

  return () => {
    return gulp.src([
      path.join(__dirname, '../resources/dynamic/README.md.hbs')
    ])
      .on('error', (e) => {
        log.error('missing README.md template: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(gulpHbsRuntime(templateData, {
        replaceExt: ''
      }))
      .pipe(gulp.dest(projectDir));
  };
};

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
 * Copy babel configuration.
 * @param packerOptions - Packer options object.
 * @param buildMode - Project build mode.
 * @param projectDir - Project root directory.
 * @param log - Logger reference.
 */
export const copyBabelConfig = (packerOptions: PackerOptions, buildMode: BuildMode, projectDir: string,
                                log: Logger): TaskFunction => {
  log.trace('copy babel config');
  const babelrc = path.join(__dirname, '../resources/dynamic/.babelrc.hbs');
  log.trace('babel config glob: %s', babelrc);

  const templateData = {
    browserCompliant: buildMode === 'browser',
    reactLib: packerOptions.reactLib,
    isBrowserEnvironment: packerOptions.testEnvironment === 'browser',
    cjsTestModule: packerOptions.testFramework === 'jasmine' || packerOptions.testFramework === 'mocha'
  };
  log.trace('template data: %o', templateData);

  return () => {
    return gulp.src([
      babelrc
    ])
      .pipe(gulpHbsRuntime(templateData, {
        replaceExt: ''
      }))
      .pipe(gulp.dest(projectDir));
  };
};

/**
 * Copy gitignore file.
 * @param projectDir - Project root directory.
 * @param log - Logger reference.
 */
export const copyGitIgnore = (projectDir: string, log: Logger): TaskFunction => {
  log.trace('copy gitignore');
  const gitignore = path.join(__dirname, '../resources/dynamic/.gitignore.hbs');
  log.trace('.gitignore.hbs path: %s', gitignore);

  return () => {
    return gulp.src([
      gitignore
    ])
      .on('error', (e) => {
        log.error('missing .gitignore template: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(gulpHbsRuntime({}, {
        replaceExt: ''
      }))
      .pipe(gulp.dest(projectDir));
  };
};

/**
 * Copy packer asset (banner.hbs and bin.hbs) files.
 * @param projectDir - Project root directory.
 * @param log - Logger reference.
 */
export const copyPackerAssets = (projectDir: string, log: Logger): TaskFunction => {
  log.trace('copy packer assets');
  const banner = path.join(__dirname, '../resources/dynamic/packer/banner.hbs');
  log.trace('banner template path: %s', banner);

  const bin = path.join(__dirname, '../resources/dynamic/packer/bin.hbs');
  log.trace('bin template path: %s', bin);

  return () => {
    return gulp.src([
      banner,
      bin
    ])
      .on('error', (e) => {
        log.error('missing packer asset: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(gulp.dest(path.join(projectDir, '.packer')));
  };
};

/**
 * Copy typescript configuration tsconfig.json and tslint.json files.
 * @param projectDir - Project root directory.
 * @param log - Logger reference.
 */
export const copyTypescriptConfig = (projectDir: string, log: Logger): TaskFunction =>  {
  const tsconfig = path.join(__dirname, '../resources/static/tsconfig.json');
  log.trace('tsconfig.json path: %s', tsconfig);

  const tslint = path.join(__dirname, '../resources/static/tslint.json');
  log.trace('tslint.json path: %s', tslint);

  return () => {
    return gulp.src([
      tsconfig,
      tslint
    ])
      .on('error', (e) => {
        log.error('missing config file: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(gulp.dest(projectDir));
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
 * Copy postcss configuration file.
 * @param projectDir - Project root directory.
 * @param log - Logger reference.
 */
export const copyPostCssConfig = (projectDir: string, log: Logger): TaskFunction =>  {
  const postCss = path.join(__dirname, '../resources/static/postcss.config.js');
  log.trace('karma.conf.js path: %s', postCss);

  return () => {
    return gulp.src([
      postCss
    ])
      .on('error', (e) => {
        log.error('missing config file: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(gulp.dest(projectDir));
  };
};

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
  const helpersGlob = path.join(__dirname, '../resources/dynamic/example/common/test/jasmine-helpers/**/*');
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
  const helpersGlob = path.join(__dirname, '../resources/dynamic/example/common/test/mocha-helpers/**/*');
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
  const mockScriptGlob = path.join(__dirname, '../resources/dynamic/example/common/test/jest-mocks/**/*');
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
 * Copy ESLint configuration file.
 * @param projectDir - Project root directory.
 * @param log - Logger reference.
 */
export const copyEsLintConfig = (projectDir: string, log: Logger): TaskFunction =>  {
  const eslintrc = path.join(__dirname, '../resources/static/.eslintrc.yml');
  log.trace('eslintrc.yml path: %s', eslintrc);

  return () => {
    return gulp.src([
      eslintrc
    ])
      .on('error', (e) => {
        log.error('missing config file: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(gulp.dest(projectDir));
  };
};

/**
 * Copy style lint configuration file.
 * @param projectDir - Project root directory.
 * @param log - Logger reference.
 */
export const copyStyleLintConfig = (projectDir: string, log: Logger): TaskFunction =>  {
  const styleLintrc = path.join(__dirname, '../resources/static/.stylelintrc.json');
  log.trace('.stylelintrc.json path: %s', styleLintrc);

  return () => {
    return gulp.src([
      styleLintrc
    ])
      .on('error', (e) => {
        log.error('missing config file: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(gulp.dest(projectDir));
  };
};

/**
 * Copy common configuration (package.json, .editorconfig and travis.yml) files
 * @param packageConfig - Package configuration object.
 * @param projectDir - Project root directory.
 * @param log - Logger reference.
 */
export const copyCommonConfig = (packageConfig: PackageConfig, projectDir: string, log: Logger): TaskFunction => {
  log.trace('copy base dynamic and static config');
  const editorConfig = path.join(__dirname, '../resources/static/.editorconfig');
  log.trace('.editorconfig path: %s', editorConfig);

  const travis = path.join(__dirname, '../resources/static/.travis.yml');
  log.trace('.travis.yml path: %s', travis);

  return () => {
    return gulp.src([
      editorConfig,
      travis,
    ])
      .on('error', (e) => {
        log.error('missing config file: %s\n', e.stack || e.message);
        process.exit(1);
      })
      .pipe(gulpFile('package.json', JSON.stringify(packageConfig, null, 2)))
      .pipe(gulp.dest(projectDir));
  };
};
