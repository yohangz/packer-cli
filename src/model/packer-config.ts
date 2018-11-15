import { DependencyMap } from './dependency-map';
import { NodeBundleFormat } from './node-bundle-format';
import { BrowserBundleFormat } from './browser-bundle-format';
import { ScriptPreprocessor } from './script-preprocessor';
import { StylePreprocessor } from './style-preprocessor';
import { BuildMode } from './build-mode';
import { TestFramework } from './test-framework';
import { PathReplacePattern } from './path-replace-pattern';

export interface PackerStyleConfig {
  inline: boolean;
  outDir: string;
  preprocessor: StylePreprocessor;
  image: {
    inlineLimit: number;
    outDir: string;
  };
}

export interface PackerWatchConfig {
  demoDir: string;
  helperDir: string;
  serveDir: string[];
  open: boolean;
  port: number;
}

export type CustomRollupPluginExtractorCallback = (buildType: string, packerConfig: PackerConfig) => any[];

export interface PackerConfig {
  extend: string;
  entry: string;
  source: string;
  dist: string;
  tmp: string;
  compiler: {
    dependencyMapMode: DependencyMap;
    sourceMap: boolean | 'inline';
    customRollupPluginExtractor: null | CustomRollupPluginExtractorCallback,
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
      image: {
        inlineLimit: number;
        outDir: string;
      }
    };
    style: false | PackerStyleConfig;
    concurrentBuild: boolean;
  };
  assetPaths: string[];
  copy: string[];
  ignore: string[];
  replacePatterns: PathReplacePattern[];
  bundle: {
    externals: string[],
    globals: {
      [key: string]: string;
    },
    mapExternals: boolean;
    format: NodeBundleFormat | BrowserBundleFormat;
    namespace: string;
    amd: {
      define: string;
      id: string;
    };
  };
  testFramework: TestFramework;
  watch: false | PackerWatchConfig;
  license: {
    banner: boolean;
  };
}
