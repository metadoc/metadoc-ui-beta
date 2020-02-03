const path = require('path')
const symbols = require('log-symbols')
const ProductionLine = require('productionline')
const Chassis = require('@chassis/core')
const Babel = require('@babel/core')
const Terser = require('terser')
const CONFIG = require('./config.js')

class Builder extends ProductionLine {
  copyAssets (cb) {
    this.copyToOutput(this.assets[0], cb)
  }

  // copyLibs (cb) {
  //   this.copyToOutput(path.join(this.source, 'lib'), cb)
  // }

  copyCustomElements (cb) {
    this.copyToOutput(path.join(this.source, 'custom-elements'), cb)
  }

  processHTML (cb) {
    let queue = new this.TaskRunner()

    this.walk('../src/**/*.html').forEach(filePath => {
      queue.add(`Copy ${filePath}...`, next => {
        this.copyToOutput(filePath, next)
      })
    })

    queue.on('complete', cb)
    queue.run()
  }

  processCSS (minify, cb) {
    let queue = new this.TaskRunner()

    const chassis = new Chassis(Object.assign({}, CONFIG.chassis, {
      minify,
      sourceMap: minify,
      theme: path.join(this.source, CONFIG.chassis.theme)
    }))

    this.walk(path.join(this.source, 'css', '**', '*.css')).forEach(filePath => {
      queue.add(`Processing ${filePath}`, next => {
        chassis.process(filePath, (err, processed) => {
          if (err) {
            this.failure(err)
            return process.exit(1)
          }

          if (!processed) {
            return next()
          }

          if (!!processed.sourceMap) {
            this.writeFileSync(`${this.outputDirectory(filePath)}.map`, processed.sourceMap)
          }

          this.writeFile(this.outputDirectory(filePath), processed.css, next)
        })
      })
    })

    queue.on('complete', cb)
    queue.run(true)
  }

  processJS (minify, cb) {
    this.walk(path.join(this.source, '**', '*.js')).forEach(filePath => {
      let output = Babel.transform(this.readFileSync(filePath), {
        presets: [
          [
            '@babel/preset-env',
            {
              targets: {
                esmodules: true
              },

              modules: false
            }
          ]
        ],

        plugins: [
          '@babel/plugin-proposal-class-properties'
        ]
      })

      if (minify) {
        output = Terser.minify(output.code, { sourceMap: true })
      }

      if (output.map) {
        this.writeFileSync(`${this.outputDirectory(filePath)}.map`, output.map)
      }

      this.writeFileSync(this.outputDirectory(filePath), output.code)
    })

    cb()
  }

  make (args) {
    let devMode = args.includes('dev')

    this.clean()
    this.addTask('Copy Assets', this.copyAssets.bind(this))
    // this.addTask('Copy Libraries', this.copyLibs.bind(this))
    this.addTask('Copy Custom Elements', this.copyCustomElements.bind(this))
    this.addTask('Process HTML', this.processHTML.bind(this))
    this.addTask('Process CSS', this.processCSS.bind(this, !devMode))
    this.addTask('Process JavaScript', this.processJS.bind(this, !devMode))
  }
}

const args = process.argv.slice(3)

const builder = new Builder({
  source: path.resolve('../src'),
  assets: path.resolve('../src/assets'),
  output: path.resolve('../dist'),

  commands: {
    default: function (cmd) {
      console.log(`\n  ${symbols.error} ${builder.COLORS.failure(cmd)} command does not exist.\n`)
      process.exit(0)
    },

    build: function (cmd) {
      builder.make(args)
    }
  }
})

if (args.includes('watch') || args.includes('dev')) {
  builder.on('complete', () => {
    builder.watch(action => {
      switch (action) {
        case 'update':
          builder.make(args)
          builder.run()
      }
    })
  })
}

builder.run()
