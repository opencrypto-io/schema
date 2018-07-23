const path = require('path')
const fs = require('fs')
const dirs = ['models', 'examples/models']
var output = {}
dirs.forEach(d => {
  let target = null
  let splt = d.split('/')
  if (splt.length > 1) {
    output[splt[0]] = {}
    target = output[splt[0]][splt[1]] = {}
  } else {
    target = output[d] = {}
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
