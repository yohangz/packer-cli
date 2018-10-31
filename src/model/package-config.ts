export interface PackageConfig {
  name?: string;
  version?: string;
  description?: string;
  keywords?: string[];
  scripts?: {
    [key: string]: string;
  };
  author?: string;
  repository?: string;
  license?: string;
  homepage?: string;
  dependencies?: {
    [key: string]: string;
  };
  devDependencies?: {
    [key: string]: string;
  };
  peerDependencies?: {
    [key: string]: string;
  };
  private?: boolean;
  bin?: {
    [key: string]: string;
  };
  main?: string;
  typings?: string;
  module?: string;
  fesm5?: string;
  esnext?: string;
  fesmnext?: string;
  nyc: any;
}
