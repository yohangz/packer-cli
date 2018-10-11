import fs from 'fs';

import rollupResolve from 'rollup-plugin-node-resolve';
import rollupCommonjs from 'rollup-plugin-commonjs';
import rollupImage from 'rollup-plugin-img';
import rollupHandlebars from 'rollup-plugin-hbs';
import rollupTypescript from 'rollup-plugin-typescript2';
import rollupIstanbul from 'rollup-plugin-istanbul';
import rollupBabel from 'rollup-plugin-babel';
import rollupPreprocessor from 'karma-rollup-preprocessor';

const typescript = require('typescript');

const config = JSON.parse(fs.readFileSync(process.cwd() + '/.packerrc.json', 'utf8'));

const testGlob = config.source + '/**/*.spec' + (config.tsProject ? '.ts' : '.js');
console.log(testGlob);

const nmlPreprocess = {};
nmlPreprocess[testGlob] = ['rollup'];

const buildPlugin = config.tsProject ?
  rollupTypescript({
    tsconfig: 'tsconfig.es5.json',
    typescript: typescript,
    check: !!process.env.CI
  }) :
  rollupBabel({
    babelrc: false,
    exclude: 'node_modules/**',
    presets: ['@babel/preset-env'],
  });

const nmlPlugin = {
  /**
   * This is just a normal Rollup config object,
   * except that `input` is handled for you.
   */
  plugins: [
    rollupResolve({
      jsnext: true,
      main: true,
      browser: true,
      preferBuiltins: false
    }),
    rollupCommonjs({
      include: 'node_modules/**'
    }),
    rollupHandlebars(),
    rollupImage({
      extensions: /\.(png|jpg|jpeg|gif|svg)$/,
      limit: 1000000,
      exclude: 'node_modules/**'
    }),
    buildPlugin,
    rollupIstanbul({
      exclude: [ testGlob, 'node_modules/**' ]
    })
  ],
  output: {
    format: 'iife',
    name: 'test',
    sourcemap: 'inline'
  }
};

const testFramework = String(config.testFramework).toLowerCase();

export {
  testGlob,
  nmlPlugin,
  nmlPreprocess,
  rollupPreprocessor,
  testFramework
}

