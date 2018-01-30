# Web Extensions polyfill: `manifest`

Web Extensions polyfill for the `manifest.json` API.

The goal with this package is to implmenet a subset of the Web Extensions API that works for Chrome, Firefox, Safari and Edge.

This module will take a definition input for the manifest, and return you filename and content for the specified browser.

## Installation

```sh
npm install --save @wext/manifest
```

## Usage

```js
const wextManifest = require('@wext/manifest')

const input = {
  manifest_version: 2,
  name: 'Example',
  version: '1.0.0',

  icons: {
    16: 'Icon.png',
    32: 'Icon-32.png',
    64: 'Icon-64.png'
  },

  applications: {
    gecko: { id: '{754FB1AD-CC3B-4856-B6A0-7786F8CA9D17}' },
    safari: { id: 'com.example.extension' }
  },

  author: 'Linus Unnebäck',
  description: 'Example extension',
  homepage_url: 'http://example.com/',

  permissions: [
    'activeTab',
    'http://example.com/*'
  ],

  browser_action: {
    default_title: 'Example',
    default_popup: 'popup.html',
    default_icon: {
      16: 'Icon.png',
      32: 'Icon-32.png',
      64: 'Icon-64.png'
    }
  }
}

console.log(wextManifest.firefox(input))
// => { name: 'manifest.json', content: '{"manifest_version":2...' }

console.log(wextManifest.safari(input))
// => { name: 'Info.plist', content: '<?xml version="1.0" enco...' }
```

## Implemented browsers

| Browser | Implemented |
| ------- | :----: |
| Chrome | ✅ |
| Edge | ❌ |
| Firefox | ✅ |
| Opera | ✅ |
| Safari | ✅ |

## Webpack usage

You can easily use this module together with the [`write-webpack-plugin`](https://www.npmjs.com/package/write-webpack-plugin) to output the manifest file as part of your build process.

The following example will create `distribution/safari.safariextension/Info.plist` when `TARGET_BROWSER=safari`, and `distribution/chrome/manifest.json` when `TARGET_BROWSER=chrome`.

```js
const path = require('path')
const wextManifest = require('@wext/manifest')
const WriteWebpackPlugin = require('write-webpack-plugin')

const targetBrowser = process.env.TARGET_BROWSER

const manifest = wextManifest[targetBrowser]({
  // Manifest input
})

module.exports = {
  // ...

  output: {
    path: path.join(__dirname, 'distribution', (targetBrowser === 'safari' ? 'safari.safariextension' : targetBrowser)),
    filename: '[name].js'
  },

  plugins: [
    // ...

    new WriteWebpackPlugin([
      { name: manifest.name, data: Buffer.from(manifest.content) }
    ])
  ]
}
```
