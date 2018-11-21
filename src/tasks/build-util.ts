import path from 'path';
import handlebars from 'handlebars';
import glob from 'glob-to-regexp';
import chalk from 'chalk';
import terser from 'terser';
import fs from 'fs';

import codeFrameColumns from '@babel/code-frame';

import { rollup, RollupFileOptions } from 'rollup';
import rollupIgnoreImport from 'rollup-plugin-ignore-import';
import rollupPostCss from 'rollup-plugin-postcss';
import rollupReplace from 'rollup-plugin-re';
import rollupIgnore from 'rollup-plugin-ignore';
import rollupResolve from 'rollup-plugin-node-resolve';
import rollupCommonjs from 'rollup-plugin-commonjs';
import rollupTypescript from 'rollup-plugin-typescript2';
import rollupBabel from 'rollup-plugin-babel';
import rollupHandlebars from 'rollup-plugin-hbs';
import rollupImage from 'rollup-plugin-img';
import rollupFilesize from 'rollup-plugin-filesize';
import rollupBuiltins from 'rollup-plugin-node-builtins';
import rollupGlobals from 'rollup-plugin-node-globals';
import rollupJson from 'rollup-plugin-json';

import { meta } from './meta';
import { PackageConfig } from '../model/package-config';
import { PackerConfig } from '../model/packer-config';
import logger, { Logger } from '../common/logger';
import { LogLevel } from '../model/log-level';
import { writeFile } from './util';

/**
 * Get distribution banner comment.
 * @param config - Packer configuration object.
 * @param packageJson - Package configuration object.
 */
export const getBanner = (config: PackerConfig, packageJson: PackageConfig) => {
  if (config.license.banner) {
    const bannerTemplate = meta.readBannerTemplate();
    return handlebars.compile(bannerTemplate)({
      config,
      pkg: packageJson
    });
  }
};

/**
 * Get rollup base configuration.
 * @param config - Packer configuration object.
 * @param packageJson - Package configuration object.
 * @param banner - Banner comment.
 * @param sourceMap - If true, a separate sourcemap file will be created. If inline, the sourcemap will be appended to
 * the resulting output file as a data URI.
 */
export const getBaseConfig = (config: PackerConfig, packageJson: PackageConfig, banner: string,
                              sourceMap?: boolean | 'inline') => {
  return {
    input: path.join(config.source, config.entry),
    output: {
      banner,
      name: packageJson.name,
      sourcemap: typeof sourceMap !== 'undefined' ? sourceMap : config.compiler.sourceMap
    }
  };
};

/**
 * Get rollup style build plugins.
 * @param config - Packer configuration object.
 * @param packageJson - Package configuration object.
 * @param watch - Copy stylesheets artifacts to watch temp directory if true, else dist directory.
 * @param main - Indicate whether it is the main build task to emit stylesheets. Otherwise, ignore style sheet building
 * unless style inline mode is enabled.
 * @param log - Logger reference.
 */
export const rollupStyleBuildPlugins = (config: PackerConfig, packageJson: PackageConfig, watch: boolean, main: boolean,
                                        log: Logger) => {
  if (!config.compiler.style) {
    log.trace('style build disabled');
    return [];
  }

  if (!main && !config.compiler.style.inline) {
    log.trace('ignore style imports to avoid redundant style compilation');
    return [
      rollupIgnoreImport({
        exclude: 'node_modules/**',
        extensions: ['.scss', '.sass', '.styl', '.css', '.less']
      })
    ];
  }

  log.trace('init style build plugins');
  const styleDir = watch ? path.join(config.tmp, 'watch') : config.dist;
  const fileName = packageJson.name + '.css';
  const styleDist = path.join(process.cwd(), styleDir, config.compiler.style.outDir, fileName);
  log.trace('stylesheet dist file name %s', styleDist);

  return [
    rollupPostCss({
      exclude: 'node_modules/**',
      extract: config.compiler.style.inline ? false : styleDist,
      config: {
        path: path.join(process.cwd(), 'postcss.config.js'),
        ctx: {
          config
        }
      },
      sourceMap: config.compiler.style.inline ? false : config.compiler.sourceMap
    })
  ];
};

export const generateMinCss = async (packerConfig: PackerConfig, packageConfig: PackageConfig,
                                     log: Logger): Promise<void> => {
  if (!packerConfig.compiler.style || packerConfig.compiler.style.inline) {
    return;
  }

  const nano = require('cssnano');

  const srcPath = path.join(process.cwd(), packerConfig.dist, packerConfig.compiler.style.outDir);
  const srcFileName = `${packageConfig.name}.css`;
  const srcFilePath = path.join(srcPath, srcFileName);
  const srcMinFileName = `${packageConfig.name}.min.css`;
  const srcMinFilePath = path.join(srcPath, srcMinFileName);
  const srcCss = fs.readFileSync(srcFilePath, 'utf8');
  const options: any = {
    from: srcFileName,
    to: srcMinFileName
  };

  if (packerConfig.compiler.sourceMap === true) {
    const srcMapFilePath = path.join(srcPath, `${packageConfig.name}.css.map`);
    const srcMapCss = fs.readFileSync(srcMapFilePath, 'utf8');
    options.map = {
      sourcesContent: true,
      prev: srcMapCss
    };
  }

  let result;

  log.info('cssnano options:\n%o', options);
  try {
    result = await nano.process(String(srcCss), options);
  } catch (e) {
    log.error('style minify failure:\n%s', e.stack || e.message);
    process.exit(1);
  }

  fs.writeFileSync(srcMinFilePath, result.css);

  if (packerConfig.compiler.sourceMap === true) {
    const srcMinMapFilePath = path.join(srcPath, `${srcMinFileName}.map`);
    fs.writeFileSync(srcMinMapFilePath, result.map);
  }
};

export const resolvePlugins = (config: PackerConfig) => {
  const plugins = [
    rollupIgnore(config.ignore),
    rollupResolve({
      browser: true,
      jsnext: true,
      main: true,
      preferBuiltins: false
    }),
    rollupCommonjs({
      include: 'node_modules/**'
    }),
    rollupJson()
  ];

  if (config.compiler.buildMode === 'browser') {
    plugins.push(
      rollupGlobals(),
      rollupBuiltins()
    );
  }

  return plugins;
};

export const buildPlugin = (packageModule: string, generateDefinition: boolean, check: boolean, config: PackerConfig,
                            tsPackage: boolean) => {
  const plugins = [];
  if (config.compiler.script.preprocessor  === 'typescript') {
    const buildConf: any = {
      check,
      tsconfig: `tsconfig.json`,
      typescript: tsPackage,
      clean: config.compiler.concurrentBuild,
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

  const babelConfig = meta.readBabelConfig(packageModule);
  plugins.push(rollupBabel({
    babelrc: false,
    exclude: 'node_modules/**',
    extensions: [ '.js', '.jsx', '.es6', '.es', '.mjs', '.ts', '.tsx' ],
    plugins: babelConfig.plugins || [],
    presets: babelConfig.presets || [],
    runtimeHelpers: true
  }));

  return plugins;
};

export const preBundlePlugins = (config: PackerConfig) => {
  const plugins = [];
  if (config.replacePatterns.length) {
    plugins.push(rollupReplace({
      exclude: 'node_modules/**',
      patterns: config.replacePatterns
    }));
  }
  plugins.push(
    rollupHandlebars(),
    rollupImage({
      exclude: 'node_modules/**',
      extensions: /\.(png|jpg|jpeg|gif|svg)$/,
      limit: config.compiler.script.image.inlineLimit,
      output: path.join(config.dist, config.compiler.script.image.outDir)
    })
  );

  return plugins;
};

const bundleSizeLoggerPlugin = (taskName: string, type: string) => {
  return rollupFilesize({
    showMinifiedSize: false,
    showBrotliSize: false,
    render: (options: any, sourceBundle: any, { gzipSize, bundleSize }): string => {
      const bundleFormatted = `bundle size: ${chalk.red(bundleSize)}`;
      const gzippedFormatted = `gzipped size: ${chalk.red(gzipSize)}`;
      return chalk.yellow(`${chalk.green(taskName)} ${type} ${bundleFormatted}, ${gzippedFormatted}`);
    }
  });
};

export const postBundlePlugins = (task: string, type: string) => {
  if (logger.level <= LogLevel.INFO) {
    return [
      bundleSizeLoggerPlugin(task, type)
    ];
  }

  return [];
};

export const customRollupPlugins = (config: PackerConfig, type: string): any[] => {
  if (config.compiler.customRollupPluginExtractor) {
    return config.compiler.customRollupPluginExtractor(type, config);
  }

  return [];
};

export const bundleBuild = async (config: PackerConfig, packageData: PackageConfig, bundleConfig: RollupFileOptions,
                                  type: string, minify: boolean, log: Logger): Promise<void> => {
  log.trace('%s bundle build start', type);
  const bundle = await rollup(bundleConfig);
  const { code, map } = await bundle.write(bundleConfig.output);
  log.trace('%s bundle build end', type);

  if (minify) {
    log.trace('%s minified bundle build start', type);
    const minFileDist = bundleConfig.output.file.replace('.js', '.min.js');
    const minMapFileDist = minFileDist.concat('.map');
    const minFileName = path.basename(minFileDist);
    const minMapFileName = minFileName.concat('.map');

    let minSourceMapConfig: any = {
      content: map,
      filename: minFileName
    };

    if (config.compiler.sourceMap === 'inline') {
      minSourceMapConfig.url = 'inline';
    } else if (config.compiler.sourceMap) {
      minSourceMapConfig.url = minMapFileName;
    } else {
      minSourceMapConfig = undefined;
    }

    const minData = terser.minify(code, {
      sourceMap: minSourceMapConfig,
      output: {
        comments: /@preserve|@license|@cc_on/i
      }
    });
    log.trace('%s minified bundle terser config\n%o', type, minData);

    if (minData.error) {
      const { message, line, col: column } = minData.error;
      log.error('%s bundle min build failure \n%s', type,
        codeFrameColumns(code, { start: { line, column } }, { message }));
      process.exit(1);
    } else {
      await writeFile(minFileDist, minData.code);
      if (minSourceMapConfig && minSourceMapConfig.url === minMapFileName) {
        log.trace('%s minified bundle write source maps', type);
        await writeFile(minMapFileDist, minData.map);
      }

      const task = log.taskName.replace(' ', '');
      const sizeDetail = bundleSizeLoggerPlugin(task, `${type} minified`);
      sizeDetail.ongenerate(null, { code:  minData.code });
    }

    log.trace('%s minified bundle build end', type);
  }
};

export const externalFilter = (config: PackerConfig) => {
  const filter = config.bundle.externals.map((external) => glob(external));
  return (id: string) => {
    return filter.some((include) => include.test(id));
  };
};

export const extractBundleExternals = (config: PackerConfig) => {
  return config.bundle.mapExternals ? Object.keys(config.bundle.globals) : externalFilter(config);
};
