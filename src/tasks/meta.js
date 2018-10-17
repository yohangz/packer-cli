import path from 'path';
import fs from 'fs';

export const readConfig = () => {
  return require(path.join(process.cwd(), '.packerrc.json'));
};

export const readPackageData = () => {
  return require(path.join(process.cwd(), 'package.json'));
};

export const readCLIPackageData = () => {
  return require(path.join(__dirname, '../package.json'));
};

export const readBabelConfig = (esVersion) => {
  return require(path.join(process.cwd(), `.babelrc.${esVersion}.js`));
};

export const readBannerTemplate = () => {
  return fs.readFileSync(path.join(process.cwd(), 'templates/.banner.hbs'), 'utf8');
};
