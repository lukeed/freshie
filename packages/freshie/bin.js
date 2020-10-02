#!/usr/bin/env node
const sade = require('sade');
const commands = require('./build');
const { version } = require('./package');

sade('freshie')
	.version(version)
	.option('-C, --cwd', 'The relative working directory', '.')

	.command('build [src]')
	.describe('Compile the Worker(s) within a directory.')
	.option('-m, --minify', 'Minify built assets', true)
	.action(commands.build)

	.command('watch [src]')
	.describe('Compile the Worker(s) within a directory.')
	.option('-m, --minify', 'Minify built assets', true)
	.action(commands.watch)

	.parse(process.argv);
