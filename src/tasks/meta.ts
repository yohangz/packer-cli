import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import * as inspector from 'schema-inspector';

import { PackerConfig } from '../model/packer-config';
import { PackageConfig } from '../model/package-config';
import { BabelConfig } from '../model/babel-config';
import { Logger } from '../common/logger';
import { packerSchema } from './validation';

// TODO: handle concurrent reads, implement a locking mechanism
class MetaData {
  private packerConfig: PackerConfig;
  private packageConfig: PackageConfig;
  private cliPackageConfig: PackageConfig;
  private babelConfig: {
    [key: string]: BabelConfig
  } = {};
  private bannerTemplate: string;
  private packerHelpSummary: string;
  private packerBanner: string;

  public readPackerConfig(log: Logger): PackerConfig {
    if (this.packerConfig) {
      return this.packerConfig;
    }

    const packerConfig = require(path.join(process.cwd(), '.packerrc.js'));
    const validation = inspector.validate(packerSchema, packerConfig);
    if (!validation.valid) {
      log.warn('malformed packer config (.packerrc):\n%s\nusing default configuration', validation.format());
    }

    this.packerConfig = inspector.sanitize(packerSchema, packerConfig).data;
    return this.packerConfig;
  }

  public readPackageData(): PackageConfig {
    if (this.packageConfig) {
      return this.packageConfig;
    }

    this.packageConfig = require(path.join(process.cwd(), 'package.json'));
    return this.packageConfig;
  }

  public readCLIPackageData(): PackageConfig {
    if (this.cliPackageConfig) {
      return this.cliPackageConfig;
    }

    this.cliPackageConfig = require(path.join(__dirname, '../package.json'));
    return this.cliPackageConfig;
  }

  public readBabelConfig(esVersion: string): BabelConfig {
    if (this.babelConfig[esVersion]) {
      return this.babelConfig[esVersion];
    }

    this.babelConfig[esVersion] = require(path.join(process.cwd(), `.babelrc.${esVersion}.js`));
    return this.babelConfig[esVersion];
  }

  public readBannerTemplate(): string {
    if (this.bannerTemplate) {
      return this.bannerTemplate;
    }

    this.bannerTemplate = fs.readFileSync(path.join(process.cwd(), '.packer/banner.hbs'), 'utf8');
    return this.bannerTemplate;
  }

  public readPackerHelpSummary(): string {
    if (this.packerHelpSummary) {
      return this.packerHelpSummary;
    }

    this.packerHelpSummary = fs.readFileSync(path.join(__dirname, '../resources/dynamic/packer-help.txt'), 'utf8');
    return this.packerHelpSummary;
  }

  public readPackerBanner(): string {
    if (this.packerBanner) {
      return this.packerBanner;
    }

    this.packerBanner = fs.readFileSync(path.join(__dirname, '../resources/dynamic/banner.txt'), 'utf8');
    return this.packerBanner;
  }

  public isValidProject(log: Logger): boolean {
    const hasPackerConfig = fs.existsSync(path.join(process.cwd(), '.packerrc.js'));
    if (!hasPackerConfig) {
      log.warn('Current directory does not contain packer config.\n%s "%s %s"',
        chalk.reset('Generate new project via'), chalk.blue('packer generate'), chalk.green('<project name>'));
    }

    return hasPackerConfig;
  }
}

export const meta = new MetaData();
