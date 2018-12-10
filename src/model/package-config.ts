/**
 * Package configuration key value object literal.
 */
export interface PackageKeyValueLiteral {
  [key: string]: string;
}

/**
 * Package configuration (package.json) schema.
 */
export interface PackageConfig {
  name?: string;
  version?: string;
  description?: string;
  keywords?: string[];
  scripts?: PackageKeyValueLiteral;
  author?: string;
  repository?: string;
  license?: string;
  homepage?: string;
  dependencies?: PackageKeyValueLiteral;
  devDependencies?: PackageKeyValueLiteral;
  peerDependencies?: PackageKeyValueLiteral;
  private?: boolean;
  bin?: PackageKeyValueLiteral;
  main?: string;
  typings?: string;
  module?: string;
  fesm5?: string;
  esnext?: string;
  fesmnext?: string;
  nyc?: any;
}
