#!/usr/bin/env node
const sade = require('sade');
const commands = require('./build');
const { version } = require('./package');

sade('freshie')
	.version(version)
	.option('-C, --cwd', 'The relative working directory', '.')

	.command('build [src]')
	.describe('Compile the Worker(s) within a directory.')
	.option('-x, --sourcemap', 'Generate sourcemap(s)')
	.option('-m, --minify', 'Minify built assets', true)
	.example('build --sourcemap --no-minify')
	.action(commands.build)

	.command('watch [src]')
	.describe('Compile the Worker(s) within a directory.')
	.alias('dev').action(commands.watch)

	.parse(process.argv);
