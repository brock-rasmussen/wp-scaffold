const { CliUx } = require('@oclif/core')
const chalk = require('chalk')
const { Command, InvalidArgumentError } = require('commander')
const { prompt } = require('inquirer')
const {
  capitalize,
  kebabCase,
  lowerCase,
  snakeCase,
  startCase,
} = require('lodash')
const path = require('path')
const pluralize = require('pluralize')

const dashicons = require('../utils/dashicons')
const scaffold = require('../utils/scaffold')
const insert = require('../utils/insert')

module.exports = () =>
  new Command('post-type')
    .description('scaffold a custom post type')
    .argument(
      '[slug]',
      'unique identifier for the post type (usually singular)',
      (slug) => {
        const sanitizedSlug = kebabCase(slug)

        // Per WordPress' requirements, the slug cannot exceed 20 characters.
        if (sanitizedSlug.length > 20) {
          throw new InvalidArgumentError('SLUG must not exceed 20 characters')
        }

        return sanitizedSlug
      }
    )
    .option('-y, --yes', 'automatically answer "yes" to any prompts', false)
    .action(async (slug, options) => {
      // Prompt for a slug if it wasn't provided.
      if (!slug) {
        const responses = await prompt([
          {
            type: 'input',
            name: 'slug',
            message: 'slug',
            filter(input) {
              return kebabCase(input)
            },
            validate(input) {
              if (!input) {
                return 'SLUG is required'
              }
              if (input.length > 20) {
                return 'SLUG must not exceed 20 characters'
              }
              return true
            },
          },
        ])

        slug = responses.slug
      }

      // Current folder name.
      const plugin = path.basename(process.cwd())

      // Default values.
      const defaults = {
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
        icon: 'dashicons-admin-post',
        supports: ['title', 'editor'],
      }

      // If `--yes` option was passed, skip the wizard.
      const responses = options.yes
        ? {}
        : await prompt([
            {
              type: 'input',
              name: 'label',
              message: 'label (singular)',
              default: defaults.label,
            },
            {
              type: 'confirm',
              name: 'hierarchical',
              message: 'hierarchical',
              default: defaults.hierarchical,
            },
            {
              type: 'confirm',
              name: 'public',
              message: 'public',
              default: defaults.public,
            },
            {
              type: 'confirm',
              name: 'showUi',
              message: 'admin interface',
              default: false,
              when(responses) {
                return !responses.public
              },
            },
            {
              type: 'confirm',
              name: 'showInRest',
              message: 'include in REST (required for block editor)',
              default: defaults.showInRest,
            },
            {
              type: 'list',
              name: 'icon',
              message: 'icon',
              default: defaults.icon,
              choices: dashicons,
              loop: false,
            },
            {
              type: 'checkbox',
              name: 'supports',
              message: 'supports',
              default: defaults.supports,
              choices: [
                'title',
                'editor',
                'comments',
                'revisions',
                'trackbacks',
                'author',
                'excerpt',
                'page-attributes',
                'thumbnail',
                'custom-fields',
                'post-formats',
              ],
              loop: false,
            },
          ])

      // Add newline in command line.
      console.log('')
      // Display loader.
      CliUx.ux.action.start(chalk.bold('creating files'))

      /**
       * Create strings for the scaffolded `labels`.
       * @see https://developer.wordpress.org/reference/functions/get_post_type_labels/
       */
      const label = responses.label ?? defaults.label

      const item = lowerCase(pluralize(label, 1))
      const items = lowerCase(pluralize(label))

      // Title-case
      const itemTitleCase = startCase(item)
      const itemsTitleCase = startCase(items)

      // Upper-case first letter only
      const itemUpperFirst = capitalize(item)
      const itemsUpperFirst = capitalize(items)

      // Create a PHP-valid string for use in PHP function names.
      const pluginMachineName = snakeCase(plugin)
      const machineName = snakeCase(slug)

      /**
       * URL rewrite slug. Use a plural form of slug per API design best-practices.
       * @see https://docs.microsoft.com/en-us/azure/architecture/best-practices/api-design#organize-the-api-design-around-resources
       */
      const resourceSlug = pluralize(slug)

      // Data variables to be passed to the template.
      const vars = Object.assign(
        {
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
        },
        defaults,
        responses
      )

      try {
        await scaffold(
          path.resolve(__dirname, './post-type.template.php.ejs'),
          `post-types/${slug}.php`,
          vars
        )

        const insert1 = await insert(
          `${plugin}.php`,
          '/* POST TYPES */',
          `require_once __DIR__ . '/post-types/${slug}.php';`
        )
        const insert2 = await insert(
          `${plugin}.php`,
          '/* REGISTER POST TYPES */',
          `\t${pluginMachineName}_post_type_${machineName}_init();`
        )
        const insert3 = await insert(
          `${plugin}.php`,
          '/* UNREGISTER POST TYPES */',
          `\tunregister_post_type( '${slug}' );`
        )

        CliUx.ux.action.stop(chalk.green('done'))

        const tree = CliUx.ux.tree()
        tree.insert(plugin)

        if (insert1 || insert2 || insert3) {
          tree.nodes[plugin].insert(
            `${plugin}.php - ${chalk.yellow('updated')}`
          )
        }

        tree.nodes[plugin].insert('post-types')
        tree.nodes[plugin].nodes['post-types'].insert(`${slug}.php`)

        // Add newline in command line.
        console.log('')
        // Display file tree
        tree.display()
      } catch (error) {
        CliUx.ux.action.stop(chalk.red('error'))
        console.log(error)
      }
    })
