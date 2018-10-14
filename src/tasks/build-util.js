import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import rollupIgnoreImport from "rollup-plugin-ignore-import";
import rollupPostCss from "rollup-plugin-postcss";
import postCssImageInline from "postcss-image-inliner";
import postCssAutoPrefix from "autoprefixer";
import rollupReplace from "rollup-plugin-re";
import rollupIgnore from "rollup-plugin-ignore";
import rollupResolve from "rollup-plugin-node-resolve";
import rollupCommonjs from "rollup-plugin-commonjs";
import typescript from "typescript";
import rollupTypescript from "rollup-plugin-typescript2";
import rollupBabel from "rollup-plugin-babel";
import rollupHandlebars from "rollup-plugin-hbs";
import rollupImage from "rollup-plugin-img";
import rollupProgress from "rollup-plugin-progress";
import rollupFilesize from "rollup-plugin-filesize";
import * as insert from 'rollup-plugin-insert';

import chalk from "chalk";
import {rollup} from "rollup";

export const getBanner = (config, packageJson) => {
  if (config.license.banner) {
    const bannerTemplate = fs.readFileSync(path.join(process.cwd(), '.banner.hbs'), 'utf8');
    return handlebars.compile(bannerTemplate)({
      config: config,
      pkg: packageJson
    })
  }
};

export const getBaseConfig = (config, packageJson, banner) => {
  return {
    input: path.join(config.source, config.entry),
    output: {
      name: packageJson.name,
      sourcemap: true,
      banner: banner
    }
  };
};



export const rollupStyleBuildPlugin = (config, packageJson, watch, minify, main) => {
  const styleDir = watch ? config.watch.scriptDir : config.dist.outDir;
  const styleDist = path.join(process.cwd(), styleDir, config.dist.stylesDir, packageJson.name + (minify ? '.min.css' : '.css'));

  if (!main && !config.bundle.inlineStyle) {
    return  rollupIgnoreImport({
      extensions: ['.scss', '.sass', '.styl', '.css', '.less']
    });
  }

  return rollupPostCss({
    plugins: [
      postCssImageInline({
        maxFileSize: config.bundle.imageInlineLimit,
        assetPaths: config.assetPaths
      }),
      postCssAutoPrefix
    ],
    sourceMap: true,
    minimize: minify,
    extract: config.bundle.inlineStyle? false: styleDist
  });
};

export const rollupReplacePlugin = (config) => {
  return rollupReplace({
    patterns: config.pathReplacePatterns
  });
};

export const resolvePlugins = (config) => {
  return [
    rollupIgnore(config.ignore),
    rollupResolve({
      jsnext: true,
      main: true,
      browser: true,
      preferBuiltins: false
    }),
    rollupCommonjs({
      include: 'node_modules/**'
    })
  ];
};

export const buildPlugin = (esVersion, generateDefinition, watch, config) => {
  if (config.typescript) {
    let buildConf = {
      tsconfig: `tsconfig.${esVersion}.json`,
      typescript: typescript,
      check: !watch
    };

    if (generateDefinition) {
      buildConf.tsconfigOverride = {
        compilerOptions: {
          declaration: true,
          declarationDir: path.join(process.cwd(), config.dist.outDir)
        }
      };

      buildConf.useTsconfigDeclarationDir = true;
    }

    return rollupTypescript(buildConf);
  }

  return rollupBabel({
    babelrc: false,
    exclude: 'node_modules/**',
    presets: [
      [
        '@babel/preset-env',
        {
          'targets': {
            'esmodules': esVersion === 'es2015'
          }
        }
      ]
    ]
  });
};

export const preBundlePlugins = (config) => {
  return [
    rollupReplacePlugin(config),
    rollupHandlebars(),
    rollupImage({
      extensions: /\.(png|jpg|jpeg|gif|svg)$/,
      limit: config.bundle.imageInlineLimit,
      exclude: 'node_modules/**'
    })
  ];
};

export const postBundlePlugins = () => {
  return [
    rollupProgress(),
    rollupFilesize({
      render: function (options, size, gzippedSize) {
        return chalk.yellow(`Bundle size: ${chalk.red(size)}, Gzipped size: ${chalk.red(gzippedSize)}`);
      }
    })
  ];
};

export const bundleBuild = async (config, type) => {
  try {
    console.log(chalk.blue(`${type} bundle build start`));
    const bundle = await rollup(config);
    await bundle.write(config.output);
    console.log(chalk.blue(`${type} bundle build end`));
  } catch (error) {
    console.log(chalk.red(`${type} bundle build Failure`));
    console.log(error);
    throw error;
  }
};
