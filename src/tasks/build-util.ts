import path from 'path';
import handlebars from 'handlebars';

import { rollup, RollupFileOptions } from 'rollup';
import rollupIgnoreImport from 'rollup-plugin-ignore-import';
import rollupPostCss from 'rollup-plugin-postcss';
import postCssImageInline from 'postcss-image-inliner';
import postCssAutoPrefix from 'autoprefixer';
import rollupReplace from 'rollup-plugin-re';
import rollupIgnore from 'rollup-plugin-ignore';
import rollupResolve from 'rollup-plugin-node-resolve';
import rollupCommonjs from 'rollup-plugin-commonjs';
import rollupTypescript from 'rollup-plugin-typescript2';
import rollupBabel from 'rollup-plugin-babel';
import rollupHandlebars from 'rollup-plugin-hbs';
import rollupImage from 'rollup-plugin-img';
import rollupProgress from 'rollup-plugin-progress';
import rollupFilesize from 'rollup-plugin-filesize';

import chalk from 'chalk';

import { readBabelConfig, readBannerTemplate } from './meta';
import { PackageConfig } from '../model/package-config';
import { PackerConfig } from '../model/packer-config';
import logger, { Logger } from '../common/logger';
import { LogLevel } from '../model/log-level';

export const getBanner = (config: PackerConfig, packageJson: PackageConfig) => {
  if (config.license.banner) {
    const bannerTemplate = readBannerTemplate();
    return handlebars.compile(bannerTemplate)({
      config,
      pkg: packageJson
    });
  }
};

export const getBaseConfig = (config: PackerConfig, packageJson: PackageConfig, banner: string) => {
  return {
    input: path.join(config.source, config.entry),
    output: {
      banner,
      name: packageJson.name,
      sourcemap: config.output.sourceMap
    }
  };
};

export const rollupStyleBuildPlugin = (config: PackerConfig,
                                       packageJson: PackageConfig,
                                       watch: boolean,
                                       minify: boolean,
                                       main: boolean) => {
  const styleDir = watch ? path.join(config.tmp, 'watch') : config.dist;
  const fileName = packageJson.name + (minify ? '.min.css' : '.css');
  const styleDist = path.join(process.cwd(), styleDir, config.output.stylesDir, fileName);

  if (!main && !config.output.inlineStyle) {
    return rollupIgnoreImport({
      extensions: ['.scss', '.sass', '.styl', '.css', '.less']
    });
  }

  return rollupPostCss({
    extract: config.output.inlineStyle ? false : styleDist,
    minimize: minify,
    plugins: [
      postCssImageInline({
        assetPaths: config.assetPaths,
        maxFileSize: config.output.imageInlineLimit
      }),
      postCssAutoPrefix
    ],
    sourceMap: config.output.sourceMap
  });
};

export const rollupReplacePlugin = (config: PackerConfig) => {
  return rollupReplace({
    patterns: config.pathReplacePatterns
  });
};

export const resolvePlugins = (config: PackerConfig) => {
  return [
    rollupIgnore(config.ignore),
    rollupResolve({
      browser: true,
      jsnext: true,
      main: true,
      preferBuiltins: false
    }),
    rollupCommonjs({
      include: 'node_modules/**'
    })
  ];
};

export const buildPlugin = (packageModule: string,
                            generateDefinition: boolean,
                            check: boolean,
                            config: PackerConfig,
                            tsPackage: boolean) => {
  const plugins = [];
  if (config.compiler.scriptPreprocessor  === 'typescript') {
    const buildConf: any = {
      check,
      tsconfig: `tsconfig.json`,
      typescript: tsPackage,
      cacheRoot: path.join(process.cwd(), config.tmp, '.rts2_cache')
    };

    if (generateDefinition) {
      buildConf.tsconfigOverride = {
        compilerOptions: {
          declaration: true,
          declarationDir: path.join(process.cwd(), config.dist)
        }
      };

      buildConf.useTsconfigDeclarationDir = true;
    }

    plugins.push(rollupTypescript(buildConf));
  }

  const babelConfig = readBabelConfig(packageModule);
  plugins.push(rollupBabel({
    babelrc: false,
    exclude: 'node_modules/**',
    extensions: [ '.js', '.jsx', '.es6', '.es', '.mjs', '.ts', 'tsx' ],
    plugins: babelConfig.plugins || [],
    presets: babelConfig.presets || [],
    runtimeHelpers: true
  }));

  return plugins;
};

export const preBundlePlugins = (config: PackerConfig) => {
  return [
    rollupReplacePlugin(config),
    rollupHandlebars(),
    rollupImage({
      exclude: 'node_modules/**',
      extensions: /\.(png|jpg|jpeg|gif|svg)$/,
      limit: config.output.imageInlineLimit
    })
  ];
};

export const postBundlePlugins = (task: string, type: string) => {
  if (logger.level <= LogLevel.INFO) {
    return [
      rollupProgress(),
      rollupFilesize({
        render: (options, size, gzippedSize) => {
          return chalk.yellow(
            `${chalk.green(task)} ${type} bundle size: ${chalk.red(size)}, gzipped size: ${chalk.red(gzippedSize)}`);
        }
      })
    ];
  }

  return [];
};

export const bundleBuild = async (config: RollupFileOptions, type: string, log: Logger): Promise<void> => {
  log.info('%s bundle build start', type);
  const bundle = await rollup(config);
  await bundle.write(config.output);
  log.info('%s bundle build end', type);
};

export const extractBundleExternals = (config: PackerConfig) => {
  return config.bundle.mapExternals ? Object.keys(config.bundle.globals) : config.bundle.externals;
};
