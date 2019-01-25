import { DependencyMap } from './dependency-map';
import { NodeBundleFormat } from './node-bundle-format';
import { BrowserBundleFormat } from './browser-bundle-format';
import { ScriptPreprocessor } from './script-preprocessor';
import { StylePreprocessor } from './style-preprocessor';
import { BuildMode } from './build-mode';
import { TestFramework } from './test-framework';
import { PathReplacePattern } from './path-replace-pattern';
import { PackageModuleType } from './package-module-type';
import { TestEnvironment } from './test-environment';
import { ObjectLiteral } from './object-literal';

/**
 * Packer style configuration schema.
 */
export interface PackerStyleConfig {
  inline: boolean;
  outDir: string;
  preprocessor: StylePreprocessor;
  image: {
    inlineLimit: number;
    outDir: string;
  };
}

/**
 * Packer watch configuration schema.
 */
export interface PackerWatchConfig {
  demoDir: string;
  helperDir: string;
  serveDir: string[];
  open: boolean;
  port: number;
}

/**
 * Custom rollup plugin extractor callback.
 * @callback customRollupPluginExtractorCallback
 * @param {string} buildType 'bundle'|'es5'|'esnext'
 * @param {string} packerConfig Packer configuration object.
 * @return {Array<{}>} Custom rollup plugin collection
 */
export type CustomRollupPluginExtractorCallback = (buildType: PackageModuleType, packerConfig: PackerConfig) => any[];

interface UnitTestCommand {
  default: string;
  watch: string;
  coverageDefault: string;
  coverageWatch: string;
}

/**
 * Packer configuration schema.
 */
export interface PackerConfig {
  extend: string;
  entry: string;
  source: string;
  dist: string;
  tmp: string;
  compiler: {
    dependencyMapMode: DependencyMap;
    packageFieldsToCopy: string[];
    sourceMap: boolean | 'inline';
    customRollupPluginExtractor: null | CustomRollupPluginExtractorCallback;
    build: {
      bundleMin: boolean;
      es5: boolean;
      es5Min: boolean;
      esnext: boolean;
      esnextMin: boolean;
    };
    buildMode: BuildMode;
    script: {
      preprocessor: ScriptPreprocessor;
      tsd: string;
      image: {
        inlineLimit: number;
        outDir: string;
      };
    };
    style: false | PackerStyleConfig;
    concurrentBuild: boolean;
    advanced: {
      rollup: {
        inputOptions: ObjectLiteral;
        outputOptions: ObjectLiteral;
        watchOptions: ObjectLiteral;
        pluginOptions: {
          ignoreImport: ObjectLiteral;
          postCss: ObjectLiteral;
          nodeResolve: ObjectLiteral;
          commonjs: ObjectLiteral;
          json: ObjectLiteral;
          globals: ObjectLiteral;
          babel: ObjectLiteral;
          typescript: ObjectLiteral;
          replace: ObjectLiteral;
          image: ObjectLiteral;
          handlebars: ObjectLiteral;
          filesize: ObjectLiteral;
          browserSync: ObjectLiteral;
        };
      };
      other: {
        terser: ObjectLiteral;
        cssnano: ObjectLiteral;
      };
    };
  };
  assetPaths: string[];
  copy: string[];
  ignore: string[];
  replacePatterns: PathReplacePattern[];
  bundle: {
    externals: string[];
    globals: {
      [key: string]: string;
    };
    mapExternals: boolean;
    format: NodeBundleFormat | BrowserBundleFormat;
    namespace: string;
    amd: {
      define: string;
      id: string;
    };
  };
  test: {
    framework: TestFramework;
    environment: TestEnvironment;
    advanced: {
      jasmine: UnitTestCommand;
      mocha: UnitTestCommand;
      jest: UnitTestCommand;
    };
  };
  serve: false | PackerWatchConfig;
  license: {
    banner: boolean;
  };
  format: {
    extensions: string[];
    advanced: {
      command: string;
    };
  };
}
