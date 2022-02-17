const ejs = require('ejs');
const { mkdir, writeFile } = require('fs/promises');
const path = require('path');

module.exports = async function scaffold(input, output, data = {}) {
	try {
		const markup = await ejs.renderFile(input, data);

		if (output.lastIndexOf('/') > -1) {
			let directory = output.slice(0, output.lastIndexOf('/'));
			await mkdir(directory, { recursive: true });
		}

		writeFile(path.join(process.cwd(), output), markup);
	} catch(error) {
		console.log(error);
	}
}
