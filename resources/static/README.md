# Universal Node Module Starter
> Universal node module starter kit to build library node modules compliant with Browser and NodeJS with vanilla JS and Typescript source support.

[![Build Status](https://travis-ci.org/yohangz/universal-node-module-starter.svg?branch=master)](https://travis-ci.org/yohangz/universal-node-module-starter)
[![MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://github.com/yohangz/typescript-library-starter/blob/master/LICENSE)

# Features

- [x] Build config managed in [config.json](https://github.com/yohangz/typescript-library-starter/blob/master/config.json)
- [x] NPM
- [x] Yarn
- [x] Travis
- [x] Typescript 2.x
- [x] Babel 7.x
- [x] TS Lint code analysis
- [x] Handlebars templating
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

To use this starter you can simply clone or fork it to your preferred location and install the dependencies

```npm install```

or

```yarn install```
 
Once the repository has been cloned locally, you can use the following CLI commands:

```sh
# Run project on watch mode
npm run watch

# Production build
npm run build

# Run unit test suite on development envrionemnt watch mode
npm run test

# Run unit test suite on continues integration environment mode
npm run test:ci
```

# Build Configuration

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
| bundleFormat                	| string           	| umd, amd, iife, system, es, cjs                                             	|

# Contributions

Feel free to open an issue or create a PR
