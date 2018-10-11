<p align="center">
  <img src="https://image.ibb.co/g1heu9/packer_cli.png" alt="Packer CLI"/>
  
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

> Full-fledged CLI tool to package library node module modules compliant with Browser and NodeJS with vanilla JS and Typescript source support | Inspired by Angular CLI

# Features

- [x] Managed build config 
- [x] NPM
- [x] Yarn
- [x] Travis
- [x] Typescript 2.x
- [x] Babel 7.x
- [x] TS Lint based Typescript code analysis
- [x] ES Lint based Javascript code analysis
- [x] Style lint based style sheet code analysis.
- [x] Precompiled handlebars templating
- [x] Support SCSS, LESS and Stylus and vanilla CSS
- [x] Post CSS based image inline and auto prefixing
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

```npm install packer-cli -g && packer generate my-library```

Then CLI will query questions associated to custom project generation,

```sh
# Description about the library
Give us a small description about the library (optional)? Client complient node module

# Name of the library author
Author's name (optional)? Yohan Gomez

# Name of the library author.
Author's email address (optional)? yohan.gz@gmail.com

# Web home page of the library. This must be a valid URL.
Library homepage link (optional)? http://www.my-project.com

# Use typescript transpiler if yes.
Do you want to use typescript? (Y/n) Yes

# Support CSS bundling if yes.  
Do you want style sheet support? (Y/n) Yes

# Style proprocessor to be used. Select none if not required.
What's the style pre processor you want to use?
- scss
- sass
- less
- stylus
- none

# Inline bundle style sheets within bundled script files.
Do you want to inline bundle styles within script? (Y/n) Yes

# Target build process to support browser compliant bundling if yes
Are you building a browser compliant library? Yes

# You can chose from the browser compliant flat bundel formats options list.
What's the build bundle format you want to use? umd
- umd
- amd
- iife
- system

# Custom AMD id can be provided if flat bundle format is UMD or AMD.
What's the AMD id you want to use? (optional) my-lib

# Library namespace will be used when exposing the libray via global scope.
What's the library namespace you want to use? my.lib

# You can chose either Jasmine or Mocha unit test framework.
Which unit test framework do you want to use?
- Jasmine
- Mocha

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

# Run Style and script lint tasks
npm run lint

# Run style lint task
npm run lint:style

# Run script lint task
npm run lint:script

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
├── /.rpt2_cache/               # TypeScript build cache directory
├── /.tmp/                      # Watch build tempary artifact directory
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
├── .eslintrc.yml               # ES Lint configuration.
├── .gitignore                  # Contains files to be ignored when pushing to git.
├── .packerrc.json              # This file contains library build configuration options.
├── .stylelintrc.json           # Style lint configuration.
├── .travis.yml                 # Travis CI configuration file.
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

Build configuration can be updated after project generation via ``.packerrc.json``. 

```json
{
  "namespace": "my.lib",
  "entry": "index.ts",
  "source": "src",
  "dist": {
    "outDir": "dist",
    "stylesDir": "styles",
    "generateFESM5": true,
    "generateFESM2015": true,
    "generateMin": true
  },
  "tsProject": true,
  "stylePreprocessor": "scss",
  "watch": {
    "scriptDir": ".tmp",
    "helperDir": "demo/helper",
    "demoDir": "demo/watch",
    "serve": true,
    "port": 4000,
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
      "test": "./config/base-config",
      "replace": "./config/replace-config"
    }
  ],
  "ignore": [],
  "assetPaths": [
    "src/assets"
  ],
  "testFramework": "jasmine",
  "bundle": {
    "amd": {
      "define": "",
      "id": "myLib"
    },
    "format": "umd",
    "imageInlineLimit": 1000000,
    "inlineStyle": false
  }
}
```

| Config                      	| Type             	| Definition                                                                       	|
|-----------------------------	|------------------	|----------------------------------------------------------------------------------	|
| namespace                   	| string           	| application namespace to be used                                                 	|
| entry                       	| string           	| entry typescript file                                                            	|
| source                      	| string           	| source directory                                                                 	|
| dist.outDir                   | string           	| build artifact output directory                                                   |
| dist.stylesDir                | string           	| build associated stylesheet output directory within out dir                       |
| generateFESM5                 | boolean           | Generate flat ESM5 module build artifacts                                         |
| generateFESM2015              | boolean           | Generate flat ESM2015 module build artifacts                                      |
| generateMin                   | boolean           | Generate flat bundle build minified artifact                                      |
| tsProject                     | boolean           | Set true if library source is in Typescript                                       |
| stylePreprocessor             | string           	| Style preprocessor can be "scss", "sass", "stylus", "less"                        |    
| watch                       	| object           	| watch mode configuration object                                                  	|
| watch.scriptDir               | string           	| watch build temp directory                                                       	|
| watch.helperDir               | string           	| watch build helper library directory                                              |
| watch.demoDir                 | string           	| watch demo page dir                                                              	|
| watch.port                  	| number           	| watch server port                                                                	|
| watch.serve                  	| boolean          	| Serve project via browser on watch mode                                           |
| watch.open                  	| boolean          	| open browser automatically                                                       	|
| copy                        	| array of strings 	| List of files paths to copy on build.                                            	|
| flatGlobals                 	| object           	| flat bundle build global dependencies.  Listed will not be treated as externals. 	|
| esmExternals                	| array of string   | ESM build external dependencies                                                  	|
| pathReplacePatterns         	| array of objects 	| Import path replace pattern collection                                           	|
| pathReplacePatterns.test    	| string           	| Path to find                                                                     	|
| pathReplacePatterns.replace 	| string           	| Path to replace                                                                  	|
| ignore                      	| array of strings 	| Import paths to ignore with noop implementation                                  	|
| assetPaths                  	| array of strings 	| List of paths which contains static assets referenced in style sheets            	|
| testFramework                 | string            | "Jasmine" and "Karma" framework options are available                             |
| imageInlineLimit            	| number           	| Inline image if image size is less than specified limit                          	|
| bundle                        | object           	| Build bundle associated configuration                                             |
| bundle.amd                 	  | object          	| AMD flat bundle configuration                                                    	|
| bundle.amd.define             | string          	| AMD flat bundle define function name                                              |
| bundle.amd.id                 | string          	| AMD flat bundle module identifier name                                            |
| bundle.format                	| string           	| "umd", "amd", "iife" and "system" flat bundle options are available               |
| bundle.imageInlineLimit       | number            | Size limit in bytes to inline compile images                                      |
| bundle.inlineStyle            | boolean           | Inline bundle styles withing JS code if true                                      |

# Contributions

Feel free to open an issue or create a PR
