module.exports = (grunt) ->
  fileOrder = grunt.file.readJSON('src/compile-order.json')
  # Project configuration
  grunt.initConfig {
    pkg: grunt.file.readJSON('package.json')
    watch: {
      dev: {
        files: ['src/*.coffee', 'src/compile-order.json']
        tasks: ['build:dev']
      }
      production: {
        files: 'src/*.coffee'
        tasks: ['build:production']
      }
    }
    mochaTest: {
      test: {
        options: {
          compilers: 'coffee:coffee-script'
          require: 'chai'
          reporter: 'spec'
        }
        src: ['test/**/*.coffee']
      }
    }
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      }
      build: {
        src: 'build/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
        sourceMapIn: 'build/<%= pkg.name %>.js.map'
      }
    }
    coffeelint: {
      app: {
        files: {
          src: ['src/*.coffee']
        }
      }
    }
    coffee: {
      compile: {
        options: {
          sourceMap: true
        }
        files: {
          'build/<%= pkg.name %>.js': ("src/#{file}.coffee" for file in fileOrder)
        }
      }
    }
  }

  # Load plugins
  plugins = [
    'grunt-contrib-uglify'
    'grunt-contrib-coffee'
    'grunt-contrib-watch'
    'grunt-coffeelint'
    'grunt-mocha-test'
  ]
  for plugin in plugins
    grunt.loadNpmTasks plugin

  # Set up tasks
  grunt.registerTask('build', 'Custom build task', (args...) ->
    tasks = ['coffeelint', 'coffee']
    # Set flag for whether in production or not
    inProduction = 'production' in args
    # uglify code in production only
    if inProduction then tasks.push 'uglify'

    grunt.task.run tasks
  )
  grunt.registerTask('test', (args...) ->
    tasks = []
    if 'build' in args then tasks.push 'build:dev'
    tasks.push 'mochaTest'

    for arg in args
      if arg is 'build' then continue
      grunt.config.set('mochaTest.test.options.reporter', arg)

    grunt.task.run tasks
  )

  grunt.registerTask('default', ['build:dev', 'watch:dev'])