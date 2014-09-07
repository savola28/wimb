module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        watch: {
            react: {
                files: 'src/**/*',
                tasks: ['browserify:dev']
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
            options: {},
            dist: {
                files: {
                    'static/bundle.js': ['static/bundle.js']
                }
            }
        },
        
        jshint: {
            files: ['Gruntfile.js', 'src/**/*.js', 'src/**/*.jsx'],
            options: {
                globals: {
                    module: true,
                    document: true
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
