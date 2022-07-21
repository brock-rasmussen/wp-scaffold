const chalk = require('chalk');
const { Command } = require('commander');
const { snakeCase, kebabCase, startCase } = require('lodash');
const path = require('path');

const prompts = require('./menu-page.prompts');
const scaffold = require('../utils/scaffold');
const { searchAndReplace } = require('../utils/project-data')

/**
 * Export the menu-page scaffolding command.
 */
module.exports = () => new Command('menu-page')
	.description('FEATURE PLUGIN ONLY - generate PHP for an admin menu page')
	.argument('<slug>', 'the unique identifier for the menu item', (slug) => {
		return slug.replace(/[^a-z\-_\d]/g, '');
	})
	.option('-y, --yes', 'automatically answer "yes" to any prompts', false)
	.action(async (slug, options) => {
		// Current plugin folder name.
		let plugin = path.basename(process.cwd());

		// Default values.
		let defaults = {
			textdomain: kebabCase(plugin),

			/**
			 * @see https://developer.wordpress.org/reference/functions/add_menu_page/
			 */
			pageTitle: startCase(slug),
			menuTitle: startCase(slug),
			menuIcon: '',
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
			await scaffold(path.resolve(__dirname, './menu-page.template.php.ejs'), `menu-pages/${slug}.php`, vars);
			await searchAndReplace(
				`${plugin}.php`,
				'/* MENU PAGES */',
				`/* MENU PAGES */\r\n\trequire_once __DIR__ . '/menu-pages/${slug}.php';`,
				(contents) => contents.includes(`require_once __DIR__ . '/menu-pages/${slug}.php';`)
			);
		} catch(error) {
			console.log(chalk.red(error));
		}
	})