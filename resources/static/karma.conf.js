process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function(config) {
  const reporters = ['progress', 'coverage'];
  const plugins = [];
  const client = {};

  switch (config.packer.framework) {
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
  plugins.push(config.packer.karmaRollupPreprocessor);

  config.set({
    basePath: '',

    frameworks: [config.packer.framework],

    browsers: [process.env.CI ? 'ChromeHeadless' : 'Chrome'],

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
      { pattern: config.packer.testGlob, watched: false }
    ],

    preprocessors: config.packer.preprocessors,

    plugins: plugins,

    mime: {
      'text/x-typescript': ['ts', 'tsx']
    },

    client: client,

    rollupPreprocessor: config.packer.rollupPreprocessor
  });
};
