const { lstat, readdir, readFile, writeFile } = require('fs/promises');
const path = require('path');


/**
 * Get a list of file names from a folder in the current working directory.
 * @param {string} folder 
 * @returns {string[]}
 */
const readdirFiles = async (dir) => {
	let dirPath = path.resolve(process.cwd(), dir);

	try {
		let stats = await lstat(dirPath);

		if (stats.isDirectory()) {
			return await readdir(dirPath);
		}
	} catch(error) {
		return []
	}
}


/**
 * Get a list of file names (without extensions) from a folder in the current working directory.
 * @param {string} dir 
 * @returns {string[]}
 */
const readdirFilenames = async (dir) => {
	let files = await readdirFiles(dir);
	return files.map((file) => path.parse(file).name);
}


/**
 * Run a search and replace on a file.
 * @param {string} filename 
 * @param {string,RegExp} search 
 * @param {string} replace
 * @param {function} abort
 */
const searchAndReplace = async (filename, search, replace, abort = (contents) => false) => {
	try {
		let contents = await readFile(path.resolve(process.cwd(), filename), 'utf-8');
		
		// If the abort callback returns true, stop.
		if (abort(contents)) {
			return;
		}

		let newContents = contents.replaceAll(search, replace);
		await writeFile(path.resolve(process.cwd(), filename), newContents, 'utf-8');
	} catch(error) {}
}


module.exports = {
	readdirFilenames,
	readdirFiles,
	searchAndReplace,
};
