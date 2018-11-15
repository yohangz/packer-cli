import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import * as inspector from 'schema-inspector';
import mergeWith from 'lodash/mergeWith';

import { PackerConfig } from '../model/packer-config';
import { PackageConfig } from '../model/package-config';
import { BabelConfig } from '../model/babel-config';
import { Logger } from '../common/logger';
import { packerSchema } from './validation';
import { args } from './util';

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

  public fetchPackerConfig(log: Logger): void {
    if (this.packerConfig) {
      return;
    }

    const projectConf: PackerConfig = require(this.readConfigPath(log));

    const readConf = (sourceConf) => {
      const conf = sourceConf[sourceConf.length - 1];
      if (conf && typeof conf === 'object' && conf.extend) {
        let parentConfPath;
        if (conf.extend.startsWith('~/packer-cli')) {
          parentConfPath = path.join(__dirname, conf.extend.replace('~/packer-cli', '../'));
        } else {
          parentConfPath = path.isAbsolute(conf.extend) ? conf.extend : path.join(process.cwd(), conf.extend);
        }

        log.trace('read parent packer config from path: %s', parentConfPath);
        return readConf([...sourceConf, require(parentConfPath)]);
      } else {
        return sourceConf;
      }
    };

    const confCollection = readConf([projectConf]).reverse();
    let packerConfig: PackerConfig = null;
    if (confCollection.length > 1) {
      const baseConf = confCollection.shift();
      packerConfig = mergeWith(baseConf, ...confCollection, (objValue, srcValue) => {
        if (Array.isArray(objValue)) {
          if (Array.isArray(srcValue)) {
            return srcValue;
          }

          return [];
        }
      });
    } else {
      packerConfig = confCollection[0];
    }

    log.trace('merged packer config:\n%o', packerConfig);
    const validation = inspector.validate(packerSchema, packerConfig);
    if (!validation.valid) {
      log.warn('malformed packer config (.packerrc.js):\n%s\nusing default configuration', validation.format());
    }

    this.packerConfig = inspector.sanitize(packerSchema, packerConfig).data;
  }

  public readPackerConfig(log: Logger): PackerConfig {
    if (this.packerConfig) {
      return this.packerConfig;
    }

    this.fetchPackerConfig(log);
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

  private readConfigPath(log: Logger): string {
    const dynamicConfIndex = args.findIndex((value: string): boolean => {
      return value.startsWith('--config') || value.startsWith('-c');
    });

    let confPath: string;
    if (dynamicConfIndex > -1) {
      const dynamicConf = args[dynamicConfIndex + 1];
      if (!dynamicConf) {
        log.error('config file path not defined with config option.\n%s "%s"',
          chalk.reset('correct packer command with'), chalk.blue('packer <command> --config path/to/packerrc.js'));
        process.exit(1);
      }

      confPath = path.isAbsolute(dynamicConf) ? dynamicConf : path.join(process.cwd(), dynamicConf);
      log.info('using dynamic packer config in %s', confPath);

      if (!fs.existsSync(confPath)) {
        log.error('packer config file not found');
        process.exit(1);
      }
    } else {
      confPath = path.join(process.cwd(), '.packerrc.js');

      if (!fs.existsSync(confPath)) {
        log.error('Current directory does not contain packer config.\n%s "%s %s"',
          chalk.reset('Generate new project via'), chalk.blue('packer generate'), chalk.green('<project name>'));
        process.exit(1);
      }
    }

    return confPath;
  }
}

export const meta = new MetaData();
