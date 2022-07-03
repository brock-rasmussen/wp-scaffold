const prompts = require('prompts');
const dashicons = require('../utils/dashicons');

module.exports = async (defaults) => {
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
			message: 'Hierarchical (e.g. page):',
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
			type: 'autocomplete',
			name: 'menuIcon',
			message: 'Icon:',
			initial: defaults.menuIcon,
			choices: dashicons,
		},
		{
			type: 'multiselect',
			name: 'supports',
			message: 'Supports:',
			choices: [
				{ title: 'title', value: 'title', selected: defaults.supports.includes('title') },
				{ title: 'editor', value: 'editor', selected: defaults.supports.includes('editor') },
				{ title: 'comments', value: 'comments', selected: defaults.supports.includes('comments') },
				{ title: 'revisions', value: 'revisions', selected: defaults.supports.includes('revisions') },
				{ title: 'trackbacks', value: 'trackbacks', selected: defaults.supports.includes('trackbacks') },
				{ title: 'author', value: 'author', selected: defaults.supports.includes('author') },
				{ title: 'excerpt', value: 'excerpt', selected: defaults.supports.includes('excerpt') },
				{ title: 'page-attributes', value: 'page-attributes', selected: defaults.supports.includes('page-attributes') },
				{ title: 'thumbnail', value: 'thumbnail', selected: defaults.supports.includes('thumbnail') },
				{ title: 'custom-fields', value: 'custom-fields', selected: defaults.supports.includes('custom-fields') },
				{ title: 'post-formats', value: 'post-formats', selected: defaults.supports.includes('post-formats') },
			],
		},
	], {
		onCancel() {
			process.exit(1);
		},
	});
};
