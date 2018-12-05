import * as path from 'path';

import { PackerOptions } from '../model/packer-options';
import { PackageConfig } from '../model/package-config';

import { meta } from './meta';
import { parseLicenseType } from './parser';

const IstanbulConfig = {
  'extension': [
    '.js',
    '.jsx',
    '.ts',
    '.tsx'
  ],
  'include': [
    'src/**'
  ],
  'reporter': [
    'lcov',
    'text-summary',
    'html'
  ],
  'temp-dir': '.tmp/nyc_output'
};

/**
 * Build package.json configuration for generated project.
 * @param packerOptions - Packer options object.
 * @param packageName - Package name.
 */
export const buildPackageConfig = (packerOptions: PackerOptions, packageName: string): PackageConfig => {
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
    '@babel/core': '^7.1.6',
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
      packageConfig.nyc = IstanbulConfig;

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
      packageConfig.nyc = IstanbulConfig;

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
          'enzyme': '^3.7.0',
          'chai-enzyme': '^1.0.0-beta.1',
          'enzyme-adapter-react-16': '^1.7.0'
        }, devDependencies);
      }
    }
  }

  if (packerOptions.styleSupport) {
    packageConfig.scripts['lint:style'] = 'packer lint --style';

    devDependencies = Object.assign({
      'stylelint': '^9.9.0',
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
