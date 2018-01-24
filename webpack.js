const wextManifest = require('./')

function WextManifestWebpackPlugin (targetBrowser, input) {
  if (typeof wextManifest[targetBrowser] !== 'function') {
    throw new Error(`Browser not supported: ${targetBrowser}`)
  }

  const { name, content } = wextManifest[targetBrowser](input)
  const buffer = Buffer.from(content)

  function apply (compiler) {
    compiler.plugin('emit', (compilation, cb) => {
      compilation.assets[name] = {
        size () { return buffer.byteLength },
        source () { return buffer }
      }

      cb()
    })
  }

  return { apply }
}

module.exports = WextManifestWebpackPlugin
