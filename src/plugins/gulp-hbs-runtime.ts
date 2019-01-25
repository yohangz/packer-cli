import through, { TransformCallback } from 'through2';
import PluginError from 'plugin-error';
import handlebars from 'handlebars';
import path from 'path';
import * as stream from 'stream';

/**
 * Gulp handlebars runtime options.
 */
export interface GulpHandlebarsOptions {
  replaceExt?: string;
  rename?: string;
}

/**
 * Gulp handlebars runtime plugin.
 * @param data Template data to complile template with.
 * @param options Plugin options.
 */
export default function gulpHbsRuntime(data: any, options?: GulpHandlebarsOptions): stream.Transform {
  return through.obj((chunk: any, enc: string, callback: TransformCallback): void => {
    try {
      if (chunk.isNull() || chunk.extname !== '.hbs') {
        return callback(null, chunk);
      }

      const template = handlebars.compile(String(chunk.contents));
      const renderedTemplate = template(data);

      if (chunk.isBuffer()) {
        chunk.contents = Buffer.from(renderedTemplate);
      }

      if (chunk.isStream()) {
        const fileStream = through();
        fileStream.write(renderedTemplate);
        chunk.contents = fileStream;
      }

      if (options) {
        if (typeof options.replaceExt !== 'undefined') {
          chunk.path = chunk.path.replace('.hbs', options.replaceExt);
        }

        if (typeof options.rename !== 'undefined') {
          chunk.path = path.join(path.dirname(chunk.path), options.rename);
        }
      }

      callback(null, chunk);
    } catch (err) {
      console.error(err);
      throw new PluginError('gulp-hbs-runtime', 'Data parse failure!');
    }
  });
}
