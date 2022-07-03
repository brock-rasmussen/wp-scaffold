const { lstat, readdir, readFile } = require('fs/promises');
const path = require('path');


/**
 * Get a file's content in the current working directory.
 * @param string fileName 
 * @returns string
 */
const getFileContents = async (fileName) => {
	try {
		let contents = await readFile(path.resolve(process.cwd(), fileName), 'utf-8');
		return contents;
	} catch(error) {}
}


/**
 * Get a list of file names (without extensions) from a folder in the current working directory.
 * @param string folder 
 * @returns string[]
 */
const getFolderFileNames = async (folder) => {
	let files = await getFolderFiles(folder);
	return files.map((file) => {
		return path.parse(file).name;
	});
}


/**
 * Get a list of file names from a folder in the current working directory.
 * @param string folder 
 * @returns string[]
 */
const getFolderFiles = async (folder) => {
	let folderPath = path.resolve(process.cwd(), folder);

	try {
		let stats = await lstat(folderPath);

		if (stats.isDirectory()) {
			const files = await readdir(folderPath);
			return files;
		}
	} catch(error) {
		return [];
	}
};

module.exports = {
	getFileContents,
	getFolderFileNames,
	getFolderFiles,
};
