const prompts = require('prompts')
const getPostTypes = require('../utils/getPostTypes')
const { getPostColumnChoices } = require('./post-column.utils')

module.exports = async (defaults) => {
  const postTypeChoices = !defaults.postTypes.length ? await getPostTypes() : []
  const postColumnChoices = await getPostColumnChoices()

  // Select the user-provided options.
  postTypeChoices.forEach((choice) => {
    choice.selected = defaults.postTypes.includes(choice.title)
  })

  return await prompts(
    [
      {
        type: 'text',
        name: 'title',
        message: 'Title:',
        initial: defaults.title,
      },
      {
        type: 'autocomplete',
        name: 'insertBefore',
        message: 'Insert the column before:',
        initial: defaults.insertBefore,
        choices: postColumnChoices,
      },
      {
        type: 'toggle',
        name: 'isSortable',
        message: 'Allow sorting by this column:',
        initial: defaults.isSortable,
        active: 'yes',
        inactive: 'no',
      },
      {
        type: defaults.postTypes.length ? null : 'multiselect',
        name: 'postTypes',
        message: 'Post types with column:',
        initial: defaults.postTypes ? '' : 1,
        choices: postTypeChoices,
      },
    ],
    {
      onCancel() {
        process.exit(1)
      },
    }
  )
}
