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

This project is inspired by [Angular CLI](https://cli.angular.io/)

# Features

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

- [x] Managed build configuration
- [x] Encapsulated build process
- [x] Both NPM and Yarn support
- [x] Travis CI
- [x] Typescript and Babel based code transpilation
- [x] TS Lint based Typescript code analysis
- [x] ES Lint based Javascript code analysis
- [x] Style lint based style sheet code analysis
- [x] Precompiled handlebars templating
- [x] Support SCSS, SASS, LESS and Stylus and vanilla CSS
- [x] Post CSS based image inline and auto prefixing
- [x] Karma unit test runner
- [x] Jasmine and Mocha unit test frameworks
- [x] Rollup and Gulp based build process
- [x] FESM5, FESM2015 and UMD build output
- [x] Emmit type definitions for typescript projects
- [x] Ready to publish as Node module
- [x] Inline and bundle styles
- [x] Theme packaging
- [x] Source import path replace
- [x] Exclude external peer dependencies in bundle
- [x] Bundle peer dependencies
- [x] Ignore imports
- [x] Copy static assets to build dir
- [x] Library summary banner generation
- [x] Library dependency license extraction
- [x] Node CLI project support
- [x] JSX and TSX support

# Usage

You can simply run the following command in a preferred directory to generate a new project using Packer CLI,

```npx packer-cli generate my-library```

or

```npm install packer-cli -g && packer generate my-library```

Then CLI will query questions associated to custom project generation,

```
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

## If yes, react framework support will be enabled. Select none to disable support.
Are you building a react library? (y/N) No

# You can chose from the browser compliant flat bundle formats options list.
What's the build bundle format you want to use? umd
- umd
- amd
- iife
- system

# Custom AMD id can be provided if flat bundle format is UMD or AMD. Applicable for "amd" module format only.
What's the AMD id you want to use? (optional) my-lib

# Library namespace will be used when exposing the library via global scope. Applicable for "umd" | "iife" | "systemjs" module formats.
What's the library namespace you want to use? my.lib

# You can chose either Jasmine or Mocha unit test framework.
Which unit test framework do you want to use?
- Jasmine
- Mocha

# Library copyright year to be included in license file.
What is the library copyright year (optional)? 2018

# Generate license file for the project.
What's the library copyright year (optional)?
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

# Generated Project Structure

```
.
├── /.rpt2_cache/               # TypeScript build cache directory
├── /.packer/                   # Build helpers files directory
│   ├── .banne.hbs              # Build artifact top banner comment template. 
│   └── .bin.hbs                # Build artifact bin file template used in CLI projects
├── /.tmp/                      # Watch build temporary artifact directory
├── /demo/                      # Demo source content (applicable if serve mode is enabled in config)
│   ├── /build/                 # Build demo page and assets
│   ├── /helper/                # Watch and build demo helper scripts
│   │   ├── require.min.js      # RequireJS static artifact
│   │   └── system.min.js       # SystemJS static artifact
│   └── /watch/                 # Watch demo page and assets
├── /dist/                      # Compiled distribution artifacts directory (Generated by build task)
│   ├── /bundles                # Directory containing main bundled artifacts (umd, amd, iife, system, ejs, esm)
│   ├── /fesm5                  # Directory containing FESM5 artifact.
│   ├── /fesmnext               # Directory containing FESMNEXT artifact.
│   ├── /styles                 # Directory containing compiled style sheets.
│   ├── /LICENSE                # Project license agreement file.
│   ├── /package.json           # Package.json file with publish artifact specific configuration.
│   └── /README.md              # Package documentation markup file.
├── /node_modules/              # Node modules directory
├── /src/                       # Library source of the project
│   ├── /sub_srcs               # Contain any sub sources(files or folders)
│   └── /index.ts               # Expose the accesible properties to the global
├── .babelrc.bundle.js          # Bundle build babel config.
├── .babelrc.es5.js             # ES5 build babel config.
├── .babelrc.esnext.js          # ESNext build babel config.
├── .editorconfig               # Define and maintain consistent coding styles between different editors and IDEs.
├── .gitignore                  # Contains files to be ignored when pushing to git.
├── .packerrc.json              # This file contains library build configuration options.
├── .stylelintrc.json           # Style lint configuration.
├── .eslintrc.yml               # ES Lint configuration.
├── .travis.yml                 # Travis CI configuration file.
├── karma.conf.js               # This file contains karma unit test runner configuration.
├── LICENSE                     # License agreement file
├── package.json                # NPM configuration and medata.
├── README.md                   # Project documentation markup file.
├── tsconfig.json               # This file contains base typescript compiler options and configuration.
└── tslint.json                 # TS Lint rules for the project.
```

# Build Configuration

Build configuration can be updated after project generation via ``.packerrc.json``. 

```json
{
  "entry": "index.ts",
  "source": "src",
  "dist": "dist",
  "tmp": ".tmp",
  "output": {
    "amd": {
      "define": "",
      "id": ""
    },
    "dependencyMapMode": "cross-map-peer-dependency",
    "esnext": true,
    "es5": true,
    "minBundle": true,
    "format": "umd",
    "imageInlineLimit": 1000000,
    "inlineStyle": false,
    "stylesDir": "styles",
    "namespace": "my.lib",
    "sourceMap": true
  },
  "compiler": {
    "buildMode": "browser",
    "scriptPreprocessor": "typescript",
    "stylePreprocessor": "scss",
    "styleSupport": true,
    "concurrentBuild": true
  },
  "assetPaths": [
    "src/assets"
  ],
  "copy": [
    "README.md",
    "LICENSE"
  ],
  "bundle": {
    "externals": [
      "regenerator-runtime/**",
      "@babel/runtime/**",
      "@babel/runtime-corejs2/**",
      "handlebars/runtime"
    ],
    "globals": {},
    "mapExternals": false
  },
  "ignore": [],
  "replacePatterns": [
    {
      "replace": "./config/replace-config",
      "test": "./config/base-config"
    }
  ],
  "testFramework": "jasmine",
  "watch": {
    "demoDir": "demo/watch",
    "helperDir": "demo/helper",
    "serveDir": [],
    "open": true,
    "port": 4000,
    "serve": true
  },
  "license": {
    "banner": true,
    "thirdParty": {
      "fileName": "dependencies.txt",
      "includePrivate": false
    }
  }
}
```

| Config                      	| Type             	| Definition                                                                       	                                                                                                                             |
|-----------------------------	|------------------	|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| entry                       	| string           	| entry source file                                                            	                                                                                                                                 |
| source                      	| string           	| source directory                                                                 	                                                                                                                             |
| dist                          | string           	| build artifact output directory                                                                                                                                                                                |
| tmp                           | string           	| watch and build temporary file directory                                                       	                                                                                                               |
| output                        | object           	| Build artifact output generation config                                                                                                                                                                        |
| output.amd                 	  | object          	| AMD flat bundle configuration                                                    	                                                                                                                             |
| output.amd.define             | string          	| AMD flat bundle define function name                                                                                                                                                                           |
| output.amd.id                 | string          	| AMD flat bundle module identifier name                                                                                                                                                                         |
| output.dependencyMapMode      | object            | Dependency map modes                                                                                                                                                                                           |
|                               |                   | "cross-map-peer-dependency" - Map project dependencies to target peerDependencies                                                                                                                              |
|                               |                   | "cross-map-dependency" - Map project peerDependencies to target dependencies                                                                                                                                   |
|                               |                   | "map-dependency" - Map project dependencies to target dependencies                                                                                                                                             |
|                               |                   | "map-peer-dependency" - Map project peer dependencies to target peerDependencies                                                                                                                               |
|                               |                   | "all" - Map both peerDependencies and dependencies to target peerDependencies and dependencies                                                                                                                 |
| output.esnext                 | boolean           | Generate flat ESNext module build artifacts based on ``.babelrc.esnext.js``  
| output.es5                    | boolean           | Generate flat ES5 module build artifacts based on ``.babelrc.es5.js``                                                                                                                                          |                                                                                                                                  |
| output.minBundle              | boolean           | Generate minified flat bundle build artifact                                                                                                                                                                   |
| output.format                	| string           	| Browser compliant bundle modules formats (based on ``.babelrc.bundle.js``)                                                                                                                                     |
|                               |                   | "umd" – Universal Module Definition, works as amd, cjs and iife all in one                                                                                                                                     |
|                               |                   | "amd" – Asynchronous Module Definition, used with module loaders like RequireJS                                                                                                                                |
|                               |                   | "iife" – A self-executing function, suitable for inclusion as a <script> tag. (If you want to create a bundle for your application, you probably want to use this, because it leads to smaller file sizes.)    |
|                               |                   | "system" - Native format of SystemJS loader                                                                                                                                                                    |
|                               |                   | NodeJS only bundle module formats                                                                                                                                                                              |
|                               |                   | "cjs" – CommonJS, suitable for Node and Browserify/Webpack                                                                                                                                                     |
|                               |                   | "esm" – Keep the bundle as an ES module file                                                                                                                                                                   |
| output.imageInlineLimit       | number            | Size limit in bytes to inline compile images                                                                                                                                                                   |
| output.inlineStyle            | boolean           | Inline bundle styles withing JS distribution if true                                                                                                                                                           |
| output.stylesDir              | string            | Style artifact output directory within dist                                                                                                                                                                    |
| output.namespace              | string            | Library global scope namespace (only applicable for browser compliant)                                                                                                                                         |
| output.sourceMap              | string or boolean | If true, a separate sourcemap file will be created. If inline, the sourcemap will be appended to the resulting output file as a data URI.                                                                      |                                                                                                                                       |
| compiler                      | object            | Compiler options object                                                                                                                                                                                        |
| compiler.buildMode            | string            | Library compile mode                                                                                                                                                                                           |
|                               |                   | "browser" - Browser/NodeJS compliant module                                                                                                                                                                    |
|                               |                   | "node" - NodeJS only module                                                                                                                                                                                    |
|                               |                   | "node-cli" - Node CLI module                                                                                                                                                                                   |
| compiler.scriptPreprocessor   | string            | Support "typescript" and "none" options                                                                                                                                                                        |
| compiler.stylePreprocessor    | string            | Support "scss", "sass", "stylus", "less" and "none" options                                                                                                                                                    |
| compiler.styleSupport         | boolean           | Support style preprocessing and linting                                                                                                                                                                        |
| compiler.concurrentBuild      | boolean           | Build library bundles in concurrent mode if true                                                                                                                                                               |                
| assetPaths                    | array of strings 	| List of paths which contains static assets referenced in style sheets                                                                                                                                          |
| copy                          | array of strings 	| List of files paths to copy on build.                                                                                                                                                                          |
| bundle                        | object            | Bundle options                                                                                                                                                                                                 |
| bundle.externals              | array of string   | Bundle output external dependencies (dependency modules to treat as externals). Refer [rollup](https://rollupjs.org) options for more info.                                                                    |
| bundle.globals                | object            | Bundle output global dependencies (dependency modules to tread as globals). Refer [rollup](https://rollupjs.org) options for more info.                                                                        |
| bundle.mapExternals           | boolean           | Treat globals as externals if true                                                                                                                                                                             |
| bundle.ignore                 | array of strings 	| Import paths to ignore with noop implementation                                                                                                                                                                |
| replacePatterns         	    | array of objects 	| Import path replace pattern collection                                           	                                                                                                                             |
| replacePatterns.test    	    | string           	| Path to find                                                                     	                                                                                                                             |
| replacePatterns.replace 	    | string           	| Path to replace                                                                  	                                                                                                                             |
| testFramework                 | string            | Support "Jasmine", "Mocha" and "jest" test framework options                                                                                                                                                   |
| watch                       	| object           	| watch mode configuration object                                                  	                                                                                                                             |
| watch.demoDir                 | string           	| watch demo page dir                                                              	                                                                                                                             |
| watch.helperDir               | string           	| watch build helper library directory                                                                                                                                                                           |
| watch.serverDir               | string           	| watch server dir                                                              	                                                                                                                             |
| watch.port                  	| number           	| watch server port                                                                	                                                                                                                             |
| watch.serve                  	| boolean          	| Serve project via browser on watch mode                                                                                                                                                                        |
| watch.open                  	| boolean          	| open browser automatically on watch mode                                                      	                                                                                                               |
| license                       | object            | Bundle license configuration                                                                                                                                                                                   |
| license.banner                | boolean           | Include inline header banner passed via ``.banner.hbs`` template                                                                                                                                               |
                                                                                                                                                                  
# Contributions

Feel free to open an issue or create a PR
