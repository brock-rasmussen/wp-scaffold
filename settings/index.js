const { Command } = require('commander')

module.exports = () =>
  new Command('settings')
    .addCommand(require('./section/section.command')())
    .addCommand(require('./field/field.command')())
