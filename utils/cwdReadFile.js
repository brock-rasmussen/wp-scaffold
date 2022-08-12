const { readFile } = require('fs/promises')
const path = require('path')

module.exports = async function cwdReadFile(file) {
  try {
    return await readFile(path.resolve(process.cwd(), file), 'utf-8')
  } catch (error) {}
}
