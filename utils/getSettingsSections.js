const { Separator } = require('inquirer')

const cwdReaddirFilenames = require('./cwdReaddirFilenames')

module.exports = async function getSettingsSections() {
  const settingsSections = await cwdReaddirFilenames('settings-sections')

  // Sort alphabetically.
  settingsSections.sort()

  // Add separator if needed.
  if (settingsSections.length) {
    settingsSections.push(new Separator())
  }

  // Add core settings pages.
  settingsSections.push('default')

  return settingsSections
}
