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
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', [
        'browserify'
    ]);
};