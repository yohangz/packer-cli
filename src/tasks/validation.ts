export const packerSchema = {
  type: 'object',
  properties: {
    entry: {
      type: 'string',
      optional: false,
      def: 'index.js'
    },
    source: {
      type: 'string',
      optional: false,
      def: 'src'
    },
    dist: {
      type: 'string',
      optional: false,
      def: 'dist'
    },
    output: {
      type: 'object',
      optional: false,
      properties: {
        amd: {
          type: 'object',
          properties: {
            entry: {
              type: 'define',
              optional: false,
              def: ''
            },
            source: {
              type: 'id',
              optional: false,
              def: ''
            },
          }
        },
        dependencyMapMode: {
          type: 'string',
          optional: false,
          def: 'cross-map-peer-dependency',
          pattern: /^(cross-map-peer-dependency|cross-map-dependency|map-dependency|map-peer-dependency|all)$/
        },
        esnext: {
          type: 'boolean',
          optional: false,
          def: true
        },
        es5: {
          type: 'boolean',
          optional: false,
          def: true
        },
        minBundle: {
          type: 'boolean',
          optional: false,
          def: true
        },
        format: {
          type: 'string',
          optional: false,
          def: 'umd',
          pattern: /^(umd|amd|iife|system|cjs|esm)$/
        },
        imageInlineLimit: {
          type: 'number',
          optional: false,
          gt: 0,
          def: 1000000,
        },
        inlineStyle: {
          type: 'boolean',
          optional: false,
          def: false,
        },
        stylesDir: {
          type: 'string',
          optional: false,
          def: 'styles'
        },
        namespace: {
          type: 'string',
          optional: false,
          def: ''
        },
        sourceMap: {
          type: [ 'string', 'boolean' ],
          optional: false,
          pattern: /^(inline)$/,
          def: true
        }
      }
    },
    compiler: {
      type: 'object',
      optional: false,
      properties: {
        buildMode: {
          type: 'string',
          optional: false,
          def: 'browser',
          pattern: /^(browser|node|node-cli)$/
        },
        scriptPreprocessor: {
          type: 'string',
          optional: false,
          def: 'none',
          pattern: /^(none|typescript)$/
        },
        stylePreprocessor: {
          type: 'string',
          optional: false,
          def: 'node',
          pattern: /^(scss|sass|less|stylus|none)$/
        },
        styleSupport: {
          type: 'boolean',
          optional: false,
          def: true
        },
        concurrentBuild: {
          type: 'boolean',
          optional: false,
          def: true
        }
      }
    },
    assetPaths: {
      type: 'array',
      optional: false,
      def: []
    },
    copy: {
      type: 'array',
      optional: false,
      def: [
        'README.md',
        'LICENSE'
      ]
    },
    bundle: {
      type: 'object',
      optional: false,
      properties: {
        externals: {
          type: 'array',
          optional: false,
          def: []
        },
        globals: {
          type: 'object',
          optional: false,
          def: {}
        },
        mapExternals: {
          type: 'boolean',
          optional: false,
          def: false
        }
      }
    },
    ignore: {
      type: 'array',
      optional: false,
      def: []
    },
    replacePatterns: {
      type: 'array',
      optional: false,
      def: []
    },
    testFramework: {
      type: 'string',
      optional: false,
      def: 'jasmine',
      pattern: /^(jasmine|mocha)$/
    },
    watch: {
      type: 'object',
      optional: false,
      properties: {
        demoDir: {
          type: 'string',
          optional: false,
          def: 'demo/watch'
        },
        helperDir: {
          type: 'string',
          optional: false,
          def: 'demo/helper'
        },
        open: {
          type: 'boolean',
          optional: false,
          def: true
        },
        port: {
          type: 'number',
          optional: false,
          gt: 0,
          lt: 65535,
          def: 4000
        },
        serve: {
          type: 'boolean',
          optional: false,
          def: true
        }
      }
    },
    license: {
      type: 'object',
      optional: false,
      properties: {
        banner: {
          type: 'boolean',
          optional: false,
          def: true
        },
        thirdParty: {
          type: 'object',
          optional: false,
          properties: {
            fileName: {
              type: 'string',
              optional: false,
              def: 'dependencies.txt'
            },
            includePrivate: {
              type: 'boolean',
              optional: false,
              def: false
            },
          }
        }
      }
    }
  }
};
