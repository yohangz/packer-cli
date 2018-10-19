export const parseStylePreprocessorExtension = (preprocessor) => {
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

export const parseLicenseType = (license) => {
  let licenseFileName = '';

  switch (license) {
    case 'MIT License':
      licenseFileName = 'MIT';
      break;
    case 'Apache 2 License':
      licenseFileName = 'Apache-2.0';
      break;
    case 'Mozilla Public License 2.0':
      licenseFileName = 'MPL-2.0';
      break;
    case 'BSD 2-Clause (FreeBSD) License':
      licenseFileName = 'BSD-2-Clause-FreeBSD';
      break;
    case 'BSD 3-Clause (NewBSD) License':
      licenseFileName = 'BSD-3-Clause';
      break;
    case 'Internet Systems Consortium (ISC) License':
      licenseFileName = 'ISC';
      break;
    case 'GNU LGPL 3.0 License':
      licenseFileName = 'LGPL-3.0';
      break;
    case 'GNU GPL 3.0 License':
      licenseFileName = 'GPL-3.0';
      break;
    case 'Unlicense':
      licenseFileName = 'unlicense';
      break;
    case 'No License':
      licenseFileName = 'UNLICENSED';
      break;
  }

  return licenseFileName;
};
