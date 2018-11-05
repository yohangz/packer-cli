import { meta } from './meta';
import { parseScriptPreprocessorExtension, parseLicenseType, parseStylePreprocessorExtension } from './parser';
import path from 'path';
import gulp from 'gulp';
import gulpHbsRuntime from '../plugins/gulp-hbs-runtime';
import gulpFile from 'gulp-file';
import { runShellCommand, args } from './util';
import { DependencyMap } from '../model/dependency-map';
import { TestFramework } from '../model/test-framework';
import { StylePreprocessor } from '../model/style-preprocessor';
import { BrowserBundleFormat } from '../model/browser-bundle-format';
import { NodeBundleFormat } from '../model/node-bundle-format';
import { PackerConfig } from '../model/packer-config';
import { ScriptPreprocessor } from '../model/script-preprocessor';
import { BuildMode } from '../model/build-mode';
import { PackerOptions } from '../model/packer-options';
import { PackageConfig } from '../model/package-config';
import { Logger } from '../common/logger';

import ReadWriteStream = NodeJS.ReadWriteStream;

export const getPackerConfig = (options: PackerOptions): PackerConfig => {
  const entryFile = 'index.' + parseScriptPreprocessorExtension(options.scriptPreprocessor);

  let bundleFormat: NodeBundleFormat | BrowserBundleFormat = 'cjs';
  let mapMode: DependencyMap = 'cross-map-peer-dependency';
  let bundleBuildMode: BuildMode;
  if (options.browserCompliant) {
    bundleBuildMode = 'browser';
    bundleFormat = (options.bundleFormat || 'umd') as BrowserBundleFormat;
  } else if (options.cliProject) {
    bundleBuildMode = 'node-cli';
    mapMode = 'map-dependency';
  } else {
    bundleBuildMode = 'node';
  }

  return {
    entry: entryFile,
    source: 'src',
    dist: 'dist',
    tmp: '.tmp',
    output: {
      amd: {
        define: '',
        id: (options.amdId || '')
      },
      dependencyMapMode: mapMode,
      esnext: true,
      es5: true,
      minBundle: true,
      format: bundleFormat,
      imageInlineLimit: 1000000,
      inlineStyle: Boolean(options.bundleStyles),
      stylesDir: 'styles',
      namespace: options.namespace || '',
      sourceMap: true
    },
    compiler: {
      buildMode: bundleBuildMode,
      scriptPreprocessor: String(options.scriptPreprocessor) as ScriptPreprocessor,
      stylePreprocessor: (options.stylePreprocessor || 'none') as StylePreprocessor,
      styleSupport: Boolean(options.styleSupport)
    },
    assetPaths: [
      'src/assets'
    ],
    copy: [
      'README.md',
      'LICENSE'
    ],
    bundle: {
      externals: [
        'handlebars/runtime',
        'assert'
      ],
      globals: {},
      mapExternals: true
    },
    ignore: [],
    pathReplacePatterns: [
      {
        replace: './config/replace-config',
        test: './config/base-config'
      }
    ],
    testFramework: (options.testFramework || 'jasmine') as TestFramework,
    watch: {
      demoDir: 'demo/watch',
      helperDir: 'demo/helper',
      open: true,
      port: 4000,
      serve: true
    },
    license: {
      banner: true,
      thirdParty: {
        fileName: 'dependencies.txt',
        includePrivate: false
      }
    },
  };
};

export const getPackageConfig = (options: PackerOptions, packageName: string): PackageConfig => {
  const cliPackageData = meta.readCLIPackageData();

  let projectAuthor = '';
  if (options.author && options.email) {
    projectAuthor = `${options.author} <${options.email}>`;
  }

  let projectUrl = '';
  let projectRepository = '';
  if (options.githubUsername) {
    projectUrl = `https://github.com/${options.githubUsername}/${packageName}`;
    projectRepository = `${projectUrl}.git`;
  }

  const packageConfig: PackageConfig = {
    name: packageName,
    version: '1.0.0',
    description: options.description || '',
    keywords: String(options.keywords || '').split(','),
    scripts: {
      'lint': 'packer lint',
      'lint:style': 'packer lint --style',
      'lint:script': 'packer lint --script',
      'build': 'packer build',
      'watch': 'packer watch',
      'test': 'packer test',
      'test:coverage': 'packer test --coverage',
      'test:ci': 'CI=true packer test',
      'test:coverage:ci': 'CI=true packer test --coverage',
      'clean': 'packer clean',
      'preversion': 'npm run build',
      'postversion': 'git push && git push --tags',
      'prerelease': 'npm run build',
      'release': 'npm publish dist'
    },
    author: projectAuthor,
    repository: projectRepository,
    license: parseLicenseType(options.license),
    homepage: options.website || projectUrl,
    dependencies: {
      handlebars: '^4.0.11',
      tslib: '^1.9.3'
    },
    devDependencies: {
      '@babel/polyfill': '^7.0.0',
      '@babel/preset-env': '^7.1.0',
      '@babel/register': '^7.0.0',
      '@babel/runtime': '^7.1.0',
      '@babel/plugin-transform-runtime': '^7.1.0',
      '@types/assert': '^1.4.0',
      '@types/jasmine': '^2.8.8',
      '@types/mocha': '^5.2.5',
      'typescript': '^3.1.1',
      'assert': '^1.4.1',
      'eslint': '>=5.0.0',
      'eslint-config-standard': '*',
      'eslint-plugin-import': '>=2.13.0',
      'eslint-plugin-node': '>=7.0.0',
      'eslint-plugin-promise': '>=4.0.0',
      'eslint-plugin-standard': '>=4.0.0',
      'jasmine': '^3.3.0',
      'jasmine-core': '^3.1.0',
      'karma': '^3.0.0',
      'karma-chrome-launcher': '^2.2.0',
      'karma-coverage': '^1.1.2',
      'karma-jasmine': '^1.1.2',
      'karma-jasmine-html-reporter': '^1.1.0',
      'karma-mocha': '^1.3.0',
      'mocha': '^5.2.0',
      'puppeteer': '^1.5.0',
      'stylelint-config-standard': '^18.2.0',
      'uglify-es': '^3.3.9',
      'nyc': '^13.1.0',
      [cliPackageData.name]: `^${cliPackageData.version}`
    },
    private: false,
    nyc: {
      'reporter': [
        'lcov',
        'text-summary',
        'html'
      ],
      'temp-dir': '.tmp/nyc_output'
    }
  };

  if (options.cliProject) {
    packageConfig.bin = {
      [packageName]: path.join('bin', `${packageConfig.name}.js`)
    };
  }

  return packageConfig;
};

export const styleCopy = (styleExt: string, projectDir: string, log: Logger): ReadWriteStream => {
  log.trace('copy styles');

  const styleGlob = path.join(__dirname, '../resources/dynamic/example/common/style', `**/*.${styleExt}`);
  log.trace('style glob: %s', styleGlob);

  return gulp.src([
    styleGlob
  ])
    .pipe(gulp.dest(path.join(projectDir, 'src/style')));
};

export const templateCopy = (projectDir: string, log: Logger): ReadWriteStream => {
  log.trace('copy templates');

  const templatePath = path.join(__dirname, '../resources/dynamic/example/common/templates/**/*');
  log.trace('template path: %s', templatePath);

  return gulp.src([
    templatePath
  ])
    .pipe(gulp.dest(path.join(projectDir, 'src/templates')));
};

export const assetCopy = (projectDir: string, log: Logger): ReadWriteStream => {
  log.trace('copy assets');

  const assetsPath  = path.join(__dirname, '../resources/dynamic/example/common/assets/**/*');
  log.trace('assets path: %s', assetsPath);

  return gulp.src([
    assetsPath
  ])
    .pipe(gulp.dest(path.join(projectDir, 'src/assets')));
};

export const sourceCopy = (packerConfig: PackerConfig, styleExt: string, projectDir: string,
                           log: Logger): ReadWriteStream => {
  log.trace('copy source');
  const jasmine = packerConfig.testFramework === 'jasmine';
  const scriptExtension = parseScriptPreprocessorExtension(packerConfig.compiler.scriptPreprocessor);
  const styleExtension = parseStylePreprocessorExtension(packerConfig.compiler.stylePreprocessor);

  log.trace('script extension: "%s"\nstyle extension:\n "%s"', scriptExtension, styleExtension);

  const exampleGlob = path.join(__dirname, '../resources/dynamic/example', scriptExtension, '**/*');
  log.trace('example glob: %s', exampleGlob);

  const templateData = {
    styleExt: styleExtension,
      isJasmine: jasmine,
    styleSupport: packerConfig.compiler.styleSupport,
    cliProject: packerConfig.compiler.buildMode === 'node-cli'
  };
  log.trace('template data: %o', templateData);

  return gulp.src([
    exampleGlob
  ])
    .pipe(gulpHbsRuntime(templateData, {
      replaceExt: ''
    }))
    .pipe(gulp.dest(path.join(projectDir, 'src')));
};

export const licenseCopy = (packageConfig: PackerOptions, packerConfig: PackerConfig,
                            projectDir: string, log: Logger): ReadWriteStream => {
  log.trace('copy license file');
  const licenseFilePath = path.join(__dirname, '../resources/dynamic/license', `${packerConfig.license}.hbs`);
  log.trace('license file path: %s', licenseFilePath);

  const templateData = {
    year: packageConfig.year,
    author: packageConfig.author
  };
  log.trace('template data: %o', templateData);

  return gulp.src([
    licenseFilePath
  ])
    .on('error', (e) => {
      log.error('missing license file template: %s\n', e.stack || e.message);
    })
    .pipe(gulpHbsRuntime(templateData, {
      rename: 'LICENSE'
    }))
    .pipe(gulp.dest(projectDir));
};

export const readmeCopy = (packageConfig: PackageConfig, projectDir: string, log: Logger): ReadWriteStream => {
  log.trace('copy base dynamic and static config');

  const templateData = {
    packageName: packageConfig.name,
    packageDescription: packageConfig.description
  };
  log.trace('template data: %o', templateData);

  return gulp.src([
    path.join(__dirname, '../resources/dynamic/README.md.hbs')
  ])
    .on('error', (e) => {
      log.error('missing README.md template: %s\n', e.stack || e.message);
    })
    .pipe(gulpHbsRuntime(templateData, {
      replaceExt: ''
    }))
    .pipe(gulp.dest(projectDir));
};

export const demoHelperScriptCopy = (projectDir: string, log: Logger): ReadWriteStream => {
  log.trace('copy demo helper scripts');
  return gulp.src([
    path.join(__dirname, '../resources/dynamic/demo/helper/**/*')
  ])
    .pipe(gulp.dest(path.join(projectDir, 'demo/helper')));
};

export const demoCopy = (packerConfig: PackerConfig, packageName: string, projectDir: string,
                         log: Logger): ReadWriteStream => {
  log.trace('copy demo resources');
  const isAmd = packerConfig.output.format === 'amd';
  const isIife = packerConfig.output.format === 'umd'
    || packerConfig.output.format === 'iife';
  const isSystem = packerConfig.output.format === 'system';
  const templateGlob = packerConfig.compiler.buildMode === 'browser' ? '*.html.hbs' : '*.js.hbs';
  const demoTemplateGlob = path.join(__dirname, '../resources/dynamic/demo/**', templateGlob);
  log.trace('demo template glob: %s', demoTemplateGlob);

  const templateData = {
    projectName: packageName,
    inlineStyle: packerConfig.output.inlineStyle,
    namespace: packerConfig.output.namespace,
    watchDir: path.join(packerConfig.tmp, 'watch'),
    distDir: packerConfig.dist,
    require: isAmd,
    iife: isIife,
    system: isSystem,
    amdModule: packerConfig.output.amd.id
  };
  log.trace('template data: %o', templateData);

  return gulp.src([
    demoTemplateGlob
  ])
    .pipe(gulpHbsRuntime(templateData, {
      replaceExt: ''
    }))
    .pipe(gulp.dest(path.join(projectDir, 'demo')));
};

export const babelConfigCopy = (packerConfig: PackerConfig, projectDir: string, log: Logger): ReadWriteStream => {
  log.trace('copy babel config');
  const babelConfigGlob = path.join(__dirname, '../resources/dynamic/babel/.*.hbs');
  log.trace('babel config glob: %s', babelConfigGlob);

  const templateData = {
    browserCompliant: packerConfig.compiler.buildMode === 'browser',
  };
  log.trace('template data: %o', templateData);

  return gulp.src([
    babelConfigGlob
  ])
    .pipe(gulpHbsRuntime(templateData, {
      replaceExt: ''
    }))
    .pipe(gulp.dest(projectDir));
};

export const copyGitIgnore = (projectDir: string, log: Logger): ReadWriteStream => {
  log.trace('copy gitignore');
  const gitignore = path.join(__dirname, '../resources/dynamic/.gitignore.hbs');
  log.trace('.gitignore.hbs path: %s', gitignore);

  return gulp.src([
    gitignore
  ])
    .on('error', (e) => {
      log.error('missing .gitignore template: %s\n', e.stack || e.message);
    })
    .pipe(gulpHbsRuntime({}, {
      replaceExt: ''
    }))
    .pipe(gulp.dest(projectDir));
};

export const copyPackerAssets = (projectDir: string, log: Logger): ReadWriteStream => {
  log.trace('copy packer assets');
  const banner = path.join(__dirname, '../resources/dynamic/packer/banner.hbs');
  log.trace('banner template path: %s', banner);

  const bin = path.join(__dirname, '../resources/dynamic/packer/bin.hbs');
  log.trace('bin template path: %s', bin);

  return gulp.src([
    banner,
    bin
  ])
    .on('error', (e) => {
      log.error('missing packer asset: %s\n', e.stack || e.message);
    })
    .pipe(gulp.dest(path.join(projectDir, '.packer')));
};

export const configCopy = (packageConfig: PackageConfig, packerConfig: PackerConfig, isYarn: boolean,
                           projectDir: string, log: Logger): ReadWriteStream => {
  log.trace('copy base dynamic and static config');
  const editorConfig = path.join(__dirname, '../resources/static/.editorconfig');
  log.trace('.editorconfig path: %s', editorConfig);

  const eslintrc = path.join(__dirname, '../resources/static/.eslintrc.yml');
  log.trace('eslintrc.yml path: %s', eslintrc);

  const stylelintrc = path.join(__dirname, '../resources/static/.stylelintrc.json');
  log.trace('.stylelintrc.json path: %s', stylelintrc);

  const travis = path.join(__dirname, '../resources/static/.travis.yml');
  log.trace('.travis.yml path: %s', travis);

  const jasmine = path.join(__dirname, '../resources/static/jasmine.json');
  log.trace('jasmine.json path: %s', jasmine);

  const karma = path.join(__dirname, '../resources/static/karma.conf.js');
  log.trace('karma.conf.js path: %s', karma);

  const tsconfig = path.join(__dirname, '../resources/static/tsconfig.json');
  log.trace('tsconfig.json path: %s', tsconfig);

  const tslint = path.join(__dirname, '../resources/static/tslint.json');
  log.trace('tslint.json path: %s', tslint);

  return gulp.src([
    editorConfig,
    eslintrc,
    stylelintrc,
    travis,
    jasmine,
    karma,
    tsconfig,
    tslint
  ])
    .on('error', (e) => {
      log.error('missing config file: %s\n', e.stack || e.message);
    })
    .pipe(gulpFile('.packerrc.json', JSON.stringify(packerConfig, null, 2)))
    .pipe(gulpFile('package.json', JSON.stringify(packageConfig, null, 2)))
    .on('finish', () => {
      if (!args.includes('--skipInstall')) {
        runShellCommand(isYarn ? 'yarn' : 'npm', ['install'], projectDir, log).then(() => {
          log.info('📦 package generated 🚀');
        });
      }
    })
    .pipe(gulp.dest(projectDir));
};
