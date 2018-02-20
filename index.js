const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const schemaDir = path.join(__dirname, 'src')

var schemas = {}
fs.readdirSync(schemaDir).forEach((s) => {
  let pp = path.parse(s)
  if (pp.ext !== '.yaml') {
    return
  }
  let schema = yaml.safeLoad(fs.readFileSync(path.join(schemaDir, s)))
  schemas[pp.name] = schema
})

module.exports = schemas
