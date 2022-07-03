#!/usr/bin/env node

const { Command } = require('commander');
const packageJson = require('./package.json');

// COMMANDS
const program = new Command()
	.version(packageJson.version, '-v, --version')
	// .addCommand(require('./commands/column')())
	.addCommand(require('./menu-page/menu-page.command')())
	// .addCommand(require('./commands/metabox')())
	.addCommand(require('./plugin/plugin.command')())
	.addCommand(require('./post-type/post-type.command')())
	.addCommand(require('./settings-field/settings-field.command')())
	.addCommand(require('./settings-section/settings-section.command')())
	.addCommand(require('./submenu-page/submenu-page.command')())
	.addCommand(require('./taxonomy/taxonomy.command')())
	.parseAsync(process.argv);
