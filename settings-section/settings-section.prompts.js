const prompts = require('prompts');
const { getSettingsPageChoices } = require('./settings-section.utils');

module.exports = async (defaults) => {
	let settingsPageChoices = !defaults.parent ? await getSettingsPageChoices() : [];

	return await prompts([
		{
			type: 'text',
			name: 'title',
			message: 'Title:',
			initial: defaults.title,
		},
		{
			type: 'text',
			name: 'description',
			message: 'Description:',
			initial: defaults.description,
		},
		{
			type: defaults.parent ? null : 'select',
			name: 'page',
			message: 'Page slug:',
			initial: defaults.parent ? settingsPageChoices.findIndex((choice) => choice.value === defaults.parent) : 1,
			choices: settingsPageChoices,
		},
	], {
		onCancel() {
			process.exit(1);
		},
	});
};
