var gulp = require('gulp');

// eslint
var eslint = require('gulp-eslint');

// browserify
var browserify = require('browserify');
var babelify = require('babelify'); // jsx -> js for browserify
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var watchify = require('watchify');

gulp.task('lint', function() {
	return gulp.src(['gulpfile.js', 'src/**/*.js', 'src/**/*.jsx'])
		.pipe(eslint({
			baseConfig: {
				ecmaFeatures: {
					jsx: true
				}
			},
			rules: {
				semi: [2, 'always'],
				quotes: [2, 'single', 'avoid-escape'],
				camelcase: [2, {
					'properties': 'never'
				}]
			},
			envs: ['browser', 'node', 'jquery']
		}))
		.pipe(eslint.format())
		.pipe(eslint.failOnError());
});

gulp.task('deploy', ['lint'], function() {
	build('production');
});

gulp.task('develop', ['lint'], function() {
	build('development');
});

gulp.task('watch', ['lint'], function() {
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
