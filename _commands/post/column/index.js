const { Command } = require('commander');
const { kebabCase, snakeCase } = require('lodash');
const chalk = require('chalk');

const wizard = require('./wizard');
const scaffold = require('../../../utils/scaffold');

/**
 * Default values for the wizard.
 */
const DEFAULT = {
	insertBefore: 'author',
	isSortable: false,
}

/**
 * Export the column scaffolding command.
 */
module.exports = () => new Command('column')
	.description('Generates PHP code for creating a custom post table column.')
	.argument('<title>', 'The column\'s title. Double quote if it includes a space.')
	.argument('<postTypes...>', 'List of post types where the column should be used.')
	.option('-t, --textdomain [textdomain]', 'Unique identifier for retrieving translated strings.', 'badger')
	.option('-w, --wizard', 'Customize registration options using a wizard.', false)
	.action(async (title, postTypes, options) => {
		// Set up the defaults object.
		let defaults = Object.assign({}, DEFAULT);

		// If `--wizard` option was passed, prompt user for data.
		// Default values for the prompts will use the selected preset values.
		let responses = !options.wizard ? {} : await wizard(defaults);

		// Create a PHP-valid string for use in PHP function names, among other things.
		let machineName = snakeCase(title);

		// Create a kebab-case string for the file name.
		let slug = kebabCase(title);

		// Compile data object to be passed to the template.
		let config = Object.assign({
			title,
			postTypes,
			textdomain: options.textdomain,
			machineName,
		}, defaults, responses);

		try {
			scaffold('./commands/post/column/template.ejs', `post-columns/${slug}.php`, config);
			console.log(chalk.green(`A file for the '${title}' post-column has been created in '/post-columns/${slug}.php'.`))
		} catch(error) {}
	})
