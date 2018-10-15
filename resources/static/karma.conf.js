var karmaPacker = require('packer-cli')();
var karmaJasmine = require('karma-jasmine');
var karmaMocha = require('karma-mocha');
var karmaChromeLauncher = require('karma-chrome-launcher');
var karmaJasmineHtmlReporter = require('karma-jasmine-html-reporter');
var karmaCoverage = require('karma-coverage');

process.env.CHROME_BIN = require('puppeteer').executablePath();

var reporters = ['progress', 'coverage'];
var plugins = [];
var client = {};

switch (karmaPacker.testFramework) {
  case 'jasmine': {
    reporters.push('kjhtml');
    plugins.push(karmaJasmine);
    plugins.push(karmaJasmineHtmlReporter);
    client.clearContext = false;
    break;
  }
  case 'mocha': {
    plugins.push(karmaMocha);
    client.mocha = {
      // change Karma's debug.html to the mocha web reporter
      reporter: 'html',
    };
    break
  }
}

plugins.push(karmaChromeLauncher);
plugins.push(karmaCoverage);
plugins.push(karmaPacker.rollupPreprocessor);

module.exports = function(config) {
  config.set({
    basePath: '',

    frameworks: [ karmaPacker.testFramework ],

    browsers: [ process.env.CI? 'ChromeHeadless': 'Chrome' ],

    port: 9876,

    singleRun: !!process.env.CI,

    colors: true,

    logLevel: config.LOG_INFO,

    reporters: reporters,

    files: [
      /**
       * Make sure to disable Karma’s file watcher
       * because the preprocessor will use its own.
       */
      { pattern: karmaPacker.testGlob, watched: false }
    ],

    preprocessors: karmaPacker.packerPreprocess,

    plugins: plugins,

    mime: {
      'text/x-typescript': ['ts', 'tsx']
    },

    client: client,

    rollupPreprocessor: karmaPacker.packerPlugin
  })
};

