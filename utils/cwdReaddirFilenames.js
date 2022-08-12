const { lstat, readdir } = require('fs/promises')
const path = require('path')

module.exports = async function cwdReaddirFilenames(dir) {
  const dirPath = path.resolve(process.cwd(), dir)

  try {
    const stats = await lstat(dirPath)

    if (stats.isDirectory()) {
      const files = await readdir(dirPath)
      return files.map((file) => path.parse(file).name)
    }
  } catch (error) {
    return []
  }
}
