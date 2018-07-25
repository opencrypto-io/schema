/* global describe, it */

const Ajv = require('ajv')

const CryptoSchema = require('.')
const MetaSchema = require('ajv/lib/refs/json-schema-draft-06.json')

var cats = [ 'models' ]

function checkSchema (c, ci, ki, example) {
  let env = new Ajv()
  env.addMetaSchema(MetaSchema)
  env.addSchema(CryptoSchema.models.core, CryptoSchema.models.core.$id)

  let testSchema = null

  if (example) {
    Object.keys(CryptoSchema[ci]).forEach(ccp => {
      if (ccp === 'core') {
        return null
      }
      let s = Object.assign({}, CryptoSchema[ci][ccp])
      // s.additionalProperties = false
      env.addSchema(s, s.$id)
    })
    testSchema = CryptoSchema[ci][ki]
  } else {
    testSchema = MetaSchema
  }

  let res = env.validate(testSchema, c[ki])
  if (!res) {
    throw new Error('Validation error: ' + JSON.stringify(env.errors))
  }
}

function walk (root, example = false) {
  cats.forEach((ci) => {
    let c = root[ci]
    describe(ci, function () {
      Object.keys(c).forEach((ki) => {
        it(ki, function () {
          checkSchema(c, ci, ki, example)
        })
      })
    })
  })
}

describe('opencrypto-schema tests', function () {
  describe('testing schemas', function () {
    walk(CryptoSchema)
  })

  describe('examples', function () {
    walk(CryptoSchema.examples, true)
  })
})
