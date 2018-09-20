# Opencrypto Schema v0.9

[![Build Status](https://travis-ci.org/opencrypto-io/schema.svg?branch=master)](https://travis-ci.org/opencrypto-io/schema)

Schemas for structured cryptocurrency-related data in [JSON Schema](http://json-schema.org/) standard.

We created this schema, because we need normalized way how to create, transfer and store data about crypto-assets and related ecosystem.

Schema is divided to models by their purpose and it's designed to be easy to understand and to encompass all data properties that is needed.

[Changelog](/CHANGELOG.md) | [Schema Explorer](https://schema.opencrypto.io/)

## Models Structure

```
└── Project
    ├── Ledger
    │   └── Network
    │       └── Block
    │           └── Transaction
    ├── Asset
    ├── Client
    └── Exchange
        └── Market
```

## Usage

### Hosted version (standalone)
You can use hosted version `https://schema.opencrypto.io`:
```
# One-file Bundle with schemas of all models
https://schema.opencrypto.io/build/bundle.json

# De-referenced version (ready for use)
https://schema.opencrypto.io/build/deref/<schema>.json

# Original version with references ($ref)
https://schema.opencrypto.io/build/models/<schema>.json

# Example for specific model
https://schema.opencrypto.io/build/models/examples/<schema>.json

```

For example:
* https://schema.opencrypto.io/build/bundle.json
* https://schema.opencrypto.io/build/deref/project.json
* https://schema.opencrypto.io/build/models/exchange.json
* https://schema.opencrypto.io/build/examples/models/asset.json
* ...

### Locally as Node.js or CommonJS module
Install it via `npm`:
```bash
npm install opencrypto-schema
```

And use it inside your script:
```js

// now you can access schemas by dot notation:
var Schema = require('opencrypto-schema')
var assetSchema = Schema.models.asset

// or you can do it more simpler:
var schemaModels = require('opencrypto-schema').models

// or if you want only one specific schema:
var assetSchema = require('opencrypto/models/asset')
```

## Documentation
* [How to build & test](/BUILDING.md)

## Licence
MIT
