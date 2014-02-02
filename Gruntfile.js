module.exports = function(grunt) {
  var fileOrder = grunt.file.readJSON('src/compile-order.json');
  // Project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      dev: {
        files: ['src/*.js', 'test/**/*.js', 'src/compile-order.json'],
        tasks: ['build:dev']
      },
      production: {
        files: ['src/*.js', 'src/compile-order.json'],
        tasks: ['build:production']
      },
      doc: {
        files: ['src/*.js', 'README.md'],
        tasks: ['doc']
      }
    },
    mochaTest: {
      test: {
        options: {
          require: 'chai',
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },
    concat: {
      options: {
        banner: ';(function( window, undefined ){ \n "use strict";',
        footer: '\n}(this));'
      },
      dist: {
        src: fileOrder.map(function (file) {
          return "src/" + file + ".js";
        }),
        dest: 'build/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'build/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js',
        sourceMapIn: 'build/<%= pkg.name %>.js.map'
      }
    },
    jsdoc: {
      dist: {
        src: ['src/*.js', 'README.md'],
        options: {
          destination: 'doc'
        }
      }
    },
    jshint: {
      src: {
        options: {
          eqnull: true
        },
        files: {
          src: ['Gruntfile.js', 'src/**/*.js']
        }
      },
      test: {
        options: {
          eqnull: true,
          expr: true // so Chai expressions work
        },
        files: {
          src: ['test/**/*.js']
        }
      }
    }
  });
  // Load plugins
  plugins = [
    'grunt-contrib-concat',
    'grunt-contrib-uglify',
    'grunt-contrib-watch',
    'grunt-contrib-jshint',
    'grunt-mocha-test',
    'grunt-jsdoc'
  ];
  plugins.forEach(function(plugin) {
    grunt.loadNpmTasks(plugin);
  });

  // Set up tasks
  grunt.registerTask('build', 'Custom build task', function() {
    var args = Array.prototype.slice.call(arguments);
    var tasks = ['jshint', 'concat'];
    // Set flag for whether in production or not
    var inProduction = args.indexOf('production') > -1;
    // uglify code in production only
    if(inProduction) {
      tasks.push('uglify');
    }

    grunt.task.run(tasks);
  });

  // Testing task
  grunt.registerTask('test', function() {
    var args = Array.prototype.slice.call(arguments);
    var tasks = [];
    if(args.indexOf('build') > -1) {
      tasks.push('build:dev');
    }
    tasks.push('mochaTest');

    var allowedReporters = ['nyan', 'spec', 'dot', 'list', 'json', 'markdown', 'min'];
    var files = [];
    args.forEach(function(arg) {
      if(arg === 'build') {
        return;
      }
      var fn = "test/" + arg + ".js";
      if(allowedReporters.indexOf(arg) > -1) {
        grunt.config.set('mochaTest.test.options.reporter', arg);
      } else if(grunt.file.exists(fn)) {
        files.push(fn);
      }
    });

    if(files.length > 0) {
      grunt.config.set('mochaTest.test.src', files);
    }

    grunt.task.run(tasks);
  });

  grunt.registerTask('default', ['build:dev', 'watch:dev']);
  grunt.registerTask('doc', ['jsdoc']);
};