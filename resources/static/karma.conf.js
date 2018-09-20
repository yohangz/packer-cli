var karmaNml = require('packer-cli/lib/karma-packer-plugin');

process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function(config) {
  config.set({
    basePath: '',

    frameworks: ['jasmine'],

    browsers: [ process.env.CI? 'ChromeHeadless': 'Chrome' ],

    port: 9876,

    singleRun: !!process.env.CI,

    colors: true,

    logLevel: config.LOG_INFO,

    reporters: ['progress', 'kjhtml', 'coverage'],

    files: [
      /**
       * Make sure to disable Karma’s file watcher
       * because the preprocessor will use its own.
       */
      { pattern: karmaNml.testGlob, watched: false }
    ],

    preprocessors: karmaNml.nmlPreprocess,

    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      karmaNml.rollupPreprocessor
    ],

    mime: {
      'text/x-typescript': ['ts', 'tsx']
    },

    client:{
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },

    rollupPreprocessor: karmaNml.nmlPlugin
  })
};

