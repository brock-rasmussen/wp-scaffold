const cwdReaddirFilenames = require('../../utils/cwdReaddirFilenames')

/**
 * Get list of post columns in project and core columns in list formatted for `prompts` library `choices`.
 * @return {{ title: string, value: string }[]}
 */
const getPostColumnChoices = async () => {
  const postColumns = await cwdReaddirFilenames('post-columns')

  // Add core columns
  postColumns.push('title', 'author', 'categories', 'tags', 'comments', 'date')

  // Sort alphabetically
  postColumns.sort()

  // Format for `prompts`
  return postColumns.map((postColumn) => ({
    title: postColumn,
    value: postColumn,
  }))
}

module.exports = {
  getPostColumnChoices,
}
