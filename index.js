#!/usr/bin/env node

const { Command } = require('commander');
const packageJson = require('./package.json');

// COMMANDS
const program = new Command()
	.version(packageJson.version, '-v, --version')
	.addCommand(require('./commands/post-type')())
	.addCommand(require('./commands/taxonomy')())
	.parseAsync(process.argv);
