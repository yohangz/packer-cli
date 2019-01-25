import inspector from 'schema-inspector';
import forOwn from 'lodash/forOwn';
import path from 'path';

import { Logger } from '../common/logger';
import { PackerConfig } from '../model/packer-config';

/**
 * Schema inspector packer config validation schema.
 */
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
        packageFieldsToCopy: {
          type: 'array',
          optional: false,
          def: ['name', 'version', 'description', 'keywords', 'author', 'repository', 'license', 'bugs', 'homepage'],
          items: {
            type: 'string'
          }
        },
        sourceMap: {
          type: ['string', 'boolean'],
          optional: false,
          pattern: /^(inline)$/,
          def: true
        },
        customRollupPluginExtractor: {
          type: ['null', 'function'],
          optional: false,
          def: null
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
            tsd: {
              type: 'string',
              optional: false,
              def: 'typings'
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
        },
        advanced: {
          type: 'object',
          optional: false,
          $mapDef: true,
          properties: {
            rollup: {
              type: 'object',
              optional: false,
              $mapDef: true,
              properties: {
                inputOptions: {
                  type: 'object',
                  optional: false,
                  def: {}
                },
                outputOptions: {
                  type: 'object',
                  optional: false,
                  def: {}
                },
                watchOptions: {
                  type: 'object',
                  optional: false,
                  def: {}
                },
                pluginOptions: {
                  type: 'object',
                  optional: false,
                  $mapDef: true,
                  properties: {
                    ignoreImport: {
                      type: 'object',
                      optional: false,
                      def: {}
                    },
                    postCss: {
                      type: 'object',
                      optional: false,
                      def: {}
                    },
                    nodeResolve: {
                      type: 'object',
                      optional: false,
                      def: {}
                    },
                    commonjs: {
                      type: 'object',
                      optional: false,
                      def: {}
                    },
                    json: {
                      type: 'object',
                      optional: false,
                      def: {}
                    },
                    globals: {
                      type: 'object',
                      optional: false,
                      def: {}
                    },
                    babel: {
                      type: 'object',
                      optional: false,
                      def: {}
                    },
                    typescript: {
                      type: 'object',
                      optional: false,
                      def: {}
                    },
                    replace: {
                      type: 'object',
                      optional: false,
                      def: {}
                    },
                    image: {
                      type: 'object',
                      optional: false,
                      def: {}
                    },
                    handlebars: {
                      type: 'object',
                      optional: false,
                      def: {}
                    },
                    filesize: {
                      type: 'object',
                      optional: false,
                      def: {}
                    },
                    browserSync: {
                      type: 'object',
                      optional: false,
                      def: {}
                    }
                  }
                }
              }
            },
            other: {
              type: 'object',
              optional: false,
              $mapDef: true,
              properties: {
                terser: {
                  type: 'object',
                  optional: false,
                  def: {}
                },
                cssnano: {
                  type: 'object',
                  optional: false,
                  def: {}
                }
              }
            }
          }
        }
      }
    },
    assetPaths: {
      type: 'array',
      optional: false,
      items: {
        type: 'string'
      },
      def: []
    },
    copy: {
      type: 'array',
      optional: false,
      items: {
        type: 'string'
      },
      def: ['README.md', 'LICENSE']
    },
    ignore: {
      type: 'array',
      optional: false,
      items: {
        type: 'string'
      },
      def: []
    },
    replacePatterns: {
      type: 'array',
      optional: false,
      items: {
        type: 'object',
        properties: {
          include: {
            type: ['string', 'array'],
            optional: false,
            items: {
              type: 'string'
            }
          },
          exclude: {
            type: ['string', 'array'],
            optional: true,
            items: {
              type: 'string'
            }
          },
          test: {
            type: ['string', 'object'],
            optional: true
          },
          replace: {
            type: 'string',
            optional: true
          },
          match: {
            type: 'object',
            optional: true
          },
          text: {
            type: 'string',
            optional: true
          },
          file: {
            type: 'string',
            optional: true
          },
          pathReplaceCallback: {
            type: 'function',
            optional: true
          }
        }
      },
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
          items: {
            type: 'string'
          },
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
    test: {
      type: 'object',
      optional: false,
      $mapDef: true,
      properties: {
        framework: {
          type: 'string',
          optional: false,
          def: 'jasmine',
          pattern: /^(jasmine|mocha|jest)$/
        },
        environment: {
          type: 'string',
          optional: false,
          def: 'jsdom',
          pattern: /^(browser|jsdom|node|enzyme)$/
        },
        advanced: {
          type: 'object',
          optional: false,
          $mapDef: true,
          properties: {
            jasmine: {
              default: {
                type: 'string',
                optional: false,
                def: 'jasmine --config=jasmine.json'
              },
              watch: {
                type: 'string',
                optional: false,
                def: 'jasmine --config=jasmine.json'
              },
              coverageDefault: {
                type: 'string',
                optional: false,
                def: 'nyc jasmine --config=jasmine.json'
              },
              coverageWatch: {
                type: 'string',
                optional: false,
                def: 'nyc jasmine --config=jasmine.json'
              }
            },
            mocha: {
              default: {
                type: 'string',
                optional: false,
                def: 'mocha --opts mocha.opts "./{,!(node_modules)/**/}*.[sS]pec.<ext-glob>"'
              },
              watch: {
                type: 'string',
                optional: false,
                def: 'mocha --opts mocha.opts --watch "./{,!(node_modules)/**/}*.[sS]pec.<ext-glob>"'
              },
              coverageDefault: {
                type: 'string',
                optional: false,
                def: 'nyc mocha --opts mocha.opts --watch "./{,!(node_modules)/**/}*.[sS]pec.<ext-glob>"'
              },
              coverageWatch: {
                type: 'string',
                optional: false,
                def: 'nyc mocha --opts mocha.opts --watch "./{,!(node_modules)/**/}*.[sS]pec.<ext-glob>"'
              }
            },
            jest: {
              default: {
                type: 'string',
                optional: false,
                def: 'jest --config=jest.config.js'
              },
              watch: {
                type: 'string',
                optional: false,
                def: 'jest --config=jest.config.js --watch'
              },
              coverageDefault: {
                type: 'string',
                optional: false,
                def: 'jest --config=jest.config.js --coverage'
              },
              coverageWatch: {
                type: 'string',
                optional: false,
                def: 'jest --config=jest.config.js --coverage --watch'
              }
            }
          }
        }
      }
    },
    serve: {
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
          items: {
            type: 'string'
          },
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
    },
    format: {
      type: 'object',
      optional: false,
      $mapDef: true,
      properties: {
        extensions: {
          type: 'array',
          optional: false,
          def: ['js', 'jsx', 'ts', 'tsx', 'html', 'scss', 'css', 'less', 'json'],
          items: {
            type: 'string'
          }
        },
        advanced: {
          optional: false,
          $mapDef: true,
          properties: {
            command: {
              type: 'string',
              optional: false,
              def: 'prettier --write **/*.{<ext-glob>}'
            }
          }
        }
      }
    }
  }
};

/**
 * Recursively map object defaults.
 * @param schema Inspector schema.
 */
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

/**
 * Extend schema inspector sanitizations.
 */
inspector.Sanitization.extend({
  /**
   * Map object defaults if invalid.
   * @param schema Inspector schema.
   * @param candidate Current sanitization candidate.
   */
  // Do not use arrow functions for this.
  // tslint:disable-next-line
  mapDef: function(schema, candidate) {
    let invalidType: boolean;
    if (Array.isArray(schema.type)) {
      invalidType = !schema.type.includes(typeof candidate);
    } else {
      invalidType = typeof candidate !== schema.type;
    }

    if (schema.$mapDef && candidate === null && invalidType) {
      return mapObjectDefaults(schema);
    }

    return candidate;
  },

  /**
   * Set accept only boolean value if not valid.
   * @param schema Inspector schema.
   * @param candidate Current sanitization candidate.
   */
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

/**
 * Extend schema inspector validations.
 */
inspector.Validation.extend({
  /**
   * Validate whether candidate value is accept only boolean value.
   * @param schema Inspector schema.
   * @param candidate Current validating candidate.
   */
  // Do not use arrow functions for this.
  // tslint:disable-next-line
  acceptOnly: function(schema, candidate) {
    if (schema.$acceptOnly && typeof candidate === 'boolean') {
      if (String(candidate) !== schema.$acceptOnly) {
        this.report(`support only boolean value '${schema.$acceptOnly}' or object`);
        return mapObjectDefaults(schema);
      }
    }
  }
});

/**
 * Cross validate configuration of dependent config errors.
 * @param packerConfig Packer configuration reference.
 * @param log Logger reference.
 */
export const crossValidateConfig = (packerConfig: PackerConfig, log: Logger): void => {
  const commonMsg = 'malformed packer config (.packerrc.js):\n';
  const entryExt = path.extname(packerConfig.entry);
  if (packerConfig.compiler.script.preprocessor === 'typescript' && !['.ts', '.tsx'].includes(entryExt)) {
    log.error(commonMsg + "Entry extension must be '.ts' when script preprocessor is 'typescript'");
    process.exit(1);
  }

  if (
    packerConfig.compiler.script.preprocessor === 'none' &&
    !['.js', '.jsx', '.es6', '.es', '.mjs'].includes(entryExt)
  ) {
    log.error(
      commonMsg +
        "Entry extension must be '.js', '.jsx', '.es6', '.es' or '.mjs' " +
        "when script preprocessor is 'none'"
    );
    process.exit(1);
  }

  if (['node', 'node-cli'].includes(packerConfig.compiler.buildMode)) {
    if (!['cjs', 'esm'].includes(packerConfig.bundle.format)) {
      log.error(commonMsg + "Bundle format must be 'cjs' or 'esm' when bundle mode is 'node' or 'node-cli'");
      process.exit(1);
    }

    if (packerConfig.serve !== false) {
      log.error(commonMsg + "Serve on watch mode is not supported when bundle format is 'cjs' or 'esm'");
      process.exit(1);
    }
  }

  if (
    packerConfig.compiler.buildMode === 'browser' &&
    !['umd', 'amd', 'iife', 'system'].includes(packerConfig.bundle.format)
  ) {
    log.error(commonMsg + "Bundle format must be 'umd', 'amd', 'iife' or 'system' when bundle mode is 'browser'");
    process.exit(1);
  }

  if (packerConfig.test.framework === 'jest' && packerConfig.test.environment === 'browser') {
    log.error(commonMsg + "Test environment 'browser' is not supported when test framework is 'jest'");
    process.exit(1);
  }

  if (['jasmine', 'mocha'].includes(packerConfig.test.framework) && packerConfig.test.environment === 'enzyme') {
    log.error(commonMsg + "Test environment 'enzyme' is only supported when test framework is 'jasmine' or 'mocha'");
    process.exit(1);
  }
};
