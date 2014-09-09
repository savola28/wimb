module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        watch: {
            react: {
                files: 'src/**/*',
                tasks: ['jshint', 'browserify:dev']
            }
        },

        browserify: {
            dev: {
                options: {
                    transform: [ require('grunt-react').browserify ]
                },
                src: ['src/entry.js'],
                dest: 'static/bundle.js'
            }
        },
        
        uglify: {
            dist: {
                files: {
                    'static/bundle.js': ['static/bundle.js']
                }
            }
        },
        
        jshint: {
            files: ['Gruntfile.js', 'src/**/*.js', 'src/**/*.jsx'],
            options: {
                undef: true,
                node: true,
                jquery: true,
                browser: true,
                globals: {
                    React: false,
                    google: false,
                    GeolocationMarker: false,
                    moment: false
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-jsxhint');

    grunt.registerTask('default', ['jshint', 'browserify', 'uglify']);
};
