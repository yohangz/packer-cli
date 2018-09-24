# Packer CLI
> Inspired by Angular CLI >>> Full-fledged CLI tool to package library node module modules compliant with Browser and NodeJS with vanilla JS and Typescript source support.

[![Build Status](https://travis-ci.org/yohangz/packer-cli.svg?branch=master)](https://travis-ci.org/yohangz/packer-cli)
[![MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://github.com/yohangz/packer-cli/blob/master/LICENSE)

# Features

- [x] Managed build config 
- [x] NPM
- [x] Yarn
- [x] Travis
- [x] Typescript 2.x
- [x] Babel 7.x
- [x] TS Lint code analysis
- [x] Precompiled handlebars templating
- [x] Post CSS based image inline and auto prefixing
- [x] Styling using SCSS
- [x] SCSS Lint
- [x] Karma 
- [x] Jasmine 
- [x] Rollup and Gulp based build process
- [x] FESM5, FESM2015 and UMD build output
- [x] Emmit type definitions
- [x] Ready to publish as Node module
- [x] Inline and bundle style
- [x] Theme packaging
- [x] Import path replace
- [x] Exclude external peer dependencies
- [x] Bundle peer dependencies
- [x] Ignore imports
- [x] Copy static assets to build dir

# Usage

You can simply run the following command in preferred directory to generate a new project using Packer CLI,

```npx packer-cli generate my-library```

or

```npm install packer-cli -g && packer new my-library```

Then CLI will query questions associated to custom project generation,

```sh
# Library name will be used when package is published to NPM
What would you name your library? my-project

# Description about the library
Give us a small description about the library (optional)? Client complient node module

# Name of the library author
Author's name (optional)? Yohan Gomez

# Name of the library author.
Author's email address (optional)? yohan.gz@gmail.com

# Web home page of the library. This must be a valid URL.
Library homepage link (optional)? http://www.my-project.com

# Use typescript transpiler if Yes.
Do you want to use typescript? (Y/n) Yes

# Inline bundle style sheets within bundled script files.
Do you want to inline bundle CSS styles in script? (Y/n) Yes

# You can close from the bundel formats options list.
What's the build bundle format you want to use? umd
- umd
- amd
- iife
- system
- esm
- cjs

# Library namespace will be used when exposing the libray via global scope.
What's the library namespace you want to use? my.lib

# Library copyright year will be included in license file.
What is the library copyright year (optional)? 2018

# License type which suould be used.
What's the license you want to use? MIT License
- MIT License
- Apache 2 License
- Mozilla Public License 2.0
- BSD 2-Clause (FreeBSD) License
- BSD 3-Clause (NewBSD) License
- Internet Systems Consortium (ISC) License
- GNU LGPL 3.0 License
- GNU GPL 3.0 License
- Unlicense
- No License

# Use yarn package manager instaid of NPM CLI if true.
Do you want to use yarn as package manager? (Y/n) Yes
```
 
Once project is generated and dependencies are installed, you can use the following CLI commands:

```sh
# Run project on watch mode
npm run watch

# Production build
npm run build

# Run unit test suite on development envrionemnt watch mode
npm run test

# Run unit test suite on continues integration environment mode
npm run test:ci

# Bump package version and push updated package config
npm version major|monor|patch

# Build project and publish to NPM
npm run release
```

# Generated Project Structure

```
.
├── /demo/                      # Demo source content (applicable if serve mode is enabled in config)
│   ├── /build/                 # Build demo page and assets
│   └── /watch/                 # Watch demo page and assets
├── /src/                       # Library source of the project
├── /node_modules/              # Node modules directory
├── /dist/                      # Compiled distribution artifacts directory (Generated by build task).
│   ├── /bundles                # Directory containing bundled artifacts (umd, amd, iife, system, es or cjs).
│   ├── /fesm5                  # Directory coniaining FESM5 artifact.
│   ├── /fesm2015               # Directory coniaining FESM2015 artifact.
│   ├── /styles                 # Directory containing compiled style sheets.
│   ├── /LICENSE                # Project license agreement file.
│   ├── /package.json           # Package.json file with publish artifact specific configuration.
│   └── /README.md              # Package documentation markup file.
├── .editorconfig               # Define and maintain consistent coding styles between different editors and IDEs.
├── .gitignore                  # Contains files to be ignored when pushing to git.
├── .scss-lint.yml              # SCSS Lint config file.
├── .travis.yml                 # Travis CI configuration file.
├── config.json                 # This file contains library build configuration options.
├── karma.conf.js               # This file contains karma unit test runner configuration.
├── LICENSE                     # License agreement file
├── package.json                # NPM configuration and medata.
├── README.md                   # Project documentation markup file.
├── tsconfig.es5.json           # This file contains ES5 typescript compiler options and configuration.
├── tsconfig.es2015.json        # This file contains ES2015 typescript compiler options and configuration.
├── tsconfig.json               # This file contains base typescript compiler options and configuration.
└── tslint.json                 # TS Lint rules for the project.
```

# Build Configuration

Build configuration can be changed depending on your preference. 

```json
{
  "namespace": "ts.lib",
  "entry": "index.ts",
  "source": "src/ts",
  "out": "dist",
  "tsProject": true,
  "watch": {
    "script": ".tmp",
    "demo": "demo/watch",
    "port": 4000,
    "serve": true,
    "open": true
  },
  "copy": [
    "README.md",
    "LICENSE"
  ],
  "flatGlobals": {},
  "esmExternals": [
    "handlebars/runtime"
  ],
  "pathReplacePatterns": [
    {
      "test": "./conf/conf1",
      "replace": "./conf/conf2"
    }
  ],
  "ignore": [],
  "imageInlineLimit": 1000000,
  "assetPaths": [
    "src/assets"
  ],
  "bundleStyle": false,
  "bundleFormat": "umd"
}
```

| Config                      	| Type             	| Definition                                                                       	|
|-----------------------------	|------------------	|----------------------------------------------------------------------------------	|
| namespace                   	| string           	| application namespace to be used                                                 	|
| entry                       	| string           	| entry typescript file                                                            	|
| source                      	| string           	| source directory                                                                 	|
| out                         	| string           	| build output directory                                                           	|
| tsProject                     | boolean           | Set true if library source is in Typescript                                       |
| watch                       	| object           	| watch mode configuration object                                                  	|
| watch.script                	| string           	| watch build temp directory                                                       	|
| watch.demo                  	| string           	| watch demo page dir                                                              	|
| watch.port                  	| number           	| watch server port                                                                	|
| watch.serve                  	| boolean          	| Serve project via browser on watch mode
| watch.open                  	| boolean          	| open browser automatically                                                       	|
| copy                        	| array of strings 	| List of files paths to copy on build.                                            	|
| flatGlobals                 	| object           	| flat bundle build global dependencies.  Listed will not be treated as externals. 	|
| esmExternals                	|                  	| ESM build external dependencies                                                  	|
| pathReplacePatterns         	| array of objects 	| Import path replace pattern collection                                           	|
| pathReplacePatterns.test    	| string           	| Path to find                                                                     	|
| pathReplacePatterns.replace 	| string           	| Path to replace                                                                  	|
| ignore                      	| array of strings 	| Import paths to ignore with noop implementation                                  	|
| imageInlineLimit            	| number           	| Inline image if image size is less than specified limit                          	|
| assetPaths                  	| array of strings 	| List of paths which contains static assets referenced in style sheets            	|
| bundleStyle                 	| boolean          	| Inline bundle styles to build                                                    	|
| bundleFormat                	| string           	| umd, amd, iife, system, es, cjs                                             	    |

# Contributions

Feel free to open an issue or create a PR
