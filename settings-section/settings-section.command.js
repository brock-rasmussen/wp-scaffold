const { Command } = require('commander');
const { kebabCase, snakeCase, startCase } = require('lodash');
const path = require('path');

const prompts = require('./settings-section.prompts');
const scaffold = require('../utils/scaffold');

/**
 * Export the settings-section scaffolding command.
 */
module.exports = () => new Command('settings-section')
	.description('generate PHP for a settings section to appear on an admin page')
	.argument('<slug>', 'the section identifier', (slug) => {
		// Not required to be snake-case, but seems to be the common convention.
		return snakeCase(slug);
	})
	.argument('[page]', 'the admin page slug')
	.option('-y, --yes', 'automatically answer "yes" to any prompts', false)
	.action(async (slug, page, options) => {
		// Current plugin folder name.
		let plugin = path.basename(process.cwd());

		// Default values.
		let defaults = {
			textdomain: kebabCase(plugin),

			/**
			 * @see https://developer.wordpress.org/reference/functions/add_settings_section/
			 */
			title: startCase(slug),
			page,
		};

		// If `--yes` option was passed, skip the wizard.
		let responses = options.yes ? {} : await prompts(defaults);

		// Create a PHP-valid string for use in PHP function names.
		let pluginMachineName = snakeCase(plugin);
		let machineName = snakeCase(slug);

		// Data variables to be passed to the template.
		let vars = Object.assign({
			slug,
			pluginMachineName,
			machineName,
		}, defaults, responses);

		try {
			scaffold(path.resolve(__dirname, './settings-section.template.php.ejs'), `settings-sections/${slug}.php`, vars);
		} catch(error) {}
	})
