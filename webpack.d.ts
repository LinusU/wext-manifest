import { InputManifest } from './'

type Browser = 'chrome' | 'firefox' | 'opera' | 'safari'

declare class WextManifestWebpackPlugin {
  constructor (targetBrowser: Browser, input: InputManifest)
}

export = WextManifestWebpackPlugin
