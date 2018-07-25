# Opencrypto Schema v0.9-beta

[![Build Status](https://travis-ci.org/opencrypto-io/schema.svg?branch=master)](https://travis-ci.org/opencrypto-io/schema)

Schemas for structured cryptocurrency-related data in [JSON Schema](http://json-schema.org/) standart.

**WARNING: Schema is currently unreleased and in heavy development. If you have some suggestion, feel free to contact us via [Issues](https://github.com/opencrypto-io/schema/issues).**

[Schema Explorer](https://schema.opencrypto.io/)

## Schemas

```
├── Core             
└── Project
    ├── Asset
    │   └── Network
    │       └── Block
    │           └── Transaction
    ├── Client
    └── Exchange
        └── Market
```

## Usage

### Hosted version (standalone)
You can use web `schema.opencrypto.io` for fetching schemas, format:
```
https://schema.opencrypto.io/<file>
```

For example:
* https://schema.opencrypto.io/models/asset.json
* https://schema.opencrypto.io/examples/models/asset.json
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

## Licence
MIT
