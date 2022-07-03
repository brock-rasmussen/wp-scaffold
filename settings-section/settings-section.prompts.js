const prompts = require('prompts');
const { getSettingsPageChoices } = require('../menu-page/menu-page.utils');

module.exports = async (defaults) => {
	let settingsPageChoices = !defaults.parent ? await getSettingsPageChoices() : [];

	return await prompts([
		{
			type: 'text',
			name: 'title',
			message: 'Title',
			initial: defaults.title,
		},
		{
			type: defaults.parent ? null : 'select',
			name: 'page',
			message: 'The slug of the settings page on which to show the section.',
			initial: defaults.parent ? settingsPageChoices.findIndex((choice) => choice.value === defaults.parent) : 1,
			choices: settingsPageChoices,
		},
	], {
		onCancel() {
			process.exit(1);
		},
	});
};
