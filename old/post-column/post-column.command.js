const { Command } = require('commander')
const { kebabCase, snakeCase, startCase } = require('lodash')
const path = require('path')

const prompts = require('./post-column.prompts')
const scaffold = require('../utils/scaffold')
const insert = require('../utils/insert')

/**
 * Export the post-column scaffolding command.
 */
module.exports = () =>
  new Command('post-column')
    .description('generate PHP for a custom post list table column')
    .argument('<slug>', 'the column identifier', (slug) => {
      return snakeCase(slug)
    })
    .argument(
      '[postTypes...]',
      'the post types where the column should be used'
    )
    .option('-y, --yes', 'automatically answer "yes" to any prompts', false)
    .action(async (slug, postTypes, options) => {
      // Current plugin folder name.
      const plugin = path.basename(process.cwd())
      const fileName = kebabCase(slug)

      // Set up the defaults object.
      const defaults = {
        textdomain: kebabCase(plugin),
        title: startCase(slug),
        insertBefore: 'author',
        isSortable: false,
        postTypes,
      }

      // If `--yes` option was passed, skip the wizard.
      const responses = options.yes ? {} : await prompts(defaults)

      // Create a PHP-valid string for use in PHP function names.
      const pluginMachineName = snakeCase(plugin)
      const machineName = snakeCase(slug)

      // Data variables to be passed to the template.
      const vars = Object.assign(
        {
          slug,
          postTypes,
          pluginMachineName,
          machineName,
        },
        defaults,
        responses
      )

      try {
        await scaffold(
          path.resolve(__dirname, './post-column.template.php.ejs'),
          `post-columns/${fileName}.php`,
          vars
        )
        await insert(
          `${plugin}.php`,
          '/* POST COLUMNS */',
          `\trequire_once __DIR__ . '/post-columns/${fileName}.php';`
        )
      } catch (error) {}
    })
