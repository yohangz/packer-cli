import path from 'path';
import handlebars from 'handlebars';
import glob from 'glob-to-regexp';
import chalk from 'chalk';
import terser from 'terser';
import get from 'lodash/get';

import codeFrameColumns from '@babel/code-frame';

import { OutputChunk, rollup, RollupOptions } from 'rollup';
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
import rollupGlobals from 'rollup-plugin-node-globals';
import rollupJson from 'rollup-plugin-json';

import { meta } from './meta';
import { PackageConfig } from '../model/package-config';
import { PackerConfig } from '../model/packer-config';
import logger, { Logger } from '../common/logger';
import { LogLevel } from '../model/log-level';
import { mergeDeep, readFile, requireDependency, writeFile } from './util';
import { PackageModuleType } from '../model/package-module-type';
import { BabelConfig } from '../model/babel-config';
import fileSize from 'filesize';

/**
 * Get distribution banner comment.
 * @param packerConfig Packer configuration object.
 * @param packageConfig Package configuration object.
 */
export const getBanner = async (packerConfig: PackerConfig, packageConfig: PackageConfig) => {
  if (packerConfig.license.banner) {
    const bannerTemplate = await meta.readBannerTemplate();
    return handlebars.compile(bannerTemplate)({
      config: packerConfig,
      pkg: packageConfig
    });
  }
};

/**
 * Get rollup base configuration.
 * @param packerConfig Packer configuration object.
 * @param packageConfig Package configuration object.
 * @param banner Banner comment.
 * @param sourceMap If true, a separate sourcemap file will be created. If inline, the sourcemap will be appended to
 * the resulting output file as a data URI.
 */
export const getBaseConfig = (
  packerConfig: PackerConfig,
  packageConfig: PackageConfig,
  banner: string,
  sourceMap?: boolean | 'inline'
) => {
  return {
    input: path.join(packerConfig.source, packerConfig.entry),
    output: {
      banner,
      name: packageConfig.name,
      sourcemap: typeof sourceMap !== 'undefined' ? sourceMap : packerConfig.compiler.sourceMap
    }
  };
};

/**
 * Get rollup style build plugins.
 * @param packerConfig Packer configuration object.
 * @param packageConfig Package configuration object.
 * @param watch Copy stylesheets artifacts to watch temp directory if true, else dist directory.
 * @param main Indicate whether it is the main build task to emit stylesheets. Otherwise, ignore style sheet building
 * unless style inline mode is enabled.
 * @param log Logger reference.
 */
export const getStyleBuildPlugins = (
  packerConfig: PackerConfig,
  packageConfig: PackageConfig,
  watch: boolean,
  main: boolean,
  log: Logger
) => {
  if (!packerConfig.compiler.style) {
    log.trace('style build disabled');
    return [];
  }

  if (!main && !packerConfig.compiler.style.inline) {
    log.trace('ignore style imports to avoid redundant style compilation');
    return [
      rollupIgnoreImport(
        mergeDeep(
          {
            exclude: 'node_modules/**',
            extensions: ['.scss', '.sass', '.styl', '.css', '.less']
          },
          packerConfig.compiler.advanced.rollup.pluginOptions.ignoreImport
        )
      )
    ];
  }

  log.trace('init style build plugins');
  const styleDir = watch ? path.join(packerConfig.tmp, 'watch') : packerConfig.dist;
  const fileName = packageConfig.name + '.css';
  const styleDist = path.join(process.cwd(), styleDir, packerConfig.compiler.style.outDir, fileName);
  log.trace('stylesheet dist file name %s', styleDist);

  return [
    rollupPostCss(
      mergeDeep(
        {
          exclude: 'node_modules/**',
          extract: packerConfig.compiler.style.inline ? false : styleDist,
          config: {
            path: path.join(process.cwd(), 'postcss.config.js'),
            ctx: {
              config: packerConfig
            }
          },
          // disable sourcemaps when inline bundling
          sourceMap: packerConfig.compiler.style.inline ? false : packerConfig.compiler.sourceMap
        },
        packerConfig.compiler.advanced.rollup.pluginOptions.postCss
      )
    )
  ];
};

/**
 * Generate minified style sheets.
 * @param packerConfig Packer configuration object.
 * @param packageConfig Package configuration object.
 * @param log Logger reference.
 */
export const generateMinStyleSheet = async (
  packerConfig: PackerConfig,
  packageConfig: PackageConfig,
  log: Logger
): Promise<void> => {
  if (!packerConfig.compiler.style || packerConfig.compiler.style.inline) {
    return;
  }

  const nano = requireDependency('cssnano', log);

  const srcPath = path.join(process.cwd(), packerConfig.dist, packerConfig.compiler.style.outDir);
  const srcFileName = `${packageConfig.name}.css`;
  const srcFilePath = path.join(srcPath, srcFileName);
  const srcMinFileName = `${packageConfig.name}.min.css`;
  const srcMinFilePath = path.join(srcPath, srcMinFileName);
  const srcCss = await readFile(srcFilePath);
  const options: any = {
    from: srcFileName,
    to: srcMinFileName
  };

  // only set cssnano sourcemap options when sourcemap is true
  if (packerConfig.compiler.sourceMap === true) {
    const srcMapFilePath = path.join(srcPath, `${packageConfig.name}.css.map`);
    const srcMapCss = await readFile(srcMapFilePath);
    options.map = {
      sourcesContent: true,
      prev: srcMapCss
    };
  }

  let result;

  log.trace('cssnano options:\n%o', options);
  try {
    result = await nano.process(String(srcCss), mergeDeep(options, packerConfig.compiler.advanced.other.cssnano));
  } catch (e) {
    log.error('style minify failure:\n%s', e.stack || e.message);
    process.exit(1);
  }

  await writeFile(srcMinFilePath, result.css);

  // save sourcemap file only when sourcemap true
  if (packerConfig.compiler.sourceMap === true) {
    const srcMinMapFilePath = path.join(srcPath, `${srcMinFileName}.map`);
    await writeFile(srcMinMapFilePath, result.map);
  }
};

/**
 * Get rollup dependency resolve plugins.
 * @param packerConfig  Packer configuration object.
 */
export const getDependencyResolvePlugins = (packerConfig: PackerConfig) => {
  const mainFields = [ 'module', 'jsnext', 'main' ];
  if (packerConfig.compiler.buildMode) {
    mainFields.push('browser');
  }

  const plugins = [
    rollupIgnore(packerConfig.ignore),
    rollupResolve(
      mergeDeep(
        {
          mainFields,
          extensions: ['.mjs', '.js', '.jsx', '.json', '.node'],
          browser: packerConfig.compiler.buildMode === 'browser',
          preferBuiltins: true
        },
        packerConfig.compiler.advanced.rollup.pluginOptions.nodeResolve
      )
    ),
    rollupCommonjs(
      mergeDeep(
        {
          include: 'node_modules/**'
        },
        packerConfig.compiler.advanced.rollup.pluginOptions.commonjs
      )
    ),
    rollupJson(packerConfig.compiler.advanced.rollup.pluginOptions.json)
  ];

  // include global and builtin plugins only when browser build mode is enabled
  if (packerConfig.compiler.buildMode === 'browser') {
    plugins.push(rollupGlobals(packerConfig.compiler.advanced.rollup.pluginOptions.globals));
  }

  return plugins;
};

/**
 * Get script build rollup plugins.
 * @param packageModule Package module type.
 * @param generateDefinition Generate type definitions if true.
 * @param check Set to false to avoid doing any diagnostic checks on the code.
 * @param packerConfig Packer configuration object.
 * @param babelConfig Babel configuration object.
 * @param typescript Typescript compiler reference.
 * @param log  Logger reference.
 */
export const getScriptBuildPlugin = (
  packageModule: PackageModuleType,
  generateDefinition: boolean,
  check: boolean,
  packerConfig: PackerConfig,
  babelConfig: BabelConfig,
  typescript: any,
  log: Logger
) => {
  const plugins = [];
  if (packerConfig.compiler.script.preprocessor === 'typescript') {
    const buildConf: RollupPluginTypescriptOptions = {
      check,
      tsconfig: `tsconfig.json`,
      typescript,
      cacheRoot: path.join(process.cwd(), packerConfig.tmp, 'build', packageModule, '.rts2_cache'),
      clean: true
    };

    if (generateDefinition) {
      buildConf.tsconfigOverride = {
        compilerOptions: {
          declaration: true,
          declarationDir: path.join(process.cwd(), packerConfig.dist, packerConfig.compiler.script.tsd)
        }
      };

      buildConf.useTsconfigDeclarationDir = true;
    }

    plugins.push(
      rollupTypescript(mergeDeep(buildConf, packerConfig.compiler.advanced.rollup.pluginOptions.typescript))
    );
  }

  const moduleConfig = get(babelConfig, `env.${packageModule}`);
  if (!moduleConfig) {
    log.error('%s module configuration not found in .babelrc', packageModule);
    process.exit(1);
  }

  plugins.push(
    rollupBabel(
      mergeDeep(
        {
          babelrc: false,
          exclude: 'node_modules/**',
          extensions: ['.js', '.jsx', '.es6', '.es', '.mjs', '.ts', '.tsx'],
          plugins: moduleConfig.plugins || [],
          presets: moduleConfig.presets || [],
          runtimeHelpers: true
        },
        packerConfig.compiler.advanced.rollup.pluginOptions.babel
      )
    )
  );

  return plugins;
};

/**
 * Get pre bundle rollup plugins.
 * @param packerConfig Packer configuration object.
 */
export const getPreBundlePlugins = (packerConfig: PackerConfig) => {
  const plugins = [];
  if (packerConfig.replacePatterns.length) {
    plugins.push(
      rollupReplace(
        mergeDeep(
          {
            exclude: 'node_modules/**',
            patterns: packerConfig.replacePatterns
          },
          packerConfig.compiler.advanced.rollup.pluginOptions.replace
        )
      )
    );
  }
  plugins.push(
    rollupHandlebars(packerConfig.compiler.advanced.rollup.pluginOptions.handlebars),
    rollupImage(
      mergeDeep(
        {
          exclude: 'node_modules/**',
          extensions: /\.(png|jpg|jpeg|gif|svg)$/,
          limit: packerConfig.compiler.script.image.inlineLimit,
          output: path.join(packerConfig.dist, packerConfig.compiler.script.image.outDir)
        },
        packerConfig.compiler.advanced.rollup.pluginOptions.image
      )
    )
  );

  return plugins;
};

/**
 * Get post bundle rollup plugins.
 * @param task Gulp task name.
 * @param type Package module type.
 * @param packerConfig Packer config object.
 */
export const getPostBundlePlugins = (packerConfig: PackerConfig, task: string, type: PackageModuleType) => {
  if (logger.level <= LogLevel.INFO) {
    return [
      rollupFilesize(
        mergeDeep(
          {
            showMinifiedSize: false,
            showBrotliSize: false,
            showGzippedSize: false,
            render: (options: any, sourceBundle: any, { gzipSize, bundleSize }): string => {
              const bundleFormatted = `bundle size: ${chalk.red(bundleSize)}`;
              return chalk.yellow(`${logger.currentTime} ${chalk.green(task)} ${type} ${bundleFormatted}`);
            }
          },
          packerConfig.compiler.advanced.rollup.pluginOptions.filesize
        )
      )
    ];
  }

  return [];
};

/**
 * Get custom rollup plugins included via packer config.
 * @param packerConfig Packer configuration object.
 * @param type Package module type.
 */
export const customRollupPlugins = (packerConfig: PackerConfig, type: PackageModuleType): any[] => {
  if (packerConfig.compiler.customRollupPluginExtractor) {
    return packerConfig.compiler.customRollupPluginExtractor(type, packerConfig);
  }

  return [];
};

/**
 * Generate bundled artifacts via rollup.
 * @param packerConfig Packer configuration object.
 * @param packageConfig Package configuration object.
 * @param bundleConfig Rollup bundle configuration object.
 * @param type Package module type.
 * @param minify Generate minified bundle artifact if true.
 * @param trackBuildPerformance Track rollup build performance.
 * @param log Logger reference.
 */
export const generateBundle = async (
  packerConfig: PackerConfig,
  packageConfig: PackageConfig,
  bundleConfig: RollupOptions,
  type: PackageModuleType,
  minify: boolean,
  trackBuildPerformance: boolean,
  log: Logger
): Promise<void> => {
  log.trace('%s bundle build start', type);
  const bundle = await rollup(mergeDeep(bundleConfig, packerConfig.compiler.advanced.rollup.inputOptions));
  const outputOptions = mergeDeep(bundleConfig.output, packerConfig.compiler.advanced.rollup.outputOptions);
  const { output } = await bundle.write(outputOptions);
  const chunks: OutputChunk[] = output.filter((chunk: any) => !chunk.isAsset) as OutputChunk[];
  const { map, code } = chunks[0];

  log.trace('%s bundle build end', type);

  if (trackBuildPerformance) {
    // Performance stats should be available on any log level
    const messageBase = `${logger.currentTime} ${chalk.green(type)}`;
    console.log(chalk.blue('%s bundle performance statistics:\n%o'), messageBase, bundle.getTimings());
  }

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

    if (packerConfig.compiler.sourceMap === 'inline') {
      minSourceMapConfig.url = 'inline';
    } else if (packerConfig.compiler.sourceMap) {
      minSourceMapConfig.url = minMapFileName;
    } else {
      minSourceMapConfig = undefined;
    }

    const minData = terser.minify(
      code,
      mergeDeep(
        {
          sourceMap: minSourceMapConfig,
          output: {
            comments: /@preserve|@license|@cc_on/i
          }
        },
        packerConfig.compiler.advanced.other.terser
      )
    );
    log.trace('%s minified bundle terser config\n%o', type, minData);

    if (minData.error) {
      const { message, line, col: column } = minData.error;
      log.error(
        '%s bundle min build failure \n%s',
        type,
        codeFrameColumns(code, { start: { line, column } }, { message })
      );
      process.exit(1);
    } else {
      await writeFile(minFileDist, minData.code);
      if (minSourceMapConfig && minSourceMapConfig.url === minMapFileName) {
        log.trace('%s minified bundle write source maps', type);
        await writeFile(minMapFileDist, minData.map);
      }

      if (logger.level <= LogLevel.INFO) {
        const  formatOptions = packerConfig.compiler.advanced.rollup.pluginOptions.filesize.format;
        const size = fileSize(Buffer.byteLength(minData.code), mergeDeep({
          base: 10
        }, formatOptions));
        const minType = `${type} minified size:`;
        log.info(chalk.yellow(minType), chalk.red(size));
      }
    }

    log.trace('%s minified bundle build end', type);
  }
};

/**
 * Get external dependency filter function.
 * @param packerConfig Packer config object.
 */
export const getExternalFilter = (packerConfig: PackerConfig) => {
  const filter = packerConfig.bundle.externals.map((external) => glob(external));
  return (id: string) => {
    return filter.some((include) => include.test(id));
  };
};

/**
 * Extract bundle external.
 * @param packerConfig Packer config object.
 */
export const extractBundleExternals = (packerConfig: PackerConfig) => {
  // Map externals from globals if mapExternals is true.
  return packerConfig.bundle.mapExternals ? Object.keys(packerConfig.bundle.globals) : getExternalFilter(packerConfig);
};
