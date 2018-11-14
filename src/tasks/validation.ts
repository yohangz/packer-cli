import inspector from 'schema-inspector';
import forOwn from 'lodash/forOwn';

export const packerSchema = {
  type: 'object',
  optional: false,
  $mapDef: true,
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
    tmp: {
      type: 'string',
      optional: false,
      def: '.tmp'
    },
    compiler: {
      type: 'object',
      optional: false,
      $mapDef: true,
      properties: {
        dependencyMapMode: {
          type: 'string',
          optional: false,
          def: 'cross-map-peer-dependency',
          pattern: /^(cross-map-peer-dependency|cross-map-dependency|map-dependency|map-peer-dependency|all)$/
        },
        sourceMap: {
          type: ['string', 'boolean'],
          optional: false,
          pattern: /^(inline)$/,
          def: true
        },
        build: {
          type: 'object',
          optional: false,
          $mapDef: true,
          properties: {
            bundleMin: {
              type: 'boolean',
              optional: false,
              def: true
            },
            es5: {
              type: 'boolean',
              optional: false,
              def: false
            },
            es5Min: {
              type: 'boolean',
              optional: false,
              def: false
            },
            esnext: {
              type: 'boolean',
              optional: false,
              def: true
            },
            esnextMin: {
              type: 'boolean',
              optional: false,
              def: true
            }
          }
        },
        buildMode: {
          type: 'string',
          optional: false,
          def: 'browser',
          pattern: /^(browser|node|node-cli)$/
        },
        script: {
          type: 'object',
          optional: false,
          $mapDef: true,
          properties: {
            preprocessor: {
              type: 'string',
              optional: false,
              def: 'none',
              pattern: /^(none|typescript)$/
            },
            image: {
              type: 'object',
              optional: false,
              $mapDef: true,
              properties: {
                inlineLimit: {
                  type: 'number',
                  optional: false,
                  gt: 0,
                  def: 1000000
                },
                outDir: {
                  type: 'string',
                  optional: false,
                  def: 'images'
                }
              }
            }
          }
        },
        style: {
          type: ['object', 'boolean'],
          optional: false,
          $acceptOnly: 'false',
          $mapDef: true,
          properties: {
            inline: {
              type: 'boolean',
              optional: false,
              def: false
            },
            outDir: {
              type: 'string',
              optional: false,
              def: 'styles'
            },
            preprocessor: {
              type: 'string',
              optional: false,
              def: 'none',
              pattern: /^(scss|sass|less|stylus|none)$/
            },
            image: {
              type: 'object',
              optional: false,
              $mapDef: true,
              properties: {
                inlineLimit: {
                  type: 'number',
                  optional: false,
                  gt: 0,
                  def: 1000000
                },
                outDir: {
                  type: 'string',
                  optional: false,
                  def: 'images'
                }
              }
            }
          }
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
    bundle: {
      type: 'object',
      optional: false,
      $mapDef: true,
      properties: {
        externals: {
          type: 'array',
          optional: false,
          def: []
        },
        globals: {
          type: 'object',
          optional: false
        },
        mapExternals: {
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
        namespace: {
          type: 'string',
          optional: false,
          def: 'com.lib'
        },
        amd: {
          type: 'object',
          optional: false,
          $mapDef: true,
          properties: {
            define: {
              type: 'string',
              optional: false,
              def: ''
            },
            id: {
              type: 'string',
              optional: false,
              def: ''
            }
          }
        }
      }
    },
    testFramework: {
      type: 'string',
      optional: false,
      def: 'jasmine',
      pattern: /^(jasmine|mocha|jest)$/
    },
    watch: {
      type: ['object', 'boolean'],
      optional: false,
      $acceptOnly: 'false',
      $mapDef: true,
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
        serveDir: {
          type: 'array',
          optional: false,
          def: []
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
        }
      }
    },
    license: {
      type: 'object',
      optional: false,
      $mapDef: true,
      properties: {
        banner: {
          type: 'boolean',
          optional: false,
          def: true
        }
      }
    }
  }
};

const mapObjectDefaults = (schema) => {
  const obj: any = {};
  forOwn(schema.properties, (value, key) => {
    if (value.def) {
      obj[key] = value.def;
    } else if (value.properties) {
      obj[key] = mapObjectDefaults(value);
    }
  });

  return obj;
};

inspector.Sanitization.extend({
  // Do not use arrow functions for this.
  // tslint:disable-next-line
  mapDef: function(schema, candidate) {
    if (schema.$mapDef && (typeof candidate !== 'object' || candidate === null)) {
      return mapObjectDefaults(schema);
    }

    return candidate;
  },
  // Do not use arrow functions for this.
  // tslint:disable-next-line
  acceptOnly: function(schema, candidate) {
    if (schema.$acceptOnly && typeof candidate === 'boolean') {
      if (String(candidate) !== schema.$acceptOnly) {
        this.report(`support only boolean value '${schema.$acceptOnly}' or object`);
        return mapObjectDefaults(schema);
      }
    }

    return candidate;
  }
});

inspector.Validation.extend({
  // Do not use arrow functions for this.
  // tslint:disable-next-line
  acceptOnly: function (schema, candidate) {
    if (schema.$acceptOnly && typeof candidate === 'boolean') {
      if (String(candidate) !== schema.$acceptOnly) {
        this.report(`support only boolean value '${schema.$acceptOnly}' or object`);
        return mapObjectDefaults(schema);
      }
    }
  }
});
