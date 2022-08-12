const { CliUx } = require('@oclif/core')
const chalk = require('chalk')
const { Command } = require('commander')
const { prompt } = require('inquirer')
const { kebabCase, snakeCase, startCase } = require('lodash')
const path = require('path')

const scaffold = require('../utils/scaffold')
const isValidURL = require('../utils/validation/isValidURL')

module.exports = () =>
  new Command('plugin')
    .description('scaffold a plugin')
    .argument('[slug]', 'plugin folder name and text domain', (slug) =>
      kebabCase(slug)
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

      // Default values.
      const defaults = {
        name: startCase(slug),
        description: '',
        author: '',
        authorURI: '',
        pluginURI: '',
      }

      // If `--yes` option was passed, skip the wizard.
      const responses = options.yes
        ? {}
        : await prompt([
            {
              type: 'text',
              name: 'name',
              message: 'plugin name',
              default: startCase(slug),
              validate(name) {
                return !!name || 'plugin name is required'
              },
            },
            {
              type: 'text',
              name: 'description',
              message: 'description',
              default: defaults.description,
            },
            {
              type: 'text',
              name: 'author',
              message: 'author',
              default: defaults.author,
            },
            {
              type: 'text',
              name: 'authorURI',
              message: 'author URI (e.g. website, github profile, etc.)',
              default: defaults.authorURI,
              validate(authorURI) {
                if (!authorURI) {
                  return true
                }
                return isValidURL(authorURI) || 'invalid URI'
              },
            },
            {
              type: 'text',
              name: 'pluginURI',
              message:
                'plugin URI (e.g. documentation site, github repository, etc.)',
              default: defaults.pluginURI,
              validate(pluginURI) {
                if (!pluginURI) {
                  return true
                }
                return isValidURL(pluginURI) || 'invalid URI'
              },
            },
          ])

      // Add newline in command line.
      console.log('')
      // Display loader.
      CliUx.ux.action.start(chalk.bold('creating files'))

      // PHP-valid string for use in function names.
      const machineName = snakeCase(slug)

      // Data variables to be passed to the template.
      const vars = Object.assign(
        {
          slug,
          machineName,
          textdomain: slug,
        },
        defaults,
        responses
      )

      try {
        await scaffold(
          path.resolve(__dirname, './plugin.template'),
          `${slug}`,
          vars
        )

        CliUx.ux.action.stop(chalk.green('done'))

        const tree = CliUx.ux.tree()
        tree.insert(slug)

        const files = [
          '.editorconfig',
          `${slug}.php`,
          'index.php',
          'LICENSE.txt',
          'README.md',
          'README.txt',
          'uninstall.php',
        ].sort((a, b) => {
          const lowerA = a.toLowerCase
          const lowerB = b.toLowerCase

          return lowerA < lowerB
        })

        files.forEach((file) => {
          tree.nodes[slug].insert(file)
        })

        // Add newline in command line.
        console.log('')
        // Display file tree
        tree.display()
      } catch (error) {
        CliUx.ux.action.stop(chalk.red('error'))
        console.log(error)
      }
    })
