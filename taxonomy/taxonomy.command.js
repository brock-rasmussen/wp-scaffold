const { Command, InvalidArgumentError } = require('commander');
const { capitalize, kebabCase, lowerCase, snakeCase, startCase } = require('lodash');
const path = require('path');
const pluralize = require('pluralize');

const prompts = require('./taxonomy.prompts');
const scaffold = require('../utils/scaffold');

/**
 * Export the taxonomy scaffolding command.
 */
module.exports = () => new Command('taxonomy')
	.description('generate PHP for a custom taxonomy')
	.argument('<slug>', 'the unique identifier for the taxonomy', (slug) => {
		const sanitizedSlug = kebabCase(slug);

		// Per WordPress' requirements, the slug cannot exceed 32 characters.
		if (sanitizedSlug.length > 32) {
			throw new InvalidArgumentError('\'slug\' must not exceed 32 characters');
		}

		return sanitizedSlug;
	})
	.argument('[objectTypes...]', 'the object types associated with the taxonomy')
	.option('-y, --yes', 'automatically answer "yes" to any prompts', false)
	.action(async (slug, objectTypes, options) => {
		// Current plugin folder name.
		let plugin = path.basename(process.cwd());

		// Set up the defaults object.
		let defaults = {
			label: startCase(slug),
			textdomain: kebabCase(plugin),
			objectTypes: objectTypes,

			/**
			 * A public `category`-like taxonomy.
			 * @see https://developer.wordpress.org/reference/functions/register_taxonomy/
			 */
			public: true,
			hierarchical: true,
			showUi: true,
			showInRest: true,
		};

		// If `--yes` option was passed, skip the wizard.
		let responses = options.yes ? {} : await prompts(defaults);

		/**
		 * Create strings for the scaffolded `labels`.
		 * @see https://developer.wordpress.org/reference/functions/get_taxonomy_labels/
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
			scaffold(path.resolve(__dirname, './taxonomy.template.php.ejs'), `taxonomies/${slug}.php`, vars);
		} catch (error) {}
	})