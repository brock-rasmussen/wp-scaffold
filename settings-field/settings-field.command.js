const { Command, Option } = require('commander');
const { kebabCase, snakeCase, startCase } = require('lodash');
const path = require('path');

const prompts = require('./settings-field.prompts');
const scaffold = require('../utils/scaffold');

/**
 * Export the settings-field scaffolding command.
 */
module.exports = () => new Command('settings-field')
	.description('generate PHP for a settings field to appear in a settings section')
	.argument('<slug>', 'the field identifier', (slug) => {
		// Not required to be snake-case, but seems to be the common convention.
		return snakeCase(slug);
	})
	.argument('[section]', 'the settings-section identifier')
	.argument('[page]', 'the admin page slug')
	.addOption(
		new Option('--type <type>', 'The input type to scaffold.')
			.default('text')
			.choices([
				'checkbox',
				'checkboxes',
				'color',
				'email',
				'media',
				'number',
				'radio',
				'richtext',
				'select',
				'textarea',
				'url',
				'text'
			])
	)
	.option('-y, --yes', 'automatically answer "yes" to any prompts', false)
	.action(async (slug, section, page, options) => {
		// Current plugin folder name.
		let plugin = path.basename(process.cwd());

		// Default values.
		let defaults = {
			textdomain: kebabCase(plugin),

			/**
			 * @see https://developer.wordpress.org/reference/functions/add_settings_field/
			 */
			title: startCase(slug),
			section,
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
			scaffold(path.resolve(__dirname, './settings-field.template.php.ejs'), `settings-fields/${slug}.php`, vars);
		} catch(error) {}
	})