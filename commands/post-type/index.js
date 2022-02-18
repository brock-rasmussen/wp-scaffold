const { Command, InvalidArgumentError, Option } = require('commander');
const { capitalize, kebabCase, lowerCase, snakeCase, startCase } = require('lodash');
const chalk = require('chalk');
const pluralize = require('pluralize');

const wizard = require('./wizard');
const scaffold = require('../../utils/scaffold');

/**
 * Default values per WP documentation.
 * Only includes relevant fields for what we allow to be configured in the CLI.
 * @see https://developer.wordpress.org/reference/functions/register_post_type/
 */
const DEFAULT = {
	description: '',
	public: false,
	hierarchical: false,
	excludeFromSearch: true, // Opposite of `public`
	showUi: false, // Same as `public`
	showInRest: false,
	menuIcon: 'admin-post',
	supports: ['title', 'editor'],
}

/**
 * Presets for quick post type setup.
 * Only includes overrides for DEFAULT.
 */
const PRESETS = {
	page: {
		public: true,
		hierarchical: true,
		excludeFromSearch: false,
		showUi: true,
		showInRest: true,
	},
	post: {
		public: true,
		excludeFromSearch: false,
		showUi: true,
		showInRest: true,
	},
};

/**
 * Export the post-type scaffolding command.
 */
module.exports = () => new Command('post-type')
	.description('Generates PHP code for registering a custom post type.')
	.argument('<slug>', 'The internal name of the post type. Usually singular.', (slug) => {
		const sanitizedSlug = kebabCase(slug);

		// Make sure there's still a slug.
		if (!sanitizedSlug.length) {
			throw new InvalidArgumentError(`The escaped slug cannot be empty.`);
		}

		// Per WP's requirements, the slug cannot exceed 20 characters.
		if (sanitizedSlug.length > 20) {
			throw new InvalidArgumentError('\'slug\' must not exceed 20 characters.');
		}

		return sanitizedSlug;
	})
	.addOption(new Option('-p, --preset <preset>', 'The quick-start post-type configuration.').default('post').choices(['page', 'post']))
	.option('-t, --textdomain [textdomain]', 'Unique identifier for retrieving translated strings.', 'badger')
	.option('-w, --wizard', 'Customize registration options using a wizard.', false)
	.action(async (slug, options) => {
		// Set up the defaults object.
		let defaults = Object.assign({}, DEFAULT, PRESETS[options.preset]);

		// If `--wizard` option was passed, prompt user for data.
		// Default values for the prompts will use the selected preset.
		let responses = !options.wizard ? {} : await wizard(defaults);

		/**
		 * Create strings for the scaffolded `labels`.
		 * @see https://developer.wordpress.org/reference/functions/get_post_type_labels/
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
			item,
			items,
			itemTitleCase,
			itemsTitleCase,
			itemUpperFirst,
			itemsUpperFirst,
			machineName,
			resourceSlug,
		}, defaults, responses);
		console.log(config.supports);

		try {
			scaffold('./templates/post-type/template.ejs', `post-types/${slug}.php`, config);
			console.log(chalk.green(`A file for the '${slug}' post-type has been created in '/post-types/${slug}.php'.`))
		} catch(error) {}
	})
