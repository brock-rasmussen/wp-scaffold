const prompts = require('prompts')
const validateURL = require('../utils/validate-url')

module.exports = async (defaults) => {
	return await prompts([
		{
			type: 'text',
			name: 'name',
			message: 'Plugin name:',
			initial: defaults.name,
		},
		{
			type: 'text',
			name: 'description',
			message: 'Description:',
			initial: defaults.description,
		},
		{
			type: 'text',
			name: 'author',
			message: 'Author:',
			initial: defaults.author,
		},
		{
			type: 'text',
			name: 'authorURI',
			message: 'Author URI (e.g. website, github profile, etc.):',
			initial: defaults.authorURI,
			validate(authorURI) {
				if (!authorURI) return true;
				return validateURL(authorURI);
			},
		},
		{
			type: 'text',
			name: 'pluginURI',
			message: 'Plugin URI (e.g. documentation site, github repository, etc.):',
			initial: defaults.pluginURI,
			validate(pluginURI) {
				if (!pluginURI) return true;
				return validateURL(pluginURI);
			},
		},
	], {
		onCancel() {
			process.exit(1);
		},
	});
};