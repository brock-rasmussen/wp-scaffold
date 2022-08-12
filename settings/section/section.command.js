const { CliUx } = require('@oclif/core')
const chalk = require('chalk')
const { Command } = require('commander')
const { prompt } = require('inquirer')
const { kebabCase, snakeCase, startCase } = require('lodash')
const path = require('path')

const getSettingsPages = require('../../utils/getSettingsPages')
const insert = require('../../utils/insert')
const scaffold = require('../../utils/scaffold')

module.exports = () =>
  new Command('section')
    .description('scaffold a settings section')
    .argument(
      '[slug]',
      'unique identifier for the settings section',
      (slug) => {
        return kebabCase(slug)
      }
    )
    .option('-p, --page', 'the menu page slug')
    .option('y, --yes', 'automatically answer "yes" to any prompts', false)
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
              return true
            },
          },
        ])

        slug = responses.slug
      }

      // Current plugin folder name.
      const plugin = path.basename(process.cwd())

      // Default values.
      const defaults = {
        textdomain: kebabCase(plugin),

        /**
         * @see https://developer.wordpress.org/reference/functions/add_settings_section/
         */
        title: startCase(slug),
        description: '',
        page: options.page,
      }

      const settingsPages = await getSettingsPages()

      // If `--yes` option was passed, skip the wizard.
      const responses = options.yes
        ? {}
        : await prompt(
            [
              {
                type: 'list',
                name: 'page',
                message: 'page',
                default: defaults.page,
                choices: settingsPages,
                loop: false,
              },
              {
                type: 'input',
                name: 'title',
                message: 'title',
                default: defaults.title,
              },
              {
                type: 'input',
                name: 'description',
                message: 'description',
                default: defaults.description,
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
          path.resolve(__dirname, './section.template.php.ejs'),
          `settings-sections/${slug}.php`,
          vars
        )
        let insert1 = await insert(
          `${plugin}.php`,
          '/* SETTINGS SECTIONS */',
          `\trequire_once __DIR__ . '/settings-sections/${slug}.php';`
        )

        CliUx.ux.action.stop(chalk.green('done'))

        const tree = CliUx.ux.tree()
        tree.insert(plugin)

        if (insert1) {
          tree.nodes[plugin].insert(
            `${plugin}.php - ${chalk.yellow('updated')}`
          )
        }

        tree.nodes[plugin].insert('settings-sections')
        tree.nodes[plugin].nodes['settings-sections'].insert(`${slug}.php`)

        // Add newline in command line.
        console.log('')
        // Display file tree
        tree.display()
      } catch (error) {
        CliUx.ux.action.stop(chalk.red('error'))
        console.log(error)
      }
    })
