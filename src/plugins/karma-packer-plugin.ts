import rollupIstanbul from 'rollup-plugin-istanbul';
import rollupPreprocessor from 'karma-rollup-preprocessor';
import rollupIgnoreImport from 'rollup-plugin-ignore-import';

import path from 'path';
import * as inspector from 'schema-inspector';

import { buildPlugin, extractBundleExternals, preBundlePlugins, resolvePlugins } from '../tasks/build-util';
import { args } from '../tasks/util';
import { parseScriptPreprocessorExtension } from '../tasks/parser';
import { packerSchema } from '../tasks/validation';
import logger from '../common/logger';

export function karmaPackerPlugin() {
  const log = logger.create('[test]');

  try {
    const typescript = require('typescript');
    const packerConfig = require(path.join(process.cwd(), '.packerrc.js'));
    const validation = inspector.validate(packerSchema, packerConfig);
    if (!validation.valid) {
      log.warn('malformed packer config (.packerrc):\n%s', validation.format());
    }

    const config = inspector.sanitize(validation, packerConfig).data;
    const testGlob: string = path.join(config.source,
      '**/*.spec.' + parseScriptPreprocessorExtension(config.compiler.scriptPreprocessor));
    log.trace('test glob: %s', testGlob);

    const packerPreprocess = {};
    packerPreprocess[testGlob] = ['rollup'];

    let coveragePlugins = [];
    if (args.includes('--coverage') || args.includes('-c')) {
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
    const externals = extractBundleExternals(config);
    const packerPlugin = {
      external: externals,
      output: {
        format: 'iife',
        name: 'test',
        sourcemap: 'inline',
        globals: config.bundle.globals,
      },
      plugins: [
        rollupIgnoreImport({
          extensions: ['.scss', '.sass', '.styl', '.css', '.less']
        }),
        ...preBundlePlugins(config),
        ...resolvePlugins(config),
        ...buildPlugin('bundle', false, false, config, typescript),
        ...coveragePlugins
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
  } catch (e) {
    log.error('failure: %s\n', e.stack || e.message);
  }
}
