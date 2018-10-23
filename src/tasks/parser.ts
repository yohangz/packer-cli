import { ScriptPreprocessor } from '../model/script-preprocessor';
import { StylePreprocessor } from '../model/style-preprocessor';
import { LicenseType } from '../model/license-type';

export const parseStylePreprocessorExtension = (preprocessor) => {
  switch (preprocessor) {
    case StylePreprocessor.scss:
      return 'scss';
    case StylePreprocessor.sass:
      return 'sass';
    case StylePreprocessor.less:
      return 'less';
    case StylePreprocessor.stylus:
      return 'styl';
    case StylePreprocessor.none:
      return 'css';
  }
};

export const parseLicenseType = (license) => {
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

export const parseScriptPreprocessorExtension = (preprocessor: string): string => {
  switch (preprocessor) {
    case ScriptPreprocessor.typescript:
      return 'ts';
    case ScriptPreprocessor[ScriptPreprocessor.none]:
    default:
      return 'js';
  }
};
