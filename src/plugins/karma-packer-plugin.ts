import rollupIstanbul from 'rollup-plugin-istanbul';
import rollupPreprocessor from 'karma-rollup-preprocessor';
import rollupIgnoreImport from 'rollup-plugin-ignore-import';

import path from 'path';

import {
  getScriptBuildPlugin,
  extractBundleExternals,
  getPreBundlePlugins,
  getDependencyResolvePlugins, getStyleBuildPlugins, getPostBundlePlugins, customRollupPlugins
} from '../tasks/build-util';
import { args } from '../tasks/util';
import { parseScriptPreprocessorExtension } from '../tasks/parser';
import logger from '../common/logger';

import { meta } from '../tasks/meta';

/**
 * Get karma packer plugin
 */
export function karmaPackerPlugin() {
  const log = logger.create('[test]');

  try {
    const typescript = require('typescript');
    const packerConfig = meta.readPackerConfig(log);
    const babelConfig = meta.readBabelConfig();

    const testGlob: string = path.join(packerConfig.source,
      '**/*.spec.' + parseScriptPreprocessorExtension(packerConfig.compiler.script.preprocessor));
    log.trace('test glob: %s', testGlob);

    const packerPreprocess = {};
    packerPreprocess[testGlob] = ['rollup'];

    let coveragePlugins = [];
    if (args.includes('--coverage') || args.includes('-C')) {
      log.trace('identified as coverage task');
      coveragePlugins = [
        rollupIstanbul({
          exclude: [ testGlob, 'node_modules/**' ]
        })
      ];
    }

    /**
     * This is just a normal Rollup config object,
     * except that `input` is handled for you.
     */
    const externals = extractBundleExternals(packerConfig);
    const packerPlugin = {
      external: externals,
      output: {
        format: 'iife',
        name: 'test',
        sourcemap: 'inline',
        globals: packerConfig.bundle.globals,
      },
      plugins: [
        ...getStyleBuildPlugins(packerConfig, null, false, true, log),
        ...getPreBundlePlugins(packerConfig),
        ...getDependencyResolvePlugins(packerConfig),
        ...getScriptBuildPlugin('bundle', false, false, packerConfig, babelConfig, typescript, log),
        ...customRollupPlugins(packerConfig, 'bundle'),
        ...coveragePlugins
      ]
    };

    const testFramework = String(packerConfig.testFramework).toLowerCase();

    return {
      packerPlugin,
      packerPreprocess,
      rollupPreprocessor,
      testFramework,
      testGlob
    };
  } catch (e) {
    log.error('task failure: %s\n', e.stack || e.message);
    process.exit(1);
  }
}
