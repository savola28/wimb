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

var enviroment = process.argv[3] === '--production' ? 'production' : 'development';

gulp.task('jshint', function() {
	gulp.src('src/**/*')
		.pipe(babel())
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		.pipe(jshint.reporter('fail'));
});

gulp.task('build', ['jshint'], function() {
	browserify('src/entry.js')
		.transform(babelify)
		.bundle()
		.pipe(source('bundle.js'))
		.pipe(buffer())
		.pipe(gulpif(enviroment === 'production', uglify()))
		.pipe(gulp.dest('static'));
});

gulp.task('watch', function() {
	gulp.watch('src/**/*', ['build']);
});

gulp.task('default', ['build', 'watch']);
