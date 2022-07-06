const prompts = require('prompts');
const { getSettingsPageChoices } = require('../menu-page/menu-page.utils');
const { getSettingsSectionChoices } = require('../settings-section/settings-section.utils');

module.exports = async (defaults) => {
	let settingsPageChoices = !defaults.parent ? await getSettingsPageChoices() : [];
	let settingsSectionChoices = !defaults.section ? await getSettingsSectionChoices() : [];

	return await prompts([
		{
			type: 'text',
			name: 'title',
			message: 'Title:',
			initial: defaults.title,
		},
		{
			type: defaults.parent ? null : 'select',
			name: 'page',
			message: 'Page slug:',
			initial: defaults.parent ? settingsPageChoices.findIndex((choice) => choice.value === defaults.parent) : 1,
			choices: settingsPageChoices,
		},
		{
			type: defaults.section ? null : 'select',
			name: 'section',
			message: 'Section slug:',
			initial: defaults.section ? settingsSectionChoices.findIndex((choice) => choice.value === defaults.section) : 1,
			choices: settingsSectionChoices,
		},
	], {
		onCancel() {
			process.exit(1);
		},
	});
};
