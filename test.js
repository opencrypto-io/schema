const request = require('request')
const djv = require('djv')
const assert = require('assert')

const CryptoSchema = require('.')
const coreSchemaId = 'http://json-schema.org/draft-06/schema#'
var coreSchema = null

var cats = [ 'models' ]

function walk(root, example = false) {
  cats.forEach((ci) => {
    let c = root[ci]
    describe(ci, function() {
      Object.keys(c).forEach((ki) => {
        it(ki, function() {

          let env = new djv({
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

          })
          let schemaId = null

          if (example) {

            env.addSchema(CryptoSchema.models.core.$id, CryptoSchema.models.core)
            env.addSchema(CryptoSchema.models.asset.$id, CryptoSchema.models.asset)
            env.addSchema(CryptoSchema.models.network.$id, CryptoSchema.models.network)

            Object.keys(CryptoSchema[ci]).forEach(ccp => {
              if (ccp === 'core') {
                return null
              }
              let s = Object.assign({}, CryptoSchema[ci][ccp])
              //s.additionalProperties = false
              env.addSchema(s.$id, s)
            })
            schemaId = CryptoSchema[ci][ki].$id

          } else {
            env.addSchema(coreSchemaId, coreSchema)
            schemaId = coreSchemaId
          }

          let res = env.validate(schemaId, c[ki])
          if (res) {
            throw new Error('Validation error: ' + JSON.stringify(res))
          }
        })
      })
    })
  })
}

describe('opencrypto-schema tests', function() {

  before(function(done) {
    request({
      url: "http://json-schema.org/draft-06/schema#",
      json: true
    }, (err, resp, body) => {
      coreSchema = body
      done()
    })
  })

  describe('testing schemas', function() {
    walk(CryptoSchema)
  })

  describe('examples', function() {
    walk(CryptoSchema.examples, true)
  })
})
