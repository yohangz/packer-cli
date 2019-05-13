declare module 'gulp-clean' {
  export default function(): NodeJS.ReadWriteStream;
}

declare module 'gulp-add' {
  export default function(filename: string | { [key: string]: string }, fileContent: string): NodeJS.ReadWriteStream;
}

declare interface PermissionOptions {
  owner?: {
    read?: boolean;
    write?: boolean;
    execute?: boolean;
  };
  group?: {
    read?: boolean;
    write?: boolean;
    execute?: boolean;
  };
  others?: {
    read?: boolean;
    write?: boolean;
    execute?: boolean;
  };
}

declare interface PackageValidity {
  validForNewPackages: false;
  validForOldPackages: true;
  warnings: string[];
  errors: string[];
}

declare module 'gulp-chmod' {
  export default function(options: PermissionOptions): NodeJS.ReadWriteStream;
}

declare module 'gulp-filter' {
  export default function(glob: string | string[]): NodeJS.ReadWriteStream;
}

declare module 'validate-npm-package-name' {
  export default function(packageName: string, options?: any): PackageValidity;
}

declare module 'schema-inspector';

declare module 'glob-to-regexp' {
  export default function(globPatten: string, options?: any): RegExp;
}

declare interface RollupFilterOptions {
  include?: string | string[];
  exclude?: string | string[];
}

declare interface RollupPluginIstanbulOptions extends RollupFilterOptions {
  instrumenter?: any;
  instrumenterConfig?: any;
}

declare module 'rollup-plugin-istanbul' {
  import { Plugin } from 'rollup';
  export default function(options?: RollupPluginIstanbulOptions): Plugin;
}

declare module 'karma-rollup-preprocessor';

declare interface RollupPluginIgnoreImportOptions extends RollupFilterOptions {
  extensions: string[];
}

declare module 'rollup-plugin-ignore-import' {
  import { Plugin } from 'rollup';
  export default function(options: RollupPluginIgnoreImportOptions): Plugin;
}

declare type NamedExportExtractor = (name: string) => boolean;

declare interface PostCssConfig {
  path?: string;
  ctx?: object;
}

declare type PostCssOnImport = (id: string) => void;

declare interface RollupPluginPostCssOptions extends RollupFilterOptions {
  extensions?: string[];
  plugins?: any[];
  inject?: boolean | object;
  extract?: boolean | string;
  modules?: boolean | object;
  autoModules?: boolean;
  namedExports?: boolean | NamedExportExtractor;
  minimize?: boolean | object;
  sourceMap?: boolean | 'inline';
  parser?: string | any;
  stringifier?: string | any;
  syntax?: string | any;
  exec?: boolean;
  config?: boolean | PostCssConfig;
  use?: string[] | any[];
  loaders?: any[];
  onImport?: PostCssOnImport;
}

declare module 'rollup-plugin-postcss' {
  import { Plugin } from 'rollup';
  export default function(options?: RollupPluginPostCssOptions): Plugin;
}

declare interface PostCssImageInnerOptions {
  assetPaths?: string[];
  maxFileSize?: number;
  b64Svg?: boolean;
  strict?: boolean;
}

declare module 'postcss-image-inliner' {
  import { Plugin } from 'rollup';
  export default function(options?: PostCssImageInnerOptions): Plugin;
}

declare type RenameTransform = (code: string, id: string) => string;

declare interface RenamePattern extends RollupFilterOptions {
  match?: RegExp;
  test?: string;
  replace?: string;
  text?: string;
  file?: string;
  transform?: RenameTransform;
}

declare interface RollupPluginRenameOptions extends RollupFilterOptions {
  defines?: {
    IS_SKIP?: boolean;
    IS_REMOVE?: boolean;
  };
  replaces?: {
    [key: string]: string;
  };
  patterns: RenamePattern[];
}

declare module 'rollup-plugin-re' {
  import { Plugin } from 'rollup';
  export default function(options?: RollupPluginRenameOptions): Plugin;
}

declare module 'rollup-plugin-ignore' {
  import { Plugin } from 'rollup';
  export default function(modules: string[]): Plugin;
}

declare interface RollupPluginNodeResolveOptions {
  mainFields: Array<'module'|'jsnext'|'main'|'browser'>;
  extensions?: string[];
  preferBuiltins?: boolean;
  jail?: string;
  only?: string[];
  modulesOnly?: boolean;
  customResolveOptions?: {
    moduleDirectory: string;
  };
}

declare module 'rollup-plugin-node-resolve' {
  import { Plugin } from 'rollup';
  export default function(options?: RollupPluginNodeResolveOptions): Plugin;
}

declare interface RollupPluginCommonjsOptions extends RollupFilterOptions {
  extensions?: string[];
  ignoreGlobal?: boolean;
  sourceMap?: boolean;
  namedExports?: {
    [key: string]: string[];
  };
  ignore?: string[];
}

declare module 'rollup-plugin-commonjs' {
  import { Plugin } from 'rollup';
  export default function(options?: RollupPluginCommonjsOptions): Plugin;
}

declare enum RollupPluginTypescriptVerbosity {
  Error = 0,
  Warning,
  Info,
  Debug
}

declare interface RollupPluginTypescriptOptions extends RollupFilterOptions {
  tsconfigDefaults?: any;
  tsconfig?: string;
  tsconfigOverride?: any;
  check?: boolean;
  clean?: boolean;
  verbosity?: RollupPluginTypescriptVerbosity;
  cacheRoot?: string;
  abortOnError?: boolean;
  rollupCommonJSResolveHack?: boolean;
  objectHashIgnoreUnknownHack?: boolean;
  useTsconfigDeclarationDir?: boolean;
  typescript?: any;
  transformers?: any;
}

declare module 'rollup-plugin-typescript2' {
  import { Plugin } from 'rollup';
  export default function(options?: RollupPluginTypescriptOptions): Plugin;
}

declare interface RollupPluginBabelOptions extends RollupFilterOptions {
  babelrc?: boolean;
  externalHelpers?: boolean;
  externalHelpersWhitelist?: string[];
  extensions?: string[];
  plugins?: any[];
  presets?: any[];
  runtimeHelpers?: boolean;
}

declare module 'rollup-plugin-babel' {
  import { Plugin } from 'rollup';
  export default function(options?: RollupPluginBabelOptions): Plugin;
}

declare interface RollupPluginHbsOptions extends RollupFilterOptions {
  handlebars?: {
    id?: string;
    options?: {
      sourceMap: boolean;
    };
    optimize?: boolean;
  };
  templateExtension?: string;
  isPartial?: (name: string) => string;
}

declare module 'rollup-plugin-hbs' {
  import { Plugin } from 'rollup';
  export default function(options?: RollupPluginHbsOptions): Plugin;
}

declare interface RollupPluginImageOptions extends RollupFilterOptions {
  limit?: number;
  output?: string;
  extensions?: RegExp;
}

declare module 'rollup-plugin-img' {
  import { Plugin } from 'rollup';
  export default function(options?: RollupPluginImageOptions): Plugin;
}

declare interface RollupPluginFileSizeData {
  minSize: string;
  gzipSize: string;
  brotliSize: string;
  bundleSize: string;
}

declare interface RollupPluginFileSizeOptions {
  showMinifiedSize?: boolean;
  showGzippedSize?: boolean;
  showBrotliSize?: boolean;
  format?: object;
  render?: (options: any, bundle: any, size: RollupPluginFileSizeData) => string;
  theme?: 'dark' | 'light';
}

declare module 'rollup-plugin-filesize' {
  import { Plugin } from 'rollup';
  export default function(options?: RollupPluginFileSizeOptions): Plugin;
}

declare interface RollupPluginNodeGlobalOptions {
  process?: boolean;
  global?: boolean;
  buffer?: boolean;
  dirname?: boolean;
  filename?: boolean;
  baseDir?: boolean;
}

declare module 'rollup-plugin-node-globals' {
  import { Plugin } from 'rollup';
  export default function(options?: RollupPluginNodeGlobalOptions): Plugin;
}

declare interface RollupPluginJsonOptions extends RollupFilterOptions {
  preferConst?: boolean;
  indent?: string;
  compact?: boolean;
  namedExports?: boolean;
}

declare module 'rollup-plugin-json' {
  import { Plugin } from 'rollup';
  export default function(options?: RollupPluginJsonOptions): Plugin;
}

declare module 'rollup-plugin-browsersync' {
  import { Options } from 'browser-sync';
  import { Plugin } from 'rollup';
  export default function(options?: Options): Plugin;
}

declare interface CodeFrameLocation {
  start?: {
    line?: number;
    column?: number;
  };
  end?: {
    line?: number;
    column?: number;
  };
}

declare interface CodeFrameOptions {
  highlightCode?: boolean;
  linesAbove?: number;
  linesBelow?: number;
  forceColor?: boolean;
  message?: string;
}

declare module '@babel/code-frame' {
  export default function(rowLine: string, location: CodeFrameLocation, options?: CodeFrameOptions): string;
}

declare module 'terser';

declare module '*.json';
