const prompts = require('prompts');

module.exports = async (config) => {
	return await prompts([
		{
			type: 'autocomplete',
			name: 'insertBefore',
			message: 'Insert this column before:',
			initial: config.insertBefore,
			choices: [
				{ title: 'title', value: 'title' },
				{ title: 'author', value: 'author' },
				{ title: 'categories', value: 'categories' },
				{ title: 'tags', value: 'tags' },
				{ title: 'comments', value: 'comments' },
				{ title: 'date', value: 'date' },
			],
		},
		{
			type: 'toggle',
			name: 'isSortable',
			message: 'Allow posts to be sorted by this column:',
			initial: config.isSortable,
			active: 'yes',
			inactive: 'no',
		},
	], {
		onCancel() {
			process.exit(1);
		},
	});
};
