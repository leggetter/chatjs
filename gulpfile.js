var gulp = require('gulp');
var browserify = require( 'gulp-browserify' );
var connect = require('gulp-connect');

gulp.task( 'server', function() {
  connect.server();
} ) ;

gulp.task( 'default', function() {
  gulp.src( 'src/core/chatjs.js' )
    .pipe( browserify( {
      debug: !gulp.env.production,
      standalone: 'chatjs'
    } ) )
    .pipe( gulp.dest( 'build/' ) );

  gulp.src( 'src/platforms/null/*.js' )
    .pipe( browserify( {
      debug: !gulp.env.production,
      standalone: 'NullChatAdapter'
    } ) )
    .pipe( gulp.dest( 'build/' ) );

  gulp.src( 'src/ui-frameworks/console/*.js' )
    .pipe( browserify( {
      debug: !gulp.env.production,
      standalone: 'ConsoleChat'
    } ) )
    .pipe( gulp.dest( 'build/' ) );
});
