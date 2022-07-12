const { Command } = require('commander');
const { kebabCase, snakeCase, startCase } = require('lodash');
const path = require('path');

const prompts = require('./term-column.prompts');
const scaffold = require('../utils/scaffold');
const { searchAndReplace } = require('../utils/project-data');

/**
 * Export the term-column scaffolding command.
 */
module.exports = () => new Command('term-column')
	.description('generate PHP for a custom term list table column')
	.argument('<slug>', 'the column identifier', (slug) => {
		return snakeCase(slug);
	})
	.argument('[taxonomies...]', 'the taxonomies where the column should be used')
	.option('-y, --yes', 'automatically answer "yes" to any prompts', false)
	.action(async (slug, taxonomies, options) => {
		// Current plugin folder name.
		let plugin = path.basename(process.cwd());
		let fileName = kebabCase(slug);

		// Set up the defaults object.
		let defaults = {
			textdomain: kebabCase(plugin),
			title: startCase(slug),
			insertBefore: 'description',
			isSortable: false,
			taxonomies,
		};

		// If `--yes` option was passed, skip the wizard.
		let responses = options.yes ? {} : await prompts(defaults);

		// Create a PHP-valid string for use in PHP function names.
		let pluginMachineName = snakeCase(plugin);
		let machineName = snakeCase(slug);

		// Data variables to be passed to the template.
		let vars = Object.assign({
			slug,
			taxonomies,
			pluginMachineName,
			machineName,
		}, defaults, responses);

		try {
			await scaffold(path.resolve(__dirname, './term-column.template.php.ejs'), `term-columns/${fileName}.php`, vars);
			await searchAndReplace(`${plugin}.php`, '/* TERM COLUMNS */', `/* TERM COLUMNS */\r\n\trequire_once __DIR__ . '/term-columns/${fileName}.php';`);
		} catch (error) {}
	});

