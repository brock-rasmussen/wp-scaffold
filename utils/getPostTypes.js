const cwdReaddirFilenames = require('./cwdReaddirFilenames')

module.exports = async function getPostTypes() {
  const postTypes = await cwdReaddirFilenames('post-types')

  // Add core post types
  postTypes.push('page', 'post')

  // Sort alphabetically
  postTypes.sort()

  return postTypes
}
