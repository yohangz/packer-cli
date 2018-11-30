<p align="center">
  <img src="https://image.ibb.co/kezsYp/packer.png" alt="Packer CLI"/>
  
  <a href="https://travis-ci.org/yohangz/packer-cli">
    <img src="https://travis-ci.org/yohangz/packer-cli.svg?branch=master" alt="travis build" height="18">
  </a>
  <a href="https://github.com/yohangz/packer-cli/blob/master/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat" alt="license" height="18">
  </a>  
  <a href="https://badge.fury.io/js/packer-cli">
    <img src="https://badge.fury.io/js/packer-cli.svg" alt="npm version" height="18">
  </a>
</p>

> Full-fledged CLI tool to generate and package library Node modules compliant with Browser and NodeJS. Packer CLI support all modern style, unit test and script transpiler tools.

> Packer CLI is using itself to compile self source.

## :book: Table of Contents
  <!-- START doctoc generated TOC please keep comment here to allow auto update -->
  <!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
  
  - [Features](#bulb-features)
  - [Usage](#sparkles-usage)
    - [Basic Usage](#mag_right-basic-usage)
    - [Standalone Usage](#gear-standalone-usage)
  - [Build Configuration](#hammer_and_pick-build-configuration)
  - [Contributions](#seedling-contributions)
  - [License](#copyright-license)
  
  <!-- END doctoc generated TOC please keep comment here to allow auto update -->

## :bulb: Features

[![Rollup](https://image.ibb.co/djqwR9/rollup.png)](https://rollupjs.org/)
[![Gulp](https://image.ibb.co/j8A7Yp/gulp.png)](https://gulpjs.com/)
[![Babel](https://image.ibb.co/hNSXzU/babel.png)](https://babeljs.io/)
[![ES Lint](https://image.ibb.co/iGhzeU/eslint.png)](https://eslint.org/)
[![Typescript](https://image.ibb.co/fjR369/typescript.png)](https://www.typescriptlang.org/)
[![TS Lint](https://image.ibb.co/ddVVm9/ts-lint.png)](https://palantir.github.io/tslint/)
[![Postcss](https://image.ibb.co/bSSbR9/postcss.png)](https://postcss.org/)
[![LESS](https://image.ibb.co/mXSXzU/less.png)](http://lesscss.org/)
[![SASS](https://image.ibb.co/jBLwR9/sass.png)](https://sass-lang.com/)
[![Stylus](https://image.ibb.co/jteZDp/stylus.png)](http://stylus-lang.com/)
[![Style Lint](https://image.ibb.co/hqySYp/stylelint.png)](https://stylelint.io/)
[![Karma](https://image.ibb.co/hq8i69/karma.png)](https://karma-runner.github.io)
[![Mocha](https://image.ibb.co/nn2XzU/mocha.png)](https://mochajs.org/)
[![Chai](https://i.ibb.co/drY8ryr/chaijs.png)](https://www.chaijs.com/)
[![Jest](https://i.ibb.co/ftLCJ50/jest.png)](https://jestjs.io/)
[![Jasmine](https://image.ibb.co/jrGEDp/jasmine.png)](https://jasmine.github.io/)
[![Istanbul](https://image.ibb.co/fOsbR9/istanbul.png)](https://istanbul.js.org/)
[![React](https://i.ibb.co/zHccJ3r/react.png)](https://reactjs.org/)
[![JSdom](https://i.ibb.co/FKDXFxM/jsdom.png)](https://github.com/jsdom/jsdom)
[![Handlebars](https://image.ibb.co/g2Di69/handlebars.png)](https://handlebarsjs.com/)
[![SPDX](https://image.ibb.co/jSgEDp/spdx.png)](https://spdx.org/)
[![NPM](https://image.ibb.co/m2HMtp/npm.png)](https://www.npmjs.com/)
[![YARN](https://image.ibb.co/g1aVm9/yarn.png)](https://yarnpkg.com/)
[![Travis CI](https://image.ibb.co/fGqKeU/travis-ci.png)](https://travis-ci.org/)

  :ballot_box_with_check: Managed build configuration  
  :ballot_box_with_check: Encapsulated build process  
  :ballot_box_with_check: Both NPM and Yarn support  
  :ballot_box_with_check: Travis CI support  
  :ballot_box_with_check: Typescript and Babel based code transpilation  
  :ballot_box_with_check: TS Lint based Typescript code analysis  
  :ballot_box_with_check: ES Lint based Javascript code analysis  
  :ballot_box_with_check: Style lint based style sheet code analysis  
  :ballot_box_with_check: Precompiled handlebars templating  
  :ballot_box_with_check: Support SCSS, SASS, LESS and Stylus and vanilla CSS  
  :ballot_box_with_check: Post CSS based image inline and auto prefixing  
  :ballot_box_with_check: Karma unit test runner  
  :ballot_box_with_check: Jasmine, Mocha and Jest unit test frameworks  
  :ballot_box_with_check: Rollup and Gulp based build process  
  :ballot_box_with_check: ES5, ESNext, UMD, AMD, SYSTEM, IIFE and CommonJS bundle build output  
  :ballot_box_with_check: Emmit type definitions for typescript projects  
  :ballot_box_with_check: Ready to publish as Node module  
  :ballot_box_with_check: Inline and bundle styles  
  :ballot_box_with_check: Theme packaging  
  :ballot_box_with_check: Source import path replace  
  :ballot_box_with_check: Exclude external peer dependencies in bundle  
  :ballot_box_with_check: Bundle peer dependencies  
  :ballot_box_with_check: Ignore imports  
  :ballot_box_with_check: Copy static assets to build dir  
  :ballot_box_with_check: Library summary banner generation  
  :ballot_box_with_check: Library dependency license extraction  
  :ballot_box_with_check: Node CLI project support  
  :ballot_box_with_check: JSX and TSX support  
  :ballot_box_with_check: Custom rollup plugin integration support
  
## :sparkles: Usage

Before the Packer-CLI installation there are few pre-requisites to be complete. If your device meet the below requisites then you can proceed to the next section. 

- Install [Node.js](https://nodejs.org/en/) on your device. 
- Run `npm install -g npx` to install [npx](https://www.npmjs.com/package/npx) globally. (optional)

## :mag_right: Basic Usage

You can simply run the following command in a preferred directory to generate a new project using Packer CLI,

```sh
npx packer-cli generate my-library
```

or

```sh
npm install packer-cli -g && packer generate my-library
```

Once project is generated and dependencies are installed, you can use the following CLI commands:

```sh
# Run project on watch mode
npm run watch

# Production build
npm run build

# Run Style and script lint tasks
npm run lint

# Run style lint task
npm run lint:style

# Run script lint task
npm run lint:script

# Run unit test suite on development envrionemnt watch mode
npm run test

# Run unit test suite with coverage on development envrionemnt watch mode
npm run test:coverage

# Run unit test suite on continues integration environment mode
npm run test:ci

# Run unit test suite with coverage mode on continues integration environment mode
npm run test:coverage:ci

# Bump package version and push updated package config
npm version major|minor|patch

# Build project and publish to NPM
npm run release
```

Generated project structure can be viewed [here](docs/STRUCTURE.md)

## :gear: Standalone Usage

You can also use packer CLI standalone on any packer compliant project to customize the NPM scripts generated.

```text
Usage: packer [--version | -v] | [--help | -h] | <command>[<args>]

  Arguments supported with all commands

  + Logging flags
    [--trace]          set console log level to trace
    [--info]           set console log level to information
    [--warn]           set console log level to warning
    [--error]          set console log level to error
    [--silent]         set console log level to silent

  + Other Flags
    [--config | -c]    dynamic packer config path

  Generate a new library project via packer

  generate | g <project name>
    [--skipInstall | -sk]   skip dependency install after project

  These are packer commands can be used on generated project
    build | b                trigger build
    watch | w                trigger serve on watch mode
    test | t                 execute project test suite
      [--watch | -W]         execute test on watch mode
      [--coverage | -C]      execute test suite with coverage
    clean | c                clean project build artifacts and temporary files generated
    lint | l                 execute lint for project source
      [--style | -sc]        execute only style lint
      [--script | -sr]       execute only script lint
```

## :hammer_and_pick: Build Configuration

Build configuration can be updated after project generation via ``.packerrc.js``. Refer [packer configuratin options](docs/BUILD_CONFIGURATION.md) for more details.
                                                                                                                                                                 
## :seedling: Contributions

Feel free to open an issue or create a PR.

## :copyright: License

Packer-CLI was license under MIT. Please refer [LICENSE](https://github.com/yohangz/packer-cli/blob/master/LICENSE) for more information.
