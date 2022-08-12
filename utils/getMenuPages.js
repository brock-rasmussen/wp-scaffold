const pluralize = require('pluralize')
const { Separator } = require('inquirer')
const cwdReaddirFilenames = require('./cwdReaddirFilenames')

module.exports = async function getMenuPages() {
  const [settingsPages, postTypes] = await Promise.all([
    cwdReaddirFilenames('menu-pages'),
    cwdReaddirFilenames('post-types'),
  ])

  // Sort settings pages alphabetically.
  settingsPages.sort()

  // Add core menu pages.
  corePages = [
    {
      name: 'dashboard (index.php)',
      value: 'index.php',
    },
    {
      name: 'posts (edit.php)',
      value: 'edit.php',
    },
    {
      name: 'media (upload.php)',
      value: 'upload.php',
    },
    {
      name: 'pages (edit.php?post_type=page)',
      value: 'upload.php',
    },
    {
      name: 'comments (edit-comments.php)',
      value: 'edit-comments.php',
    },
    {
      name: 'appearance (theme.php)',
      value: 'themes.php',
    },
    {
      name: 'plugins (plugins.php)',
      value: 'plugins.php',
    },
    {
      name: 'users (users.php)',
      value: 'users.php',
    },
    {
      name: 'tools (tools.php)',
      value: 'tools.php',
    },
    {
      name: 'settings (options-general.php)',
      value: 'options-general.php',
    },
  ]

  postTypes.forEach((postType) => {
    const postTypePlural = pluralize(postType)

    corePages.push({
      name: `${postTypePlural} (edit.php?post_type=${postType})`,
      value: `edit.php?post_type=${postType}`,
    })
  })

  // Sort core pages alphabetically by `name`
  corePages.sort((a, b) => {
    if (a.title < b.title) {
      return -1
    }
    if (a.title > b.title) {
      return 1
    }
    return 0
  })

  const choices = [
    {
      name: 'none',
      value: '',
    },
    new Separator(),
  ]

  if (settingsPages.length) {
    choices.push(...settingsPages, new Separator())
  }

  choices.push(...corePages)

  return choices
}
