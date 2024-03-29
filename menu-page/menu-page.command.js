const { CliUx } = require('@oclif/core')
const chalk = require('chalk')
const { Command } = require('commander')
const { prompt } = require('inquirer')
const { snakeCase, kebabCase, startCase } = require('lodash')
const path = require('path')

const dashicons = require('../utils/dashicons')
const getMenuPages = require('../utils/getMenuPages')
const insert = require('../utils/insert')
const scaffold = require('../utils/scaffold')

module.exports = () =>
  new Command('menu-page')
    .description('scaffold a menu page')
    .argument('[slug]', 'unique identifier for the menu item', (slug) => {
      // Remove non-lowercase alphanumerics. Allow hyphens and underscores.
      return slug.toLowerCase().replace(/[^a-z\-_\d]/g, '')
    })
    .option('-p, --parent [parent]', 'parent page')
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
              return input.toLowerCase().replace(/[^a-z\-_\d]/g, '')
            },
            validate(input) {
              if (!input) {
                return 'SLUG is required'
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
        textdomain: kebabCase(plugin),
        parent: options.parent,

        /**
         * Shared by menu page and submenu page
         * @see https://developer.wordpress.org/reference/functions/add_menu_page/
         * @see https://developer.wordpress.org/reference/functions/add_submenu_page/
         */
        pageTitle: startCase(slug),
        menuTitle: startCase(slug),

        // Menu page specific.
        icon: '',

        // Submenu page specific.
        parent: '',
      }

      const menuPages = await getMenuPages()

      // If `--yes` option was passed, skip the wizard.
      const responses = options.yes
        ? {}
        : await prompt(
            [
              {
                type: 'list',
                name: 'parent',
                message: 'parent',
                default: defaults.parent,
                choices: menuPages,
                loop: false,
              },
              {
                type: 'input',
                name: 'menuTitle',
                message: 'menu title',
                default: defaults.menuTitle,
              },
              {
                type: 'input',
                name: 'pageTitle',
                message: 'page title',
                default: defaults.pageTitle,
              },
              {
                type: 'list',
                name: 'icon',
                message: 'icon',
                defaults: defaults.icon,
                choices: dashicons,
                loop: false,
                when(responses) {
                  return !responses.parent
                },
              },
            ],
            options
          )

      // Add newline in command line.
      console.log('')
      // Display loader
      CliUx.ux.action.start(chalk.bold('creating files'))

      // Create a PHP-valid string for use in PHP function names.
      const pluginMachineName = snakeCase(plugin)
      const machineName = snakeCase(slug)

      // Data variables to be passed to the template.
      const vars = Object.assign(
        {
          slug,
          pluginMachineName,
          machineName,
        },
        defaults,
        responses
      )

      try {
        await scaffold(
          path.resolve(__dirname, './menu-page.template.php.ejs'),
          `menu-pages/${slug}.php`,
          vars
        )
        const insert1 = await insert(
          `${plugin}.php`,
          `/* ${vars.parent ? 'SUBMENU' : 'MENU'} PAGES */`,
          `\trequire_once __DIR__ . '/menu-pages/${slug}.php';`
        )

        CliUx.ux.action.stop(chalk.green('done'))

        const tree = CliUx.ux.tree()
        tree.insert(plugin)

        if (insert1) {
          tree.nodes[plugin].insert(
            `${plugin}.php - ${chalk.yellow('updated')}`
          )
        }

        tree.nodes[plugin].insert('menu-pages')
        tree.nodes[plugin].nodes['menu-pages'].insert(`${slug}.php`)

        // Add newline in command line.
        console.log('')
        // Display file tree
        tree.display()
      } catch (error) {
        CliUx.ux.action.stop(chalk.red('error'))
        console.log(error)
      }
    })
