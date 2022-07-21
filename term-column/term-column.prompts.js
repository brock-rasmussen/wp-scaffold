const prompts = require('prompts');
const { getTaxonomyChoices } = require('../taxonomy/taxonomy.utils');
const { getTermColumnChoices } = require('./term-column.utils');

module.exports = async (defaults) => {
	let taxonomyChoices = !defaults.taxonomies.length ? await getTaxonomyChoices() : [];
	let termColumnChoices = await getTermColumnChoices();

	// Select the user-provided options.
	taxonomyChoices.forEach((choice) => {
		choice.selected = defaults.taxonomies.includes(choice.title);
	})

	return await prompts([
		{
			type: 'text',
			name: 'title',
			message: 'Title:',
			initial: defaults.title,
		},
		{
			type: 'autocomplete',
			name: 'insertBefore',
			message: 'Insert the column before:',
			initial: defaults.insertBefore,
			choices: termColumnChoices,
		},
		{
			type: 'toggle',
			name: 'isSortable',
			message: 'Allow sorting by this column:',
			initial: defaults.isSortable,
			active: 'yes',
			inactive: 'no',
		},
		{
			type: defaults.taxonomies.length ? null : 'multiselect',
			name: 'taxonomies',
			message: 'Taxonomies with column:',
			initial: defaults.taxonomies ? '' : 1,
			choices: taxonomyChoices,
		},
	], {
		onCancel() {
			process.exit(1);
		},
	});
};