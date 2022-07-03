const { Command } = require('commander');

module.exports = () => new Command('post')
	.addCommand(require('./column')())
	.addCommand(require('./type')())