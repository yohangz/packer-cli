import through from 'through2';
import PluginError from 'plugin-error';
import handlebars from 'handlebars';
import path from 'path';

export default function gulpHbsRuntime(data, options) {

  return through.obj((file, enc, cb) => {
    try {
      if (file.isNull() || file.extname !== '.hbs') {
        return cb(null, file);
      }

      const template = handlebars.compile(String(file.contents));
      const renderedTemplate = template(data);

      if (file.isBuffer()) {
        file.contents = new Buffer(renderedTemplate);
      }

      if (file.isStream()) {
        const stream = through();
        stream.write(renderedTemplate);
        file.contents = stream;
      }

      if (options) {
        if (typeof options.replaceExt !== 'undefined') {
          file.path = file.path.replace('.hbs', options.replaceExt);
        }

        if (typeof options.rename !== 'undefined') {
          file.path = path.join(path.dirname(file.path), options.rename);
        }
      }

      cb(null, file);
    } catch (err) {
      console.error(err);
      throw new PluginError('gulp-hbs-runtime', 'Data parse failure!');
    }
  });
};
