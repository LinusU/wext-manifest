exports.firefox = function (input) {
  const copy = Object.assign({}, input)

  if (copy.applications) {
    copy.applications = { gecko: input.applications.gecko }
  }

  return { name: 'manifest.json', content: JSON.stringify(copy) }
}

exports.chrome = function (input) {
  const copy = Object.assign({}, input)

  if (copy.applications) {
    delete copy.applications
  }

  return { name: 'manifest.json', content: JSON.stringify(copy) }
}

exports.opera = function (input) {
  return exports.chrome(input)
}

exports.safari = function (input) {
  if (!input.applications) throw new Error('Missing `applications` object')
  if (!input.applications.safari) throw new Error('Missing `applications.safari` object')
  if (!input.applications.safari.id) throw new Error('Missing `applications.safari.id` string')

  let xml = ''

  function append (indentation, text) {
    xml += `${'\t'.repeat(indentation)}${text}\n`
  }

  append(0, '<?xml version="1.0" encoding="UTF-8"?>')
  append(0, '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">')
  append(0, '<plist version="1.0">')
  append(0, '<dict>')

  if (input.author) {
    append(1, '<key>Author</key>')
    append(1, `<string>${input.author}</string>`)
  }

  append(1, '<key>Builder Version</key>')
  append(1, '<string>13604.4.7.1.6</string>')

  if (input.name) {
    append(1, '<key>CFBundleDisplayName</key>')
    append(1, `<string>${input.name}</string>`)
  }

  append(1, '<key>CFBundleIdentifier</key>')
  append(1, `<string>${input.applications.safari.id}</string>`)

  append(1, '<key>CFBundleInfoDictionaryVersion</key>')
  append(1, '<string>6.0</string>')

  append(1, '<key>CFBundleShortVersionString</key>')
  append(1, `<string>${input.version.replace(/[a-z]+\d+$/, '')}</string>`)

  append(1, '<key>CFBundleVersion</key>')
  append(1, `<string>${input.version}</string>`)

  if (input.browser_action || input.background) {
    append(1, '<key>Chrome</key>')
    append(1, '<dict>')

    if (input.background) {
      if (input.background.scripts) {
        throw new Error('`background.scripts` is not implemented for Safari, use `background.page` for now')
      }

      if (input.background.page) {
        append(2, '<key>Global Page</key>')
        append(2, `<string>${input.background.page}</string>`)
      }
    }

    if (input.browser_action) {
      append(2, '<key>Popovers</key>')
      append(2, '<array>')
      append(3, '<dict>')

      append(4, '<key>Filename</key>')
      append(4, `<string>${input.browser_action.default_popup}</string>`)

      append(4, '<key>Identifier</key>')
      append(4, '<string>default_popover</string>')

      if (input.applications.safari.popup_width) {
        append(4, '<key>Width</key>')
        append(4, `<integer>${input.applications.safari.popup_width}</integer>`)
      }

      if (input.applications.safari.popup_height) {
        append(4, '<key>Height</key>')
        append(4, `<integer>${input.applications.safari.popup_height}</integer>`)
      }

      append(3, '</dict>')
      append(2, '</array>')

      append(2, '<key>Toolbar Items</key>')
      append(2, '<array>')
      append(3, '<dict>')

      append(4, '<key>Identifier</key>')
      append(4, '<string>default_toolbar_item</string>')

      append(4, '<key>Image</key>')
      append(4, `<string>${input.browser_action.default_icon['16']}</string>`)

      append(4, '<key>Include By Default</key>')
      append(4, '<true/>')

      append(4, '<key>Label</key>')
      append(4, `<string>${input.browser_action.default_title}</string>`)

      append(4, '<key>Popover</key>')
      append(4, '<string>default_popover</string>')

      append(3, '</dict>')
      append(2, '</array>')
    }

    append(1, '</dict>')
  }

  if (input.content_scripts && input.content_scripts.length) {
    const startScripts = input.content_scripts.filter(s => s.run_at === 'document_start' && s.js).reduce((mem, s) => [...mem, ...s.js], [])
    const endScripts = input.content_scripts.filter(s => s.run_at !== 'document_start' && s.js).reduce((mem, s) => [...mem, ...s.js], [])
    const styleSheets = input.content_scripts.filter(s => s.css).reduce((mem, s) => [...mem, ...s.css], [])

    const uniqueMatches = new Set(input.content_scripts.map(s => s.matches.sort().join(';'))).size

    if (uniqueMatches > 1) {
      throw new Error('Safari cannot handle different "matches" properties')
    }

    append(1, '<key>Content</key>')
    append(1, '<dict>')

    if (startScripts.length || endScripts.length) {
      append(2, '<key>Scripts</key>')
      append(2, '<dict>')

      if (endScripts.length) {
        append(3, '<key>End</key>')
        append(3, '<array>')
        for (const file of endScripts) append(4, `<string>${file}</string>`)
        append(3, '</array>')
      }

      if (startScripts.length) {
        append(3, '<key>Start</key>')
        append(3, '<array>')
        for (const file of startScripts) append(4, `<string>${file}</string>`)
        append(3, '</array>')
      }

      append(2, '</dict>')
    }

    if (styleSheets.length) {
      append(2, '<key>Stylesheets</key>')
      append(2, '<array>')
      for (const file of styleSheets) append(3, `<string>${file}</string>`)
      append(2, '</array>')
    }

    append(2, '<key>Whitelist</key>')
    append(2, '<array>')
    for (const pattern of input.content_scripts[0].matches) append(3, `<string>${pattern}</string>`)
    append(2, '</array>')

    append(1, '</dict>')
  }

  append(1, '<key>Description</key>')
  append(1, `<string>${input.description}</string>`)

  if (input.applications.safari.developer_id) {
    append(1, '<key>DeveloperIdentifier</key>')
    append(1, `<string>${input.applications.safari.developer_id}</string>`)
  }

  append(1, '<key>ExtensionInfoDictionaryVersion</key>')
  append(1, '<string>1.0</string>')

  { // Permissions
    const hasAllUrls = (input.permissions || []).includes('<all_urls>')
    const httpPermissions = (input.permissions || []).filter(p => p.startsWith('http://'))
    const httpsPermissions = (input.permissions || []).filter(p => p.startsWith('https://'))

    append(1, '<key>Permissions</key>')
    append(1, '<dict>')
    append(2, '<key>Website Access</key>')
    append(2, '<dict>')

    if (hasAllUrls) {
      append(3, '<key>Include Secure Pages</key>')
      append(3, '<true/>')
      append(3, '<key>Level</key>')
      append(3, '<string>All</string>')
    } else if (httpPermissions.length || httpsPermissions.length) {
      append(3, '<key>Allowed Domains</key>')
      append(3, '<array>')

      const domains = new Set([
        ...httpPermissions.map(p => p.replace('http://', '').replace(/\/.*$/, '')),
        ...httpsPermissions.map(p => p.replace('https://', '').replace(/\/.*$/, ''))
      ])

      for (const domain of domains) {
        append(4, `<string>${domain}</string>`)
      }

      append(3, '</array>')
      append(3, '<key>Include Secure Pages</key>')
      append(3, httpsPermissions.length ? '<true/>' : '<false/>')
      append(3, '<key>Level</key>')
      append(3, '<string>Some</string>')
    } else {
      append(3, '<key>Include Secure Pages</key>')
      append(3, '<false/>')
      append(3, '<key>Level</key>')
      append(3, '<string>None</string>')
    }

    append(2, '</dict>')
    append(1, '</dict>')
  }

  append(1, '<key>Website</key>')
  append(1, `<string>${input.homepage_url}</string>`)

  append(0, '</dict>')
  append(0, '</plist>')

  return { name: 'Info.plist', content: xml }
}
