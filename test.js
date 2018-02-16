#!/usr/local/bin/node

const fs = require('fs')
const path = require('path')
const Ajv = require('ajv')
const ajv = new Ajv()
const yaml = require('js-yaml')
const assert = require('assert')

const collections = [ 'assets', 'exchanges', 'wallets' ]
var errors = []

function loadSchemas () {
  fs.readdirSync(path.join(__dirname, 'src')).forEach((s) => {
    var pp = path.parse(s)
    if (pp.ext !== '.yaml') {
      return
    }
    var schema = yaml.safeLoad(fs.readFileSync(path.join(__dirname, 'src', s)))
    ajv.addSchema(schema, pp.name)
  })
}

function scanDir (dir) {
  dir = path.resolve(dir)
  collections.forEach((col) => {
    describe(col, () => {
      fs.readdirSync(path.join(dir, col)).forEach((pkg) => {
        describe(pkg, () => {
          checkPackage(path.join(dir, col, pkg), col)
        })
      })
    })
  })
}

function checkPackage (dir, col) {
  var colIndex = col.substr(0, col.length-1)

  it('Index file schema', () => {
    checkFile(path.join(dir, colIndex) + '.yaml', colIndex)
  })
}

function checkFile (file, schema) {
  if (!fs.existsSync(file)) {
    var msg = `File not exists: ${file}`
    throw new Error(msg)
    return false
  }
  var data = yaml.safeLoad(fs.readFileSync(file))
  if(!ajv.validate(schema, data)) {
    var msg = `Validation error: ${file}\n\n${JSON.stringify(ajv.errors, null, 2)}`
    throw new Error(msg)
    return false
  }
  return true
}

var localDir = process.argv[3]
if (localDir === undefined || localDir === '') {
  localDir = process.cwd()
}

loadSchemas()
scanDir(localDir)

if (errors.length > 0) {
  errors.forEach((e) => {
  })
  process.exit(1)
}
