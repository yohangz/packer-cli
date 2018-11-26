import { BabelBaseConfig } from './babel-base-config';

/**
 * Babel configuration schema.
 */
export interface BabelConfig extends BabelBaseConfig {
  env?: {
    bundle?: BabelBaseConfig;
    es5?: BabelBaseConfig;
    es2015?: BabelBaseConfig;
  };
}
