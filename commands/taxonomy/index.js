const { Command, InvalidArgumentError, Option } = require('commander');
const { capitalize, kebabCase, lowerCase, snakeCase, startCase } = require('lodash');
const chalk = require('chalk');
const pluralize = require('pluralize');

const wizard = require('./wizard');
const scaffold = require('../../utils/scaffold');

/**
 * TODO:
 * - Consider adding a --textdomain flag.
 * - Consider adding a --template flag for the user to use their own.
 */

/**
 * Default values per WP documentation.
 * Only includes relevant fields for what we allow to be configured in the CLI.
 * @see https://developer.wordpress.org/reference/functions/register_taxonomy/
 */
const DEFAULT = {
	description: '',
	public: false,
	hierarchical: false,
	showUi: false, // Defaults to `public`
	showInRest: false,
	showInQuickEdit: false, // Defaults to `showUi`
	showAdminColumn: false,
}

/**
 * Presets for quick post type setup.
 * Only includes overrides for DEFAULT.
 */
const PRESETS = {
	category: {
		public: true,
		hierarchical: true,
		showUi: true,
		showInRest: true,
		showInQuickEdit: true,
		showAdminColumn: true,
	},
	tag: {
		public: true,
		showUi: true,
		showInRest: true,
		showInQuickEdit: true,
		showAdminColumn: true,
	},
};

/**
 * Export the post-type scaffolding command.
 */
module.exports = () => new Command('taxonomy')
	.description('Generates PHP code for registering a custom taxonomy.')
	.argument('<slug>', 'The internal name of the taxonomy. Usually singular.', (slug) => {
		const sanitizedSlug = kebabCase(slug);

		// Make sure there's still a slug.
		if (!sanitizedSlug.length) {
			throw new InvalidArgumentError(`The escaped slug cannot be empty.`);
		}

		// Per WP's requirements, the slug cannot exceed 32 characters.
		if (sanitizedSlug.length > 32) {
			throw new InvalidArgumentError('\'slug\' must not exceed 32 characters.');
		}

		return sanitizedSlug;
	})
	.argument('<objectTypes...>', 'List of object types with which the taxonomy should be associated.')
	.addOption(new Option('-p, --preset <preset>', 'The quick-start taxonomy configuration.').default('tag').choices(['category', 'tag']))
	.option('-t, --textdomain [textdomain]', 'Unique identifier for retrieving translated strings.', 'badger')
	.option('-w, --wizard', 'Customize registration options using a wizard.', false)
	.action(async (slug, objectTypes, options) => {
		// Set up the defaults object.
		let defaults = Object.assign({}, DEFAULT, PRESETS[options.preset]);

		// If `--wizard` option was passed, prompt user for data.
		// Default values for the prompts will use the selected preset.
		let responses = !options.wizard ? {} : await wizard(defaults);

		/**
		 * Create strings for the scaffolded `labels`.
		 * @see https://developer.wordpress.org/reference/functions/get_taxonomy_labels/
		 */
		let item = lowerCase(pluralize(slug, 1));
		let items = lowerCase(pluralize(slug));

		// Title-case
		let itemTitleCase = startCase(item);
		let itemsTitleCase = startCase(items);

		// Upper-case first letter only
		let itemUpperFirst = capitalize(item);
		let itemsUpperFirst = capitalize(items);

		// Create a PHP-valid string for use in PHP function names.
		let machineName = snakeCase(slug);

		/**
		 * URL rewrite slug. Use a plural form of slug per API design best-practices.
		 * @see https://docs.microsoft.com/en-us/azure/architecture/best-practices/api-design#organize-the-api-design-around-resources
		 */
		let resourceSlug = pluralize(slug);

		// Compile data object to be passed to the template.
		let config = Object.assign({
			slug,
			textdomain: options.textdomain,
			objectTypes,
			item,
			items,
			itemTitleCase,
			itemsTitleCase,
			itemUpperFirst,
			itemsUpperFirst,
			machineName,
			resourceSlug,
		}, defaults, responses);

		try {
			scaffold('./commands/taxonomy/template.ejs', `taxonomies/${slug}.php`, config);
			console.log(chalk.green(`A file for the '${slug}' taxonomy has been created in '/taxonomies/${slug}.php'.`))
		} catch (error) { }
	})
