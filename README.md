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

[![NPM](https://image.ibb.co/m2HMtp/npm.png)](https://www.npmjs.com/)
[![YARN](https://image.ibb.co/g1aVm9/yarn.png)](https://yarnpkg.com/)
[![Travis CI](https://image.ibb.co/fGqKeU/travis-ci.png)](https://travis-ci.org/)
[![Stylus](https://image.ibb.co/jteZDp/stylus.png)](http://stylus-lang.com/)
[![Style Lint](https://image.ibb.co/hqySYp/stylelint.png)](https://stylelint.io/)
[![Rollup](https://image.ibb.co/djqwR9/rollup.png)](https://rollupjs.org/)
[![Postcss](https://image.ibb.co/bSSbR9/postcss.png)](https://postcss.org/)
[![Mocha](https://image.ibb.co/nn2XzU/mocha.png)](https://mochajs.org/)
[![LESS](https://image.ibb.co/mXSXzU/less.png)](http://lesscss.org/)
[![Istanbul](https://image.ibb.co/fOsbR9/istanbul.png)](https://istanbul.js.org/)
[![Handlebars](https://image.ibb.co/g2Di69/handlebars.png)](https://handlebarsjs.com/)
[![Gulp](https://image.ibb.co/j8A7Yp/gulp.png)](https://gulpjs.com/)
[![ES Lint](https://image.ibb.co/iGhzeU/eslint.png)](https://eslint.org/)
[![Babel](https://image.ibb.co/hNSXzU/babel.png)](https://babeljs.io/)
[![SPDX](https://image.ibb.co/jSgEDp/spdx.png)](https://spdx.org/)
[![TS Lint](https://image.ibb.co/ddVVm9/ts-lint.png)](https://palantir.github.io/tslint/)
[![Jasmine](https://image.ibb.co/jrGEDp/jasmine.png)](https://jasmine.github.io/)
[![Karma](https://image.ibb.co/hq8i69/karma.png)](https://karma-runner.github.io)
[![SASS](https://image.ibb.co/jBLwR9/sass.png)](https://sass-lang.com/)
[![Typescript](https://image.ibb.co/fjR369/typescript.png)](https://www.typescriptlang.org/)
[![React](https://image.ibb.co/j9xLFA/react.png)](https://reactjs.org/)
[![Jest](https://image.ibb.co/dLBQhq/jest.png)](https://jestjs.io/)

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

Then CLI will query questions associated to custom project generation,

```sh
# Description about the library
Give us a small description about the library (optional)? Client compliant node module

# Comma separated package keywords to be included in package config
Give us a set of comma separated package keywords (optional)? lib,awesome library,my library

# Name of the library author
Author's name (optional)? Yohan Gomez

# Name of the library author.
Author's email address (optional)? yohan.gz@gmail.com

# Github username of the library author.
Author's github username (optional)? yohangz

# Web home page of the library. This must be a valid URL.
Library homepage link (optional)? http://www.my-project.com

# Script transpiler to be used. Select none to use vanilla javascript.
What's the script pre processor you want to use?
- typescript
- none

# Support CSS bundling if yes.  
Do you want style sheet support? (Y/n) Yes

# Style preprocessor to be used. Select none if not required.
What's the style pre processor you want to use?
- scss
- sass
- less
- stylus
- none

# Inline bundle style sheets within bundled script files. Select none to disable support.
Do you want to inline bundle styles within script? (y/N) No

# Target build process to support browser compliant bundling if yes
Are you building a browser compliant library? (Y/n) Yes

# If yes, react framework support will be enabled. Select none to disable support.
Are you building a react library? (y/N) No

# You can chose from the browser compliant flat bundle formats options list.
What's the build bundle format you want to use? umd
- umd
- amd
- iife
- system

# Custom AMD id can be provided if flat bundle format is UMD or AMD. Applicable for "amd" module format only.
What's the AMD id you want to use? my-lib

# Library namespace will be used when exposing the library via global scope. Applicable for "umd" | "iife" | "systemjs" module formats.
What's the library namespace you want to use? my.lib

# You can chose either Jasmine or Mocha unit test framework.
Which unit test framework do you want to use?
- jasmine
- mocha
- jest

# Library copyright year to be included in license file.
What's the library copyright year (optional)? 2018

# Generate license file for the project.
What's the license you want to use?
- MIT License
- Apache License 2.0
- Mozilla Public License 2.0
- BBSD 2-Clause FreeBSD License
- BSD 3-Clause Revised License
- Internet Systems Consortium (ISC) License
- GNU Lesser General Public License v3.0 only
- GNU General Public License v3.0 only
- The Unlicense

# Use yarn package manager instead of NPM CLI if true.
Do you want to use yarn as package manager? (Y/n) Yes
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
      [--coverage | -C]      execute test suite with coverage
    clean | c                clean project build artifacts and temporary files generated
    lint | l                 execute lint for project source
      [--style | -sc]        execute only style lint
      [--script | -sr]       execute only script lint
```

## :hammer_and_pick: Build Configuration

Build configuration can be updated after project generation via ``.packerrc.js``. 

```js
/**
 * Packer base configuration object.
 */
module.exports = {
  /**
   * Extend with packer base config
   * @type {string}
   * @default '~/packer-cli/resources/static/.packerrc.base.js'
   */
  extend: '~/packer-cli/resources/static/.packerrc.base.js',
    
  /**
   * Entry source file.
   * @type {string}
   * @default 'index.js'
   */
  entry: 'index.js',

  /**
   * Source directory
   * @type {string}
   * @default 'src'
   */
  source: 'src',

  /**
   * Build artifact output directory
   * @type {string}
   * @default 'dist'
   */
  dist: 'dist',

  /**
   * Watch and build temporary file directory
   * @type {string}
   * @default '.tmp'
   */
  tmp: '.tmp',

  /**
   * Packer compiler options
   */
  compiler: {

    /**
     * Dependency map mode option in target package.json file.
     * - 'cross-map-peer-dependency' : Map project dependencies to target peerDependencies
     * - 'cross-map-dependency' : Map project peerDependencies to target dependencies
     * - 'map-dependency' : Map project dependencies to target dependencies
     * - 'map-peer-dependency' : Map project peer dependencies to target peerDependencies
     * - 'all' - Map both peerDependencies and dependencies to target peerDependencies and dependencies
     * @type {string}
     * @default 'cross-map-peer-dependency'
     */
    dependencyMapMode: 'cross-map-peer-dependency',
    
    /**
     * Specified package fields will be copied to target package.json file.
     * @type {Array<string>}
     * @default [ 'name', 'version', 'description', 'keywords', 'author', 'repository', 'license', 'bugs', 'homepage' ]
     */
    packageFieldsToCopy: [
      'name',
      'version',
      'description',
      'keywords',
      'author',
      'repository',
      'license',
      'bugs',
      'homepage'
    ],

    /**
     * If true, a separate sourcemap file will be created. If inline, the sourcemap will be appended to
     * the resulting output file as a data URI.
     * @type {(boolean|string)}
     * @default true
     */
    sourceMap: true,
    
    /**
     * Custom rollup plugin extractor callback.
     * @callback customRollupPluginExtractorCallback
     * @param {string} buildType - 'bundle'|'es5'|'esnext'
     * @param {string} packerConfig - Packer configuration object.
     * @return {Array<{}>} Custom rollup plugin collection
     */

    /**
     * Extract custom rollup plugins to be executed while building the target artifacts.
     * @type {(null|customRollupPluginExtractorCallback)}
     */
    customRollupPluginExtractor: null,

    /**
     * Compile build target config.
     * @type {{}}
     * @default {}
     */
    build: {

      /**
       * Generate flat bundle minified build artifact.
       * @type {boolean}
       * @default true
       */
      bundleMin: true,

      /**
       * Generate flat es5 build artifact based on .babelrc es5 environment configuration.
       * @type {boolean}
       * @default false
       */
      es5: false,

      /**
       * Generate flat es5 minified build artifact.
       * @type {boolean}
       * @default false
       */
      es5Min: false,

      /**
       * Generate flat esnext build artifact based on .babelrc esnext environment configuration.
       * @type {boolean}
       * @default true
       */
      esnext: true,

      /**
       * Generate flat esnext minified build artifact.
       * @type {boolean}
       * @default true
       */
      esnextMin: true
    },

    /**
     * Library compile mode.
     * - 'browser' : Browser/NodeJS compliant module.
     * - 'node' : NodeJS only module.
     * - 'node-cli' : Node CLI module.
     * @type {string}
     * @default 'browser'
     */
    buildMode: 'browser',

    /**
     * Script compile configuration.
     * @type {{}}
     * @default {}
     */
    script: {

      /**
       * Script preprocessor.
       * - 'typescript' : use typescript preprocessor to transpile source.
       * - 'none': do not use any script preprocessor to transpile source.
       * @type {string}
       * @default 'none'
       */
      preprocessor: 'none',

      /**
       * Script required image compile configuration.
       * set false if not required to inline images
       * @type {({}|false)}
       * @default {}
       */
      image: {

        /**
         * Inline image if image size is less than or equal to specified limit.
         * @type {number}
         * @default 1000000
         */
        inlineLimit: 1000000,

        /**
         * Large image output directory within distribution directory.
         * @type {string}
         * @default 'images'
         */
        outDir: 'images'
      },
    },

    /**
     * Style compile configuration.
     * Set false if styles are not supported.
     * @type {({}|false)}
     * @default {}
     */
    style: {

      /**
       * Bundle styles inline within target build and inject to head at runtime.
       * @type {boolean}
       * @default false
       */
      inline: false,

      /**
       * Bundled style output directory path within distribution directory.
       * @type {string}
       * @default 'styles'
       */
      outDir: 'styles',

      /**
       * Style preprocessor
       * - 'scss' : SCSS style preprocessor.
       * - 'sass' : SASS style preprocessor.
       * - 'stylus' : Stylus style preprocessor.
       * - 'less' : LESS style preprocessor.
       * - 'none' : Do not use any style preprocessor.
       * @type {string}
       * @default 'none'
       */
      preprocessor: 'none',

      /**
       * Stylesheet required image compile configuration.
       * set false if not required to inline images
       * @type {({}|false)}
       * @default {}
       */
      image: {

        /**
         * Inline image if image size is less than or equal to specified limit.
         * @type {number}
         * @default 1000000
         */
        inlineLimit: 1000000,

        /**
         * Large image output directory within distribution directory.
         * @type {string}
         * @default 'images'
         */
        outDir: 'images'
      }
    },

    /**
     * Run bundle build tasks concurrently to improve performance if true
     * @type {boolean}
     * @default true
     */
    concurrentBuild: true,
    
    /**
     * Advance compiler options to override plugin configuration.
     * Caution! change only if you know what you are doing.
     * @type {{}}
     */
    advanced: {

      /**
       * Rollup plugins.
       * refer: https://rollupjs.org
       * @type {{}}
       */
      rollup: {

        /**
         * Override rollup build task input options.
         * refer: https://rollupjs.org inputOptions section.
         * @type {{}}
         */
        inputOptions: {},

        /**
         * Override rollup build task output options.
         * refer: https://rollupjs.org outputOptions section.
         * @type {{}}
         */
        outputOptions: {},

        /**
         * Override rollup watch task options.
         * refer: https://rollupjs.org watchOptions section.
         * @type {{}}
         */
        watchOptions: {},

        /**
         * Override rollup plugin options.
         * refer: https://rollupjs.org plugins section.
         * @type {{}}
         */
        pluginOptions: {

          /**
           * Override ignore import plugin options
           * refer: https://github.com/yohangz/rollup-plugin-ignore-import
           * @type {{}}
           */
          ignoreImport: {},

          /**
           * Override post css plugin options.
           * refer: https://github.com/egoist/rollup-plugin-postcss
           */
          postCss: {},

          /**
           * Override node resolve plugin options.
           * refer: https://github.com/rollup/rollup-plugin-node-resolve
           * @type {{}}
           */
          nodeResolve: {},

          /**
           * Override commonjs plugin options.
           * refer: https://github.com/rollup/rollup-plugin-commonjs
           * @type {{}}
           */
          commonjs: {},

          /**
           * Override json plugin options.
           * refer: https://github.com/rollup/rollup-plugin-json
           * @type {{}}
           */
          json: {},

          /**
           * Override globals plugin options.
           * refer: https://github.com/calvinmetcalf/rollup-plugin-node-globals
           * @type {{}}
           */
          globals: {},

          /**
           * Override babel plugin options.
           * refer: https://github.com/rollup/rollup-plugin-babel
           * @type {{}}
           */
          babel: {},

          /**
           * Override typescript plugin options.
           * refer: https://github.com/ezolenko/rollup-plugin-typescript2
           * @type {{}}
           */
          typescript: {},

          /**
           * Override replace plugin options.
           * refer: https://github.com/jetiny/rollup-plugin-re
           */
          replace: {},

          /**
           * Override image plugin options.
           * refer: https://github.com/alwaysonlinetxm/rollup-plugin-img
           * @type {{}}
           */
          image: {},

          /**
           * Override handlebars plugin options.
           * refer: https://github.com/yohangz/rollup-plugin-hbs
           * @type {{}}
           */
          handlebars: {},

          /**
           * Override filesize plugin options.
           * refer: https://github.com/ritz078/rollup-plugin-filesize
           * @type {{}}
           */
          filesize: {},

          /**
           * Override serve plugin options.
           * refer: https://github.com/thgh/rollup-plugin-serve
           * @type {{}}
           */
          serve: {},

          /**
           * Override live reload plugin options.
           * refer: https://github.com/thgh/rollup-plugin-livereload
           * @type {{}}
           */
          liveReload: {}
        }
      },

      /**
       * Other plugins.
       */
      other: {

        /**
         * Override terser plugin options.
         * refer: https://github.com/terser-js/terser
         * @type {{}}
         */
        terser: {},

        /**
         * Override cssnano options.
         * refer: https://github.com/cssnano/cssnano
         * @type {{}}
         */
        cssnano: {}
      }
    }
  },

  /**
   * List of paths which contains static assets referenced in style sheets.
   * Paths should be relative to project root.
   * @type {Array<string>}
   * @default []
   */
  assetPaths: [
    'src/assets'
  ],

  /**
   * List of files paths to copy on build.
   * Paths should be relative to project root.
   * @type {Array<string>}
   * @default [ 'README.md', 'LICENSE' ]
   */
  copy: [
    'README.md',
    'LICENSE',
    'assets/**/{.*,*}'
  ],

  /**
   * Import paths to ignore with noop implementation.
   * Paths should be relative to project root.
   * @type {Array<string>}
   * @default []
   */
  ignore: [],

  /**
   * Custom rollup plugin extractor callback.
   * @callback pathReplaceCallback
   * @param {string} code - code segment
   * @param {string} id - file path/identifier.
   * @return {string} transformed code.
   */

  /**
   * Path Replace pattern object type.
   * @typedef {Object} PathReplacePattern
   * @property {(string|RegExp)} test - test expression or string.
   * @property {string} replace - string to replace the match.
   * @property {RegExp} match - regexp match with resolved path.
   * @property {(string|string[])} include - whitelist patterns to match.
   * @property {(string|string[])} exclude - blacklist patterns avoid matching.
   * @property {string} text - replace content with given text.
   * @property {string} file - replace with given file relative to project root.
   * @property {pathReplaceCallback} transform - path replace function.
   */

  /**
   * Import path replace pattern collection.
   * @type {Array<PathReplacePattern>}
   * @default []
   */
  replacePatterns: [
    {
      /**
       * Test path identifier string or regular expression.
       * @type {(string|RegExp)}
       * @default ''
       */
      test: './config/base-config',

      /**
       * Replace path string.
       * @type {string}
       * @default ''
       */
      replace: './config/replace-config'
    }
  ],

  /**
   * Bundle artifact build configuration.
   * @type {{}}
   */
  bundle: {

    /**
     * Bundle output external dependencies (dependency modules to treat as externals).
     * Refer rollup options for more info.
     * @type {Array<string>}
     * @default []
     */
    externals: [
      'regenerator-runtime/**',
      '@babel/runtime/**',
      '@babel/runtime-corejs2/**'
    ],

    /**
     * Bundle output global dependencies (dependency modules to tread as globals).
     * Refer rollup options for more info.
     * @type {{}}
     * @default {}
     */
    globals: {
      'react': 'React',
      'react-dom': 'ReactDOM'
    },

    /**
     * Treat globals as externals if true
     * @type {boolean}
     * @default true
     */
    mapExternals: true,

    /**
     * Browser compliant bundle modules formats (based on .babelrc bundle environment configuration)
     * - 'umd' – Universal Module Definition, works as amd, cjs and iife all in one
     * - 'amd' – Asynchronous Module Definition, used with module loaders like RequireJS
     * - 'iife' – A self-executing function, suitable for inclusion as a DOM script tag. (If you want to create a bundle
     * for your application, you probably want to use this, because it leads to smaller file sizes.)
     * - 'system' - Native format of SystemJS loader
     *
     * NodeJS only bundle module formats
     * 'cjs' – CommonJS, suitable for Node and Browserify/Webpack
     * 'esm' – Keep the bundle as an ES module file
     * @type {string}
     * @default 'umd'
     */
    format: 'umd',

    /**
     * Library global scope namespace (only applicable for browser compliant).
     * @type {string}
     * @default 'com.lib'
     */
    namespace: 'com.lib',

    /**
     * AMD flat bundle configuration
     * @type {{}}
     * @default {}
     */
    amd: {

      /**
       * AMD flat bundle define function name
       * @type {string}
       * @default ''
       */
      define: '',

      /**
       * AMD flat bundle module identifier name
       * @type {string}
       * @default 'my-lib'
       */
      id: 'my-lib'
    }
  },

  /**
   * Unit test framework
   *  - 'jasmine'
   *  - 'mocha'
   *  - 'jest'
   * @type {string}
   * @default 'jasmine'
   */
  testFramework: '{{testFramework}}',

  /**
   * Watch mode configuration
   * Set false if not required to serve on watch build.
   * @type {({}|false)}
   * @default {}
   */
  watch: {

    /**
     * Demo watch source directory which contains index.html to serve.
     * This path should be relative to root.
     * @type {string}
     * @default 'demo/watch'
     */
    demoDir: 'demo/watch',

    /**
     * Demo watch helper directory which contains helper scripts to serve.
     * This path should be relative to root.
     * @type {string}
     * @default 'demo/watch'
     */
    helperDir: 'demo/helper',

    /**
     * Additional serve directories.
     * These paths should be relative to root.
     * @type {Array<string>}
     * @default []
     */
    serveDir: [
      'node_modules/react/umd',
      'node_modules/react-dom/umd'
    ],

    /**
     * Open browser tab on watch mode build if true
     * @type {boolean}
     * @default true
     */
    open: true,

    /**
     * Watch source serve port.
     * @type {number}
     * @default 4000
     */
    port: 4000
  },

  /**
   * Bundle license configuration
   * @type {{}}
   * @default {}
   */
  license: {

    /**
     * Include inline header banner parsed via .packer/.banner.hbs template to build artifacts.
     * @type {boolean}
     * @default true
     */
    banner: true
  }
};
```
                                                                                                                                                                 
## :seedling: Contributions

Feel free to open an issue or create a PR.

## :copyright: License

Packer-CLI was license under MIT. Please refer [LICENSE](https://github.com/yohangz/packer-cli/blob/master/LICENSE) for more information.
