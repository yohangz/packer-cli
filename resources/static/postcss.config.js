const path = require('path');

module.exports = (context) => {
  const conf = context.options.config;

  const plugins = [
    require('postcss-url')({
      url: 'inline',
      basePath: conf.assetPaths.map((assetPath) => {
        return path.join(process.cwd(), assetPath);
      }),
      maxSize: conf.compiler.style.image.inlineLimit,
      fallback: 'copy',
      optimizeSvgEncode: true,
      assetsPath: path.join(process.cwd(), conf.dist, conf.compiler.style.image.outDir),
      useHash: true,
      rebase: path.join(process.cwd(), conf.dist)
    }),
    require('autoprefixer')
  ];

  if (conf.compiler.style.inline) {
    plugins.push(require('cssnano'));
  }

  return {
    plugins
  };
};
