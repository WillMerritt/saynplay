
// Dependencies
const gulp = require('gulp');
const nodemon = require('gulp-nodemon');
const notify = require('gulp-notify');
const livereload = require('gulp-livereload');
const wait = require('gulp-wait');

// Task
gulp.task('default', function() {
  // listen for changes
  livereload.listen();
  // configure nodemon
  nodemon({
    // the script to run the app
    script: 'server.js',
    ext: 'js'
  }).on('restart', function(){
    // when the app has restarted, run livereload.
    gulp.src('server.js')
      .pipe(wait(3000))
      .pipe(livereload())
  })
});
// sdf
