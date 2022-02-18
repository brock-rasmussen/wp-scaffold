const prompts = require('prompts');

module.exports = async (config) => {
	return await prompts([
		{
			type: 'text',
			name: 'description',
			message: 'Description',
			initial: config.description,
		},
		{
			type: 'toggle',
			name: 'public',
			message: 'Public:',
			initial: config.public,
			active: 'yes',
			inactive: 'no',
		},
		{
			type: 'toggle',
			name: 'hierarchical',
			message: 'Hierarchical (e.g., Categories):',
			initial: config.hierarchical,
			active: 'yes',
			inactive: 'no',
		},
		{
			type: 'toggle',
			name: 'showUi',
			message: 'Show admin UI:',
			initial: config.showUi,
			active: 'yes',
			inactive: 'no',
		},
		{
			type: 'toggle',
			name: 'showInRest',
			message: 'Show in REST (required to support the block editor):',
			initial: config.showInRest,
			active: 'yes',
			inactive: 'no',
		},
		{
			type: 'toggle',
			name: 'showInQuickEdit',
			message: 'Show in the quick edit fields:',
			initial: config.showInRest,
			active: 'yes',
			inactive: 'no',
		},
		{
			type: 'toggle',
			name: 'showAdminColumn',
			message: 'Show a table column for related post-types:',
			initial: config.showInRest,
			active: 'yes',
			inactive: 'no',
		},
	], {
		onCancel() {
			process.exit(1);
		},
	});
};
