import { ScriptPreprocessor } from './script-preprocessor';
import { StylePreprocessor } from './style-preprocessor';
import { BrowserBundleFormat } from './browser-bundle-format';
import { NodeBundleFormat } from './node-bundle-format';
import { TestFramework } from './test-framework';
import { TestEnvironment } from './test-environment';

/**
 * Packer questioner options schema.
 */
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
  testFramework: TestFramework;
  testEnvironment: TestEnvironment;
  year: string;
  license: string;
  isYarn: boolean;
  reactLib: boolean;
  useEnzyme: boolean;
}
