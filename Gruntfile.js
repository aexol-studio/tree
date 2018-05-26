module.exports = function(grunt) {
  grunt.initConfig({
    ts: {
      default: {
        tsconfig: './tsconfig.json'
      }
    },
    copy: {
      default: {
        cwd: 'src/',
        src: '**/*.css',
        dest: 'lib/',
        expand: true
      }
    },
    watch: {
      files: ['src/**/*.{tsx,css}'],
      tasks: ['default']
    }
  });
  grunt.event.on('watch', function(action, filepath, target) {
    grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
  });
  grunt.loadNpmTasks('grunt-ts')
  grunt.loadNpmTasks('grunt-contrib-watch');;
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.registerTask('default', ['ts', 'copy']);
};
