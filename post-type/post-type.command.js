const { Command, InvalidArgumentError } = require('commander');
const { capitalize, kebabCase, lowerCase, snakeCase, startCase } = require('lodash');
const path = require('path');
const pluralize = require('pluralize');

const prompts = require('./post-type.prompts');
const scaffold = require('../utils/scaffold');

/**
 * Export the post-type scaffolding command.
 */
module.exports = () => new Command('post-type')
	.description('generate PHP for a custom post type')
	.argument('<slug>', 'the unique identifier (usually singular) for the post type', (slug) => {
		const sanitizedSlug = kebabCase(slug);

		// Per WordPress' requirements, the slug cannot exceed 20 characters.
		if (sanitizedSlug.length > 20) {
			throw new InvalidArgumentError('\'slug\' must not exceed 20 characters');
		}

		return sanitizedSlug;
	})
	.option('-y, --yes', 'automatically answer "yes" to any prompts', false)
	.action(async (slug, options) => {
		// Current plugin folder name.
		let plugin = path.basename(process.cwd());

		// Set up the defaults object.
		let defaults = {
			label: startCase(slug),
			textdomain: kebabCase(plugin),
			
			/**
			 * A public `post`-like post type.
			 * @see https://developer.wordpress.org/reference/functions/register_post_type/
			 */
			public: true,
			showUi: true,
			showInRest: true,
			hierarchical: false,
			menuIcon: 'admin-post',
			supports: ['title', 'editor'],
		};

		// If `--yes` option was passed, skip the wizard.
		let responses = options.yes ? {} : await prompts(defaults);

		/**
		 * Create strings for the scaffolded `labels`.
		 * @see https://developer.wordpress.org/reference/functions/get_post_type_labels/
		 */
		let label = responses.label ?? defaults.label;
		
		let item = lowerCase(pluralize(label, 1));
		let items = lowerCase(pluralize(label));

		// Title-case
		let itemTitleCase = startCase(item);
		let itemsTitleCase = startCase(items);

		// Upper-case first letter only
		let itemUpperFirst = capitalize(item);
		let itemsUpperFirst = capitalize(items);

		// Create a PHP-valid string for use in PHP function names.
		let pluginMachineName = snakeCase(plugin);
		let machineName = snakeCase(slug);

		/**
		 * URL rewrite slug. Use a plural form of slug per API design best-practices.
		 * @see https://docs.microsoft.com/en-us/azure/architecture/best-practices/api-design#organize-the-api-design-around-resources
		 */
		let resourceSlug = pluralize(slug);

		// Data variables to be passed to the template.
		let vars = Object.assign({
			slug,
			item,
			items,
			itemTitleCase,
			itemsTitleCase,
			itemUpperFirst,
			itemsUpperFirst,
			resourceSlug,
			pluginMachineName,
			machineName,
		}, defaults, responses);

		try {
			scaffold(path.resolve(__dirname, './post-type.template.php.ejs'), `post-types/${slug}.php`, vars);
		} catch(error) {}
	})
