import * as path from 'path';

import { PackerOptions } from '../model/packer-options';
import { PackageConfig, PackageKeyValueLiteral } from '../model/package-config';

import { parseLicenseType } from './parser';
import {
  name as sourcePackageName,
  version as sourcePackageVersion,
  devDependencies as sourceDevDependencies,
  dependencies as sourceDependencies,
} from '../../package.json';
import { TestEnvironment } from '../model/test-environment';

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

const mapDependencies = (dependencies: string[]): PackageKeyValueLiteral => {
  return dependencies.reduce((previous: {}, current: string) => {
    return Object.assign(previous, {
      [current]: sourceDevDependencies[current] || sourceDependencies[current]
    });
  }, {});
};

/**
 * Build package.json configuration for generated project.
 * @param packerOptions - Packer options object.
 * @param testEnvironment - Test environment type.
 * @param packageName - Package name.
 */
export const buildPackageConfig = (packerOptions: PackerOptions, testEnvironment: TestEnvironment,
                                   packageName: string): PackageConfig => {
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
    keywords: packerOptions.keywords ? [] : packerOptions.keywords.split(','),
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

  const dependencies = [
    '@babel/runtime-corejs2'
  ];

  const devDependencies = [
    '@babel/core',
    '@babel/polyfill',
    '@babel/preset-env',
    '@babel/register',
    '@babel/plugin-transform-runtime'
  ];

  if (packerOptions.reactLib) {
    devDependencies.push('@babel/preset-react');
    dependencies.push('react', 'react-dom');
  } else {
    dependencies.push('handlebars');
  }

  if (packerOptions.scriptPreprocessor === 'typescript') {
    dependencies.push('tslib');
    devDependencies.push('typescript', 'tslint');

    if (packerOptions.reactLib) {
      devDependencies.push('@types/react', '@types/react-dom');
    }
  } else {
    devDependencies.push('eslint', 'eslint-config-standard', 'eslint-plugin-import', 'eslint-plugin-node',
      'eslint-plugin-promise', 'eslint-plugin-standard');
  }

  if (packerOptions.testFramework === 'jest') {
    devDependencies.push('jest');

    if (packerOptions.scriptPreprocessor === 'typescript') {
      devDependencies.push('@types/jest', 'ts-jest');
    } else if (packerOptions.scriptPreprocessor === 'none') {
      devDependencies.push('babel-jest', 'babel-core');
    }

    if (packerOptions.useEnzyme) {
      devDependencies.push('enzyme', 'jest-enzyme', 'jest-environment-enzyme', 'enzyme-adapter-react-16');

      if (packerOptions.scriptPreprocessor === 'typescript') {
        devDependencies.push('@types/enzyme');
      }
    }
  }

  if (packerOptions.testFramework === 'jasmine') {
    if (packerOptions.scriptPreprocessor === 'typescript') {
      devDependencies.push('@types/jasmine');

      if (testEnvironment !== 'browser') {
        devDependencies.push('ts-node');
      }
    }

    if (testEnvironment === 'browser') {
      devDependencies.push('puppeteer', 'karma', 'karma-chrome-launcher', 'karma-coverage', 'jasmine-core',
        'karma-jasmine', 'karma-jasmine-html-reporter');
    } else {
      packageConfig.nyc = IstanbulConfig;

      devDependencies.push('jasmine', 'nyc', 'ignore-styles');

      if (testEnvironment === 'jsdom') {
        devDependencies.push('jsdom');
      }
    }

    if (packerOptions.useEnzyme) {
      devDependencies.push('enzyme', 'jasmine-enzyme', 'enzyme-adapter-react-16');

      if (packerOptions.scriptPreprocessor === 'typescript') {
        devDependencies.push('@types/enzyme', '@types/jasmine-enzyme');
      }
    }
  }

  if (packerOptions.testFramework === 'mocha') {
    if (packerOptions.scriptPreprocessor === 'typescript') {
      devDependencies.push('@types/chai', '@types/mocha');

      if (testEnvironment !== 'browser') {
        devDependencies.push('ts-node');
      }
    }

    if (testEnvironment === 'browser') {
      devDependencies.push('puppeteer', 'karma', 'karma-chrome-launcher', 'karma-coverage', 'karma-mocha', 'mocha',
        'chai');
    } else {
      packageConfig.nyc = IstanbulConfig;

      devDependencies.push('mocha', 'chai', 'nyc', 'ignore-styles');

      if (testEnvironment === 'jsdom') {
        devDependencies.push('jsdom');
      }
    }

    if (packerOptions.useEnzyme) {
      devDependencies.push('enzyme', 'chai-enzyme', 'cheerio', 'enzyme-adapter-react-16');

      if (packerOptions.scriptPreprocessor === 'typescript') {
        devDependencies.push('@types/enzyme', '@types/chai-enzyme');
      }
    }
  }

  if (packerOptions.styleSupport) {
    packageConfig.scripts['lint:style'] = 'packer lint --style';

    devDependencies.push('stylelint', 'stylelint-config-standard', 'autoprefixer', 'postcss-url', 'cssnano');

    if (packerOptions.stylePreprocessor === 'scss' || packerOptions.stylePreprocessor === 'sass') {
      devDependencies.push('node-sass');
    }

    if (packerOptions.stylePreprocessor === 'less') {
      devDependencies.push('less');
    }

    if (packerOptions.stylePreprocessor === 'stylus') {
      devDependencies.push('stylus');
    }
  }

  devDependencies[sourcePackageName] = `^${sourcePackageVersion}`;

  packageConfig.dependencies = mapDependencies(dependencies);
  packageConfig.devDependencies = mapDependencies(devDependencies);
  if (packerOptions.cliProject) {
    packageConfig.bin = {
      [packageName]: path.join('bin', `${packageConfig.name}.js`)
    };
  }

  return packageConfig;
};
