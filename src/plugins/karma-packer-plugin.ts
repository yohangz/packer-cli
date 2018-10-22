import rollupIstanbul from 'rollup-plugin-istanbul';
import rollupPreprocessor from 'karma-rollup-preprocessor';
import rollupIgnoreImport from 'rollup-plugin-ignore-import';

import path from 'path';
import { buildPlugin, preBundlePlugins, resolvePlugins } from '../tasks/build-util';

export default function karmaPackerPlugin() {
  const typescript = require('typescript');
  const config = require(path.join(process.cwd(), '.packerrc.json'));

  const testGlob = config.source + '/**/*.spec' + (config.typescript ? '.ts' : '.js');
  console.log(testGlob);

  const packerPreprocess = {};
  packerPreprocess[testGlob] = ['rollup'];

  /**
   * This is just a normal Rollup config object,
   * except that `input` is handled for you.
   */
  const packerPlugin = {
    output: {
      format: 'iife',
      name: 'test',
      sourcemap: 'inline'
    },
    plugins: [
      rollupIgnoreImport({
        extensions: ['.scss', '.sass', '.styl', '.css', '.less']
      }),
      ...preBundlePlugins(config),
      ...resolvePlugins(config),
      ...buildPlugin('bundle', false, false, config, typescript),
      rollupIstanbul({
        exclude: [ testGlob, 'node_modules/**' ]
      })
    ]
  };

  const testFramework = String(config.testFramework).toLowerCase();

  return {
    packerPlugin,
    packerPreprocess,
    rollupPreprocessor,
    testFramework,
    testGlob
  };
}
