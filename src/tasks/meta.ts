import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import * as inspector from 'schema-inspector';

import { PackerConfig } from '../model/packer-config';
import { PackageConfig } from '../model/package-config';
import { BabelConfig } from '../model/babel-config';
import { Logger } from '../common/logger';
import { packerSchema } from './validation';

let configData: PackerConfig = null;

export const readConfig = (log: Logger): PackerConfig => {
  if (configData) {
    return configData;
  }

  const packerConfig = require(path.join(process.cwd(), '.packerrc.json'));
  const validation = inspector.validate(packerSchema, packerConfig);
  if (!validation.valid) {
    log.warn('malformed packer config (.packerrc):\n%s', validation.format());
  }

  configData = inspector.sanitize(validation, packerConfig).data;
  return configData;
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

export const readSummary = (): string => {
  return fs.readFileSync(path.join(__dirname, '../resources/dynamic/packer-help.txt'), 'utf8');
};

export const readBanner = (): string => {
  return fs.readFileSync(path.join(__dirname, '../resources/dynamic/banner.txt'), 'utf8');
};

export const isValidProject = (log: Logger): boolean => {
  const hasPackerConfig = fs.existsSync(path.join(process.cwd(), '.packerrc.json'));
  if (!hasPackerConfig) {
    log.warn('Current directory does not contain packer config.\n%s "%s %s"',
      chalk.reset('Generate new project via'), chalk.blue('packer generate'), chalk.green('<project name>'));
  }

  return hasPackerConfig;
};
