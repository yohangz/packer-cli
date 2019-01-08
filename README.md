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

> Packer CLI helps you to kickstart new node module projects compliant with NodeJS and Browser, prescribing best practices. Packer encapsulating file-watching, live-reloading, transpiling, bundling and unit test framework integration with coverage and much more, so you don't have to. You will get to enjoy the latest latest JavaScript awesomeness with flexibility to custom fit your project needs.
  To do so, we provide a generator ecosystem via command line to scaffold complete projects with full control over all exposed workflows.
  
  Explained in detail: [Build Node Modules Like a Pro with Packer CLI](http://bit.ly/packer-cli)
  
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

## :bulb: Tech Stack

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

## :sparkles: Usage

Proceed with next steps if your platform meet following prerequisites. 

- Install [Node.js](https://nodejs.org/en/) on your device. 
- Optional: Run `npm install -g npx` to install [npx](https://www.npmjs.com/package/npx) globally.

## :mag_right: Basic Usage

<p align="center">
  <img src="https://i.ibb.co/hDZZFZb/packer-intro.gif" alt="Packer Intro" width="620px" />
</p>

You can simply run the following command in a preferred directory to generate a new library project using Packer CLI,

```sh
npx packer-cli generate my-library
```

or

```sh
npm install packer-cli -g && packer generate my-library
```

Once project is generated and dependencies are installed, you can use the following NPM scripts:

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
      [--perf | -P]          execute build task with rollup performance monitoring
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

Build configuration can be updated after project generation via ``.packerrc.js``. Refer [packer configuratin options](docs/BUILD_CONFIGURATION.md) for detailed configuration options list.
                                                                                                                                                                 
## :seedling: Contributions

Feel free to open an issue or create a PR.

## :copyright: License

Packer-CLI is MIT licensed. Please refer [LICENSE](https://github.com/yohangz/packer-cli/blob/master/LICENSE) for more information.
