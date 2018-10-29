import gulp from 'gulp';
import path from 'path';
import chalk from 'chalk';

gulp.task('test', async () => {
  try {
    const karma = require('karma');

    const server = new karma.Server({
      configFile: path.join(process.cwd(), 'karma.conf.js')
    }, (exitCode) => {
      console.log(chalk.blue(`Karma has exited with ${exitCode}`));
      process.exit(exitCode);
    });

    server.start();
  } catch (e) {
    console.error(e);
    throw Error('task failure');
  }
});
