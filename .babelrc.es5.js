module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          esmodules: false
        }
      }
    ]
  ],
  plugins: [
    [
      '@babel/plugin-transform-runtime',
      {
        corejs: false,
        helpers: true,
        regenerator: true,
        useESModules: false
      }
    ]
  ]
};
