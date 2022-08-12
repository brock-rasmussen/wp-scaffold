const cwdReaddirFilenames = require('./cwdReaddirFilenames')

module.exports = async function getTaxonomies() {
  const taxonomies = await cwdReaddirFilenames('taxonomies')

  // Add core taxonomies
  taxonomies.push('category', 'tag')

  // Sort alphabetically
  taxonomies.sort()

  return taxonomies
}
