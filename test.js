const request = require('request')
//const djv = require('djv')
const Ajv = require('ajv')
const assert = require('assert')

const CryptoSchema = require('.')
const MetaSchema = require('ajv/lib/refs/json-schema-draft-06.json')

var cats = [ 'models' ]

function walk(root, example = false) {
  cats.forEach((ci) => {
    let c = root[ci]
    describe(ci, function() {
      Object.keys(c).forEach((ki) => {
        it(ki, function() {

          let env = new Ajv()
          env.addMetaSchema(MetaSchema)

          /*let env = new djv({
            version: 'draft-06',
            //errorHandler: () => { "console.log(this.data); r" }
            errorHandler(errorType) {
              const path = this.data.toString().replace(/^data/, '')
              const dataPath = path
                .replace(/\['([^']+)'\]/ig, '.$1')
                .replace(/\[(i[0-9]*)\]/ig, '[\'+$1+\']');
              const schemaPath = `#${
                path
                  .replace(/\[i([0-9]*)\]/ig, '/items')
                  .replace(/\['([^']+)'\]/ig, '/properties/$1')
              }/${errorType}`

              return `return {
                keyword: '${errorType}',
                dataPath: '${dataPath}',
                schemaPath: '${schemaPath}'
              };`
            }

          })*/
          let schemaId = null

          if (example) {

            env.addSchema(CryptoSchema.models.core, CryptoSchema.models.core.$id)
            env.addSchema(CryptoSchema.models.asset, CryptoSchema.models.asset.$id)
            env.addSchema(CryptoSchema.models.network, CryptoSchema.models.network.$id)

            Object.keys(CryptoSchema[ci]).forEach(ccp => {
              if (ccp === 'core') {
                return null
              }
              let s = Object.assign({}, CryptoSchema[ci][ccp])
              //s.additionalProperties = false
              env.addSchema(s, s.$id)
            })
            schemaId = CryptoSchema[ci][ki].$id

          }

          let res = env.validate(c[ki], schemaId)
          if (!res) {
            throw new Error('Validation error: ' + JSON.stringify(env.errors))
          }
        })
      })
    })
  })
}

describe('opencrypto-schema tests', function() {

  describe('testing schemas', function() {
    walk(CryptoSchema)
  })

  describe('examples', function() {
    walk(CryptoSchema.examples, true)
  })
})
