import path from 'path';
import fs from 'fs';
import { PackerConfig } from '../model/packer-config';
import { PackageConfig } from '../model/package-config';
import { BabelConfig } from '../model/babel-config';
import merge from 'lodash/merge';

const defaultPackerConfig = {
  entry: 'index.js',
  source: 'src',
  dist: 'dist',
  output: {
    amd: {
      define: '',
      id: ''
    },
    dependencyMapMode: '',
    esnext: true,
    es5: true,
    minBundle: true,
    format: 'umd',
    imageInlineLimit: 1000000,
    inlineStyle: false,
    stylesDir: 'styles',
    namespace: ''
  },
  compiler: {
    buildMode: 'browser',
    scriptPreprocessor: 'none',
    stylePreprocessor: 'scss',
    styleSupport: true
  },
  assetPaths: [
    'src/assets'
  ],
  copy: [
    'README.md',
    'LICENSE'
  ],
  bundle: {
    externals: [],
    globals: {},
    mapExternals: false
  },
  ignore: [],
  pathReplacePatterns: [],
  testFramework: 'jasmine',
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
  }
};

export const readConfig = (): PackerConfig => {
  return require(path.join(process.cwd(), '.packerrc.json'));
};

export const readPackageData = (): PackageConfig => {
  return require(path.join(process.cwd(), 'package.json'));
};

export const readCLIPackageData = (): PackageConfig => {
  return require(path.join(__dirname, '../package.json'));
};

export const readBabelConfig = (esVersion: string): BabelConfig => {
  const projectConfig = require(path.join(process.cwd(), `.babelrc.${esVersion}.js`));
  return merge({}, defaultPackerConfig, projectConfig);
};

export const readBannerTemplate = (): string => {
  return fs.readFileSync(path.join(process.cwd(), '.packer/banner.hbs'), 'utf8');
};
