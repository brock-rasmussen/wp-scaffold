const { Separator } = require('inquirer')

const cwdReaddirFilenames = require('./cwdReaddirFilenames')

module.exports = async function getSettingsPages() {
  const settingsPages = await cwdReaddirFilenames('menu-pages')

  // Sort alphabetically.
  settingsPages.sort()

  // Add separator if needed.
  if (settingsPages.length) {
    settingsPages.push(new Separator())
  }

  // Add core settings pages.
  settingsPages.push(
    'discussion',
    'general',
    'media',
    'permalink',
    'reading',
    'writing'
  )

  return settingsPages
}
