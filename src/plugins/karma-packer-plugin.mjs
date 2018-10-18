import rollupResolve from 'rollup-plugin-node-resolve';
import rollupCommonjs from 'rollup-plugin-commonjs';
import rollupImage from 'rollup-plugin-img';
import rollupHandlebars from 'rollup-plugin-hbs';
import rollupTypescript from 'rollup-plugin-typescript2';
import rollupIstanbul from 'rollup-plugin-istanbul';
import rollupBabel from 'rollup-plugin-babel';
import rollupPreprocessor from 'karma-rollup-preprocessor';

import path from 'path';

export default function karmaPackerPlugin () {
  const config = require(path.join(process.cwd(), '.packerrc.json'));
  const babelConfig = require(path.join(process.cwd(), '.babelrc.es2015.js'));

  const testGlob = config.source + '/**/*.spec' + (config.tsProject ? '.ts' : '.js');
  console.log(testGlob);

  const packerPreprocess = {};
  packerPreprocess[testGlob] = ['rollup'];

  let buildPlugin;
  if (config.tsProject) {
    buildPlugin = rollupTypescript({
      tsconfig: 'tsconfig.es5.json',
      typescript: require('typescript'),
      check: !!process.env.CI
    });
  } else {
    buildPlugin = rollupBabel({
      babelrc: false,
      exclude: 'node_modules/**',
      presets: babelConfig.presets,
      plugins: babelConfig.plugins,
      runtimeHelpers: true
    });
  }

  const packerPlugin = {
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

  return {
    testGlob,
    packerPlugin,
    packerPreprocess,
    rollupPreprocessor,
    testFramework
  };
}
