import { ScriptPreprocessor } from '../model/script-preprocessor';
import { StylePreprocessor } from '../model/style-preprocessor';
import { LicenseType } from '../model/license-type';

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

export const parseScriptPreprocessorExtension = (preprocessor: ScriptPreprocessor): string => {
  switch (preprocessor) {
    case 'typescript':
      return 'ts';
    case 'none':
    default:
      return 'js';
  }
};
