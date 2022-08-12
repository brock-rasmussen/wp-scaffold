#!/usr/bin/env node

const { Command } = require('commander')
const packageJson = require('./package.json')

// COMMANDS
const program = new Command('brwp')
  .version(packageJson.version, '-v, --version')
  .addCommand(require('./menu-page/menu-page.command')())
  .addCommand(require('./plugin/plugin.command')())
  .addCommand(require('./post-type/post-type.command')())
  .addCommand(require('./taxonomy/taxonomy.command')())
  // .addCommand(require('./column/column.command')())
  .addCommand(require('./settings')())
  .parseAsync(process.argv)
