const prompts = require('prompts');
const { getPostTypeChoices } = require('../post-type/post-type.utils');

module.exports = async (defaults) => {
	let postTypeChoices = !defaults.objectTypes.length ? await getPostTypeChoices() : [];

	// Select the user-provided options.
	postTypeChoices.forEach((choice) => {
		choice.selected = defaults.objectTypes.includes(choice.title);
	})

	return await prompts([
		{
			type: 'text',
			name: 'label',
			message: 'Label (singular):',
			initial: defaults.label,
		},
		{
			type: 'toggle',
			name: 'hierarchical',
			message: 'Hierarchical (e.g. category):',
			initial: defaults.hierarchical,
			active: 'yes',
			inactive: 'no',
		},
		{
			type: 'toggle',
			name: 'public',
			message: 'For public use:',
			initial: defaults.public,
			active: 'yes',
			inactive: 'no',
		},
		{
			type: (prev, values) => values.public ? null : 'toggle',
			name: 'showUi',
			message: 'Show admin UI:',
			initial: (prev, values) => values.public,
			active: 'yes',
			inactive: 'no',
		},
		{
			type: 'toggle',
			name: 'showInRest',
			message: 'Include in the REST API (required to support the block editor):',
			initial: defaults.showInRest,
			active: 'yes',
			inactive: 'no',
		},
		{
			type: defaults.objectTypes.length ? null : 'multiselect',
			name: 'objectTypes',
			message: 'Associated object types:',
			choices: postTypeChoices,
		}
	], {
		onCancel() {
			process.exit(1);
		},
	});
};
