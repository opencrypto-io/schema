#!/usr/local/bin/node

const fs = require('fs')
const path = require('path')
const Ajv = require('ajv')
const yaml = require('js-yaml')
const assert = require('assert')

class Data {
  constructor (dir) {
    this.dir = dir
    this.loaded = false
    this.collections = [ 'assets', 'exchanges', 'wallets' ]
    this.ajv = new Ajv()
    this.data = {}
  }
  load () {
    this.loadSchemas()
    this.collections.forEach((col) => {
      fs.readdirSync(path.join(this.dir, col)).forEach((pkg) => {
        if (!this.data[col]) {
          this.data[col] = []
        }
        this.data[col].push(new Package(pkg, col, this))
      })
    })
    //console.log(this.data)
    this.loaded = true
  }
  loadSchemas () {
    fs.readdirSync(path.join(__dirname, 'src')).forEach((s) => {
      var pp = path.parse(s)
      if (pp.ext !== '.yaml') {
        return
      }
      var schema = yaml.safeLoad(fs.readFileSync(path.join(__dirname, 'src', s)))
      this.ajv.addSchema(schema, pp.name)
    })
  }
  test (fw) {
    if (!this.loaded) {
      this.load()
    }
    if (!fw) {
      fw = {
        describe: () => {},
        it: () => {}
      }
    }
    this.collections.forEach((col) => {
      fw.describe(col, () => {
        this.data[col].forEach((pkg) => {
          pkg.test(fw)
        })
      })
    })
  }
  dump () {
    if (!this.loaded) {
      this.load()
    }
    var output = {}
    this.collections.forEach((col) => {
      output[col] = []
      this.data[col].forEach((item) => {
        output[col].push(item.dump())
      })
    })
    return JSON.stringify(output, null, 2)
  }
}

class Package {
  constructor (id, col, data) {
    this.id = id
    this.col = col
    this.data = data
    this.indexFn = this.col.substr(0, this.col.length-1)
    this.dir = path.join(this.data.dir, this.col, this.id)
    this.index = null
    this.files = []

    this.loadFiles()
    this.loadIndex()
  }
  loadIndex () {
    var file = path.join(this.dir, this.indexFn + '.yaml')
    if (!fs.existsSync(file)) {
      var msg = `File not exists: ${file}`
      throw new Error(msg)
      return false
    }
    this.index = yaml.safeLoad(fs.readFileSync(file))
  }
  loadFiles () {
    fs.readdirSync(this.dir).forEach((f) => {
      if (f === this.indexFn + '.yaml') {
        return
      }
      var pp = path.parse(f)
      switch (pp.ext) {
        case '.svg':
          this.files.push({
            file: f,
            cat: 'images',
            name: pp.name,
            base: pp.base,
            type: pp.ext.substr(1),
          })
          break
      }
    })
  }
  test (fw) {
    fw.describe(this.id, () => {
      fw.it('Check index schema', () => {
        if (!this.data.ajv.validate(this.indexFn, this.dump())) {
          var msg = `Index schema validation error: ${this.col}/${this.id}`
            + `\n\n${JSON.stringify(this.data.ajv.errors, null, 2)}`
          throw new Error(msg)
          return false
        }
      })
      if (this.files.length > 0) {
        this.files.forEach((f) => {
          fw.it(`Check file "${f.base}"`, () => {
          })
        })
      }
    })
  }
  dump () {
    var output = Object.assign({}, this.index)

    // render files into object
    if (this.files.length > 0) {
      this.files.forEach((f) => {
        var fn = path.join(this.dir, f.file)
        output[f.cat] = {}
        output[f.cat][f.name.replace('-', '_')] = {
          type: f.type,
          data: fs.readFileSync(fn).toString('base64')
        }
      })
    }
    return output
  }
}

var dir = process.cwd()
var cmd = 'test'
if (!process.argv[2].match(/^node_modules/)) {
  cmd = process.argv[2]
}

console.log('Working directory: %s', dir)
console.log('Command: %s', cmd)
var data = new Data(dir)

switch (cmd) {
  case 'build':
    var dump = data.dump()
    var fn = path.join('build', 'data.json')
    fs.writeFileSync(fn, dump)
    console.log('Data written to file: %s', fn)
    break

  case 'print':
    console.log(data.dump())
    break

  case 'test':
    data.test({ describe, it })
    break
}


