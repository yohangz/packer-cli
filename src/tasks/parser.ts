import { ScriptPreprocessor } from '../model/script-preprocessor';
import { StylePreprocessor } from '../model/style-preprocessor';
import { LicenseType } from '../model/license-type';
import { PackerOptions } from '../model/packer-options';
import { BuildMode } from '../model/build-mode';
import { TestEnvironment } from '../model/test-environment';

/**
 * Parse style extension by preprocessor type.
 * @param preprocessor - Style preprocessor type.
 */
export const parseStylePreprocessorExtension = (preprocessor: StylePreprocessor): string => {
  switch (preprocessor) {
    case 'scss':
      return 'scss';
    case 'sass':
      return 'sass';
    case 'less':
      return 'less';
    case 'stylus':
      return 'styl';
    case 'none':
      return 'css';
  }
};

/**
 * Parse license file name by license type.
 * @param license - License type.
 */
export const parseLicenseType = (license: string): string => {
  let licenseFileName = '';

  switch (license) {
    case LicenseType.MIT:
      licenseFileName = 'MIT';
      break;
    case LicenseType.APACHE_2:
      licenseFileName = 'Apache-2.0';
      break;
    case LicenseType.MPL_2:
      licenseFileName = 'MPL-2.0';
      break;
    case LicenseType.BSD_2:
      licenseFileName = 'BSD-2-Clause-FreeBSD';
      break;
    case LicenseType.BSD_3:
      licenseFileName = 'BSD-3-Clause';
      break;
    case LicenseType.ISC:
      licenseFileName = 'ISC';
      break;
    case LicenseType.LGPL_3:
      licenseFileName = 'LGPL-3.0';
      break;
    case LicenseType.GLP_3:
      licenseFileName = 'GPL-3.0';
      break;
    case LicenseType.UNLICENSE:
      licenseFileName = 'Unlicense';
      break;
  }

  return licenseFileName;
};

/**
 * Parse script transpiler by preprocessor type.
 * @param preprocessor - Script preprocessor type.
 */
export const parseScriptPreprocessorExtension = (preprocessor: ScriptPreprocessor): string => {
  switch (preprocessor) {
    case 'typescript':
      return 'ts';
    case 'none':
    default:
      return 'js';
  }
};

/**
 * Parse script transpiler by preprocessor type and extract extension glob.
 * @param preprocessor - Script preprocessor type.
 */
export const parseScriptPreprocessorExtensionGlob = (preprocessor: ScriptPreprocessor): string => {
  const scriptExt = parseScriptPreprocessorExtension(preprocessor);
  return `{${scriptExt},${scriptExt}x}`;
};

/**
 * Parse package build mode.
 * @param packerOptions - Packer options object.
 */
export const parseBuildMode = (packerOptions: PackerOptions): BuildMode => {
  if (packerOptions.browserCompliant) {
    return 'browser';
  } else if (packerOptions.cliProject) {
    return 'node-cli';
  }

  return 'node';
};

/**
 * Parse test environment type.
 * @param packerOptions - Packer options object.
 */
export const parseTestEnvironment = (packerOptions: PackerOptions): TestEnvironment => {
  let testEnvironment: TestEnvironment = 'node';
  if (packerOptions.testFramework === 'jest' && packerOptions.reactLib && packerOptions.useEnzyme) {
    testEnvironment = 'enzyme';
  } else {
    testEnvironment = packerOptions.testEnvironment || (packerOptions.browserCompliant ? 'jsdom' : 'node');
  }

  return testEnvironment;
};
