const { CliUx } = require('@oclif/core')
const chalk = require('chalk')
const { Command, Option } = require('commander')
const { prompt } = require('inquirer')
const { kebabCase, snakeCase, startCase } = require('lodash')
const path = require('path')

const getSettingsPages = require('../../utils/getSettingsPages')
const getSettingsSections = require('../../utils/getSettingsSections')
const insert = require('../../utils/insert')
const scaffold = require('../../utils/scaffold')

const controlTypes = [
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
]

module.exports = () =>
  new Command('field')
    .description('scaffold a settings field')
    .argument('[slug]', 'unique identifier for the settings field', (slug) => {
      return kebabCase(slug)
    })
    .option('-p, --page <page>', 'the menu page slug')
    .option('-s, --section <section>', 'the settings section slug')
    .addOption(
      new Option('-t, --type <type>', 'the field control type').choices(
        controlTypes
      )
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
              return true
            },
          },
        ])

        slug = responses.slug
      }

      // Current plugin folder name.
      const plugin = path.basename(process.cwd())
      const fileName = kebabCase(slug)

      // Default values.
      const defaults = {
        textdomain: kebabCase(plugin),
        type: options.type,
        options: [],
        description: '',

        /**
         * @see https://developer.wordpress.org/reference/functions/add_settings_field/
         */
        title: startCase(slug),
        page: options.page,
        section: options.section,
      }

      const settingsPages = await getSettingsPages()
      const settingsSections = await getSettingsSections()

      // If `--yes` option was passed, skip the wizard.
      const responses = options.yes
        ? {}
        : await prompt(
            [
              {
                type: 'list',
                name: 'type',
                message: 'type',
                default: defaults.type,
                choices: controlTypes,
                loop: false,
              },
              {
                type: 'list',
                name: 'page',
                message: 'page',
                default: defaults.page,
                choices: settingsPages,
                loop: false,
              },
              {
                type: 'list',
                name: 'section',
                message: 'section',
                default: defaults.section,
                choices: settingsSections,
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
              {
                type: 'input',
                name: 'options',
                message: 'options (comma separated)',
                filter(input) {
                  return input.split(',').map((option) => option.trim())
                },
                when(responses) {
                  return ['checkboxes', 'radio', 'select'].includes(
                    responses.type
                  )
                },
              },
            ],
            options
          )

      // Create a PHP-valid string for use in PHP function names.
      const pluginMachineName = snakeCase(plugin)
      const machineName = snakeCase(slug)

      // Data variables to be passed to the template.
      const vars = Object.assign(
        {
          slug,
          optionName: snakeCase(`${plugin}-${slug}`),
          plugin,
          pluginMachineName,
          machineName,
          sanitizeCallback: false,
          labelFor: '',
        },
        defaults,
        responses
      )

      let multiple = ['checkboxes'].includes(vars.type)

      // Maybe add label.
      if (!['checkbox', 'checkboxes', 'radio'].includes(vars.type)) {
        vars.labelFor = `${plugin}-${slug}`
      }

      // Sanitize callback.
      if (!multiple) {
        switch (vars.type) {
          case 'email': {
            vars.sanitizeCallback = 'sanitize_email'
            break
          }
          case 'number': {
            vars.sanitizeCallback = 'intval'
            break
          }
          case 'richtext': {
            vars.sanitizeCallback = 'wp_filter_post_kses'
            break
          }
          case 'textarea': {
            vars.sanitizeCallback = 'sanitize_textarea_field'
            break
          }
          case 'url': {
            vars.sanitizeCallback = 'esc_url_raw'
            break
          }
          default: {
            vars.sanitizeCallback = 'sanitize_text_field'
            break
          }
        }
      }

      // Field template.
      vars.fieldTemplate = [
        'checkbox',
        'checkboxes',
        'media',
        'radio',
        'richtext',
        'select',
        'textarea',
      ].includes(vars.type)
        ? vars.type
        : 'default'

      console.log(vars)

      // Add newline in command line.
      console.log('')
      // Display loader
      CliUx.ux.action.start(chalk.bold('creating files'))

      try {
        await scaffold(
          path.resolve(__dirname, './field.template.php.ejs'),
          `settings-fields/${fileName}.php`,
          vars
        )
        let insert1 = await insert(
          `${plugin}.php`,
          '/* SETTINGS FIELDS */',
          `\trequire_once __DIR__ . '/settings-fields/${fileName}.php';`
        )

        CliUx.ux.action.stop(chalk.green('done'))

        const tree = CliUx.ux.tree()
        tree.insert(plugin)

        if (insert1) {
          tree.nodes[plugin].insert(
            `${plugin}.php - ${chalk.yellow('updated')}`
          )
        }

        if (vars.type === 'color' && vars.page) {
          await scaffold(
            path.resolve(__dirname, './../../assets/color-picker.js'),
            'assets/color-picker.js',
            {}
          )
          let insert2 = await insert(
            `${plugin}.php`,
            '/* REGISTER SCRIPTS */',
            `wp_register_script( '${pluginMachineName}_color-picker', plugins_url( 'assets/color-picker.js', __FILE__ ), [ 'jquery' ], date("ymd-Gis", filemtime( plugin_dir_path( __FILE__ ) . 'assets/color-picker.js' )), true );`
          )
          let insert3 = await insert(
            `menu-pages/${vars.page}.php`,
            '/* ENQUEUE SCRIPTS */',
            `wp_enqueue_script( '${pluginMachineName}_color-picker' );`
          )

          tree.nodes[plugin].insert('assets')
          tree.nodes[plugin].nodes['assets'].insert('color-picker.js')

          if (!insert1 && insert2) {
            tree.nodes[plugin].insert(
              `${plugin}.php - ${chalk.yellow('updated')}`
            )
          }

          if (insert3) {
            tree.nodes[plugin].insert('menu-pages')
            tree.nodes[plugin].nodes['menu-pages'].insert(
              `${vars.page}.php - ${chalk.yellow('updated')}`
            )
          }
        }

        tree.nodes[plugin].insert('settings-fields')
        tree.nodes[plugin].nodes['settings-fields'].insert(`${slug}.php`)

        // Add newline in command line.
        console.log('')
        // Display file tree
        tree.display()
      } catch (error) {
        CliUx.ux.action.stop(chalk.red('error'))
        console.log(error)
      }
    })
