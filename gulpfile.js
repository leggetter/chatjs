var gulp = require('gulp');
var browserify = require( 'gulp-browserify' );
var connect = require('gulp-connect');

gulp.task( 'server', function() {
  connect.server();
} ) ;

gulp.task( 'watch', function() {
  gulp.watch( [ 'src/**/*.js' ], ['build'] );
} );

gulp.task( 'build', function() {
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

  gulp.src( 'src/platforms/pusher/*.js' )
    .pipe( browserify( {
      debug: !gulp.env.production,
      standalone: 'PusherChatAdapter'
    } ) )
    .pipe( gulp.dest( 'build/' ) );

  gulp.src( 'src/ui-frameworks/console/*.js' )
    .pipe( browserify( {
      debug: !gulp.env.production,
      standalone: 'ConsoleChat'
    } ) )
    .pipe( gulp.dest( 'build/' ) );
});

gulp.task( 'default', [ 'build', 'watch', 'server' ] );
