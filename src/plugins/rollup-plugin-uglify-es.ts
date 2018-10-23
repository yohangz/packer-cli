'use strict';

import uglifyEs from 'uglify-es';

export default function rollupUglify(options) {
  if (options === void 0) {
    options = {};
  }

  return {
    name: 'uglify',
    transformBundle: (code) => {
      const result = uglifyEs.minify(
        code,
        Object.assign({ sourceMap: { url: 'out.js.map' } }, options) // force sourcemap creation
      );
      if (result.map) {
        const commentPos = result.code.lastIndexOf('//#');
        result.code = result.code.slice(0, commentPos).trim();
      }
      return result;
    }
  };
}
