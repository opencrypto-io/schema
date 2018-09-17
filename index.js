const path = require('path')
const fs = require('fs')
const dirs = ['build/models', 'build/examples/models']
var output = {}
dirs.forEach(d => {
  let target = null
  let splt = d.split('/')
  if (splt.length > 2) {
    output[splt[1]] = {}
    target = output[splt[1]][splt[2]] = {}
  } else {
    target = output[splt[1]] = {}
  }
  fs.readdirSync(path.join(__dirname, d)).forEach(f => {
    let pp = path.parse(f)
    if (pp.ext !== '.json') {
      return
    }
    target[pp.name] = require(path.join(__dirname, d, f))
  })
})
module.exports = output
