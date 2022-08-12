const { Command, Option } = require('commander')
const { kebabCase, snakeCase, startCase } = require('lodash')
const path = require('path')

const prompts = require('./settings-field.prompts')
const scaffold = require('../utils/scaffold')
const insert = require('../utils/insert')

/**
 * Export the settings-field scaffolding command.
 */
module.exports = () =>
  new Command('settings-field')
    .description(
      'generate PHP for a settings field to appear in a settings section'
    )
    .argument('<slug>', 'the field identifier', (slug) => {
      // Not required to be snake-case, but seems to be the common convention.
      return kebabCase(slug)
    })
    .argument('[section]', 'the settings-section identifier')
    .argument('[page]', 'the admin page slug')
    .addOption(
      new Option('--type <type>', 'The input type to scaffold.')
        .default('text')
        .choices([
          'checkbox',
          'checkboxes',
          'color',
          'email',
          'media',
          'number',
          'radio',
          'richtext',
          'select',
          'textarea',
          'url',
          'text',
        ])
    )
    .option('-y, --yes', 'automatically answer "yes" to any prompts', false)
    .action(async (slug, section, page, options) => {
      // Current plugin folder name.
      const plugin = path.basename(process.cwd())
      const fileName = snakeCase(slug)

      // Default values.
      const defaults = {
        textdomain: kebabCase(plugin),

        /**
         * @see https://developer.wordpress.org/reference/functions/add_settings_field/
         */
        title: startCase(slug),
        section,
        page,
      }

      // If `--yes` option was passed, skip the wizard.
      const responses = options.yes ? {} : await prompts(defaults)

      // Create a PHP-valid string for use in PHP function names.
      const pluginMachineName = snakeCase(plugin)
      const machineName = snakeCase(slug)

      // Set up variables based on the `type`.
      let dataType
      let sanitizeCallback

      switch (options.type) {
        case 'checkbox':
          dataType = 'boolean'
          break
        case 'checkboxes':
          dataType = 'array'
          break
        case 'color':
          dataType = 'string'
          break
        case 'email':
          dataType = 'string'
          sanitizeCallback = 'sanitize_email'
          break
        case 'media':
          dataType = 'integer'
          break
        case 'number':
          dataType = 'number'
          sanitizeCallback = 'intval'
          break
        case 'radio':
          dataType = 'array'
          break
        case 'richtext':
          dataType = 'text'
          sanitizeCallback = 'wp_filter_post_kses'
          break
        case 'select':
          dataType = 'string'
          break
        case 'text':
          dataType = 'string'
          break
        case 'textarea':
          dataType = 'string'
          break
        case 'url':
          dataType = 'string'
          sanitizeCallback = 'esc_url_raw'
          break
      }

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
          path.resolve(__dirname, './settings-field.template.php.ejs'),
          `settings-fields/${fileName}.php`,
          vars
        )
        await searchAndReplace(
          `${plugin}.php`,
          '/* SETTINGS FIELDS */',
          `require_once __DIR__ . '/settings-fields/${slug}.php';`
        )
      } catch (error) {}
    })
