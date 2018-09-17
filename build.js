const deref = require('json-schema-deref')
const fs = require('fs')
const path = require('path')
const jmespath = require('jmespath')
const pkg = require('./package')
const yaml = require('js-yaml')

const schemas = {}

const dir = './models'
const outputDir = './build'
const examplesDir = './examples'

function loadSchema (fn, noDeref = false) {
  if (noDeref) {
    return yaml.safeLoad(fs.readFileSync(fn))
  }
  if (!schemas[fn]) {
    let raw = fs.readFileSync(fn).toString()
    raw = raw.replace(/\$ref: 'https:\/\/schema.opencrypto.io\/models\/([^#]+)/g, "$ref: 'opencrypto:$1")
    raw = raw.replace(/\$ref: '#\/definitions\//g, "$ref: 'opencrypto:core#/definitions/")
    schemas[fn] = yaml.safeLoad(raw)
  }
  return schemas[fn]
}

async function derefSchema (schema) {
  return new Promise((resolve, reject) => {
    deref(schema, {
      loader: (ref, option, fn) => {
        let m = ref.match(/^opencrypto:([^#]+)#\/?(.+)$/)
        if (m) {
          let file = path.join(dir, m[1] + '.yaml')
          let key = m[2].replace('/', '.')
          // console.log('have match! file:',file, ', key:', key)
          let targetSchema = loadSchema(file)
          if (key !== '.') {
            targetSchema = jmespath.search(targetSchema, key)
          }
          return fn(null, targetSchema)
        }
        return fn()
      }
    }, (err, fullSchema) => {
      if (err) {
        throw new Error(err)
      }
      resolve(fullSchema)
    })
  })
}

async function build () {
  let schemas = {}
  let q = []
  fs.readdirSync(dir).forEach(m => {
    // if (m != 'project.json') { return null }
    let jm = m.replace('yaml', 'json')
    let rschema = loadSchema(path.join(dir, m), true)
    let schemaPath = path.join(outputDir, 'models', jm)
    console.log('Writing:', schemaPath)
    fs.writeFileSync(schemaPath, JSON.stringify(rschema, null, 2))

    let exampleSourceFn = path.join(examplesDir, 'models', m)
    if (fs.existsSync(exampleSourceFn)) {
      let example = yaml.safeLoad(fs.readFileSync(exampleSourceFn))
      let examplePath = path.join(outputDir, 'examples/models', jm)
      console.log('Writing:', examplePath)
      fs.writeFileSync(examplePath, JSON.stringify(example, null, 2))
    }

    let schema = loadSchema(path.join(dir, m))
    q.push(async function () {
      let fullSchema = await derefSchema(schema)
      for (let i = 0; i <= 10; i++) {
        fullSchema = await derefSchema(fullSchema)
      }
      let finalPath = path.join(outputDir, 'deref', jm)
      console.log('Writing:', finalPath)
      fs.writeFileSync(finalPath, JSON.stringify(fullSchema, null, 2))
      schemas[m.match(/^(.+)\.yaml$/)[1]] = fullSchema
    }())
    // let fullSchema = await derefSchema(schema)
    // console.log(fullSchema)
    // fs.writeFileSync()
  })

  await Promise.all(q)

  const map = require('./map.json')

  function getPath (type, path = []) {
    if (map.models[type].parent) {
      return getPath(map.models[type].parent, path.concat([ type ]))
    }
    return path.concat([ type ])
  }

  // extend + copy map
  const outputMapFn = path.join(outputDir, 'map.json')
  Object.keys(map.models).forEach(mk => {
    let m = map.models[mk]
    let sm = schemas[mk]
    m.id = mk
    m.name = sm.title
    m.description = sm.description
    m.path = getPath(mk).reverse()
  })
  console.log('Writing: %s', outputMapFn)
  fs.writeFileSync(outputMapFn, JSON.stringify(map, null, 2))

  // build bundle
  const outputBundleFn = path.join(outputDir, 'bundle.json')
  Object.keys(map.models).forEach(mk => {
    let m = map.models[mk]
    let sm = schemas[mk]
    m.schema = sm
    m.example = yaml.safeLoad(fs.readFileSync(path.join(examplesDir, 'models', `${mk}.yaml`)))
  })
  map.meta = {
    version: pkg.version
  }
  console.log('Writing: %s', outputBundleFn)
  fs.writeFileSync(outputBundleFn, JSON.stringify(map, null, 2))

  // done
  console.log('Done')

  process.exit()
}

/* async function test () {
  let project = loadSchema('./models/project.json')
  let out = await derefSchema(project)
  // console.log(out)
}
test()
*/

build()
