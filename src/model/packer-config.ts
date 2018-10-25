import { DependencyMap } from './dependency-map';
import { NodeBundleFormat } from './node-bundle-format';
import { BrowserBundleFormat } from './browser-bundle-format';
import { ScriptPreprocessor } from './script-preprocessor';
import { StylePreprocessor } from './style-preprocessor';
import { BuildMode } from './build-mode';
import { TestFramework } from './test-framework';
import { PathReplacePattern } from './path-replace-pattern';

export interface PackerConfig {
  entry: string;
  source: string;
  dist: string;
  output: {
    amd: {
      define: string;
      id: string;
    };
    dependencyMapMode: DependencyMap;
    esnext: boolean;
    es5: boolean;
    minBundle: boolean;
    format: NodeBundleFormat | BrowserBundleFormat;
    imageInlineLimit: number;
    inlineStyle: boolean;
    stylesDir: string;
    namespace: string;
  };
  compiler: {
    buildMode: BuildMode,
    scriptPreprocessor: ScriptPreprocessor,
    stylePreprocessor: StylePreprocessor,
    styleSupport: boolean
  };
  assetPaths: string[];
  copy: string[];
  bundle: {
    externals: string[],
    globals: {
      [key: string]: string;
    },
    mapExternals: boolean;
  };
  ignore: string[];
  pathReplacePatterns: PathReplacePattern[];
  testFramework: TestFramework;
  watch: {
    demoDir: string,
    helperDir: string,
    open: boolean,
    port: number,
    scriptDir: string,
    serve: boolean
  };
  license: {
    banner: boolean,
    thirdParty: {
      fileName: string,
      includePrivate: boolean
    }
  };
}
