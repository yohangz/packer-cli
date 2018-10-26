import { readCLIPackageData } from './meta';
import { parseScriptPreprocessorExtension, parseLicenseType, parseStylePreprocessorExtension } from './parser';
import path from 'path';
import gulp from 'gulp';
import gulpHbsRuntime from '../plugins/gulp-hbs-runtime';
import gulpFilter from 'gulp-filter';
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
        'handlebars/runtime'
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
      scriptDir: '.tmp',
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
  const cliPackageData = readCLIPackageData();

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
      'test:ci': 'CI=true packer test',
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
      [cliPackageData.name]: `^${cliPackageData.version}`
    },
    private: false
  };

  if (options.cliProject) {
    packageConfig.bin = {
      [packageName]: path.join('bin', `${packageConfig.name}.js`)
    };
  }

  return packageConfig;
};

export const styleCopy = (styleExt: string, projectDir: string): ReadWriteStream => {
  try {
    return gulp.src([
      path.join(__dirname, '../resources/dynamic/example/common/style', `**/*.${styleExt}`)
    ])
      .pipe(gulp.dest(path.join(projectDir, 'src/style')));
  } catch (e) {
    console.error(e);
    throw Error('task failure');
  }
};

export const templateCopy = (projectDir: string): ReadWriteStream => {
  try {
    return gulp.src([
      path.join(__dirname, '../resources/dynamic/example/common/templates/**/*')
    ])
      .pipe(gulp.dest(path.join(projectDir, 'src/templates')));
  } catch (e) {
    console.error(e);
    throw Error('task failure');
  }
};

export const assetCopy = (projectDir: string): ReadWriteStream => {
  try {
    return gulp.src([
      path.join(__dirname, '../resources/dynamic/example/common/assets/**/*')
    ])
      .pipe(gulp.dest(path.join(projectDir, 'src/assets')));
  } catch (e) {
    console.error(e);
    throw Error('task failure');
  }
};

export const sourceCopy = (packerConfig: PackerConfig, styleExt: string, projectDir: string): ReadWriteStream => {
  try {
    const jasmine = packerConfig.testFramework === 'jasmine';
    const scriptExtension = parseScriptPreprocessorExtension(packerConfig.compiler.scriptPreprocessor);
    const styleExtension = parseStylePreprocessorExtension(packerConfig.compiler.stylePreprocessor);

    return gulp.src([
      path.join(__dirname, '../resources/dynamic/example', scriptExtension, '**/*')
    ])
      .pipe(gulpHbsRuntime({
        styleExt: styleExtension,
        isJasmine: jasmine,
        styleSupport: packerConfig.compiler.styleSupport,
        cliProject: packerConfig.compiler.buildMode === 'node-cli'
      }, {
        replaceExt: ''
      }))
      .pipe(gulp.dest(path.join(projectDir, 'src')));
  } catch (e) {
    console.error(e);
    throw Error('task failure');
  }
};

export const licenseCopy = (packageConfig: PackerOptions, packerConfig: PackerConfig, projectDir: string): ReadWriteStream => {
  try {
    return gulp.src([
      path.join(__dirname, '../resources/dynamic/license', `${packerConfig.license}.hbs`)
    ])
      .on('error', (e) => {
        console.error(e);
        throw Error('task failure');
      })
      .pipe(gulpHbsRuntime({
        year: packageConfig.year,
        author: packageConfig.author
      }, {
        rename: 'LICENSE'
      }))
      .pipe(gulp.dest(projectDir));
  } catch (e) {
    console.error(e);
    throw Error('task failure');
  }
};

export const readmeCopy = (packageConfig: PackageConfig, projectDir: string): ReadWriteStream => {
  try {
    return gulp.src([
      path.join(__dirname, '../resources/dynamic/README.md.hbs')
    ])
      .on('error', (e) => {
        console.error(e);
        throw Error('task failure');
      })
      .pipe(gulpHbsRuntime({
        packageName: packageConfig.name,
        packageDescription: packageConfig.description
      }, {
        replaceExt: ''
      }))
      .pipe(gulp.dest(projectDir));
  } catch (e) {
    console.error(e);
    throw Error('task failure');
  }
};

export const demoHelperScriptCopy = (projectDir: string): ReadWriteStream => {
  try {
    return gulp.src([
      path.join(__dirname, '../resources/dynamic/demo/helper/**/*')
    ])
      .pipe(gulp.dest(path.join(projectDir, 'demo/helper')));
  } catch (e) {
    console.error(e);
    throw Error('task failure');
  }
};

export const demoCopy = (packerConfig: PackerConfig, packageName: string, projectDir: string): ReadWriteStream => {
  try {
    const isAmd = packerConfig.output.format === 'amd';
    const isIife = packerConfig.output.format === 'umd'
      || packerConfig.output.format === 'iife';
    const isSystem = packerConfig.output.format === 'system';

    return gulp.src([
      path.join(__dirname, '../resources/dynamic/demo/**/*.hbs')
    ])
      .pipe(gulpFilter('**/*' + (packerConfig.compiler.buildMode === 'browser' ? '.html.hbs' : '.js.hbs')))
      .pipe(gulpHbsRuntime({
        projectName: packageName,
        inlineStyle: packerConfig.output.inlineStyle,
        namespace: packerConfig.output.namespace,
        watchDir: packerConfig.watch.scriptDir,
        distDir: packerConfig.dist,
        require: isAmd,
        iife: isIife,
        system: isSystem,
        amdModule: packerConfig.output.amd.id
      }, {
        replaceExt: ''
      }))
      .pipe(gulp.dest(path.join(projectDir, 'demo')));
  } catch (e) {
    console.error(e);
    throw Error('task failure');
  }
};

export const babelConfigCopy = (packerConfig: PackerConfig, projectDir: string): ReadWriteStream => {
  try {
    return gulp.src([
      path.join(__dirname, '../resources/dynamic/babel/.*.hbs')
    ])
      .pipe(gulpHbsRuntime({
        browserCompliant: packerConfig.compiler.buildMode === 'browser',
      }, {
        replaceExt: ''
      }))
      .pipe(gulp.dest(projectDir));
  } catch (e) {
    console.error(e);
    throw Error('task failure');
  }
};

export const copyGitIgnore = (projectDir: string): ReadWriteStream => {
  try {
    return gulp.src([
      path.join(__dirname, '../resources/dynamic/.gitignore.hbs')
    ])
      .on('error', (e) => {
        console.error(e);
        throw Error('task failure');
      })
      .pipe(gulpHbsRuntime({}, {
        replaceExt: ''
      }))
      .pipe(gulp.dest(projectDir));
  } catch (e) {
    console.error(e);
    throw Error('task failure');
  }
};

export const copyPackerAssets = (projectDir: string): ReadWriteStream => {
  try {
    return gulp.src([
      path.join(__dirname, '../resources/dynamic/packer/banner.hbs'),
      path.join(__dirname, '../resources/dynamic/packer/bin.hbs')
    ])
      .on('error', (e) => {
        console.error(e);
        throw Error('task failure');
      })
      .pipe(gulp.dest(path.join(projectDir, '.packer')));
  } catch (e) {
    console.error(e);
    throw Error('task failure');
  }
};

export const configCopy = (packageConfig: PackageConfig,
                           packerConfig: PackerConfig,
                           isYarn: boolean,
                           projectDir: string): ReadWriteStream => {
  try {
    return gulp.src([
      path.join(__dirname, '../resources/static/.editorconfig'),
      path.join(__dirname, '../resources/static/.eslintrc.yml'),
      path.join(__dirname, '../resources/static/.stylelintrc.json'),
      path.join(__dirname, '../resources/static/.travis.yml'),
      path.join(__dirname, '../resources/static/karma.conf.js'),
      path.join(__dirname, '../resources/static/tsconfig.json'),
      path.join(__dirname, '../resources/static/tslint.json'),
    ])
      .on('error', (e) => {
        console.error(e);
        throw Error('task failure');
      })
      .pipe(gulpFile('.packerrc.json', JSON.stringify(packerConfig, null, 2)))
      .pipe(gulpFile('package.json', JSON.stringify(packageConfig, null, 2)))
      .on('end', () => {
        if (!args.includes('--skipInstall')) {
          runShellCommand(isYarn ? 'yarn' : 'npm', ['install'], projectDir).then(() => {
            console.log('📦 package generated 🚀');
          });
        }
      })
      .pipe(gulp.dest(projectDir));
  } catch (e) {
    console.error(e);
    throw Error('task failure');
  }
};
