import { readCLIPackageData } from './meta';
import { parseLicenseType } from './parser';
import path from 'path';
import gulp from 'gulp';
import gulpHbsRuntime from '../plugins/gulp-hbs-runtime';
import gulpFilter from 'gulp-filter';
import gulpFile from 'gulp-file';
import { runShellCommand } from './util';

export const getPackerConfig = (options: any) => {
  const entry = 'index' + (options.typescript ? '.ts' : '.js');

  let bundleFormat = '';
  if (options.browserCompliant) {
    bundleFormat = String(options.bundleFormat || 'umd').toLowerCase();
  } else {
    bundleFormat = 'cjs';
  }

  let dependencyMapMode = 'crossMapPeerDependency';
  if (options.cliProject) {
    dependencyMapMode = 'mapDependency';
  }

  return {
    namespace: options.namespace,
    entry: entry,
    source: 'src',
    dist: {
      outDir: 'dist',
      stylesDir: 'styles',
      generateFESM5: true,
      generateFESM2015: true,
      generateMin: true
    },
    typescript: Boolean(options.typescript),
    stylePreprocessor: (options.stylePreprocessor || 'scss').toLowerCase(),
    cliProject: Boolean(options.cliProject),
    styleSupport: Boolean(options.styleSupport),
    browserCompliant: Boolean(options.browserCompliant),
    watch: {
      scriptDir: '.tmp',
      helperDir: 'demo/helper',
      demoDir: 'demo/watch',
      serve: true,
      port: 4000,
      open: true
    },
    copy: [
      'README.md',
      'LICENSE'
    ],
    flatGlobals: {},
    esmExternals: [
      'handlebars/runtime'
    ],
    pathReplacePatterns: [
      {
        test: './config/base-config',
        replace: './config/replace-config'
      }
    ],
    ignore: [],
    assetPaths: [
      'src/assets'
    ],
    testFramework: (options.testFramework || 'jasmine').toLowerCase(),
    bundle: {
      amd: {
        define: '',
        id: (options.amdId || '')
      },
      format: bundleFormat,
      imageInlineLimit: 1000000,
      inlineStyle: Boolean(options.bundleStyles),
      dependencyMapMode: dependencyMapMode
    },
    license: {
      banner: true,
      thirdParty: {
        includePrivate: false,
        fileName: 'dependencies.txt'
      }
    }
  };
};

export const getPackageConfig = (options: any, packageName: any) => {
  const cliPackageData = readCLIPackageData();

  let author = '';
  if (options.author && options.email) {
    author = `${options.author} <${options.email}>`;
  }

  let projectUrl = '';
  let repository = '';
  if (options.githubUsername) {
    projectUrl = `https://github.com/${options.githubUsername}/${packageName}`;
    repository = `${projectUrl}.git`;
  }

  const packageConfig: any = {
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
    author: author,
    repository: repository,
    license: parseLicenseType(options.license),
    homepage: options.homepage || projectUrl,
    dependencies: {
      'handlebars': '^4.0.11',
      'tslib': '^1.9.3'
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

export const styleCopy = (styleExt, projectDir) => {
  return gulp.src([
    path.join(__dirname, '../resources/dynamic/example/common/style', `**/*.${styleExt}`)
  ])
    .pipe(gulp.dest(path.join(projectDir, 'src/style')));
};

export const templateCopy = (projectDir) => {
  return gulp.src([
    path.join(__dirname, '../resources/dynamic/example/common/templates/**/*')
  ])
    .pipe(gulp.dest(path.join(projectDir, 'src/templates')));
};

export const assetCopy = (projectDir) => {
  return gulp.src([
    path.join(__dirname, '../resources/dynamic/example/common/assets/**/*')
  ])
    .pipe(gulp.dest(path.join(projectDir, 'src/assets')));
};

export const sourceCopy = (packerConfig, styleExt, projectDir) => {
  const isJasmine = packerConfig.testFramework === 'jasmine';

  return gulp.src([
    path.join(__dirname, '../resources/dynamic/example', packerConfig.typescript ? 'ts' : 'js', '**/*')
  ])
    .pipe(gulpHbsRuntime({
      styleExt: styleExt,
      isJasmine: isJasmine,
      styleSupport: packerConfig.styleSupport,
      cliProject: packerConfig.cliProject
    }, {
      replaceExt: ''
    }))
    .pipe(gulp.dest(path.join(projectDir, 'src')));
};

export const licenseCopy = (packageConfig, projectDir) => {
  return gulp.src([
    path.join(__dirname, '../resources/dynamic/license', `${packageConfig.license}.hbs`)
  ])
    .pipe(gulpHbsRuntime({
      year: packageConfig.year,
      author: packageConfig.author
    }, {
      rename: 'LICENSE'
    }))
    .pipe(gulp.dest(projectDir));
};

export const readmeCopy = (packageConfig, projectDir) => {
  return gulp.src([
    path.join(__dirname, '../resources/dynamic/README.md.hbs')
  ])
    .pipe(gulpHbsRuntime({
      packageName: packageConfig.name,
      packageDescription: packageConfig.description
    }, {
      replaceExt: ''
    }))
    .pipe(gulp.dest(projectDir));
};

export const demoHelperScriptCopy = (projectDir) => {
  return gulp.src([
    path.join(__dirname, '../resources/dynamic/demo/helper/**/*')
  ])
    .pipe(gulp.dest(path.join(projectDir, 'demo/helper')));
};

export const demoCopy = (packerConfig, packageName, projectDir) => {
  const isAmd = packerConfig.bundle.format === 'amd';
  const isIife = packerConfig.bundle.format === 'umd' || packerConfig.bundle.format === 'iife';
  const isSystem = packerConfig.bundle.format === 'system';

  return gulp.src([
    path.join(__dirname, '../resources/dynamic/demo/**/*.hbs')
  ])
    .pipe(gulpFilter('**/*' + (packerConfig.browserCompliant ? '.html.hbs' : '.js.hbs')))
    .pipe(gulpHbsRuntime({
      projectName: packageName,
      inlineStyle: packerConfig.bundle.inlineStyle,
      namespace: packerConfig.namespace,
      watchDir: packerConfig.watch.scriptDir,
      distDir: packerConfig.dist.outDir,
      require: isAmd,
      iife: isIife,
      system: isSystem,
      amdModule: packerConfig.bundle.amd.id
    }, {
      replaceExt: ''
    }))
    .pipe(gulp.dest(path.join(projectDir, 'demo')));
};

export const babelConfigCopy = (packerConfig, projectDir) => {
  return gulp.src([
    path.join(__dirname, '../resources/dynamic/babel/.*.hbs')
  ])
    .pipe(gulpHbsRuntime({
      browserCompliant: packerConfig.browserCompliant,
    }, {
      replaceExt: ''
    }))
    .pipe(gulp.dest(projectDir));
};

export const configCopy = (packageConfig, packerConfig, projectDir) => {
  return gulp.src([
    path.join(__dirname, '../resources/static/**/{.*,*}')
  ])
    .pipe(gulpFile('.packerrc.json', JSON.stringify(packerConfig, null, 2)))
    .pipe(gulpFile('package.json', JSON.stringify(packageConfig, null, 2)))
    .on('end', () => {
      runShellCommand(packerConfig.isYarn ? 'yarn' : 'npm', ['install'], projectDir).then(() => {
        console.log('--done--');
      });
    })
    .pipe(gulp.dest(projectDir));
};
