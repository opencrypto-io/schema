# How to build & test

First, you need clone this repository locally:
```bash
git clone git@github.com:opencrypto-io/schema.git opencrypto-schema
cd opencrypto-schema
npm install
```

then you can use these commands:
```bash
# to run tests
npm test

# to generate /build directory
npm run-script build

# to generate all (including schema-explorer)
npm run-script build-all
```
