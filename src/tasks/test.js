import gulp from 'gulp';
import path from 'path';
import chalk from 'chalk';

gulp.task('test', async () => {
  const karma = require('karma');

  const server = new karma.Server({
    configFile: path.join(process.cwd(), 'karma.conf.js'),
    port: 9876
  }, (exitCode) => {
    console.log(chalk.blue(`Karma has exited with ${exitCode}`));
    process.exit(exitCode);
  });

  server.start();
});
