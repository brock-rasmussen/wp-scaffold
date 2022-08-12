const cwdReaddirFilenames = require('../../utils/cwdReaddirFilenames')

/**
 * Get list of term columns in project and core columns in list formatted for `prompts` library `choices`.
 * @return {{ title: string, value: string }[]}
 */
const getTermColumnChoices = async () => {
  const termColumns = await cwdReaddirFilenames('term-columns')

  // Add core columns
  termColumns.push('name', 'description', 'slug', 'posts')

  // Sort alphabetically
  termColumns.sort()

  // Format for `prompts`
  return termColumns.map((termColumn) => ({
    title: termColumn,
    value: termColumn,
  }))
}

module.exports = {
  getTermColumnChoices,
}
