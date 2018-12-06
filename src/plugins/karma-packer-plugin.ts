import rollupIstanbul from 'rollup-plugin-istanbul';
import karmaRollupPreprocessor from 'karma-rollup-preprocessor';

import {
  getScriptBuildPlugin,
  extractBundleExternals,
  getPreBundlePlugins,
  getDependencyResolvePlugins,
  getStyleBuildPlugins,
  customRollupPlugins
} from '../tasks/build-util';
import { args, requireDependency } from '../tasks/util';
import { parseScriptPreprocessorExtension } from '../tasks/parser';
import { Logger } from '../common/logger';

import { meta } from '../tasks/meta';

/**
 * Get karma packer plugin
 */
export const karmaPackerPlugin = (log: Logger) => {
  try {
    const typescript = requireDependency('typescript', log);
    const packerConfig = meta.readPackerConfig(log);
    const packageConfig = meta.readPackageData();
    const babelConfig = meta.readBabelConfig();

    const testGlob = `spec/**/*.spec.${parseScriptPreprocessorExtension(packerConfig.compiler.script.preprocessor)}`;
    log.trace('test glob: %s', testGlob);

    const preprocessors = {};
    preprocessors[testGlob] = ['rollup'];

    let coveragePlugins = [];
    if (args.includes('--coverage') || args.includes('-C')) {
      log.trace('identified as coverage task');
      coveragePlugins = [
        rollupIstanbul({
          exclude: [ 'node_modules/**' ]
        })
      ];
    }

    /**
     * This is just a normal Rollup config object,
     * except that `input` is handled for you.
     */
    const externals = extractBundleExternals(packerConfig);
    const rollupPreprocessor = {
      external: externals,
      output: {
        format: 'iife',
        name: 'test',
        sourcemap: 'inline',
        globals: packerConfig.bundle.globals,
      },
      plugins: [
        ...getStyleBuildPlugins(packerConfig, packageConfig, false, false, log),
        ...getPreBundlePlugins(packerConfig),
        ...getDependencyResolvePlugins(packerConfig),
        ...getScriptBuildPlugin('bundle', false, false, packerConfig, babelConfig, typescript, log),
        ...customRollupPlugins(packerConfig, 'bundle'),
        ...coveragePlugins
      ]
    };

    const framework = String(packerConfig.test.framework).toLowerCase();

    return {
      rollupPreprocessor,
      preprocessors,
      karmaRollupPreprocessor,
      framework,
      testGlob
    };
  } catch (e) {
    log.error('task failure: %s\n', e.stack || e.message);
    process.exit(1);
  }
};
