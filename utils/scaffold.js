const chalk = require('chalk');
const ejs = require('ejs');
const { mkdir, writeFile, lstat, readdir } = require('fs/promises');
const path = require('path');

module.exports = async function scaffold(input, output, data = {}) {
	let stats = await lstat(input);
	
	// Remove `.ejs` from the output path.
	let _output = path.normalize(output.replace('.ejs', ''));
	// Replace variables in path names with the value.
	Object.entries(data).forEach(([key, value]) => {
		_output = _output.replace(`[${key}]`, value);
	})
	
	if (stats.isDirectory()) {
		// Loop through the directory's contents and scaffold each.
		const files = await readdir(input);

		files.forEach((file) => {
			scaffold(path.resolve(input, file), path.join(_output, file), data)
		});

	} else {
		// Set up output path of the file.
		let destination = path.join(process.cwd(), _output);

		// If the output path contains a directory, create it.
		if (_output.lastIndexOf(path.sep) > -1) {
			let directory = _output.slice(0, _output.lastIndexOf(path.sep));
			await mkdir(directory, { recursive: true });
		}

		// Scaffold the file.
		try {
			const markup = await ejs.renderFile(input, data);
			writeFile(destination, markup);
			console.log(`file created at ${chalk.green(destination)}`)
		} catch(error) {
			throw error;
		}
	}
}
