import { ScriptPreprocessor } from './script-preprocessor';
import { StylePreprocessor } from './style-preprocessor';
import { BrowserBundleFormat } from './browser-bundle-format';
import { NodeBundleFormat } from './node-bundle-format';

export interface PackerOptions {
  description: string;
  keywords: string;
  author: string;
  email: string;
  githubUsername: string;
  website: string;
  scriptPreprocessor: ScriptPreprocessor;
  styleSupport: boolean;
  stylePreprocessor: StylePreprocessor;
  bundleStyles: boolean;
  browserCompliant: boolean;
  cliProject: boolean;
  bundleFormat: BrowserBundleFormat|NodeBundleFormat;
  amdId: string;
  namespace: string;
  testFramework: string;
  year: string;
  license: string;
  isYarn: boolean;
  reactLib: boolean;
}
