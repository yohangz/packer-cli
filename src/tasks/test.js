import gulp from "gulp";
import {Server} from "karma";
import path from "path";
import chalk from "chalk";

gulp.task('test', async (done) => {
  const server = new Server({
    configFile: path.join(process.cwd(), 'karma.conf.js'),
    port: 9876
  }, (exitCode) => {
    console.log(chalk.blue(`Karma has exited with ${exitCode}`));
    process.exit(exitCode);
    done();
  });

  server.start()
});
