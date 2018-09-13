const fs = require('fs')
const path = require('path')

const webappDir = path.join(process.cwd(), 'node_modules/opencrypto-schema-explorer/docs')
const outputDir = path.join(process.cwd(), 'dist')

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir)
}

fs.readdirSync(webappDir).forEach(f => {
  let src = path.join(webappDir, f)
  let dest = path.join(outputDir, f)
  fs.copyFileSync(src, dest)
  console.log(`Copying webapp file: ${f} => ${dest}`)
})
console.log('Done')

