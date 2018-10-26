import path from 'path';
import fs from 'fs';
import { PackerConfig } from '../model/packer-config';
import { PackageConfig } from '../model/package-config';
import { BabelConfig } from '../model/babel-config';

export const readConfig = (): PackerConfig => {
  return require(path.join(process.cwd(), '.packerrc.json'));
};

export const readPackageData = (): PackageConfig => {
  return require(path.join(process.cwd(), 'package.json'));
};

export const readCLIPackageData = (): PackageConfig => {
  return require(path.join(__dirname, '../package.json'));
};

export const readBabelConfig = (esVersion: string): BabelConfig => {
  return require(path.join(process.cwd(), `.babelrc.${esVersion}.js`));
};

export const readBannerTemplate = (): string => {
  return fs.readFileSync(path.join(process.cwd(), '.packer/banner.hbs'), 'utf8');
};
