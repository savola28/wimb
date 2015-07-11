var gulp = require('gulp');

// jshint
var babel = require("gulp-babel"); // jsx -> js for jshint
var jshint = require('gulp-jshint');

// browserify
var browserify = require('browserify');
var babelify = require("babelify"); // jsx -> js for browserify
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var watchify = require('watchify');

gulp.task('jshint', function() {
	gulp.src('src/**/*')
		.pipe(babel())
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		.pipe(jshint.reporter('fail'));
});

gulp.task('deploy', ['jshint'], function() {
	build('production');
});

gulp.task('develop', ['jshint'], function() {
	build('development');
});

gulp.task('watch', ['jshint'], function() {
	build('watch');
});

function build(env) {
	var bundler = browserify({
		entries: ['src/entry.js'],
		transform: [babelify], // We want to convert JSX to normal javascript
		cache: {},
		packageCache: {},
		fullPaths: true // Requirement of watchify
	});

	if (env === 'watch') {
		bundler = watchify(bundler);
		bundler.on('update', function() {
			var updateStart = Date.now();
			bundle(bundler, env);
			console.log('Build in ', (Date.now() - updateStart) + 'ms');
		});
	}

	bundle(bundler, env);

	function bundle(bundler, env) {
		bundler.bundle()
			.pipe(source('bundle.js'))
			.pipe(buffer())
			.pipe(gulpif(env === 'production', uglify()))
			.pipe(gulp.dest('static'));
	}
}

gulp.task('default', ['develop']);
