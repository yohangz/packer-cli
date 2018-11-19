declare module 'gulp-clean' {
  export default function(): NodeJS.ReadWriteStream;
}

declare module 'gulp-file' {
  export default function(fileName: string, fileContent: string): NodeJS.ReadWriteStream;
}

declare interface PermissionOptions {
  owner?: {
    read?: boolean,
    write?: boolean,
    execute?: boolean
  };
  group?: {
    read?: boolean,
    write?: boolean,
    execute?: boolean
  };
  others?: {
    read?: boolean,
    write?: boolean,
    execute?: boolean
  };
}

declare interface PackageValidity {
  validForNewPackages: false;
  validForOldPackages: true;
  warnings: string [];
  errors: string[];
}

declare module 'gulp-chmod' {
  export default function(options: PermissionOptions): NodeJS.ReadWriteStream;
}

declare module 'validate-npm-package-name' {
  export default function(packageName: string): PackageValidity;
}

declare module 'gulp-filter' {
  export default function(glob: string|string[]): NodeJS.ReadWriteStream;
}

declare module 'schema-inspector';

declare interface RollupPluginProgressOptions {
  clearLine?: boolean;
}

declare module 'rollup-plugin-progress' {
  export default function(options?: RollupPluginProgressOptions): any;
}

declare interface RollupPluginIstanbulOptions {
  include?: string|string[];
  exclude?: string|string[];
  instrumenterConfig?: any;
}

declare module 'rollup-plugin-istanbul' {
  export default function(options?: RollupPluginIstanbulOptions): any;
}

declare module 'karma-rollup-preprocessor';

declare interface RollupPluginIgnoreImportOptions {
  extensions: string[];
}

declare module 'rollup-plugin-ignore-import' {
  export default function(options: RollupPluginIgnoreImportOptions): any;
}

declare module 'glob-to-regexp' {
  export default function(globPatten: string): RegExp;
}

declare type NamedExportExtractor = (name: string) => boolean;

declare interface PostCssConfig {
  path?: string;
  ctx?: object;
}

declare type PostCssOnImport = (id: string) => void;

declare interface RollupPluginPostCssOptions {
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
  use?: string[]| any[];
  loaders?: any[];
  onImport?: PostCssOnImport;
}

declare module 'rollup-plugin-postcss' {
  export default function(options?: RollupPluginPostCssOptions): any;
}

declare interface PostCssImageInnerOptions {
  assetPaths?: string[];
  maxFileSize?: number;
  b64Svg?: boolean;
  strict?: boolean;
}

declare module 'postcss-image-inliner' {
  export default function(options?: PostCssImageInnerOptions): any;
}

declare type RenameTrransform = (code: string, id: string) => boolean;

declare interface RenamePattern {
  include?: string | string[];
  exclude?: string | string[];
  match?: RegExp;
  test?: string;
  replace?: string;
  text?: string;
  file?: string;
  transform?: RenameTrransform;
}

declare interface RollupPluginRenameOptions {
  include?: string | string[];
  exclude?: string | string[];
  defines?: {
    IS_SKIP?: boolean,
    IS_REMOVE?: boolean,
  };
  replaces?: {
    $version: string
  };
  patterns: RenamePattern[];
}

declare module 'rollup-plugin-re' {
  export default function(options?: RollupPluginRenameOptions): any;
}

declare module 'rollup-plugin-ignore' {
  export default function(modules: string[]): any;
}

declare interface RollupPluginNodeResolveOptions {
  module?: boolean;
  jsnext?: boolean;
  main?: boolean;
  browser?: boolean;
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
  export default function(options?: RollupPluginNodeResolveOptions): any;
}

declare interface RollupPluginCommonjsOptions {
  include?: string | string[];
  exclude?: string | string[];
  extensions?: string[];
  ignoreGlobal?: boolean;
  sourceMap?: boolean;
  namedExports?: {
    [key: string]: string[]
  };
  ignore?: string[];
}

declare module 'rollup-plugin-commonjs' {
  export default function(options?: RollupPluginCommonjsOptions): any;
}

declare enum RollupPluginTypescriptVerbosity {
  Error = 1,
  Warning,
  Info,
  Debug
}

declare interface RollupPluginTypescriptOptions {
  tsconfigDefaults?: any;
  tsconfig?: string;
  tsconfigOverride?: any;
  check?: boolean;
  verbosity?: RollupPluginTypescriptVerbosity;
  cacheRoot?: string;
  include: string | string[];
  exclude: string | string[];
  abortOnError?: boolean;
  rollupCommonJSResolveHack?: boolean;
  objectHashIgnoreUnknownHack?: boolean;
  useTsconfigDeclarationDir?: boolean;
  typescript?: any;
  transformers?: any;
}

declare module 'rollup-plugin-typescript2' {
  export default function(options?: RollupPluginTypescriptOptions): any;
}

declare interface RollupPluginBabelOptions {
  babelrc?: boolean;
  externalHelpers?: boolean;
  include?: string | string[];
  exclude?: string | string[];
  externalHelpersWhitelist?: string[];
  extensions?: string[];
  plugins?: any[];
  presets?: any[];
  runtimeHelpers?: boolean;
}

declare module 'rollup-plugin-babel' {
  export default function(options?: RollupPluginBabelOptions): any;
}

declare interface RollupPluginHbsOptions {
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
  export default function(options?: RollupPluginHbsOptions): any;
}

declare interface RollupPluginImageOptions {
  include?: string | string[];
  exclude?: string | string[];
  limit?: number;
  output?: string;
  extensions?: RegExp;
}

declare module 'rollup-plugin-img' {
  export default function(options?: RollupPluginImageOptions): any;
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
  export default function(options?: RollupPluginFileSizeOptions): any;
}

declare module 'rollup-plugin-node-builtins' {
  export default function(options?: { crypto?: boolean; }): any;
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
  export default function(options?: RollupPluginNodeGlobalOptions): any;
}

declare interface RollupPluginJsonOptions {
  include?: string | string[];
  exclude?: string | string[];
  preferConst?: boolean;
  indent?: string;
  compact?: boolean;
  namedExports?: boolean;
}

declare module 'rollup-plugin-json' {
  export default function(options?: RollupPluginJsonOptions): any;
}

declare interface RollupPluginServeOptions {
  open?: boolean;
  openPage?: string;
  verbose?: boolean;
  contentBase?: string | string[];
  historyApiFallback?: boolean | string;
  host?: string;
  port?: number;
  https?: {
    [key: string]: string | Buffer;
  };
  headers?: {
    [key: string]: string;
  };
}

declare module 'rollup-plugin-serve' {
  export default function(options?: RollupPluginServeOptions): any;
}

declare interface RollupPluginLiveReloadOptions {
  watch?: string | string[];
  verbose?: boolean;
  https?: boolean;
}

declare module 'rollup-plugin-livereload' {
  export default function(options?: string | RollupPluginLiveReloadOptions): any;
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
