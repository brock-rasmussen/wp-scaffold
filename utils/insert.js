const { readFile, writeFile } = require('fs/promises')
const path = require('path')

/**
 * Run a search and replace on a file.
 * @param {string} file File to insert into
 * @param {string|RegExp} hook The pattern or string to insert `text` after
 * @param {string} text The text to insert
 */
module.exports = async function insert(file, hook, text) {
  try {
    const contents = await readFile(path.resolve(process.cwd(), file), 'utf-8')

    // Abort if the file already contains the text being inserted.
    if (contents.includes(text)) {
      return false
    }

    const newContents = contents.replaceAll(hook, `${hook}\r\n${text}`)
    await writeFile(path.resolve(process.cwd(), file), newContents, 'utf-8')
    return true
  } catch (error) {}
}
