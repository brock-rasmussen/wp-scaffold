const prompts = require('prompts');
const dashicons = require('../utils/dashicons');

module.exports = async (defaults) => {
	return await prompts([
		{
			type: 'text',
			name: 'menuTitle',
			message: 'Menu title:',
			initial: defaults.menuTitle,
		},
		{
			type: 'text',
			name: 'pageTitle',
			message: 'Page title:',
			initial: defaults.pageTitle,
		},
		{
			type: 'autocomplete',
			name: 'menuIcon',
			message: 'Icon:',
			initial: defaults.menuIcon,
			choices: dashicons,
		},
	], {
		onCancel() {
			process.exit(1);
		},
	});
};