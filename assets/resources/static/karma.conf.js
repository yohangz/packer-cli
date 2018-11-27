const { karmaPackerPlugin } = require('packer-cli');

const packerPlugin = karmaPackerPlugin();
process.env.CHROME_BIN = require('puppeteer').executablePath();

const reporters = ['progress', 'coverage'];
const plugins = [];
const client = {};

switch (packerPlugin.testFramework) {
  case 'jasmine': {
    reporters.push('kjhtml');
    plugins.push(require('karma-jasmine'));
    plugins.push(require('karma-jasmine-html-reporter'));
    client.clearContext = false;
    break;
  }
  case 'mocha': {
    plugins.push(require('karma-mocha'));
    client.mocha = {
      // change Karma's debug.html to the mocha web reporter
      reporter: 'html'
    };
    break;
  }
}

plugins.push(require('karma-chrome-launcher'));
plugins.push(require('karma-coverage'));
plugins.push(packerPlugin.rollupPreprocessor);

module.exports = function (config) {
  config.set({
    basePath: '',

    frameworks: [ packerPlugin.testFramework ],

    browsers: [ process.env.CI ? 'ChromeHeadless' : 'Chrome' ],

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
      { pattern: packerPlugin.testGlob, watched: false }
    ],

    preprocessors: packerPlugin.packerPreprocess,

    plugins: plugins,

    mime: {
      'text/x-typescript': ['ts', 'tsx']
    },

    client: client,

    rollupPreprocessor: packerPlugin.packerPlugin
  });
};
