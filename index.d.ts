export interface BrowserAction {
  default_title: string
  default_popup: string
  default_icon: { [size: string]: string }
  theme_icons?: { dark: string, light: string, size: number }[]
}

export interface ContentScript {
  css?: string[]
  js?: string[]
  matches: string[]
  run_at?: 'document_start' | 'document_end' | 'document_idle'
}

export interface InputManifest {
  manifest_version: 2

  applications?: {
    gecko?: { id?: string }
    safari?: { id: string }
  }

  author: string
  description: string
  homepage_url?: string
  name: string
  permissions?: string[]
  version: string

  icons?: { [size: string]: string }

  browser_action?: BrowserAction
  content_scripts?: ContentScript[]
}

export interface Result {
  name: string
  content: string
}

export function chrome (input: InputManifest): Result
export function firefox (input: InputManifest): Result
export function opera (input: InputManifest): Result
export function safari (input: InputManifest): Result
