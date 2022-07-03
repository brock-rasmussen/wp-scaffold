const prompts = require('prompts');
const { getMenuPageChoices } = require('../menu-page/menu-page.utils');

module.exports = async (defaults) => {
	let menuPageChoices = !defaults.menuPage ? await getMenuPageChoices() : [];

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
			type: defaults.parentSlug ? null : 'select',
			name: 'parentSlug',
			message: 'Parent menu slug:',
			initial: defaults.parentSlug ? menuPageChoices.findIndex((choice) => choice.value === defaults.parentSlug) : 1,
			choices: menuPageChoices,
		},
	], {
		onCancel() {
			process.exit(1);
		},
	});
};
